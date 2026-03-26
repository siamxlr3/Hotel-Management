<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceRequest;
use App\Models\Attendance;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function __construct(private AttendanceService $service) {}

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

    public function store(AttendanceRequest $request): JsonResponse
    {
        try {
            $attendance = $this->service->create($request->validated());
            return response()->json(['success' => true, 'data' => $attendance, 'message' => 'Attendance recorded successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(Attendance $attendance): JsonResponse
    {
        $attendance->load('staff');
        return response()->json(['success' => true, 'data' => $attendance]);
    }

    public function update(AttendanceRequest $request, Attendance $attendance): JsonResponse
    {
        try {
            $updated = $this->service->update($attendance, $request->validated());
            return response()->json(['success' => true, 'data' => $updated, 'message' => 'Attendance updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Attendance $attendance): JsonResponse
    {
        try {
            $this->service->delete($attendance);
            return response()->json(['success' => true, 'message' => 'Attendance deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
