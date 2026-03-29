import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import StatCard           from '../components/cards/StatCard';
import RoomAvailability   from '../components/widgets/RoomAvailability';
import RevenueChart       from '../components/charts/RevenueChart';
import ReservationsChart  from '../components/charts/ReservationsChart';
import BookingTable       from '../components/table/BookingTable';
import { useGetDashboardReportQuery } from '../store/api/reportApi';
import { MdCalendarToday, MdRefresh } from 'react-icons/md';
import { translate } from '../utils/localeHelper';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const { language, currency } = useSelector(state => state.locale);
  // Helper to format local date as YYYY-MM-DD reliably
  const getLocalDateString = (d) => {
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  // Date filtering state (default to current month, strictly in local timezone)
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return getLocalDateString(d);
  });
  
  const [toDate, setToDate] = useState(() => getLocalDateString(new Date()));

  const { data: response, isLoading, isFetching, error, refetch } = useGetDashboardReportQuery({
    from_date: fromDate,
    to_date: toDate
  });

  const data = response?.data || {};

  // Display errors using toast if fetch fails
  React.useEffect(() => {
    if (error) {
      toast.error('Failed to load dashboard data');
    }
  }, [error]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#f8f9fc]">
      <Toaster position="top-right" />
      
      {/* Dashboard Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 pb-0 gap-4 shrink-0">
         <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1" style={{ fontFamily:'"Plus Jakarta Sans",sans-serif' }}>
              {translate('Dashboard Overview', language)}
            </h1>
            <p className="text-sm text-gray-500 font-medium tracking-wide">{translate('Hotel performance and revenue statistics', language)}</p>
         </div>
         
         <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="relative">
              <MdCalendarToday className="absolute left-3 top-2.5 text-gray-400 z-10" size={16} />
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs text-gray-600 outline-none focus:border-indigo-400 focus:bg-white w-[148px] transition-all" />
            </div>
            <span className="text-gray-300 font-bold">-</span>
            <div className="relative">
              <MdCalendarToday className="absolute left-3 top-2.5 text-gray-400 z-10" size={16} />
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs text-gray-600 outline-none focus:border-indigo-400 focus:bg-white w-[148px] transition-all" />
            </div>
            <button onClick={refetch} disabled={isFetching} className="p-2.5 ml-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all disabled:opacity-50">
               <MdRefresh size={18} className={isFetching ? 'animate-spin' : ''} />
            </button>
         </div>
      </div>

      {/* Main column */}
      <div className="flex-1 overflow-y-auto p-5 pb-8 flex flex-col gap-5 min-w-0"
           style={{ scrollbarWidth: 'thin', scrollbarColor: '#E0E0E0 transparent' }}>

        {isLoading ? (
           <DashboardSkeleton />
        ) : (
           <>
             {/* Row 1: Stats */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
               {data.stats?.map(s => <StatCard key={s.id} {...s}/>)}
             </div>

             {/* Row 2: Room Availability + Revenue */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 shrink-0">
               <RoomAvailability data={data.roomAvailability || {}}/>
               <RevenueChart     data={data.revenueData || []}/>
             </div>

             {/* Row 3: Reservations */}
             <div className="shrink-0">
               <ReservationsChart data={data.reservationsData || []}/>
             </div>

             {/* Row 4: Booking Table */}
             <div className="shrink-0">
               <BookingTable bookings={data.bookings || []}/>
             </div>
           </>
        )}
      </div>

    </div>
  );
}

// Minimal Skeleton Loader for the entire Dashboard
const DashboardSkeleton = () => (
   <div className="animate-pulse flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-200 h-28 rounded-2xl w-full"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
         <div className="bg-gray-200 h-80 rounded-2xl w-full"></div>
         <div className="bg-gray-200 h-80 rounded-2xl w-full"></div>
      </div>
      <div className="bg-gray-200 h-72 rounded-2xl w-full"></div>
      <div className="bg-gray-200 h-96 rounded-2xl w-full"></div>
   </div>
);
