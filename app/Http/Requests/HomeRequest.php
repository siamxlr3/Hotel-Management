<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class HomeRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');
        return [
            'hotel_name'  => 'required|string|max:200',
            'logo'        => ($isUpdate ? 'nullable' : 'nullable') . '|image|mimes:jpg,jpeg,png,webp',
            'hero'        => 'nullable|array',
            'hero.*'      => 'image|mimes:jpg,jpeg,png,webp',
        ];
    }

    public function messages(): array
    {
        return [
            'logo.image'    => 'The logo must be a valid image file.',
            'logo.mimes'    => 'The logo must be in JPG, PNG, or WebP format.',
            'logo.uploaded' => 'The logo failed to upload. Please try a different file.',
            'hero.*.image'  => 'One or more hero files are not valid images.',
            'hero.*.mimes'  => 'Hero images must be in JPG, PNG, or WebP format.',
            'hero.*.uploaded'=> 'A hero image failed to upload. Please ensure your files are not too large and try again.',
        ];
    }
}
