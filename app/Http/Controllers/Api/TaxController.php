<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaxRequest;
use App\Models\Tax;
use App\Services\TaxService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    public function __construct(private TaxService $service) {}

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
                'success' => true,
                'data'    => $data->items(),
                'meta'    => $this->meta($data),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(TaxRequest $request): JsonResponse
    {
        try {
            $tax = $this->service->create($request->validated());
            return response()->json(['success' => true, 'data' => $tax,
                'message' => 'Tax created successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(Tax $tax): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $tax]);
    }

    public function update(TaxRequest $request, Tax $tax): JsonResponse
    {
        try {
            $updated = $this->service->update($tax, $request->validated());
            return response()->json(['success' => true, 'data' => $updated,
                'message' => 'Tax updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Tax $tax): JsonResponse
    {
        try {
            $this->service->delete($tax);
            return response()->json(['success' => true,
                'message' => 'Tax deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
