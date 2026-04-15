<?php

namespace App\Http\Requests;

use App\Models\LeaveType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LeaveTypeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $leaveTypeId = $this->route('leave_type')?->id;

        return [
            'name'         => [
                'required', 'string', 'max:100',
                Rule::unique('leave_types', 'name')->ignore($leaveTypeId),
            ],
            'days_allowed' => 'required|integer|min:1',
            'description'  => 'nullable|string',
            'status'       => ['required', Rule::in([LeaveType::STATUS_ACTIVE, LeaveType::STATUS_INACTIVE])],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'       => 'Leave Type name is required.',
            'name.unique'         => 'This Leave Type name already exists.',
            'days_allowed.min'    => 'Days allowed must be at least 1.',
            'status.in'           => 'Status must be Active or Inactive.',
        ];
    }
}
