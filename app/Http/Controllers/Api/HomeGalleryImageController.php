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

    public function index(Request $request): JsonResponse {
        try {
            $data = $this->service->getAll($request->all());
            return response()->json(['success'=>true,
                'data'=>$data->items(),
                'meta'=>$this->meta($data)]);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function store(HomeGalleryImageRequest $request): JsonResponse {
        try {
            $gallery = $this->service->create($request->validated(), $request);
            return response()->json(['success'=>true,'data'=>$gallery,
                'message'=>'Gallery created.'],201);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function show(HomeGalleryImage $homeGallery): JsonResponse {
        return response()->json(['success'=>true,'data'=>$homeGallery]);
    }
    public function update(HomeGalleryImageRequest $request, HomeGalleryImage $homeGallery): JsonResponse {
        try {
            $updated = $this->service->update($homeGallery, $request->validated(), $request);
            return response()->json(['success'=>true,'data'=>$updated,
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
