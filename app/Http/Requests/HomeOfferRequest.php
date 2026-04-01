<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class HomeOfferRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'title'       => 'required|string|max:200',
            'description' => 'required|string',
            'discount'    => 'required|numeric|min:0|max:100',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp',
            'start_date'  => 'nullable|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
        ];
    }
    public function messages(): array
    {
        return [
            'end_date.after_or_equal' => 'End date must be after or equal to start date.',
            'image.image'    => 'The uploaded file must be a valid image.',
            'image.mimes'    => 'The image must be in JPG, PNG, or WebP format.',
            'image.uploaded' => 'The image failed to upload. Please try a different file or ensure it is not too large.',
        ];
    }
}
