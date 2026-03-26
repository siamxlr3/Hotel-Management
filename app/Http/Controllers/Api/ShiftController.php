<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShiftRequest;
use App\Models\Shift;
use App\Services\ShiftService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function __construct(private ShiftService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getAll($request->all());
            return response()->json([
                'success' => true,
                'data' => $data->items(),
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'last_page' => $data->lastPage(),
                    'per_page' => $data->perPage(),
                    'total' => $data->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(ShiftRequest $request): JsonResponse
    {
        try {
            $shift = $this->service->create($request->validated());
            return response()->json(['success' => true, 'data' => $shift, 'message' => 'Shift created successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(Shift $shift): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $shift]);
    }

    public function update(ShiftRequest $request, Shift $shift): JsonResponse
    {
        try {
            $updated = $this->service->update($shift, $request->validated());
            return response()->json(['success' => true, 'data' => $updated, 'message' => 'Shift updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Shift $shift): JsonResponse
    {
        try {
            $this->service->delete($shift);
            return response()->json(['success' => true, 'message' => 'Shift deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
