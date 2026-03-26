<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HomeFeatureRequest;
use App\Models\HomeFeature;
use App\Services\HomeFeatureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeFeatureController extends Controller
{
    public function __construct(private HomeFeatureService $service) {}

    private function meta($p): array {
        return ['current_page'=>$p->currentPage(),'last_page'=>$p->lastPage(),
                'per_page'=>$p->perPage(),'total'=>$p->total()];
    }

    public function index(Request $request): JsonResponse {
        try {
            $data = $this->service->getAll($request->all());
            return response()->json(['success'=>true,'data'=>$data->items(),'meta'=>$this->meta($data)]);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function store(HomeFeatureRequest $request): JsonResponse {
        try {
            $f = $this->service->create($request->validated());
            return response()->json(['success'=>true,'data'=>$f,'message'=>'Feature created.'],201);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function show(HomeFeature $homeFeature): JsonResponse {
        return response()->json(['success'=>true,'data'=>$homeFeature]);
    }
    public function update(HomeFeatureRequest $request, HomeFeature $homeFeature): JsonResponse {
        try {
            $f = $this->service->update($homeFeature, $request->validated());
            return response()->json(['success'=>true,'data'=>$f,'message'=>'Feature updated.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function destroy(HomeFeature $homeFeature): JsonResponse {
        try {
            $this->service->delete($homeFeature);
            return response()->json(['success'=>true,'message'=>'Feature deleted.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
}
