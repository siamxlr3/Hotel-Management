<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExpenseRequest;
use App\Models\Expense;
use App\Models\HomeContact;
use App\Models\Home;
use App\Services\ExpenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(private ExpenseService $service) {}

    private function meta($p): array
    {
        return [
            'current_page' => $p->currentPage(),
            'last_page'    => $p->lastPage(),
            'per_page'     => $p->perPage(),
            'total'        => $p->total(),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getAll($request->all());
            return response()->json([
                'success' => true,
                'data'    => $data->items(),
                'meta'    => $this->meta($data),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()], 500);
        }
    }

    public function store(ExpenseRequest $request): JsonResponse
    {
        try {
            $expense = $this->service->create($request->validated());
            return response()->json([
                'success' => true,
                'data'    => $expense,
                'message' => 'Expense created successfully.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()], 500);
        }
    }

    public function show(Expense $expense): JsonResponse
    {
        return response()->json(['success'=>true,'data'=>$expense]);
    }

    public function update(ExpenseRequest $request, Expense $expense): JsonResponse
    {
        try {
            $updated = $this->service->update($expense, $request->validated());
            return response()->json([
                'success' => true,
                'data'    => $updated,
                'message' => 'Expense updated successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()], 500);
        }
    }

    public function destroy(Expense $expense): JsonResponse
    {
        try {
            $this->service->delete($expense);
            return response()->json(['success'=>true,'message'=>'Expense deleted.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()], 500);
        }
    }

    /**
     * Summary stats endpoint
     */
    public function summary(Request $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data'    => $this->service->getSummary($request->all()),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()], 500);
        }
    }

    /**
     * Hotel info for invoice header
     * Pulls from home_contacts + homes tables
     */
    public function hotelInfo(): JsonResponse
    {
        try {
            $contact = HomeContact::latest()->first();
            $home    = Home::latest()->first();
            return response()->json([
                'success' => true,
                'data'    => [
                    'hotel_name' => $home?->hotel_name ?? 'Hotel Management',
                    'phone'      => $contact?->phone   ?? '',
                    'email'      => $contact?->email   ?? '',
                    'address'    => $contact?->address ?? '',
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()], 500);
        }
    }
}
