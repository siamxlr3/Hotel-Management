<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GlobalDiscountRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:100',
            'value'       => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string|max:1000',
            'status'      => 'required|in:Active,Inactive',
            'valid_from'  => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
            'room_id'     => 'nullable|integer|exists:rooms,id',
        ];
    }

    public function messages(): array
    {
        return [
            'value.max'               => 'Discount cannot exceed 100%.',
            'valid_until.after_or_equal' => 'End date must be after start date.',
            'room_id.exists'          => 'Selected room does not exist.',
        ];
    }
}
