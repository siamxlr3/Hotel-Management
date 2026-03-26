<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReservationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $req = $this->isMethod('put') || $this->isMethod('patch') ? 'sometimes|required' : 'required';

        return [
            'room_id'                   => "$req|integer|exists:rooms,id",
            'guest_name'                => "$req|string|max:150",
            'guest_phone'               => "$req|string|max:30",
            'guest_email'               => 'nullable|email|max:150',
            'identity_type'             => "$req|in:NID,PASSPORT,DRIVING LICENCE",
            'identity_number'           => "$req|string|max:100",
            'person_count'              => "$req|integer|min:1",
            'check_in'                  => "$req|date",
            'check_out'                 => "$req|date|after:check_in",
            'payment_method'            => 'nullable|string|max:50',
            'subtotal'                  => 'nullable|numeric|min:0',

            'tax_percent'               => 'nullable|numeric|min:0|max:100',
            'global_discount_percent'   => 'nullable|numeric|min:0|max:100',
            'category_discount_percent' => 'nullable|numeric|min:0|max:100',
            'tax_amount'                => 'nullable|numeric|min:0',
            'discount_amount'           => 'nullable|numeric|min:0',
            'total_amount'              => 'nullable|numeric|min:0',
            'booking_type'              => "$req|in:Booking,Reservation",
            'status'                    => 'nullable|in:Paid,Unpaid,Reserved,Occupied,Cleaning,Available,Cancelled',
            'payment_status'            => 'nullable|string',

            'checked_in_at'             => 'nullable|date',
            'checked_out_at'            => 'nullable|date',
        ];
    }
}
