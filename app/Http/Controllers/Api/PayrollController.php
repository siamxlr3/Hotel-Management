<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PayrollRequest;
use App\Models\Payroll;
use App\Services\PayrollService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function __construct(private PayrollService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getAll($request->all());
            $summary = $this->service->getSummary($request->all());
            
            return response()->json([
                'success' => true,
                'data' => $data->items(),
                'summary' => $summary,
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

    public function store(PayrollRequest $request): JsonResponse
    {
        try {
            $payroll = $this->service->create($request->validated());
            return response()->json(['success' => true, 'data' => $payroll, 'message' => 'Payroll record created.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(Payroll $payroll): JsonResponse
    {
        $payroll->load('staff');
        return response()->json(['success' => true, 'data' => $payroll]);
    }

    public function update(PayrollRequest $request, Payroll $payroll): JsonResponse
    {
        try {
            $updated = $this->service->update($payroll, $request->validated());
            return response()->json(['success' => true, 'data' => $updated, 'message' => 'Payroll updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Payroll $payroll): JsonResponse
    {
        try {
            $this->service->delete($payroll);
            return response()->json(['success' => true, 'message' => 'Payroll record deleted.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function summary(Request $request): JsonResponse
    {
        try {
            $summary = $this->service->getSummary($request->all());
            return response()->json(['success' => true, 'data' => $summary]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
