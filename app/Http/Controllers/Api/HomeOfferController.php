<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HomeOfferRequest;
use App\Models\HomeOffer;
use App\Services\HomeOfferService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HomeOfferController extends Controller
{
    public function __construct(private HomeOfferService $service) {}

    private function meta($p): array {
        return ['current_page'=>$p->currentPage(),'last_page'=>$p->lastPage(),
                'per_page'=>$p->perPage(),'total'=>$p->total()];
    }

    private function transform(HomeOffer $o): array {
        $arr = $o->toArray();
        $arr['image_url'] = $o->image ? "/storage/{$o->image}" : null;
        return $arr;
    }

    public function index(Request $request): JsonResponse {
        try {
            $data = $this->service->getAll($request->all());
            return response()->json(['success'=>true,
                'data'=>array_map(fn($o)=>$this->transform($o),$data->items()),
                'meta'=>$this->meta($data)]);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function store(HomeOfferRequest $request): JsonResponse {
        try {
            $offer = $this->service->create($request->validated(), $request);
            return response()->json(['success'=>true,'data'=>$this->transform($offer),
                'message'=>'Offer created.'],201);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function show(HomeOffer $homeOffer): JsonResponse {
        return response()->json(['success'=>true,'data'=>$this->transform($homeOffer)]);
    }
    public function update(HomeOfferRequest $request, HomeOffer $homeOffer): JsonResponse {
        try {
            $updated = $this->service->update($homeOffer, $request->validated(), $request);
            return response()->json(['success'=>true,'data'=>$this->transform($updated),
                'message'=>'Offer updated.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function destroy(HomeOffer $homeOffer): JsonResponse {
        try {
            $this->service->delete($homeOffer);
            return response()->json(['success'=>true,'message'=>'Offer deleted.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
}
