<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class HomeFeatureRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'title'       => 'required|string|max:200',
            'description' => 'required|string',
        ];
    }
}
