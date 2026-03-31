<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HomeRequest;
use App\Models\Home;
use App\Services\HomeService;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HomeController extends Controller
{
    use HandlesImageUpload;
    public function __construct(private HomeService $service) {}

    private function meta($p): array {
        return ['current_page'=>$p->currentPage(),'last_page'=>$p->lastPage(),
                'per_page'=>$p->perPage(),'total'=>$p->total()];
    }

    public function index(Request $request): JsonResponse {
        try {
            $data = $this->service->getAll($request->all());
            return response()->json([
                'success' => true,
                'data'    => $data->items(),
                'meta'    => $this->meta($data),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()], 500);
        }
    }

    public function store(HomeRequest $request): JsonResponse {
        try {
            $home = $this->service->create($request->validated(), $request);
            return response()->json(['success'=>true,'data'=>$home,
                'message'=>'Home created.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()], 500);
        }
    }

    public function show(Home $home): JsonResponse {
        return response()->json(['success'=>true,'data'=>$home]);
    }

    public function update(HomeRequest $request, Home $home): JsonResponse {
        try {
            $updated = $this->service->update($home, $request->validated(), $request);
            return response()->json(['success'=>true,'data'=>$updated,
                'message'=>'Home updated.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()], 500);
        }
    }

    public function destroy(Home $home): JsonResponse {
        try {
            $this->service->delete($home);
            return response()->json(['success'=>true,'message'=>'Home deleted.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()], 500);
        }
    }
}
