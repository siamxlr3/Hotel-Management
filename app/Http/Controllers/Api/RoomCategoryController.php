<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoomCategoryRequest;
use App\Models\RoomCategory;
use App\Services\RoomCategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomCategoryController extends Controller
{
    public function __construct(private RoomCategoryService $service) {}

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

    public function store(RoomCategoryRequest $request): JsonResponse
    {
        try {
            $category = $this->service->create($request->validated());
            return response()->json(['success' => true, 'data' => $category, 'message' => 'Category created successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(RoomCategory $room_category): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $room_category->loadCount('rooms')]);
    }

    public function update(RoomCategoryRequest $request, RoomCategory $room_category): JsonResponse
    {
        try {
            $category = $this->service->update($room_category, $request->validated());
            return response()->json(['success' => true, 'data' => $category, 'message' => 'Category updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(RoomCategory $room_category): JsonResponse
    {
        try {
            $this->service->delete($room_category);
            return response()->json(['success' => true, 'message' => 'Category deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }
}
