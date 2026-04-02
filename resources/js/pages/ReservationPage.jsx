import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  MdHotel, MdCheckCircle, MdWarning, MdBuild, MdCleaningServices,
  MdClose, MdSearch, MdRefresh, MdPayment, MdCalendarToday, MdPerson
} from 'react-icons/md';
import { BsPersonVcardFill } from 'react-icons/bs';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReservationInvoicePDF from '../components/reservation/ReservationInvoicePDF';

import {
  useGetReservationsQuery,
  useGetCheckoutsQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useCancelReservationMutation,
  useGetActiveReservationQuery
} from '../store/api/reservationApi';

import {
  useGetRoomsQuery,
  useGetAllCategoriesQuery,
  useUpdateRoomStatusMutation
} from '../store/api/roomApi';

import {
  useGetTaxesQuery,
  useGetGlobalDiscountsQuery,
  useGetCategoryDiscountsQuery
} from '../store/api/settingApi';

import {
  useGetHomeQuery,
  useGetContactQuery
} from '../store/api/cmsApi';
import { translate, formatPrice } from '../utils/localeHelper';

/* ─── UI Constants ─── */
const STATUS_COLORS = {
  Available:   { bg: 'bg-[#E8F5E0]', text: 'text-[#2D5A30]', border: 'border-[#A8D5A2]', dot: 'bg-emerald-500' },
  Occupied:    { bg: 'bg-[#FFEDED]', text: 'text-[#D32F2F]', border: 'border-[#FFCDD2]', dot: 'bg-red-500' },
  Reserved:    { bg: 'bg-[#FFF4E5]', text: 'text-[#ED6C02]', border: 'border-[#FFE0B2]', dot: 'bg-orange-500' },
  Maintenance: { bg: 'bg-[#F5F5F5]', text: 'text-[#616161]', border: 'border-[#E0E0E0]', dot: 'bg-gray-500' },
  Cleaning:    { bg: 'bg-[#E3F2FD]', text: 'text-[#1976D2]', border: 'border-[#BBDEFB]', dot: 'bg-blue-500' }
};

const MODAL_OVERLAY = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const MODAL_CONTENT = {
  initial: { scale: 0.95, opacity: 0, y: 10 },
  animate: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { scale: 0.95, opacity: 0, y: 10 }
};

/* ─── Helper Components ─── */

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 w-full flex flex-col gap-3 min-h-[160px] animate-pulse">
      <div className="flex justify-between">
        <div className="h-6 w-24 bg-gray-200 rounded-lg"></div>
        <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 w-32 bg-gray-100 rounded-md"></div>
      <div className="h-4 w-20 bg-gray-100 rounded-md"></div>
      <div className="mt-auto h-8 w-full bg-gray-100 rounded-xl"></div>
    </div>
  );
}

function RoomCard({ room, onClick, globalDiscounts, categoryDiscounts, language, currency }) {
  const c = STATUS_COLORS[room.status] || STATUS_COLORS['Available'];
  
  // Calculate dynamic pricing
  const activeGlobalDiscount = globalDiscounts?.find(d => d.status === 'Active' && (!d.room_id || d.room_id === room.id))?.value || 0;
  const activeCategoryDiscount = categoryDiscounts?.find(d => d.status === 'Active' && d.category_id === room.category_id && (!d.room_id || d.room_id === room.id))?.value || 0;
  
  const totalDiscountPercent = Number(activeGlobalDiscount) + Number(activeCategoryDiscount);
  const discountAmount = Number(room.base_price) * (totalDiscountPercent / 100);
  const discountedPrice = Number(room.base_price) - discountAmount;
  const hasDiscount = totalDiscountPercent > 0;

  // Features parsing
  const features = typeof room.features === 'string' ? JSON.parse(room.features || '[]') : (room.features || []);
  
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(room)}
      className={`bg-white rounded-2xl border transition-all cursor-pointer p-5 flex flex-col min-h-[160px] relative ${
        room.status === 'Available' ? 'hover:border-[#A8D5A2]' : 'hover:border-gray-300'
      }`}
      style={{ borderColor: c.border.replace('border-', '') }}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-xl font-bold text-gray-800 tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          {translate('Room', language)} {room.room_number}
        </h3>
        <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
      </div>
      
      <p className="text-xs text-gray-500 font-medium mb-1">
        {room.category?.name || 'Standard'} • {translate('Capacity', language)}: {room.capacity} • {translate('Floor', language)} {room.floor}
      </p>
      
      <p className="text-xs mb-3">
        {hasDiscount ? (
          <>
            <span className="text-gray-400 line-through mr-1">{formatPrice(room.base_price, currency)}</span>
            <span className="font-bold text-gray-800">{formatPrice(discountedPrice, currency)}</span>
          </>
        ) : (
          <span className="font-bold text-gray-800">{formatPrice(room.base_price, currency)}</span>
        )}
        <span className="text-gray-400"> / {translate('night', language)}</span>
      </p>

      {/* Features */}
      {features.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {features.slice(0, 3).map((f, i) => (
             <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">{f}</span>
          ))}
          {features.length > 3 && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">+{features.length - 3}</span>}
        </div>
      )}

      {/* Guest info if Occupied or Reserved */}
      {(room.status === 'Occupied' || room.status === 'Reserved') && room.currentReservation && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-3 bg-gray-50 px-2 py-1.5 rounded-lg w-fit">
          <MdPerson size={14} className="text-gray-400" />
          {room.currentReservation.guest_name}
        </div>
      )}

      {/* Status Badge */}
      <div className={`mt-auto w-full py-1.5 rounded-lg text-center text-[11px] font-bold uppercase tracking-widest ${c.bg} ${c.text}`}>
        {translate(room.status, language)}
      </div>
    </motion.div>
  );
}

/* ─── Main Page Component ─── */

export default function ReservationPage() {
  const { language, currency } = useSelector(state => state.locale);
  
  // Local States
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [checkoutDate, setCheckoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeReservationRoomId, setActiveReservationRoomId] = useState(null); 
  const [modalType, setModalType] = useState(null); 
  const [activeReservation, setActiveReservation] = useState(null);
  const [form, setForm] = useState({
    guest_name: '', guest_phone: '', guest_email: '',
    identity_type: 'NID', identity_number: '',
    person_count: 1, check_in: '', check_out: '',
    payment_method: 'Cash', subtotal: 0, tax_percent: 0,
    global_discount_percent: 0, category_discount_percent: 0,
    base_nightly_rate: 0
  });
  // RTK Query Hooks
  const { data: roomsData, isFetching: loadingRooms, refetch: refetchRooms } = useGetRoomsQuery({
    status: filterStatus !== 'All' ? filterStatus : '',
    category_id: filterCategory !== 'All' ? filterCategory : '',
    per_page: 50
  });
  const rooms = roomsData?.data || [];

  const { data: checkoutsData, isFetching: loadingCheckouts, refetch: refetchCheckouts } = useGetCheckoutsQuery({ date: checkoutDate });
  const checkouts = checkoutsData?.data || [];

  const { data: allCategories = [] } = useGetAllCategoriesQuery();
  const { data: taxesData } = useGetTaxesQuery({ status: 'Active' });
  const { data: globalDiscountsData } = useGetGlobalDiscountsQuery({ status: 'Active' });
  const { data: categoryDiscountsData } = useGetCategoryDiscountsQuery({ status: 'Active' });

  const { data: cmsHomeData } = useGetHomeQuery();
  const { data: cmsContactData } = useGetContactQuery();

  const [createReservationFn, { isLoading: creatingReservation }] = useCreateReservationMutation();
  const [updateReservationFn, { isLoading: updatingReservation }] = useUpdateReservationMutation();
  const [cancelReservationFn, { isLoading: cancellingReservation }] = useCancelReservationMutation();
  const [updateRoomStatusFn, { isLoading: updatingRoomStatus }] = useUpdateRoomStatusMutation();

  const actionLoading = creatingReservation || updatingReservation || cancellingReservation || updatingRoomStatus;

  // Active Reservation Query (Lazy-ish via skip)
  const { data: activeResFromQuery, isFetching: fetchingActiveRes } = useGetActiveReservationQuery(
    activeReservationRoomId, 
    { skip: !activeReservationRoomId }
  );

  useEffect(() => {
    if (activeResFromQuery && activeReservationRoomId) {
      if (modalType !== 'downloadReceipt') {
        setActiveReservation({ ...activeResFromQuery, room: selectedRoom });
      }
      
      if (modalType === 'paymentForm' || modalType === 'reservedAction') {
        // Sync subtotal if needed
        const st = Number(activeResFromQuery.subtotal);
        if (st) setForm(prev => ({ ...prev, subtotal: st }));
      }
    }
  }, [activeResFromQuery, activeReservationRoomId, modalType, selectedRoom]);

  const hotelInfo = useMemo(() => {
    const cmsHome = cmsHomeData?.[0] || cmsHomeData?.data?.[0];
    const cmsContact = cmsContactData?.[0] || cmsContactData?.data?.[0];
    return {
      hotel_name: cmsHome?.hotel_name || 'HOTEL MANAGEMENT',
      logo: cmsHome?.logo_url,
      address: cmsContact?.address || 'Hotel Address',
      phone: cmsContact?.phone || 'N/A',
      email: cmsContact?.email || 'N/A'
    };
  }, [cmsHomeData, cmsContactData]);

  /* ─── Room Click Flow ─── */
  const handleRoomClick = async (room) => {
    setSelectedRoom(room);
    setActiveReservation(null);
    setActiveReservationRoomId(null);
    
    // Reset Form Date Defaults (Strictly Local)
    const getLocalDateString = (d) => new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const today = getLocalDateString(new Date());
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const tomorrow = getLocalDateString(tmrw);
    
    // Calculate discounted price for this room
    const activeGlobalDiscount = globalDiscountsData?.data?.find(d => d.status === 'Active' && (!d.room_id || d.room_id === room.id))?.value || 0;
    const activeCategoryDiscount = categoryDiscountsData?.data?.find(d => d.status === 'Active' && d.category_id === room.category_id && (!d.room_id || d.room_id === room.id))?.value || 0;
    
    const totalDiscountPercent = Number(activeGlobalDiscount) + Number(activeCategoryDiscount);
    const discountedPrice = Number(room.base_price) - (Number(room.base_price) * (totalDiscountPercent / 100));

    // Calculate active tax rate
    const activeTaxes = taxesData?.data?.filter(t => t.status === 'Active') || [];
    const totalTaxRate = activeTaxes.reduce((sum, t) => sum + Number(t.rate), 0);

    setForm({
      guest_name: '', guest_phone: '', guest_email: '',
      identity_type: 'NID', identity_number: '',
      person_count: 1, check_in: today, check_out: tomorrow,
      payment_method: 'Cash', subtotal: discountedPrice, tax_percent: totalTaxRate,
      global_discount_percent: activeGlobalDiscount, category_discount_percent: activeCategoryDiscount,
      base_nightly_rate: discountedPrice 
    });

    if (room.status === 'Available') {
      setModalType('actionChoice');
    } else if (room.status === 'Reserved') {
      setActiveReservationRoomId(room.id);
      setModalType('reservedAction');
    } else if (room.status === 'Occupied') {
      setActiveReservationRoomId(room.id);
      setModalType('paymentForm');
    } else if (room.status === 'Cleaning') {
      setModalType('cleaningAction');
    } else {
       toast.error(`Room is currently ${room.status}`);
       setSelectedRoom(null);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedRoom(null);
    setActiveReservation(null);
    setActiveReservationRoomId(null);
  };

  /* ─── Actions ─── */
  const submitBooking = async (type) => {
    try {
      const checkIn = new Date(form.check_in);
      const checkOut = new Date(form.check_out);
      const nights = Math.max(1, Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      const calculatedSubtotal = form.base_nightly_rate * nights;

      const payload = {
        ...form,
        room_id: selectedRoom.id,
        booking_type: type,
        status: 'Unpaid',
        subtotal: calculatedSubtotal,
        tax_amount: (calculatedSubtotal * (form.tax_percent / 100)),
        discount_amount: (Number(selectedRoom.base_price) * nights) - calculatedSubtotal, 
        total_amount: calculatedSubtotal + (calculatedSubtotal * (form.tax_percent / 100)),
        ...(type === 'Booking' && { checked_in_at: new Date().toISOString() })
      };

      await createReservationFn(payload).unwrap();
      toast.success(`${type} successful!`);
      refetchRooms();
      refetchCheckouts();
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create booking.');
    }
  };

  const processPayment = async () => {
    if (!activeReservation) return toast.error("No active reservation found.");
    
    try {
      const payload = {
        id: activeReservation.id,
        payment_method: form.payment_method,
        status: 'Paid',
        payment_status: 'Completed',
        checked_out_at: new Date().toISOString()
      };

      const res = await updateReservationFn(payload).unwrap();
      toast.success('Payment processed! Invoice generated.');
      refetchRooms();
      refetchCheckouts();
      
      // Navigate to download receipt state
      setActiveReservation({ ...activeReservation, ...(res.data || res), room: selectedRoom });
      setModalType('downloadReceipt');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to process payment.');
    }
  };


  const checkInReserved = async () => {
    if (!activeReservation) return;
    try {
      await updateReservationFn({ id: activeReservation.id, checked_in_at: new Date().toISOString() }).unwrap();
      toast.success('Guest Checked-In.');
      refetchRooms();
      refetchCheckouts();
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to check-in.');
    }
  };

  const handleCancelReservation = () => {
    // Use activeResFromQuery as fallback in case the state hasn't synced yet (async race)
    const reservation = activeReservation || activeResFromQuery;
    if (!reservation) return;

    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[250px]">
        <p className="text-sm font-bold text-gray-800">
          {translate('Are you sure you want to cancel this reservation?', language)}
        </p>
        <div className="flex gap-2 justify-end mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
          >
            {translate('No, Keep', language)}
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await cancelReservationFn(reservation.id).unwrap();
                toast.success(translate('Reservation cancelled successfully.', language));
                refetchRooms();
                refetchCheckouts();
                closeModal();
              } catch (err) {
                toast.error(err?.data?.message || translate('Failed to cancel reservation.', language));
              }
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-md"
          >
            {translate('Yes, Cancel', language)}
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };

  const finishCleaning = async () => {
    try {
      await updateRoomStatusFn({ id: selectedRoom.id, status: 'Available' }).unwrap();
      toast.success('Room marked as Available.');
      refetchRooms();
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status.');
    }
  };

  /* ─── Calculation Helper ─── */
  const activeTaxes = taxesData?.data?.filter(t => t.status === 'Active') || [];

  const calculateTotal = () => {
    const st = Number(form.subtotal);
    const tax = st * (Number(form.tax_percent) / 100);
    return (st + tax).toFixed(2);
  };

  /* ─── Render ─── */
  return (
    <div className="flex h-full w-full bg-[#f8f9fc] overflow-hidden">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius:'12px', fontSize:'13px' } }}/>
      
      {/* ─── LEFT: MAIN GRID ─── */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily:'"Plus Jakarta Sans",sans-serif' }}>
              {translate('Reservations', language)}
            </h1>
            <p className="text-sm text-gray-400 font-medium">{translate('Front-desk room and inventory control', language)}</p>
          </div>
          <button onClick={() => refetchRooms()} className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors text-gray-500">
            <MdRefresh size={20} className={loadingRooms ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['All', 'Available', 'Occupied', 'Reserved', 'Maintenance', 'Cleaning'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === s 
                  ? 'bg-white shadow-md text-gray-800 border-b-2 border-[#2D3A2E]'
                  : 'bg-transparent text-gray-500 hover:bg-gray-200'
              }`}
            >
              {translate(s, language)} {s === 'All' ? translate('Rooms', language) : ''}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterCategory('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterCategory === 'All' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {translate('All Categories', language)}
          </button>
          {allCategories?.map(c => (
             <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterCategory === c.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
             >
               {c.name}
             </button>
          ))}
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {loadingRooms ? (
            [...Array(10)].map((_, i) => <SkeletonCard key={i} />)
          ) : rooms?.length > 0 ? (
            rooms.map(room => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onClick={handleRoomClick} 
                globalDiscounts={globalDiscountsData?.data} 
                categoryDiscounts={categoryDiscountsData?.data} 
                language={language}
                currency={currency}
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-gray-400 font-medium flex flex-col items-center">
              <MdHotel size={48} className="mb-3 opacity-20" />
              <p>{translate('No rooms found for selected filters.', language)}</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT: SIDEBAR ─── */}
      <div className="w-[340px] bg-white border-l border-gray-100 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.02)] flex flex-col p-5 overflow-y-auto z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <BsPersonVcardFill className="text-indigo-500" /> {translate("Today's Checkouts", language)}
          </h2>
          <button onClick={() => refetchCheckouts()} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <MdRefresh size={18} className={loadingCheckouts ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Date Filter */}
        <div className="mb-5 relative">
          <MdCalendarToday size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="date"
            value={checkoutDate}
            onChange={e => setCheckoutDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all font-medium text-gray-600"
          />
        </div>

        {/* Checkout List */}
        <div className="flex flex-col gap-3">
          {loadingCheckouts ? (
            <div className="text-center py-10"><span className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin inline-block"></span></div>
          ) : checkouts?.length > 0 ? (
             checkouts.map(checkout => (
               <div key={checkout.id} className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex gap-3 relative overflow-hidden group hover:bg-white hover:shadow-md transition-all cursor-default">
                  <div className="w-1.5 h-full bg-red-400 absolute left-0 top-0"></div>
                  
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold text-xs space-y-0 tracking-tight">
                    {checkout.room?.room_number}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 leading-tight mb-0.5">{checkout.guest_name}</p>
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">{checkout.room?.category?.name || translate('Room', language)}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <MdClose size={12} className="text-red-400" /> {translate('Check-out', language)}: {new Date(checkout.check_out).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md h-fit mt-1">
                    {translate(checkout.status, language)}
                  </div>
               </div>
             ))
          ) : (
             <div className="py-10 text-center text-xs font-medium text-gray-400">
               {translate('No checkouts scheduled for this date.', language)}
             </div>
          )}
        </div>
      </div>

      {/* ─── MODALS ─── */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div {...MODAL_OVERLAY} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />

            {/* Modal Container */}
            <motion.div {...MODAL_CONTENT} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden focus:outline-none flex flex-col max-h-[90vh]">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Room {selectedRoom?.room_number}</h3>
                  <p className="text-xs text-gray-500 font-medium">{selectedRoom?.category?.name} • ${Number(selectedRoom?.base_price).toFixed(2)}/night</p>
                </div>
                <button onClick={closeModal} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors text-gray-500 shadow-sm">
                  <MdClose size={18} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                
                {/* 1. INITIAL ACTION CHOICE (AVAILABLE) */}
                {modalType === 'actionChoice' && (
                   <div className="flex flex-col gap-4">
                     <p className="text-sm text-gray-600 text-center mb-2">How would you like to process this room?</p>
                     <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => setModalType('bookingForm')} className="p-6 rounded-2xl border-2 border-[#2D3A2E] bg-white hover:bg-[#E8F5E0] transition-all group flex flex-col items-center justify-center gap-3">
                         <div className="w-12 h-12 rounded-full bg-[#E8F5E0] flex items-center justify-center text-[#2D3A2E] group-hover:scale-110 transition-transform">
                           <MdCheckCircle size={24} />
                         </div>
                         <div className="text-center">
                           <h4 className="font-bold text-[#2D3A2E] mb-1">{translate('Direct Booking', language)}</h4>
                           <p className="text-[10px] text-gray-500 leading-tight">Guest is present.<br/>Check-in instantly.</p>
                         </div>
                       </button>
                       <button onClick={() => setModalType('reserveForm')} className="p-6 rounded-2xl border-2 border-indigo-600 bg-white hover:bg-indigo-50 transition-all group flex flex-col items-center justify-center gap-3">
                         <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                           <MdCalendarToday size={24} />
                         </div>
                         <div className="text-center">
                           <h4 className="font-bold text-indigo-700 mb-1">{translate('Reserve For Later', language)}</h4>
                           <p className="text-[10px] text-gray-500 leading-tight">Advanced booking.<br/>Guest arriving later.</p>
                         </div>
                       </button>
                     </div>
                   </div>
                )}

                {/* 2. BOOKING OR RESERVE FORM */}
                {(modalType === 'bookingForm' || modalType === 'reserveForm') && (
                  <form onSubmit={e => { e.preventDefault(); submitBooking(modalType === 'bookingForm' ? 'Booking' : 'Reservation'); }} className="flex flex-col gap-4">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2">
                         <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{translate('Guest Name', language)}</label>
                         <input required type="text" value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A8D5A2] focus:bg-white transition-colors" placeholder="John Doe" />
                       </div>
                       
                       <div>
                         <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{translate('Phone', language)}</label>
                         <input required type="text" value={form.guest_phone} onChange={e => setForm({...form, guest_phone: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A8D5A2] focus:bg-white transition-colors" placeholder="+1 234..." />
                       </div>
                       <div>
                         <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{translate('Email (Optional)', language)}</label>
                         <input type="email" value={form.guest_email} onChange={e => setForm({...form, guest_email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A8D5A2] focus:bg-white transition-colors" placeholder="john@email.com" />
                       </div>

                       <div>
                         <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{translate('Identity Type', language)}</label>
                         <select value={form.identity_type} onChange={e => setForm({...form, identity_type: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A8D5A2] focus:bg-white transition-colors">
                           <option value="NID">National ID</option>
                           <option value="PASSPORT">Passport</option>
                           <option value="DRIVING LICENCE">Driving Licence</option>
                         </select>
                       </div>
                       <div className="col-span-2">
                         <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{translate('Identity Number', language)}</label>
                         <input required type="text" value={form.identity_number} onChange={e => setForm({...form, identity_number: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A8D5A2] focus:bg-white transition-colors" placeholder="123456789" />
                       </div>

                       <div className="col-span-2">
                         <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{translate('Number of Persons', language)}</label>
                         <input required type="number" min="1" value={form.person_count} onChange={e => setForm({...form, person_count: parseInt(e.target.value) || 1})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A8D5A2] focus:bg-white transition-colors" />
                       </div>

                       <div>
                         <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{translate('Check-in', language)}</label>
                         <input required type="date" value={form.check_in} onChange={e => setForm({...form, check_in: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A8D5A2] focus:bg-white transition-colors" />
                       </div>
                       <div>
                         <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{translate('Check-out', language)}</label>
                         <input required type="date" value={form.check_out} onChange={e => setForm({...form, check_out: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A8D5A2] focus:bg-white transition-colors" />
                       </div>
                     </div>

                     <div className="mt-4 flex gap-3">
                        <button type="button" onClick={() => setModalType('actionChoice')} className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                          {translate('Back', language)}
                        </button>
                        <button type="submit" disabled={actionLoading} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex justify-center items-center" style={{ backgroundColor: modalType === 'bookingForm' ? '#2D3A2E' : '#4F46E5', color: 'white' }}>
                          {actionLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : translate(modalType === 'bookingForm' ? 'Confirm Booking' : 'Confirm Reservation', language)}
                        </button>
                     </div>
                  </form>
                )}

                {/* 3. RESERVED ACTION (CHECK-IN) */}
                {modalType === 'reservedAction' && (
                  <div className="flex flex-col gap-6 items-center py-4">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                      <BsPersonVcardFill size={32} />
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">Guest Arrived?</h4>
                      <p className="text-sm text-gray-500">Reservation for <strong>{activeReservation?.guest_name || activeResFromQuery?.guest_name}</strong>. Check them in to turn this room to Occupied.</p>
                    </div>
                    {/* Check-In button — only shows spinner for updatingReservation */}
                    <button
                      onClick={checkInReserved}
                      disabled={updatingReservation || cancellingReservation}
                      className="w-full py-3 rounded-xl font-bold bg-[#2D3A2E] text-white hover:bg-[#1f2820] shadow-md transition-colors flex justify-center items-center gap-2"
                    >
                      {updatingReservation
                        ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : 'Check-In Guest'}
                    </button>
                    {/* Cancel button — only shows spinner for cancellingReservation */}
                    <button
                      onClick={handleCancelReservation}
                      disabled={cancellingReservation || updatingReservation}
                      className="w-full py-3 rounded-xl font-bold bg-white text-red-500 border border-red-200 hover:bg-red-50 transition-colors flex justify-center items-center gap-2 mt-[-10px]"
                    >
                      {cancellingReservation
                        ? <span className="w-5 h-5 border-2 border-red-300/40 border-t-red-500 rounded-full animate-spin" />
                        : translate('Cancel Booking', language)}
                    </button>
                  </div>
                )}

                {/* 4. PAYMENT / CHECKOUT FORM */}
                {modalType === 'paymentForm' && (
                  <div className="flex flex-col gap-5">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2 relative overflow-hidden">
                       <MdPayment className="absolute right-[-20px] top-[-20px] text-gray-200/50" size={120} />
                       
                       <div className="flex justify-between items-end relative z-10 w-full mb-2 border-b border-gray-200/60 pb-2">
                         <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{translate('Nights', language)} ({formatPrice(selectedRoom?.base_price || 0, currency)} / {translate('night', language)})</span>
                         <span className="text-sm font-semibold text-gray-800">
                           {activeReservation?.check_in && activeReservation?.check_out ? Math.max(1, Math.ceil(Math.abs(new Date(activeReservation.check_out) - new Date(activeReservation.check_in)) / (1000 * 60 * 60 * 24))) : 1}
                         </span>
                       </div>

                       <div className="flex justify-between items-end relative z-10 w-full mb-2">
                         <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{translate('Subtotal', language)}</span>
                         <span className="text-sm font-semibold text-gray-800">{formatPrice(form.subtotal, currency)}</span>
                       </div>
                       
                       {(form.global_discount_percent > 0 || form.category_discount_percent > 0) && (
                         <div className="flex justify-between items-end relative z-10 w-full mb-2 text-red-500">
                           <span className="text-[11px] font-bold uppercase tracking-widest">{translate('Discount Applied', language)}</span>
                           <span className="text-sm font-semibold">-{formatPrice(((Number(selectedRoom?.base_price || 0) * (activeReservation?.check_in && activeReservation?.check_out ? Math.max(1, Math.ceil(Math.abs(new Date(activeReservation.check_out) - new Date(activeReservation.check_in)) / (1000 * 60 * 60 * 24))) : 1)) - Number(form.subtotal)), currency)}</span>
                         </div>
                       )}

                       {activeTaxes.length > 0 ? (
                         <div className="mb-3 pb-3 border-b border-gray-200/60">
                           {activeTaxes.map((tax) => (
                             <div key={tax.id} className="flex justify-between items-end relative z-10 w-full mb-2 last:mb-0">
                               <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{tax.name} ({tax.rate}%)</span>
                               <span className="text-sm font-semibold text-gray-800">{formatPrice((form.subtotal * (Number(tax.rate) / 100)), currency)}</span>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="flex justify-between items-end relative z-10 w-full mb-3 pb-3 border-b border-gray-200/60">
                           <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{translate('Taxes', language)} ({form.tax_percent}%)</span>
                           <span className="text-sm font-semibold text-gray-800">{formatPrice((form.subtotal * (form.tax_percent / 100)), currency)}</span>
                         </div>
                       )}
                       
                       <div className="flex justify-between items-end relative z-10 w-full">
                         <span className="text-sm font-black text-gray-800 uppercase tracking-widest">{translate('Grand Total', language)}</span>
                         <span className="text-2xl font-black text-[#2D3A2E]">{formatPrice(calculateTotal(), currency)}</span>
                       </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{translate('Payment Method', language)}</label>
                      <select value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20 transition-all font-semibold text-gray-700">
                        <option value="Cash">Cash Payment</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Mobile Banking">Mobile Banking</option>
                      </select>
                    </div>

                    <button onClick={processPayment} disabled={actionLoading} className="w-full mt-2 py-3.5 rounded-xl font-bold bg-[#A8D5A2] text-[#2D5A30] hover:bg-[#96c190] shadow-[0_5px_15px_-5px_#A8D5A2] transition-colors flex justify-center items-center gap-2">
                      {actionLoading ? <span className="w-5 h-5 border-2 border-[#2D5A30]/30 border-t-[#2D5A30] rounded-full animate-spin"/> : <><MdCheckCircle size={20} /> {translate('Process Payment & Checkout', language)}</>}
                    </button>
                  </div>
                )}

                {/* 4.5 DOWNLOAD RECEIPT SCREEN */}
                {modalType === 'downloadReceipt' && (
                  <div className="flex flex-col items-center gap-6 py-6 px-4">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <MdCheckCircle size={40} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{translate('Payment Successful!', language)}</h3>
                      <p className="text-sm text-gray-500 font-medium">Room {selectedRoom?.room_number} has been checked out successfully and moved to cleaning.</p>
                    </div>

                    {/* PDF Generator Button */}
                    <div className="w-full mt-4">
                      <PDFDownloadLink
                        document={<ReservationInvoicePDF reservation={activeReservation} hotelInfo={hotelInfo} activeTaxes={activeTaxes} />}
                        fileName={`invoice-${activeReservation?.transaction_id || 'receipt'}.pdf`}
                        className="w-full block"
                      >
                        {({ loading }) => (
                           <button disabled={loading} className="w-full py-4 bg-[#2D3A2E] hover:bg-[#1a221a] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                             {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : translate('Download Invoice PDF', language)}
                           </button>
                        )}
                      </PDFDownloadLink>
                    </div>

                    <button onClick={closeModal} className="text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors mt-2 underline underline-offset-4">
                      {translate('Back to Dashboard', language)}
                    </button>
                  </div>
                )}

                {/* 5. CLEANING ACTION */}
                {modalType === 'cleaningAction' && (
                  <div className="flex flex-col gap-6 items-center py-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                      <MdCleaningServices size={32} />
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{translate('Room Cleaned?', language)}</h4>
                      <p className="text-sm text-gray-500">Housekeeping has finished cleaning Room {selectedRoom?.room_number}.</p>
                    </div>
                    <button onClick={finishCleaning} disabled={actionLoading} className="w-full py-3 rounded-xl font-bold bg-blue-500 text-white hover:bg-blue-600 shadow-md transition-colors flex justify-center">
                       {actionLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : translate('Mark as Available', language)}
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
