<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportRequest;
use App\Http\Resources\ReportResource;
use App\Services\ReportService;
use Exception;

class ReportController extends Controller
{
    public function __construct(private ReportService $reportService) {}

    /**
     * Display the dashboard reports.
     */
    public function index(ReportRequest $request): ReportResource|JsonResponse
    {
        try {
            $data = $this->reportService->getDashboardReport($request->from_date, $request->to_date);

            return new ReportResource($data);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report. Please try again later.'
            ], 500);
        }
    }
}
