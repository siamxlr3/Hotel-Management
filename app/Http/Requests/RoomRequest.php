<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoomRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $roomId = $this->route('room');
        $req = $this->isMethod('put') || $this->isMethod('patch') ? 'sometimes' : 'required';
        $rules = [
            'room_number' => [
                $req, 'required', 'string', 'max:20',
                Rule::unique('rooms', 'room_number')->ignore($roomId),
            ],
            'category_id' => [$req, 'required', 'integer', 'exists:room_categories,id'],
            'base_price'  => [$req, 'required', 'numeric', 'min:0', 'max:99999.99'],
            'capacity'    => [$req, 'required', 'integer', 'min:1', 'max:20'],
            'features'        => 'nullable|array',
            'features.*'      => 'string|max:50',
            'existing_images' => 'nullable|array',
            'existing_images.*' => 'string',
            'new_images'      => 'nullable|array',
            'new_images.*'    => 'image|mimes:jpg,jpeg,png,webp',
            'floor'           => [$req, 'required', 'integer', 'min:1', 'max:200'],
            'status'          => [$req, 'required', Rule::in([
                Room::STATUS_AVAILABLE,
                Room::STATUS_OCCUPIED,
                Room::STATUS_RESERVED,
                Room::STATUS_MAINTENANCE,
                Room::STATUS_CLEANING,
            ])],
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'room_number.required' => 'Room number is required.',
            'room_number.unique'   => 'This room number already exists.',
            'category_id.exists'   => 'Selected category does not exist.',
            'base_price.min'       => 'Price cannot be negative.',
            'new_images.*.image'   => 'One or more of the selected files is not a valid image.',
            'new_images.*.mimes'   => 'Room images must be in JPG, PNG, or WebP format.',
            'new_images.*.uploaded'=> 'An image failed to upload. Please ensure your files are not too large and try again.',
        ];
    }
}
