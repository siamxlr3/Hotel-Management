<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'supplier_name'  => 'required|string|max:200',
            'contact_person' => 'nullable|string|max:150',
            'phone'          => 'nullable|string|max:30',
            'address'        => 'nullable|string|max:1000',
            'line_items'     => 'required|array|min:1',
            'line_items.*.items'    => 'required|string|max:255',
            'line_items.*.category' => 'required|string',
            'line_items.*.qty'      => 'required|numeric|min:0.01',
            'line_items.*.price'    => 'required|numeric|min:0',
            'line_items.*.total'    => 'required|numeric|min:0',
            'grand_total'    => 'required|numeric|min:0',
            'date'           => 'required|date',
            'status'         => 'required|in:Paid,Unpaid',
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_name.required' => 'Supplier name is required.',
            'line_items.required'    => 'At least one item is required.',
            'line_items.array'       => 'Invalid item format.',
            'grand_total.required'   => 'Grand total is required.',
            'date.required'          => 'Expense date is required.',
            'status.in'              => 'Status must be Paid or Unpaid.',
        ];
    }
}
