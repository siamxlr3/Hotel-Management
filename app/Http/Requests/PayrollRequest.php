<?php

namespace App\Http\Requests;

use App\Models\Payroll;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PayrollRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'staff_id'   => 'required|exists:staff,id',
            'month'      => 'required|string',
            'year'       => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'net_salary' => 'required|numeric|min:0',
            'bonus'      => 'nullable|numeric|min:0',
            'deduction'  => 'nullable|numeric|min:0',
            'status'     => ['required', Rule::in([Payroll::STATUS_PAID, Payroll::STATUS_UNPAID])],
            'paid_at'    => 'nullable|date',
        ];
    }
}
