<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class HomeAboutRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'description' => 'required|string',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
        ];
    }
}
