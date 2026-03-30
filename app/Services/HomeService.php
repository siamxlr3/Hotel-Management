<?php
namespace App\Services;

use App\Models\Home;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class HomeService
{
    use HandlesImageUpload;

    public function getAll(array $f): LengthAwarePaginator
    {
        return Home::latest()->paginate(min((int)($f['per_page'] ?? 15), 100));
    }

    public function create(array $data, Request $request): Home
    {
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('logo', 'public');
        }
        if ($request->hasFile('hero')) {
            $data['hero'] = $this->storeMultipleImages(
                $request->file('hero'), 'hero'
            );
        }

        return Home::create($data);
    }

    public function update(Home $home, array $data, Request $request): Home
    {
        // ── Logo ──
        if ($request->input('remove_logo')) {
            $this->deleteImage($home->logo);
            $data['logo'] = null;
        } elseif ($request->hasFile('logo')) {
            $data['logo'] = $this->storeImage(
                $request->file('logo'), 'logo', $home->logo
            );
        }

        // ── Hero ──
        $existingHero = $home->hero ?? [];
        $removeHero   = $request->input('remove_hero', []);   // paths to delete
        $keepHero     = $request->input('keep_hero', []);      // paths to keep

        // Delete removed ones
        foreach ($removeHero as $path) {
            $this->deleteImage($path);
        }

        // Start with kept paths
        $heroResult = array_values(array_filter(
            $existingHero,
            fn($p) => in_array($p, $keepHero)
        ));

        // Append newly uploaded ones
        if ($request->hasFile('hero')) {
            $newPaths = $this->storeMultipleImages(
                $request->file('hero'), 'hero'
            );
            $heroResult = array_merge($heroResult, $newPaths);
        }

        if (!empty($heroResult) || $request->has('keep_hero') || $request->has('remove_hero')) {
            $data['hero'] = $heroResult;
        }

        $home->update($data);
        return $home->fresh();
    }

    public function delete(Home $home): void
    {
        $this->deleteImage($home->logo);
        $this->deleteImages($home->hero ?? []);
        $home->delete();
    }
}
