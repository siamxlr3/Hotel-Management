<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class HomeGalleryImageRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'gallery' => 'required|array',
            'gallery.*' => 'image|mimes:jpg,jpeg,png,webp|max:10240',
            'keep_gallery'      => 'nullable|array',
            'keep_gallery.*'    => 'string',
            'remove_gallery'    => 'nullable|array',
            'remove_gallery.*'  => 'string',
        ];
    }
}
