<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class HomeRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');
        return [
            'hotel_name'  => 'required|string|max:200',
            'logo'        => ($isUpdate ? 'nullable' : 'nullable') . '|image|mimes:jpg,jpeg,png,webp|max:10240',
            'hero'        => 'nullable|array',
            'hero.*'      => 'image|mimes:jpg,jpeg,png,webp|max:10240',
        ];
    }
}
