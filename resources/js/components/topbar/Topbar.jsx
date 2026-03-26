import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSidebar } from '../../hooks/useDashboard';
import { Languages, Coins } from 'lucide-react';
import { setLanguage, setCurrency } from '../../store/slices/localeSlice';

export default function Topbar() {
  const { toggle } = useSidebar();
  const dispatch = useDispatch();
  const { language, currency } = useSelector(state => state.locale);

  const isBangla = language === 'BAN';
  const isBDT    = currency === 'BDT';

  const toggleLanguage = () => dispatch(setLanguage(isBangla ? 'ENG' : 'BAN'));
  const toggleCurrency = () => dispatch(setCurrency(isBDT ? 'USD' : 'BDT'));

  const VibrantToggle = ({ label1, label2, isActive, onClick, Icon }) => (
    <div className="flex items-center gap-3 bg-gray-100/80 p-1 rounded-xl border border-gray-200 shadow-sm">
      <div className="pl-2 text-gray-400">
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <button
        onClick={onClick}
        className="relative flex items-center bg-gray-200 rounded-lg p-0.5 w-28 h-8 overflow-hidden transition-all"
      >
        {/* Sliding highlight */}
        <div
          className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md transition-all duration-300 ease-out shadow-sm
            ${isActive ? 'translate-x-full bg-[#A8D5A2]' : 'translate-x-0 bg-white'}`}
        />
        <span className={`flex-1 text-[11px] font-bold z-10 transition-colors ${!isActive ? 'text-gray-800' : 'text-gray-500'}`}>
          {label1}
        </span>
        <span className={`flex-1 text-[11px] font-bold z-10 transition-colors ${isActive ? 'text-[#1A2E1B]' : 'text-gray-500'}`}>
          {label2}
        </span>
      </button>
    </div>
  );

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-md border-b border-gray-100 flex-shrink-0">

      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label="Toggle sidebar"
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150 flex-shrink-0"
        >
          <span className="w-5 h-0.5 bg-gray-600 rounded-full block"/>
          <span className="w-4 h-0.5 bg-gray-600 rounded-full block"/>
          <span className="w-5 h-0.5 bg-gray-600 rounded-full block"/>
        </button>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          Dashboard
        </h1>
      </div>

      {/* Right: language + currency toggles + notification */}
      <div className="flex items-center gap-4">
        <VibrantToggle
          label1="ENG"
          label2="BAN"
          isActive={isBangla}
          onClick={toggleLanguage}
          Icon={Languages}
        />
        <VibrantToggle
          label1="USD"
          label2="BDT"
          isActive={isBDT}
          onClick={toggleCurrency}
          Icon={Coins}
        />

        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm ml-2">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"/>
        </button>
      </div>
    </div>
  );
}
