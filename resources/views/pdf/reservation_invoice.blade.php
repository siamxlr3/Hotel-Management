<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reservation Invoice #{{ $reservation->transaction_id }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.5; font-size: 14px; margin: 0; padding: 20px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2D3A2E; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2D3A2E; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { margin: 0; color: #4F46E5; }
        .grid { display: table; width: 100%; margin-bottom: 30px; }
        .col { display: table-cell; width: 50%; }
        .info-box { background: #f8f9fc; padding: 15px; border-radius: 8px; }
        .info-box h4 { margin-top: 0; margin-bottom: 10px; color: #555; font-size: 12px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #2D3A2E; color: white; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .total-row td { border-bottom: none; }
        .grand-total { font-size: 18px; font-weight: bold; color: #2D3A2E; background: #E8F5E0; }
        .footer { text-align: center; font-size: 12px; color: #888; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            HOTEL MANAGEMENT<br>
            <span style="font-size: 12px; color: #666; font-weight: normal;">123 Luxury Avenue, Metropolis</span>
        </div>
        <div class="invoice-details">
            <h2>PAYMENT RECEIPT</h2>
            <p><strong>Trx ID:</strong> {{ $reservation->transaction_id }}<br>
               <strong>Date:</strong> {{ \Carbon\Carbon::parse($reservation->checked_out_at)->format('d M Y, h:i A') }}</p>
        </div>
    </div>

    <div class="grid">
        <div class="col" style="padding-right: 15px;">
            <div class="info-box">
                <h4>Guest Information</h4>
                <strong>{{ $reservation->guest_name }}</strong><br>
                Phone: {{ $reservation->guest_phone }}<br>
                Email: {{ $reservation->guest_email ?? 'N/A' }}<br>
                {{ $reservation->identity_type }}: {{ $reservation->identity_number }}
            </div>
        </div>
        <div class="col" style="padding-left: 15px;">
            <div class="info-box">
                <h4>Stay Details</h4>
                <strong>Room {{ $reservation->room->room_number ?? 'N/A' }}</strong> ({{ $reservation->room->category->name ?? 'N/A' }})<br>
                Check-in: {{ \Carbon\Carbon::parse($reservation->check_in)->format('d M Y') }}<br>
                Check-out: {{ \Carbon\Carbon::parse($reservation->check_out)->format('d M Y') }}<br>
                Persons: {{ $reservation->person_count }}
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Accommodation ({{ \Carbon\Carbon::parse($reservation->check_in)->diffInDays(\Carbon\Carbon::parse($reservation->check_out)) ?: 1 }} nights)</td>
                <td style="text-align: right;">${{ number_format($reservation->subtotal, 2) }}</td>
            </tr>
            @if(isset($activeTaxes) && count($activeTaxes) > 0)
                @foreach($activeTaxes as $tax)
                    <tr>
                        <td style="text-align: right; color: #666;">{{ $tax->name }} ({{ (float)$tax->rate }}%)</td>
                        <td style="text-align: right; color: #666;">${{ number_format($reservation->subtotal * ($tax->rate / 100), 2) }}</td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td style="text-align: right; color: #666;">Taxes ({{ (float)$reservation->tax_percent }}%)</td>
                    <td style="text-align: right; color: #666;">${{ number_format($reservation->tax_amount, 2) }}</td>
                </tr>
            @endif
            @if($reservation->discount_amount > 0)
            <tr>
                <td style="text-align: right; color: #D32F2F;">Discount</td>
                <td style="text-align: right; color: #D32F2F;">-${{ number_format($reservation->discount_amount, 2) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td style="text-align: right;" class="grand-total">GRAND TOTAL</td>
                <td style="text-align: right;" class="grand-total">${{ number_format($reservation->total_amount, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="info-box" style="margin-bottom: 0;">
        <strong>Payment Method:</strong> {{ $reservation->payment_method }}<br>
        <strong>Status:</strong> <span style="color: green;">{{ strtoupper($reservation->status) }}</span>
    </div>

    <div class="footer">
        Thank you for choosing our hotel. We hope to see you again.
    </div>
</body>
</html>
