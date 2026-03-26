<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaxRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $taxId = $this->route('tax');
        return [
            'name'   => [
                'required', 'string', 'max:100',
                Rule::unique('taxes', 'name')->ignore($taxId),
            ],
            'rate'   => 'required|numeric|min:0|max:100',
            'status' => 'required|in:Active,Inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Tax name is required.',
            'name.unique'    => 'This tax name already exists.',
            'rate.required'  => 'Tax rate is required.',
            'rate.max'       => 'Tax rate cannot exceed 100%.',
            'status.in'      => 'Status must be Active or Inactive.',
        ];
    }
}
