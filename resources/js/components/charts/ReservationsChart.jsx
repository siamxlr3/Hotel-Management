import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';
import { translate, translateDigits } from '../../utils/localeHelper';

export default function ReservationsChart({ data }) {
  const { language } = useSelector(state => state.locale);

  // Translate the date labels (e.g., "26 Mar" -> "২৬ মার্চ")
  const localizedData = data.map(item => {
    const [day, month] = item.date.split(' ');
    const translatedMonth = translate(month, language);
    const translatedDay = translateDigits(day, language);
    return {
      ...item,
      date: language === 'BAN' ? `${translatedDay} ${translatedMonth}` : `${day} ${translatedMonth}`
    };
  });
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-800 font-display text-sm">{translate('Reservations', language)}</h3>
      </div>
      <div className="flex gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#A8D5A2] inline-block"/>{translate('Booked', language)}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#D4ED9A] inline-block"/>{translate('Canceled', language)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={localizedData} barGap={2} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}/>
          <YAxis tickFormatter={v => translateDigits(v, language)} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={28}/>
          <Tooltip 
            formatter={(value, name) => [translateDigits(value, language), translate(name, language)]}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
          />
          <Bar dataKey="booked"   fill="#A8D5A2" radius={[4,4,0,0]}/>
          <Bar dataKey="canceled" fill="#D4ED9A"  radius={[4,4,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
