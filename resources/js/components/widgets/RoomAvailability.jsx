import { useSelector } from 'react-redux';
import { translate, translateDigits } from '../../utils/localeHelper';

export default function RoomAvailability({ data }) {
  const { language } = useSelector(state => state.locale);
  const total = data.occupied + data.reserved + data.available + data.notReady;
  const pct = (v) => `${((v / total) * 100).toFixed(1)}%`;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 font-display text-sm">{translate('Room Availability', language)}</h3>
        <button className="text-gray-400 hover:text-gray-600 text-lg leading-none">···</button>
      </div>

      {/* Horizontal stacked bar */}
      <div className="flex rounded-full overflow-hidden h-5 mb-5 gap-0.5">
        <div style={{ width: pct(data.occupied) }}  className="bg-[#A8D5A2] transition-all duration-500"/>
        <div style={{ width: pct(data.reserved) }}  className="bg-[#D4ED9A] transition-all duration-500"/>
        <div style={{ width: pct(data.available) }} className="bg-[#E8F5B0] transition-all duration-500"/>
        <div style={{ width: pct(data.notReady) }}  className="bg-[#D3D3D3] transition-all duration-500"/>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Occupied',   value: data.occupied,  color: '#A8D5A2' },
          { label: 'Reserved',   value: data.reserved,  color: '#D4ED9A' },
          { label: 'Available',  value: data.available, color: '#E8F5B0' },
          { label: 'Not Ready',  value: data.notReady,  color: '#D3D3D3' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color, border: '1px solid rgba(0,0,0,0.1)' }}/>
            <div>
              <p className="text-xs text-gray-500">{translate(item.label, language)}</p>
              <p className="text-lg font-bold text-gray-800 font-display leading-tight">{translateDigits(item.value, language)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
