<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StaffRequest;
use App\Models\Staff;
use App\Services\StaffService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function __construct(private StaffService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getAll($request->all());
            
            // Return the items directly as the appends property handles image_url
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

    public function store(StaffRequest $request): JsonResponse
    {
        try {
            $staff = $this->service->create($request->validated());
            return response()->json(['success' => true, 'data' => $staff, 'message' => 'Staff created successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(Staff $staff): JsonResponse
    {
        $staff->load(['role', 'shift']);
        return response()->json(['success' => true, 'data' => $staff]);
    }

    public function update(StaffRequest $request, Staff $staff): JsonResponse
    {
        try {
            $updated = $this->service->update($staff, $request->validated());
            return response()->json(['success' => true, 'data' => $updated, 'message' => 'Staff updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Staff $staff): JsonResponse
    {
        try {
            $this->service->delete($staff);
            return response()->json(['success' => true, 'message' => 'Staff deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
