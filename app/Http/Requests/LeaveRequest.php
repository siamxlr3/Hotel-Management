<?php

namespace App\Http\Requests;

use App\Models\Leave;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LeaveRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $req = $this->isMethod('put') || $this->isMethod('patch') ? 'sometimes' : 'required';

        return [
            'staff_id'      => [$req, 'required', 'exists:staff,id'],
            'leave_type_id' => [$req, 'required', 'exists:leave_types,id'],
            'start_date'    => [$req, 'required', 'date'],
            'end_date'      => [$req, 'required', 'date', 'after_or_equal:start_date'],
            'reason'        => 'nullable|string',
            'status'        => [$req, 'required', Rule::in([
                Leave::STATUS_PENDING,
                Leave::STATUS_APPROVED,
                Leave::STATUS_REJECTED,
            ])],
        ];
    }
}
