<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GlobalDiscountRequest;
use App\Models\GlobalDiscount;
use App\Services\GlobalDiscountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalDiscountController extends Controller
{
    public function __construct(private GlobalDiscountService $service) {}

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
                'success' => true, 'data' => $data->items(),
                'meta'    => $this->meta($data),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(GlobalDiscountRequest $request): JsonResponse
    {
        try {
            $item = $this->service->create($request->validated());
            return response()->json(['success' => true, 'data' => $item,
                'message' => 'Global discount created.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(GlobalDiscount $globalDiscount): JsonResponse
    {
        return response()->json(['success' => true,
            'data' => $globalDiscount->load('room:id,room_number')]);
    }

    public function update(GlobalDiscountRequest $request,
                           GlobalDiscount $globalDiscount): JsonResponse
    {
        try {
            $updated = $this->service->update($globalDiscount, $request->validated());
            return response()->json(['success' => true, 'data' => $updated,
                'message' => 'Global discount updated.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(GlobalDiscount $globalDiscount): JsonResponse
    {
        try {
            $this->service->delete($globalDiscount);
            return response()->json(['success' => true,
                'message' => 'Global discount deleted.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
