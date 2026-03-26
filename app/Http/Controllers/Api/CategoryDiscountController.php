<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryDiscountRequest;
use App\Models\CategoryDiscount;
use App\Services\CategoryDiscountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryDiscountController extends Controller
{
    public function __construct(private CategoryDiscountService $service) {}

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

    public function store(CategoryDiscountRequest $request): JsonResponse
    {
        try {
            $item = $this->service->create($request->validated());
            return response()->json(['success' => true, 'data' => $item,
                'message' => 'Category discount created.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(CategoryDiscount $categoryDiscount): JsonResponse
    {
        return response()->json(['success' => true,
            'data' => $categoryDiscount->load('category:id,name','room:id,room_number')]);
    }

    public function update(CategoryDiscountRequest $request,
                           CategoryDiscount $categoryDiscount): JsonResponse
    {
        try {
            $updated = $this->service->update($categoryDiscount, $request->validated());
            return response()->json(['success' => true, 'data' => $updated,
                'message' => 'Category discount updated.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(CategoryDiscount $categoryDiscount): JsonResponse
    {
        try {
            $this->service->delete($categoryDiscount);
            return response()->json(['success' => true,
                'message' => 'Category discount deleted.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
