<?php
namespace App\Services;

use App\Models\HomeOffer;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class HomeOfferService
{
    use HandlesImageUpload;

    public function getAll(array $f): LengthAwarePaginator
    {
        $q = HomeOffer::query();
        if (!empty($f['search'])) {
            $q->where('title', 'LIKE', "%{$f['search']}%");
        }
        return $q->latest()->paginate(min((int)($f['per_page'] ?? 15), 100));
    }

    public function create(array $data, Request $request): HomeOffer
    {
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('offer', 'public');
        }

        // Clean up data
        unset($data['image']);

        return HomeOffer::create($data);
    }

    public function update(HomeOffer $offer, array $data, Request $request): HomeOffer
    {
        if ($request->input('remove_image')) {
            $this->deleteImage($offer->image);
            $data['image'] = null;
        } elseif ($request->hasFile('image')) {
            $data['image'] = $this->storeImage(
                $request->file('image'), 'offer', $offer->image
            );
        }

        // Clean up data
        unset($data['image'], $data['remove_image']);

        $offer->update($data);
        return $offer->fresh();
    }

    public function delete(HomeOffer $offer): void
    {
        $this->deleteImage($offer->image);
        $offer->delete();
    }
}
