<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HomeContactRequest;
use App\Models\HomeContact;
use App\Services\HomeContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeContactController extends Controller
{
    public function __construct(private HomeContactService $service) {}

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
    public function store(HomeContactRequest $request): JsonResponse {
        try {
            $c = $this->service->create($request->validated());
            return response()->json(['success'=>true,'data'=>$c,'message'=>'Contact created.'],201);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function show(HomeContact $homeContact): JsonResponse {
        return response()->json(['success'=>true,'data'=>$homeContact]);
    }
    public function update(HomeContactRequest $request, HomeContact $homeContact): JsonResponse {
        try {
            $updated = $this->service->update($homeContact, $request->validated());
            return response()->json(['success'=>true,'data'=>$updated,'message'=>'Contact updated.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
    public function destroy(HomeContact $homeContact): JsonResponse {
        try {
            $this->service->delete($homeContact);
            return response()->json(['success'=>true,'message'=>'Contact deleted.']);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()],500);
        }
    }
}
