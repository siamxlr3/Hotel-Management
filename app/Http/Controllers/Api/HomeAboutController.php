<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HomeAboutRequest;
use App\Models\HomeAbout;
use App\Services\HomeAboutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HomeAboutController extends Controller
{
    public function __construct(private HomeAboutService $service) {}

    private function meta($p): array {
        return ['current_page'=>$p->currentPage(),'last_page'=>$p->lastPage(),
                'per_page'=>$p->perPage(),'total'=>$p->total()];
    }

    private function transform(HomeAbout $a): array {
        $arr = $a->toArray();
        $arr['image_url'] = $a->image ? "/storage/{$a->image}" : null;
        return $arr;
    }

    public function index(Request $request): JsonResponse {
        try {
            $data = $this->service->getAll($request->all());
            return response()->json(['success'=>true,
                'data'=>array_map(fn($a)=>$this->transform($a),$data->items()),
                'meta'=>$this->meta($data)]);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }

    public function store(HomeAboutRequest $request): JsonResponse {
        try {
            $about = $this->service->create($request->validated(), $request);
            return response()->json(['success'=>true,'data'=>$this->transform($about),
                'message'=>'About section created.'],201);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }

    public function show(HomeAbout $homeAbout): JsonResponse {
        return response()->json(['success'=>true,'data'=>$this->transform($homeAbout)]);
    }

    public function update(HomeAboutRequest $request, HomeAbout $homeAbout): JsonResponse {
        try {
            $updated = $this->service->update($homeAbout, $request->validated(), $request);
            return response()->json(['success'=>true,'data'=>$this->transform($updated),
                'message'=>'About section updated.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }

    public function destroy(HomeAbout $homeAbout): JsonResponse {
        try {
            $this->service->delete($homeAbout);
            return response()->json(['success'=>true,'message'=>'About section deleted.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
}
