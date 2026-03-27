<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReservationRequest;
use App\Models\Reservation;
use App\Services\ReservationService;
use Barryvdh\Snappy\Facades\SnappyPdf as PDF;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function __construct(private ReservationService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getAll($request->all());
            return response()->json([
                'success' => true,
                'data'    => $data->items(),
                'meta'    => [
                    'current_page' => $data->currentPage(),
                    'last_page'    => $data->lastPage(),
                    'per_page'     => $data->perPage(),
                    'total'        => $data->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(ReservationRequest $request): JsonResponse
    {
        try {
            $reservation = $this->service->create($request->validated());
            return response()->json([
                'success' => true,
                'data'    => $reservation,
                'message' => 'Reservation created successfully.'
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(ReservationRequest $request, Reservation $reservation): JsonResponse
    {
        try {
            $updated = $this->service->update($reservation, $request->validated());
            return response()->json([
                'success' => true,
                'data'    => $updated,
                'message' => 'Reservation updated successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Reservation $reservation): JsonResponse
    {
        try {
            $this->service->delete($reservation);
            return response()->json(['success' => true, 'message' => 'Reservation deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function checkouts(Request $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data'    => $this->service->getCheckouts($request->all()),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function downloadInvoice(Reservation $reservation)
    {
        try {
            $reservation->load('room.category');
            
            $pdf = PDF::loadView('pdf.reservation_invoice', compact('reservation'));
            
            return $pdf->download('invoice-' . $reservation->transaction_id . '.pdf');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getActiveReservation($roomId): JsonResponse
    {
        try {
            $reservation = Reservation::where('room_id', $roomId)
                ->where('status', 'Unpaid')
                ->latest()
                ->first();

            if (!$reservation) {
                return response()->json(['success' => false, 'message' => 'No active reservation found'], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $reservation
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function cancelReservation($id): JsonResponse
    {
        try {
            $reservation = Reservation::findOrFail($id);

            if ($reservation->booking_type !== 'Reservation' || $reservation->status === Reservation::STATUS_CANCELLED) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only active reserved bookings can be cancelled.'
                ], 400);
            }

            $reservation->status = Reservation::STATUS_CANCELLED;
            $reservation->cancelled_at = now();
            $reservation->save();

            // Make sure the room becomes available again
            if ($reservation->room) {
                $reservation->room->update(['status' => 'Available']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Reservation cancelled successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
