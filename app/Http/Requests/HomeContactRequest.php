<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class HomeContactRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'phone'       => 'nullable|string|max:30',
            'email'       => 'nullable|email|max:150',
            'address'     => 'nullable|string|max:300',
            'facebook'    => 'nullable|url|max:300',
            'instagram'   => 'nullable|url|max:300',
            'tiktok'      => 'nullable|url|max:300',
            'maps_iframe' => 'nullable|string',
        ];
    }
}
