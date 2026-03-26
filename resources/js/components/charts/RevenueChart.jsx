import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSelector } from 'react-redux';
import { translate, formatPrice, translateDigits } from '../../utils/localeHelper';

export default function RevenueChart({ data }) {
  const { language, currency } = useSelector(state => state.locale);

  // Translate the date labels (e.g., "26 Mar" -> "২৬ মার্চ")
  const localizedData = data.map(item => {
    const [day, month] = item.month.split(' ');
    const translatedMonth = translate(month, language);
    const translatedDay = translateDigits(day, language);
    return {
      ...item,
      month: language === 'BAN' ? `${translatedDay} ${translatedMonth}` : `${day} ${translatedMonth}`
    };
  });

  const formatPriceShort = (v) => {
    const symbol = currency === 'BDT' ? '৳' : '$';
    const num = v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v;
    return translateDigits(`${symbol}${num}`, language);
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 font-display text-sm">{translate('Revenue vs Expense', language)}</h3>
      </div>
      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={localizedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={formatPriceShort} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={48}/>
            <Tooltip
              formatter={(value, name) => [formatPrice(value, currency, language), translate(name, language)]}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
            />
            <Legend 
              formatter={(value) => <span className="text-gray-600 font-medium">{translate(value, language)}</span>}
              wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} 
              iconType="circle" 
            />
            <Bar dataKey="revenue" name="Revenue" fill="#4CAF50" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
