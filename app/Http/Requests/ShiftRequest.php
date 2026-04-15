<?php

namespace App\Http\Requests;

use App\Models\Shift;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShiftRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'       => 'required|string|max:100',
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i',
            'status'     => ['required', Rule::in([Shift::STATUS_ACTIVE, Shift::STATUS_INACTIVE])],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Status must be Active or Inactive.',
        ];
    }
}
