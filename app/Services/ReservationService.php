<?php
namespace App\Services;

use App\Models\Reservation;
use App\Models\Room;
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
            $search = '%' . $filters['search'] . '%';
            $query->where(function($q) use ($search) {
                $q->where('transaction_id', 'like', $search)
                  ->orWhere('guest_name', 'like', $search)
                  ->orWhere('guest_phone', 'like', $search)
                  ->orWhere('guest_email', 'like', $search)
                  ->orWhere('identity_number', 'like', $search)
                  ->orWhereHas('room', function($r) use ($search) {
                      $r->where('room_number', 'like', $search);
                  });
            });
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
            if ($data['booking_type'] === 'Booking' && empty($data['checked_in_at'])) {
                $data['checked_in_at'] = now();
            }

            $reservation = Reservation::create($data);

            // Update Room status based on booking type
            $roomStatus = ($data['booking_type'] === 'Reservation') ? 'Reserved' : 'Occupied';
            
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
            $reservation->update($data);
            
            // If checking out/paying, the room status changes to Cleaning
            if (isset($data['status']) && $data['status'] === 'Paid') {
                Room::where('id', $reservation->room_id)->update(['status' => 'Cleaning']);
            }
            // If upgrading from Reserved to Occupied
            elseif (isset($data['booking_type']) && $data['booking_type'] === 'Booking') {
                if ($reservation->room->status === 'Reserved') {
                    Room::where('id', $reservation->room_id)->update(['status' => 'Occupied']);
                    
                    if (empty($reservation->checked_in_at)) {
                        $reservation->checked_in_at = now();
                        $reservation->save();
                    }
                }
            }

            return $reservation->fresh('room.category');
        });
    }

    /**
     * Delete a reservation 
     */
    public function delete(Reservation $reservation): void
    {
        DB::transaction(function () use ($reservation) {
            $roomId = $reservation->room_id;
            $reservation->delete();
            // Optional: reset room to Available if it was active
            Room::where('id', $roomId)->update(['status' => 'Available']);
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
