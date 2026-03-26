<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StaffRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('staff')?->id;

        return [
            'staff_code' => ['required', 'string', 'max:20', Rule::unique('staff', 'staff_code')->ignore($id)],
            'name' => 'required|string|max:200',
            'email' => ['required', 'email', 'max:150', Rule::unique('staff', 'email')->ignore($id)],
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'nid_number' => ['required', 'string', 'max:50', Rule::unique('staff', 'nid_number')->ignore($id)],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'role_id' => 'required|exists:roles,id',
            'shift_id' => 'required|exists:shifts,id',
            'salary' => 'required|numeric|min:0',
            'joined_at' => 'required|date',
            'status' => 'required|in:Active,Inactive',
            'remove_image' => 'nullable|boolean',
        ];
    }
}
