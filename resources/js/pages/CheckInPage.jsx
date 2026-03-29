import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdSearch, MdPrint, MdCheckCircle, MdCalendarToday } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReservationInvoicePDF from '../components/reservation/ReservationInvoicePDF';
import { useGetReservationsQuery } from '../store/api/reservationApi';
import { useGetTaxesQuery } from '../store/api/settingApi';
import { useGetHomeQuery, useGetContactQuery } from '../store/api/cmsApi';
import { translate, formatPrice, translateDigits } from '../utils/localeHelper';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100">
     <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
     <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded mb-1"></div><div className="h-3 w-20 bg-gray-100 rounded"></div></td>
     <td className="p-4"><div className="h-4 w-28 bg-gray-200 rounded"></div></td>
     <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
     <td className="p-4"><div className="h-4 w-28 bg-gray-200 rounded"></div></td>
     <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded mb-1"></div><div className="h-3 w-12 bg-gray-100 rounded"></div></td>
     <td className="p-4"><div className="h-4 w-10 bg-gray-200 rounded"></div></td>
     <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded mb-1"></div><div className="h-3 w-20 bg-gray-100 rounded mb-1.5 mt-1.5"></div><div className="h-3 w-20 bg-gray-100 rounded"></div></td>
     <td className="p-4"><div className="h-3 w-16 bg-gray-200 rounded mb-2"></div><div className="h-3 w-16 bg-gray-100 rounded mb-2"></div><div className="h-3 w-16 bg-gray-100 rounded mb-2"></div><div className="h-4 w-20 bg-gray-300 rounded"></div></td>
     <td className="p-4"><div className="h-5 w-16 bg-gray-200 rounded-md"></div></td>
     <td className="p-4 text-center"><div className="h-8 w-20 bg-gray-200 rounded-lg mx-auto"></div></td>
  </tr>
);

export default function CheckInPage() {
  const { language, currency } = useSelector(state => state.locale);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // RTK Query: Reservations
  const { data: reservationData, isFetching: loadingReservations } = useGetReservationsQuery({
    search: debouncedSearch,
    start_date: startDate,
    end_date: endDate,
    page
  });

  const reservations = reservationData?.data || [];
  const reservationMeta = reservationData?.meta;
  
  // RTK Query: Settings
  const { data: taxesData } = useGetTaxesQuery({ status: 'Active' });
  const activeTaxes = taxesData?.data?.filter(t => t.status === 'Active') || [];
  
  // RTK Query: CMS Branding
  const { data: cmsHomeData } = useGetHomeQuery();
  const { data: cmsContactData } = useGetContactQuery();

  const hotelInfo = useMemo(() => {
    const home = cmsHomeData?.[0] || cmsHomeData?.data?.[0];
    const contact = cmsContactData?.[0] || cmsContactData?.data?.[0];
    return {
      hotel_name: home?.hotel_name || 'HOTEL MANAGEMENT',
      logo: home?.logo_url,
      address: contact?.address || 'Hotel Address',
      phone: contact?.phone || 'N/A',
      email: contact?.email || 'N/A'
    };
  }, [cmsHomeData, cmsContactData]);

  return (
    <div className="flex h-full w-full bg-[#f8f9fc] flex-col overflow-hidden">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius:'12px', fontSize:'13px' } }} />
      
      <div className="p-6 pb-2 shrink-0">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1" style={{ fontFamily:'"Plus Jakarta Sans",sans-serif' }}>
          {translate('Check-In & Check-Out', language)}
        </h1>
        <p className="text-sm text-gray-500 mb-6 font-medium">{translate('Manage all guest stays, transactions, and re-print invoices.', language)}</p>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           {/* Search */}
           <div className="relative flex-1 min-w-[200px]">
             <MdSearch className="absolute left-3 top-3 text-gray-400" size={20} />
             <input type="text" placeholder="Search by Guest Name, Phone, TRX ID, Room..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/20 transition-all text-gray-700 placeholder-gray-400" />
           </div>
           
           {/* Date Range */}
           <div className="flex items-center gap-2">
             <div className="relative">
               <MdCalendarToday className="absolute left-3 top-3 text-gray-400 z-10" size={16} />
               <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm text-gray-600 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/20 w-[180px]" title="Start Date" />
             </div>
             <span className="text-gray-400 font-bold">-</span>
             <div className="relative">
               <MdCalendarToday className="absolute left-3 top-3 text-gray-400 z-10" size={16} />
               <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm text-gray-600 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/20 w-[180px]" title="End Date" />
             </div>
           </div>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="flex-1 overflow-auto px-6 pb-6" style={{ scrollbarWidth: 'thin' }}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
           <div className="overflow-x-auto flex-1 h-full relative" style={{ scrollbarWidth: 'thin' }}>
             <table className="w-full text-left border-collapse min-w-[1700px] table-fixed">
                <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                  <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-4 pl-6 w-[140px]">{translate('Transaction', language)}</th>
                    <th className="p-4 w-[200px]">{translate('Guest', language)}</th>
                    <th className="p-4 w-[180px]">{translate('Email', language)}</th>
                    <th className="p-4 w-[120px]">{translate('Identity Type', language)}</th>
                    <th className="p-4 w-[160px]">{translate('Identity Number', language)}</th>
                    <th className="p-4 w-[150px]">{translate('Room', language)}</th>
                    <th className="p-4 w-[80px]">{translate('Pax', language)}</th>
                    <th className="p-4 w-[250px]">{translate('Dates & Times', language)}</th>
                    <th className="p-4 w-[180px]">{translate('Billing Snapshot', language)}</th>
                    <th className="p-4 w-[120px]">{translate('Status', language)}</th>
                    <th className="p-4 text-center pr-6 w-[120px]">{translate('Action', language)}</th>
                  </tr>
                </thead>
               <tbody className="text-sm">
                  {loadingReservations ? (
                    [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                  ) : reservations?.length > 0 ? (
                    reservations.map(res => (
                      <tr key={res.id} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
                        <td className="p-4 pl-6">
                           <span className="font-mono text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-md">{res.transaction_id}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{res.guest_name}</p>
                          <p className="text-[11px] text-gray-500 font-medium">{res.guest_phone}</p>
                        </td>
                        <td className="p-4">
                           <p className="text-xs text-gray-600 font-medium truncate" title={res.guest_email}>{res.guest_email || 'N/A'}</p>
                        </td>
                        <td className="p-4">
                           <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{res.identity_type || 'N/A'}</span>
                        </td>
                        <td className="p-4 font-mono text-xs text-gray-600 font-bold tracking-tight">{translateDigits(res.identity_number, language) || 'N/A'}</td>
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{translate('Room', language)} {translateDigits(res.room?.room_number, language)}</p>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-1">{res.room?.category?.name || 'Standard'}</p>
                        </td>
                        <td className="p-4 font-bold text-gray-600">{translateDigits(res.person_count, language)}</td>
                        <td className="p-4 text-xs font-medium">
                           <div className="flex flex-col gap-1.5">
                             <div className="flex gap-2 items-center text-gray-700">
                               <strong className="w-10 text-gray-400 text-[10px] uppercase tracking-widest">{translate('Book', language)}</strong> 
                               <span>{new Date(res.check_in).toLocaleDateString()} &rarr; {new Date(res.check_out).toLocaleDateString()}</span>
                             </div>
                             <div className="bg-gray-50/80 p-1.5 rounded-lg border border-gray-100 text-[11px] flex justify-between gap-2 shadow-sm font-semibold">
                               {res.checked_in_at ? <span className="text-emerald-700">IN: {parseUtcTime(res.checked_in_at)}</span> : <span className="text-gray-400">IN: --:--</span>}
                               {res.checked_out_at ? <span className="text-blue-700">OUT: {parseUtcTime(res.checked_out_at)}</span> : <span className="text-gray-400">OUT: --:--</span>}
                             </div>
                           </div>
                        </td>
                        <td className="p-4 text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                           <div className="grid grid-cols-[45px_1fr] gap-x-2 gap-y-1 w-32">
                             <span className="text-gray-400">Base</span><span>{formatPrice(res.subtotal, currency)}</span>
                             {activeTaxes.length > 0 && res.tax_amount > 0 ? (
                               activeTaxes.map((tax, idx) => {
                                 const totalActiveRate = activeTaxes.reduce((sum, t) => sum + Number(t.rate), 0);
                                 const proportionalTax = totalActiveRate > 0 
                                     ? Number(res.tax_amount) * (Number(tax.rate) / totalActiveRate) 
                                     : 0;
                                 return (
                                   <React.Fragment key={idx}>
                                     <span className="text-gray-400 truncate" title={tax.name}>{tax.name}</span>
                                     <span>+{formatPrice(proportionalTax, currency)}</span>
                                   </React.Fragment>
                                 );
                               })
                             ) : (
                               <>
                                 <span className="text-gray-400 truncate" title="Tax">Tax ({res.tax_percent}%)</span>
                                 <span>+{formatPrice(res.tax_amount, currency)}</span>
                               </>
                             )}
                             <span className="text-gray-400">Disc</span><span className="text-red-400">-{formatPrice(res.discount_amount, currency)}</span>
                             <span className="text-gray-900 font-black mt-1">Total</span><span className="text-[#2D3A2E] text-sm font-black mt-0.5 tracking-tight">{formatPrice(res.total_amount, currency)}</span>
                           </div>
                        </td>
                        <td className="p-4">
                           <div className={`px-2.5 py-1 text-[10.5px] font-black rounded-lg uppercase tracking-wider inline-flex flex-col items-center gap-0.5 shadow-sm border ${
                             res.status === 'Paid' ? 'bg-[#E8F5E0] text-[#2D5A30] border-[#A8D5A2]' : 'bg-red-50 text-red-600 border-red-200'
                           }`}>
                             <div className="flex items-center gap-1">{res.status === 'Paid' && <MdCheckCircle size={12}/>} {translate(res.status, language)}</div>
                             {res.payment_method && <span className="text-[9px] opacity-80">{res.payment_method}</span>}
                           </div>
                        </td>
                        <td className="p-4 pr-6 text-center align-middle">
                          {res.status === 'Paid' ? (
                            <PDFDownloadLink
                               document={<ReservationInvoicePDF reservation={res} hotelInfo={hotelInfo} activeTaxes={activeTaxes} />}
                               fileName={`invoice-${res.transaction_id}.pdf`}
                            >
                                {({ loading }) => (
                                 <button disabled={loading} className="px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5 text-xs font-bold w-full justify-center disabled:opacity-50 disabled:hover:bg-indigo-50 disabled:hover:text-indigo-600" title="Reprint Invoice">
                                   <MdPrint size={15} /> {translate(loading ? 'Printing...' : 'Reprint', language)}
                                 </button>
                               )}
                            </PDFDownloadLink>
                          ) : (
                             <span className="text-xs text-gray-400 italic block py-2">{translate('Unpaid', language)}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="p-16 text-center text-gray-400 flex flex-col items-center w-full min-h-[300px] justify-center absolute inset-0">
                        <MdCalendarToday size={48} className="mb-4 text-gray-200" />
                        <span className="font-bold text-gray-500">No reservations found.</span>
                        <span className="text-sm">Try adjusting your search or date filters.</span>
                      </td>
                    </tr>
                  )}
               </tbody>
             </table>
           </div>

           {/* Pagination Footer */}
           {reservationMeta && reservationMeta.last_page > 1 && (
              <div className="bg-gray-50 border-t border-gray-100 p-4 shrink-0 flex items-center justify-between shadow-inner">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                  Showing {((page - 1) * reservationMeta.per_page) + 1} to {Math.min(page * reservationMeta.per_page, reservationMeta.total)} of {reservationMeta.total}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 disabled:opacity-40 transition-all">Prev</button>
                  <button onClick={() => setPage(p => Math.min(reservationMeta.last_page, p + 1))} disabled={page === reservationMeta.last_page} className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 disabled:opacity-40 transition-all">Next</button>
                </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
