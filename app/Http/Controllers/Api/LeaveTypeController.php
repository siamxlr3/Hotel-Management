<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeaveTypeRequest;
use App\Models\LeaveType;
use App\Services\LeaveTypeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    public function __construct(private LeaveTypeService $service) {}

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

    public function store(LeaveTypeRequest $request): JsonResponse
    {
        try {
            $leaveType = $this->service->create($request->validated());
            return response()->json(['success' => true, 'data' => $leaveType, 'message' => 'Leave Type created successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(LeaveType $leave_type): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $leave_type]);
    }

    public function update(LeaveTypeRequest $request, LeaveType $leave_type): JsonResponse
    {
        try {
            $updated = $this->service->update($leave_type, $request->validated());
            return response()->json(['success' => true, 'data' => $updated, 'message' => 'Leave Type updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(LeaveType $leave_type): JsonResponse
    {
        try {
            $this->service->delete($leave_type);
            return response()->json(['success' => true, 'message' => 'Leave Type deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
