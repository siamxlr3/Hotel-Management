<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class HomeGalleryImageRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|mimes:jpg,jpeg,png,webp',
            'keep_gallery'      => 'nullable|array',
            'keep_gallery.*'    => 'string',
            'remove_gallery'    => 'nullable|array',
            'remove_gallery.*'  => 'string',
        ];
    }

    public function messages(): array
    {
        return [
            'gallery.*.image'   => 'One or more of the selected files is not a valid image.',
            'gallery.*.mimes'   => 'Gallery images must be in JPG, PNG, or WebP format.',
            'gallery.*.uploaded'=> 'An image failed to upload. Please ensure your files are not too large and try again.',
        ];
    }
}
