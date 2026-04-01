<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class HomeAboutRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'description' => 'required|string',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp',
        ];
    }

    public function messages(): array
    {
        return [
            'image.image'    => 'The uploaded file must be a valid image.',
            'image.mimes'    => 'The image must be in JPG, PNG, or WebP format.',
            'image.uploaded' => 'The image failed to upload. Please ensure the file is not corrupted or too large.',
        ];
    }
}
