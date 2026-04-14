<?php
namespace App\Services;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\Tax;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReservationService
{
    /**
     * Get paginated reservations with filtering
     */
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Reservation::with('room.category');

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['room_id'])) {
            $query->where('room_id', $filters['room_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->where(function($q) use ($filters) {
                $q->whereDate('check_in', '>=', $filters['start_date'])
                  ->whereDate('check_out', '<=', $filters['end_date']);
            });
        } elseif (!empty($filters['date'])) {
            $date = Carbon::parse($filters['date'])->toDateString();
            $query->whereDate('check_in', '<=', $date)
                  ->whereDate('check_out', '>=', $date);
        }

        $perPage = min((int)($filters['per_page'] ?? 15), 100);

        return $query->latest('id')->paginate($perPage);
    }

    /**
     * Create a new reservation and update room status
     */
    public function create(array $data): Reservation
    {
        return DB::transaction(function () use ($data) {
            $data = $this->calculateTotals($data);

            if ($data['booking_type'] === 'Booking' && empty($data['checked_in_at'])) {
                $data['checked_in_at'] = now();
            }

            $reservation = Reservation::create($data);

            // Update Room status based on booking type
            $roomStatus = ($data['booking_type'] === 'Reservation') ? Reservation::STATUS_RESERVED : Reservation::STATUS_OCCUPIED;
            
            Room::where('id', $data['room_id'])->update(['status' => $roomStatus]);

            return $reservation->load('room.category');
        });
    }

    /**
     * Update an existing reservation
     */
    public function update(Reservation $reservation, array $data): Reservation
    {
        return DB::transaction(function () use ($reservation, $data) {
            // Recalculate totals if subtotal changes and it's not fully paid
            if (isset($data['subtotal']) && $reservation->payment_status !== 'Completed' && $reservation->status !== Reservation::STATUS_PAID) {
                $data = $this->calculateTotals($data);
            }

            $reservation->update($data);
            
            // If checking out/paying, the room status changes to Cleaning
            if (isset($data['status']) && $data['status'] === Reservation::STATUS_PAID) {
                Room::where('id', $reservation->room_id)->update(['status' => Reservation::STATUS_CLEANING]);
            }
            // If checking in a guest for a reserved room
            elseif (isset($data['checked_in_at']) && $reservation->room->status === Reservation::STATUS_RESERVED) {
                Room::where('id', $reservation->room_id)->update(['status' => Reservation::STATUS_OCCUPIED]);
                
                if (empty($reservation->checked_in_at)) {
                    $reservation->checked_in_at = now();
                    $reservation->save();
                }
            }

            return $reservation->fresh('room.category');
        });
    }

    /**
     * Cancel a reservation
     */
    public function cancel(Reservation $reservation): Reservation
    {
        return DB::transaction(function () use ($reservation) {
            $reservation->status = Reservation::STATUS_CANCELLED;
            $reservation->cancelled_at = now();
            $reservation->save();

            if ($reservation->room) {
                $reservation->room->update(['status' => Reservation::STATUS_AVAILABLE]);
            }

            return $reservation;
        });
    }

    /**
     * Internal: Calculate taxes and totals
     */
    private function calculateTotals(array $data): array
    {
        if (!isset($data['subtotal'])) {
            return $data;
        }

        $activeTaxes = Tax::active()->get();
        $taxPercent = $activeTaxes->sum('rate') ?? 0;
        
        $data['tax_percent'] = $taxPercent;
        $data['tax_amount'] = $data['subtotal'] * ($taxPercent / 100);
        $data['total_amount'] = $data['subtotal'] + $data['tax_amount'];

        return $data;
    }

    /**
     * Delete a reservation 
     */
    public function delete(Reservation $reservation): void
    {
        DB::transaction(function () use ($reservation) {
            $roomId = $reservation->room_id;
            $reservation->delete();
            Room::where('id', $roomId)->update(['status' => Reservation::STATUS_AVAILABLE]);
        });
    }

    /**
     * Get limited checkouts for a specific date (for the sidebar widget)
     */
    public function getCheckouts(array $filters): array
    {
        $date = !empty($filters['date']) ? Carbon::parse($filters['date'])->toDateString() : Carbon::today()->toDateString();
        
        return Reservation::with('room.category')
            ->whereDate('check_out', $date)
            ->latest('id')
            ->get()
            ->toArray();
    }
}
