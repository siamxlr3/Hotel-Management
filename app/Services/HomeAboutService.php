<?php
namespace App\Services;

use App\Models\HomeAbout;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class HomeAboutService
{
    use HandlesImageUpload;

    public function getAll(array $f): LengthAwarePaginator
    {
        return HomeAbout::latest()->paginate(min((int)($f['per_page'] ?? 15), 100));
    }

    public function create(array $data, Request $request): HomeAbout
    {
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('about', 'public');
        }

        // Clean up data
        unset($data['image']);

        return HomeAbout::create($data);
    }

    public function update(HomeAbout $about, array $data, Request $request): HomeAbout
    {
        if ($request->input('remove_image')) {
            $this->deleteImage($about->image);
            $data['image'] = null;
        } elseif ($request->hasFile('image')) {
            $data['image'] = $this->storeImage(
                $request->file('image'), 'about', $about->image
            );
        }

        // Clean up data
        unset($data['image'], $data['remove_image']);

        $about->update($data);
        return $about->fresh();
    }

    public function delete(HomeAbout $about): void
    {
        $this->deleteImage($about->image);
        $about->delete();
    }
}
