<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HomeGalleryImageRequest;
use App\Models\HomeGalleryImage;
use App\Services\HomeGalleryImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HomeGalleryImageController extends Controller
{
    public function __construct(private HomeGalleryImageService $service) {}

    private function meta($p): array {
        return ['current_page'=>$p->currentPage(),'last_page'=>$p->lastPage(),
                'per_page'=>$p->perPage(),'total'=>$p->total()];
    }

    private function transform(HomeGalleryImage $g): array {
        $arr = $g->toArray();
        $arr['gallery_urls'] = array_map(
            fn($p) => Storage::disk('public')->url($p),
            $g->gallery ?? []
        );
        return $arr;
    }

    public function index(Request $request): JsonResponse {
        try {
            $data = $this->service->getAll($request->all());
            return response()->json(['success'=>true,
                'data'=>array_map(fn($g)=>$this->transform($g),$data->items()),
                'meta'=>$this->meta($data)]);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function store(HomeGalleryImageRequest $request): JsonResponse {
        try {
            $gallery = $this->service->create($request->validated(), $request);
            return response()->json(['success'=>true,'data'=>$this->transform($gallery),
                'message'=>'Gallery created.'],201);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function show(HomeGalleryImage $homeGallery): JsonResponse {
        return response()->json(['success'=>true,'data'=>$this->transform($homeGallery)]);
    }
    public function update(HomeGalleryImageRequest $request, HomeGalleryImage $homeGallery): JsonResponse {
        try {
            $updated = $this->service->update($homeGallery, $request->validated(), $request);
            return response()->json(['success'=>true,'data'=>$this->transform($updated),
                'message'=>'Gallery updated.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function destroy(HomeGalleryImage $homeGallery): JsonResponse {
        try {
            $this->service->delete($homeGallery);
            return response()->json(['success'=>true,'message'=>'Gallery deleted.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
}
