import { useSelector } from 'react-redux';
import { translate, translateDigits } from '../../utils/localeHelper';

const statusStyle = {
  'Checked-In': 'bg-green-100 text-green-700',
  'Paid':       'bg-green-100 text-green-700',
  'Reserved':   'bg-blue-100 text-blue-600',
  'Pending':    'bg-amber-100 text-amber-600',
  'Cancelled':  'bg-red-100 text-red-600',
  'Checked-Out':'bg-gray-100 text-gray-500',
};
const typeStyle = {
  'Deluxe':   'bg-green-50 text-green-700 border border-green-200',
  'Standard': 'bg-gray-50  text-gray-600  border border-gray-200',
  'Suite':    'bg-amber-50 text-amber-700 border border-amber-200',
};

export default function BookingTable({ bookings }) {
  const { language } = useSelector(state => state.locale);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'BAN' ? 'bn-BD' : 'en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 font-display text-sm">{translate('Booking List', language)}</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input placeholder={translate('Search guest, status, etc', language)} className="bg-transparent text-xs outline-none text-gray-500 placeholder-gray-400 w-48"/>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              {['Booking ID', 'Guest Name', 'Room Type', 'Room Number', 'Duration', 'Check-In & Check-Out', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap uppercase tracking-wider text-[10px]">
                  {translate(h, language)} <span className="opacity-50">↕</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr key={b.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                <td className="px-5 py-3.5 font-medium text-gray-700 whitespace-nowrap">{translateDigits(b.id, language)}</td>
                <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{b.guest}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${typeStyle[b.type] || typeStyle.Standard}`}>
                    ● {translate(b.type, language)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-600">
                  {(b.room || '').startsWith('Room ') 
                    ? `${translate('Room', language)} ${translateDigits((b.room || '').replace('Room ', ''), language)}`
                    : translate(b.room, language)}
                </td>
                <td className="px-5 py-3.5 text-gray-600">
                  {(b.duration || '').includes(' Pax') 
                    ? `${translateDigits((b.duration || '').replace(' Pax', ''), language)} ${translate('Pax', language)}`
                    : translateDigits(b.duration, language)}
                </td>
                <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(b.checkIn)} — {formatDate(b.checkOut)}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusStyle[b.status] || statusStyle.Reserved}`}>
                    {translate(b.status, language)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
