<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LeaveTypeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'days_allowed' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',
        ];
    }
}
