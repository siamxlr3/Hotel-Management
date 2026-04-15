<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $roleId = $this->route('role')?->id;

        return [
            'name'   => [
                'required', 'string', 'max:100',
                Rule::unique('roles', 'name')->ignore($roleId),
            ],
            'status' => ['required', Rule::in([Role::STATUS_ACTIVE, Role::STATUS_INACTIVE])],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required.',
            'name.unique'   => 'This role name already exists.',
            'status.in'     => 'Status must be Active or Inactive.',
        ];
    }
}
