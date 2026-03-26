<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeaveRequest;
use App\Models\Leave;
use App\Services\LeaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function __construct(private LeaveService $service) {}

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

    public function store(LeaveRequest $request): JsonResponse
    {
        try {
            $leave = $this->service->create($request->validated());
            return response()->json(['success' => true, 'data' => $leave, 'message' => 'Leave application submitted.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(Leave $leaf): JsonResponse
    {
        $leaf->load(['staff', 'leaveType']);
        return response()->json(['success' => true, 'data' => $leaf]);
    }

    public function update(LeaveRequest $request, Leave $leaf): JsonResponse
    {
        try {
            $updated = $this->service->update($leaf, $request->validated());
            return response()->json(['success' => true, 'data' => $updated, 'message' => 'Leave updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Leave $leaf): JsonResponse
    {
        try {
            $this->service->delete($leaf);
            return response()->json(['success' => true, 'message' => 'Leave deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
