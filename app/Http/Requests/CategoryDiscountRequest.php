<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryDiscountRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'category_id' => 'required|integer|exists:room_categories,id',
            'room_id'     => 'nullable|integer|exists:rooms,id',
            'name'        => 'required|string|max:100',
            'value'       => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string|max:1000',
            'status'      => 'required|in:Active,Inactive',
            'valid_from'  => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required'       => 'Category is required.',
            'category_id.exists'         => 'Selected category does not exist.',
            'value.max'                  => 'Discount cannot exceed 100%.',
            'valid_until.after_or_equal' => 'End date must be after start date.',
        ];
    }
}
