import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  MdSearch, MdPrint, MdCheckCircle, MdCalendarToday,
  MdBed, MdPerson, MdReceipt, MdChevronLeft, MdChevronRight,
} from 'react-icons/md';
import { BsPersonVcard, BsCreditCard2Back } from 'react-icons/bs';
import { RiHotelLine } from 'react-icons/ri';
import { HiOutlineDocumentText } from 'react-icons/hi';
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
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

/* ── Status config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  Paid:      { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Unpaid:    { bg: 'bg-rose-50',     text: 'text-rose-600',    border: 'border-rose-200',    dot: 'bg-rose-500'    },
  Cancelled: { bg: 'bg-gray-100',    text: 'text-gray-500',    border: 'border-gray-200',    dot: 'bg-gray-400'    },
  Reserved:  { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
};

/* ── Skeleton Card ─────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex flex-wrap gap-4 items-start">
      <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      <div className="h-6 w-20 bg-gray-100 rounded-full" />
      <div className="ml-auto h-6 w-16 bg-gray-200 rounded-lg" />
    </div>
    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

/* ── Info Chip ─────────────────────────────────────────────────────────── */
const Chip = ({ icon: Icon, label, value, mono = false }) => (
  <div className="flex flex-col gap-0.5 min-w-0">
    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1">
      {Icon && <Icon size={10} />}{label}
    </span>
    <span className={`text-sm font-semibold text-gray-700 truncate ${mono ? 'font-mono' : ''}`} title={value}>
      {value || '—'}
    </span>
  </div>
);

/* ── Main Component ────────────────────────────────────────────────────── */
export default function CheckInPage() {
  const { language, currency } = useSelector(state => state.locale);

  const [searchTerm, setSearchTerm]   = useState('');
  const debouncedSearch               = useDebounce(searchTerm, 500);
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [page, setPage]               = useState(1);
  const [perPage, setPerPage]         = useState(15);

  // Reset to page 1 on filter/perPage change
  useEffect(() => setPage(1), [debouncedSearch, startDate, endDate, perPage]);

  const { data: reservationData, isFetching: loadingReservations } = useGetReservationsQuery({
    search: debouncedSearch,
    start_date: startDate,
    end_date: endDate,
    page,
    per_page: perPage,
  });

  const reservations     = reservationData?.data || [];
  const reservationMeta  = reservationData?.meta;

  const { data: taxesData }    = useGetTaxesQuery({ status: 'Active' });
  const activeTaxes            = taxesData?.data?.filter(t => t.status === 'Active') || [];

  const { data: cmsHomeData }    = useGetHomeQuery();
  const { data: cmsContactData } = useGetContactQuery();

  const hotelInfo = useMemo(() => {
    const home    = cmsHomeData?.[0]  || cmsHomeData?.data?.[0];
    const contact = cmsContactData?.[0] || cmsContactData?.data?.[0];
    return {
      hotel_name: home?.hotel_name || 'HOTEL MANAGEMENT',
      logo:       home?.logo_url,
      address:    contact?.address || 'Hotel Address',
      phone:      contact?.phone   || 'N/A',
      email:      contact?.email   || 'N/A',
    };
  }, [cmsHomeData, cmsContactData]);

  /* ── Helpers ── */
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const totalFrom = reservationMeta ? ((page - 1) * perPage) + 1 : 0;
  const totalTo   = reservationMeta ? Math.min(page * perPage, reservationMeta.total) : 0;

  return (
    <div className="flex h-full w-full bg-[#f4f6fa] flex-col overflow-hidden">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontSize: '13px' } }} />

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <RiHotelLine size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              {translate('Check-In & Check-Out', language)}
            </h1>
            <p className="text-xs text-gray-400 font-medium">{translate('Manage all guest stays, transactions, and re-print invoices.', language)}</p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="px-6 pb-4 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={translate('Search by Guest Name, Phone, TRX ID, Room...', language)}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/20 transition-all text-gray-700 placeholder-gray-400"
            />
          </div>
          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/20 w-[160px]"
              />
            </div>
            <span className="text-gray-300 font-bold">→</span>
            <div className="relative">
              <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/20 w-[160px]"
              />
            </div>
          </div>
          {/* Record count badge */}
          {reservationMeta && (
            <div className="ml-auto bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-xl">
              {reservationMeta.total} {translate('Records', language)}
            </div>
          )}
        </div>
      </div>

      {/* ── Card List ── */}
      <div className="flex-1 overflow-auto px-6 pb-2" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex flex-col gap-3">
          {loadingReservations ? (
            [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
          ) : reservations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 gap-3">
              <MdCalendarToday size={52} className="text-gray-200" />
              <p className="font-bold text-gray-500 text-base">{translate('No reservations found.', language)}</p>
              <p className="text-sm text-gray-400">{translate('Try adjusting your search or date filters.', language)}</p>
            </div>
          ) : reservations.map((res) => {
              const statusCfg = STATUS_CONFIG[res.status] || STATUS_CONFIG.Unpaid;

              /* billing breakdown */
              const billingRows = (() => {
                const rows = [{ label: 'Base Rate', value: formatPrice(res.subtotal, currency), color: '' }];
                if (activeTaxes.length > 0 && res.tax_amount > 0) {
                  const totalRate = activeTaxes.reduce((s, t) => s + Number(t.rate), 0);
                  activeTaxes.forEach(tax => {
                    const prop = totalRate > 0 ? Number(res.tax_amount) * (Number(tax.rate) / totalRate) : 0;
                    rows.push({ label: `${tax.name} (${tax.rate}%)`, value: `+${formatPrice(prop, currency)}`, color: 'text-amber-600' });
                  });
                } else if (res.tax_amount > 0) {
                  rows.push({ label: `Tax (${res.tax_percent}%)`, value: `+${formatPrice(res.tax_amount, currency)}`, color: 'text-amber-600' });
                }
                if (parseFloat(res.discount_amount) > 0) {
                  rows.push({ label: 'Discount', value: `-${formatPrice(res.discount_amount, currency)}`, color: 'text-rose-500' });
                }
                return rows;
              })();

              return (
                <div key={res.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 overflow-hidden">

                  {/* ── Card Top Bar ── */}
                  <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-gray-50 bg-gray-50/60">
                    {/* Transaction ID */}
                    <div className="flex items-center gap-2">
                      <HiOutlineDocumentText size={15} className="text-indigo-400" />
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                        {res.transaction_id}
                      </span>
                    </div>

                    {/* Booking type */}
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      res.booking_type === 'Booking'
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-purple-50 text-purple-600 border-purple-100'
                    }`}>
                      {translate(res.booking_type || 'Reservation', language)}
                    </span>

                    {/* Created date/time */}
                    <span className="text-xs text-gray-400 font-medium">
                      {fmtDate(res.created_at)}
                      {res.created_at && <span className="ml-1.5 opacity-60">{fmtTime(res.created_at)}</span>}
                    </span>

                    {/* Status — right side */}
                    <div className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {translate(res.status, language)}
                      {res.payment_method && <span className="opacity-60 normal-case font-medium">· {res.payment_method}</span>}
                    </div>

                    {/* Print button */}
                    {res.status === 'Paid' ? (
                      <PDFDownloadLink
                        document={<ReservationInvoicePDF reservation={res} hotelInfo={hotelInfo} activeTaxes={activeTaxes} />}
                        fileName={`invoice-${res.transaction_id}.pdf`}
                      >
                        {({ loading }) => (
                          <button disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
                            <MdPrint size={14} />
                            {translate(loading ? 'Printing...' : 'Reprint', language)}
                          </button>
                        )}
                      </PDFDownloadLink>
                    ) : (
                      <span className="text-[11px] text-gray-300 italic font-medium">No Invoice</span>
                    )}
                  </div>

                  {/* ── Card Body ── */}
                  <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4">

                    {/* Guest */}
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1">
                        <MdPerson size={10} /> Guest
                      </span>
                      <span className="text-sm font-bold text-gray-800 truncate" title={res.guest_name}>{res.guest_name}</span>
                      <span className="text-xs text-gray-400 font-medium font-mono">{res.guest_phone || '—'}</span>
                      <span className="text-xs text-gray-400 truncate" title={res.guest_email}>{res.guest_email || '—'}</span>
                    </div>

                    {/* Identity */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1">
                        <BsPersonVcard size={10} /> Identity
                      </span>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit">
                        {res.identity_type || '—'}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-600 truncate" title={res.identity_number}>
                        {translateDigits(res.identity_number, language) || '—'}
                      </span>
                    </div>

                    {/* Room */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1">
                        <MdBed size={10} /> Room
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        Room {translateDigits(res.room?.room_number, language)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit">
                        {res.room?.category?.name || 'Standard'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {translateDigits(res.person_count, language)} {translate('Pax', language)}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1">
                        <MdCalendarToday size={10} /> Stay Period
                      </span>
                      <div className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-500 font-bold text-[10px] uppercase w-5">In</span>
                          <span>{fmtDate(res.check_in)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-rose-400 font-bold text-[10px] uppercase w-5">Out</span>
                          <span>{fmtDate(res.check_out)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Billing */}
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1">
                        <MdReceipt size={10} /> Billing
                      </span>
                      <div className="flex flex-col gap-0.5 text-xs">
                        {billingRows.map((row, i) => (
                          <div key={i} className="flex justify-between gap-4">
                            <span className="text-gray-400 truncate">{row.label}</span>
                            <span className={`font-semibold tabular-nums ${row.color || 'text-gray-600'}`}>{row.value}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-100 mt-1 pt-1 flex justify-between gap-4">
                          <span className="font-bold text-gray-700">Total</span>
                          <span className="font-black text-[#2D3A2E] tabular-nums">{formatPrice(res.total_amount, currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>

      {/* ── Pagination Footer ── */}
      {reservationMeta && (
        <div className="px-6 pb-6 pt-3 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">

            {/* Left: record info + per-page selector */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs text-gray-500 font-semibold">
                {reservationMeta.total > 0
                  ? `Showing ${totalFrom}–${totalTo} of ${reservationMeta.total} records`
                  : 'No records found'}
              </span>
              {/* Per-page selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Rows per page:</span>
                <select
                  value={perPage}
                  onChange={e => setPerPage(Number(e.target.value))}
                  className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all cursor-pointer"
                >
                  {[10, 15, 25, 50, 100].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: page navigation */}
            {reservationMeta.last_page > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                >
                  <MdChevronLeft size={16} /> Prev
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {[...Array(reservationMeta.last_page)].map((_, idx) => {
                    const p = idx + 1;
                    const isActive = p === page;
                    const showPage = p === 1 || p === reservationMeta.last_page
                      || (p >= page - 1 && p <= page + 1);
                    if (!showPage) {
                      if (p === page - 2 || p === page + 2)
                        return <span key={p} className="text-gray-300 text-xs px-1">…</span>;
                      return null;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-500 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(reservationMeta.last_page, p + 1))}
                  disabled={page === reservationMeta.last_page}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                >
                  Next <MdChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
