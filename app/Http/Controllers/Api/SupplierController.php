<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Services\ReceiptService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SupplierController extends Controller
{
    public function __construct(protected ReceiptService $receiptService)
    {
    }

    /**
     * Display a paginated listing of suppliers.
     *
     * NEW: $date parameter — filters by created_at date (YYYY-MM-DD).
     *      Added to cache key so filtered/unfiltered results are cached separately.
     */
    public function index(Request $request)
    {
        $page    = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 10);
        $search  = $request->input('search', '');
        $date    = $request->input('date', '');          // ← NEW

        $cacheKey = "suppliers_page_{$page}_limit_{$perPage}_search_{$search}_date_{$date}";

        return Cache::tags(['suppliers'])->remember($cacheKey, 3600, function () use ($perPage, $page, $search, $date) {
            return Supplier::query()
                ->select([
                    'id', 'supplier_id', 'name', 'contact_person',
                    'phone', 'email', 'address', 'status', 'total_price', 'created_at',
                ])
                ->withCount('items')
                ->when($search, function ($query, $search) {
                    $query->where('supplier_id', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                })
                ->when($date, fn($q, $d) => $q->whereDate('created_at', $d))  // ← NEW
                ->orderByDesc('created_at')
                ->paginate($perPage, ['*'], 'page', $page);
        });
    }

    public function store(StoreSupplierRequest $request)
    {
        try {
            DB::beginTransaction();

            $supplierId = 'SUP-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            $supplierData                = $request->only([
                'name', 'contact_person', 'phone', 'email', 'address', 'status', 'total_price',
            ]);
            $supplierData['supplier_id'] = $supplierId;

            $supplier = Supplier::create($supplierData);

            if ($request->has('items')) {
                $supplier->items()->createMany($request->input('items'));
            }

            DB::commit();
            $this->clearCache();

            return response()->json([
                'message' => 'Supplier and inventory recorded successfully',
                'data'    => $supplier->load('items'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Supplier store failed', [
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
                'payload' => $request->validated(),
            ]);
            return response()->json(['message' => 'Failed to record supplier data. Please try again.'], 500);
        }
    }

    public function show(Supplier $supplier)
    {
        return response()->json(['data' => $supplier->load('items')]);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        try {
            DB::beginTransaction();

            $supplier->update($request->only([
                'name', 'contact_person', 'phone', 'email', 'address', 'status', 'total_price',
            ]));

            if ($request->has('items')) {
                $supplier->items()->delete();
                $supplier->items()->createMany($request->input('items'));
            }

            DB::commit();
            $this->clearCache();

            return response()->json([
                'message' => 'Supplier updated successfully',
                'data'    => $supplier->load('items'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Supplier update failed', [
                'supplier_id' => $supplier->id,
                'error'       => $e->getMessage(),
                'trace'       => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to update supplier. Please try again.'], 500);
        }
    }

    public function destroy(Supplier $supplier)
    {
        try {
            $supplier->delete();
            $this->clearCache();
            return response()->json(['message' => 'Supplier deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Supplier delete failed', ['supplier_id' => $supplier->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete supplier. Please try again.'], 500);
        }
    }

    public function downloadReceipt(Supplier $supplier)
    {
        if ($supplier->status !== 'Paid') {
            return response()->json([
                'message' => 'Receipt can only be generated for suppliers with "Paid" status.',
            ], 422);
        }
        $supplier->load('items');
        return $this->receiptService->generateSupplierReceipt($supplier);
    }

    private function clearCache(): void
    {
        try {
            Cache::tags(['suppliers'])->flush();
        } catch (\Exception $e) {
            Log::error('Supplier cache clear failed', ['error' => $e->getMessage()]);
        }
    }
}