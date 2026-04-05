<?php
namespace App\Services;

use App\Models\Reservation;
use App\Models\Expense;
use App\Models\Payroll;
use App\Models\Room;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    /**
     * Get aggregated dashboard report data for a given date range.
     */
    public function getDashboardReport($fromDate, $toDate)
    {
        $start = Carbon::parse($fromDate)->startOfDay();
        $end = Carbon::parse($toDate)->endOfDay();

        // 1. Stats
        $newBookings = Reservation::whereBetween('created_at', [$start, $end])->count();
        
        $totalRevenue = Reservation::whereBetween('created_at', [$start, $end])
            ->where('status', 'Paid')
            ->sum('total_amount');
            
        $totalExpenseItems = Expense::whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->sum('grand_total');
            
        // Calculate payroll expense (approximate based on months overlapping the range)
        // Alternatively, filter by paid_at or month/year. We will filter by month/year spanning the date range.
        $startMonth = $start->month;
        $startYear = $start->year;
        $endMonth = $end->month;
        $endYear = $end->year;
        
        $rawPayrollRecords = Payroll::select('paid_at', 'month', 'year', 'net_salary', 'bonus', 'deduction')
            ->whereBetween('year', [$startYear, $endYear])
            ->whereIn('month', $this->getMonthsBetween($start, $end))
            ->toBase() // Memory optimization: returns raw scalar objects, completely bypassing heavy Eloquent hydration
            ->get();

        $payrollByDate = [];

        foreach ($rawPayrollRecords as $p) {
            $amount = (float)$p->net_salary + (float)$p->bonus - (float)$p->deduction;
            if ($amount <= 0) continue;

            $pDate = $p->paid_at ? Carbon::parse($p->paid_at) : Carbon::parse("1 {$p->month} {$p->year}");
            
            // Only include payroll if its assigned date falls within the selected date range
            if ($pDate->isBetween($start, $end)) {
                $dateStr = $pDate->format('Y-m-d');
                $payrollByDate[$dateStr] = ($payrollByDate[$dateStr] ?? 0) + $amount;
            }
        }

        // Remap to expected collection format
        $payrollRecords = collect();
        foreach ($payrollByDate as $date => $amount) {
            $payrollRecords->push(['date' => $date, 'amount' => $amount]);
        }

        $totalPayroll = $payrollRecords->sum('amount');
            
        $totalExpense = $totalExpenseItems + $totalPayroll;
        $profitMargin = $totalRevenue - $totalExpense;

        $stats = [
            [ 'id' => 1, 'label' => 'New Bookings',  'value' => (string) $newBookings, 'change' => '', 'positive' => true, 'icon' => 'calendar' ],
            [ 'id' => 2, 'label' => 'Total Revenue', 'value' => '$' . number_format($totalRevenue, 2), 'change' => '', 'positive' => true, 'icon' => 'dollar' ],
            [ 'id' => 3, 'label' => 'Total Expense', 'value' => '$' . number_format($totalExpense, 2), 'change' => '', 'positive' => false, 'icon' => 'dollar' ],
            [ 'id' => 4, 'label' => 'Profit Margin', 'value' => '$' . number_format($profitMargin, 2), 'change' => '', 'positive' => $profitMargin >= 0, 'icon' => 'dollar' ],
        ];

        // 2. Room Availability (Live snapshot, ignores dates typically, but we return current stats)
        $roomStatusCounts = Room::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();
            
        $roomAvailability = [
            'occupied'  => $roomStatusCounts['Occupied'] ?? 0,
            'reserved'  => $roomStatusCounts['Reserved'] ?? 0,
            'available' => $roomStatusCounts['Available'] ?? 0,
            'notReady'  => ($roomStatusCounts['Cleaning'] ?? 0) + ($roomStatusCounts['Maintenance'] ?? 0),
            'total'     => array_sum($roomStatusCounts),
        ];

        // 3. Reservations Data (Booked vs Canceled per day)
        // We group by DATE(created_at) for bookings and cancelled reservations.
        $reservationsRaw = Reservation::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(CASE WHEN status != "Cancelled" THEN 1 ELSE 0 END) as booked'),
                DB::raw('SUM(CASE WHEN status = "Cancelled" THEN 1 ELSE 0 END) as canceled')
            )
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();
            
        $reservationsData = $reservationsRaw->map(function ($row) {
            return [
                'date' => Carbon::parse($row->date)->format('d M'),
                'booked' => (int) $row->booked,
                'canceled' => (int) $row->canceled,
            ];
        });

        // 4. Revenue vs Expense per day
        $revenueRaw = Reservation::select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as revenue'))
            ->whereBetween('created_at', [$start, $end])
            ->where('status', 'Paid')
            ->groupBy('date')
            ->pluck('revenue', 'date');
            
        $expenseRaw = Expense::select('date', DB::raw('SUM(grand_total) as expense'))
            ->whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->groupBy('date')
            ->pluck('expense', 'date')
            ->toArray();

        // 4.1 Incorporate Payroll into daily expenses for the chart
        foreach ($payrollRecords as $p) {
            $targetDate = $p['date'];
            $expenseRaw[$targetDate] = ($expenseRaw[$targetDate] ?? 0) + $p['amount'];
        }
            
        // We'll merge these by date.
        $datesCollection = collect(array_keys($revenueRaw->toArray()))->merge(array_keys($expenseRaw))->unique()->sort();
        
        $revenueData = $datesCollection->map(function ($date) use ($revenueRaw, $expenseRaw) {
            return [
                // 'month' key is used by the frontend chart, though it represents days now. We'll format it nicely.
                'month'   => Carbon::parse($date)->format('d M'), 
                'revenue' => (float) ($revenueRaw[$date] ?? 0),
                'expense' => (float) ($expenseRaw[$date] ?? 0),
            ];
        })->values();

        // 5. Booking List (Recent 5 check-ins/reservations)
        $bookings = Reservation::with(['room.category'])
            ->whereBetween('created_at', [$start, $end])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($res) {
                // Map to the dashboard slice format
                return [
                    'id'       => $res->transaction_id,
                    'guest'    => $res->guest_name,
                    'type'     => $res->room ? $res->room->category->name : 'N/A',
                    'room'     => $res->room ? 'Room ' . $res->room->room_number : 'N/A',
                    'duration' => $res->person_count . ' Pax', // Quick workaround, or calculate nights
                    'checkIn'  => Carbon::parse($res->check_in)->format('F j, Y'),
                    'checkOut' => Carbon::parse($res->check_out)->format('F j, Y'),
                    'status'   => $res->status,
                ];
            });

        return [
            'stats'            => $stats,
            'roomAvailability' => $roomAvailability,
            'reservationsData' => $reservationsData,
            'revenueData'      => $revenueData,
            'bookings'         => $bookings,
        ];
    }
    
    private function getMonthsBetween($start, $end)
    {
        $months = [];
        $current = $start->copy()->startOfMonth();
        while($current <= $end) {
            $months[] = $current->format('F');
            $current->addMonth();
        }
        return $months;
    }
}
