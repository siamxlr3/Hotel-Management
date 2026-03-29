<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReservationRequest;
use App\Models\Reservation;
use App\Models\Tax;
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
            $data = $request->validated();
            
            // Adjust totals dynamically based on current DB taxes
            $activeTaxes = Tax::active()->get();
            $taxPercent = $activeTaxes->sum('rate') ?? 0;
            
            if (isset($data['subtotal'])) {
                $data['tax_percent'] = $taxPercent;
                $data['tax_amount'] = $data['subtotal'] * ($taxPercent / 100);
                $data['total_amount'] = $data['subtotal'] + $data['tax_amount'];
            }

            $reservation = $this->service->create($data);
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
            $data = $request->validated();

            // Only dynamically recalculate the totals if the reservation has not been fully paid yet
            // This prevents changing historical prices if someone updates a guest name later
            if ($reservation->payment_status !== 'Completed' && $reservation->status !== 'Paid') {
                $subtotal = $data['subtotal'] ?? $reservation->subtotal;
                $activeTaxes = Tax::active()->get();
                $taxPercent = $activeTaxes->sum('rate') ?? 0;
                
                if ($subtotal !== null) {
                    $data['tax_percent'] = $taxPercent;
                    $data['tax_amount'] = $subtotal * ($taxPercent / 100);
                    $data['total_amount'] = $subtotal + $data['tax_amount'];
                }
            }

            $updated = $this->service->update($reservation, $data);
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
            $activeTaxes = \App\Models\Tax::active()->get();
            
            $pdf = PDF::loadView('pdf.reservation_invoice', compact('reservation', 'activeTaxes'));
            
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
