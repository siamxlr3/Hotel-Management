const iconMap = {
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
  ),
  login: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  ),
  dollar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
};

import { useSelector } from 'react-redux';
import { translate, formatPrice, translateDigits } from '../../utils/localeHelper';

export default function StatCard({ label, value, change, positive, icon }) {
  const { language, currency } = useSelector(state => state.locale);

  // If value starts with $, we re-format it using formatPrice
  const displayValue = value.startsWith('$') 
    ? formatPrice(parseFloat(value.replace(/[$,]/g, '')), currency, language)
    : translateDigits(value, language);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-1 min-w-0">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{translate(label, language)}</p>
        <div className="w-9 h-9 rounded-xl bg-[#E8F5E0] flex items-center justify-center text-[#4CAF50]">
          {iconMap[icon]}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 font-display mb-2">{displayValue}</p>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${positive ? 'text-green-600' : 'text-red-500'}`}>
          <span>{positive ? '↑' : '↓'}</span>
          {translateDigits(change, language)}
        </span>
        <span className="text-[11px] text-gray-400">{translate('from last week', language)}</span>
      </div>
    </div>
  );
}
