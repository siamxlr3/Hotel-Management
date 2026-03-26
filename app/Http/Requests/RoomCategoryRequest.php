<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoomCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $categoryId = $this->route('room_category');

        return [
            'name' => [
                'required', 'string', 'max:100',
                Rule::unique('room_categories', 'name')
                    ->ignore($categoryId),
            ],
            'description' => 'nullable|string|max:1000',
            'status'      => 'required|in:Active,Inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required.',
            'name.unique'   => 'This category name already exists.',
            'status.in'     => 'Status must be Active or Inactive.',
        ];
    }
}
