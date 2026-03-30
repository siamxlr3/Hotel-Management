<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoomRequest;
use App\Models\Room;
use App\Services\RoomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function __construct(private RoomService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->service->getAll($request->all());
            return response()->json([
                'success' => true,
                'data'    => $data->items(),
                'meta'    => [
                    'current_page' => $data->currentPage(),
                    'last_page'    => $data->lastPage(),
                    'per_page'     => $data->perPage(),
                    'total'        => $data->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(RoomRequest $request): JsonResponse
    {
        try {
            $room = $this->service->create($request->validated());
            return response()->json(['success' => true, 'data' => $room, 'message' => 'Room created successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(Room $room): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $room->load('category:id,name')]);
    }

    public function update(RoomRequest $request, Room $room): JsonResponse
    {
        try {
            $updated = $this->service->update($room, $request->validated());
            return response()->json(['success' => true, 'data' => $updated, 'message' => 'Room updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, Room $room): JsonResponse
    {
        try {
            $request->validate(['status' => 'required|string']);
            $room->update(['status' => $request->status]);
            return response()->json(['success' => true, 'message' => 'Room status updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Room $room): JsonResponse
    {
        try {
            $this->service->delete($room);
            return response()->json(['success' => true, 'message' => 'Room deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
