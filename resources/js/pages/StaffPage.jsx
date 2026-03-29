import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import { 
  MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdRefresh, 
  MdSearch, MdChevronLeft, MdChevronRight, MdPrint,
  MdPeople, MdAccessTime, MdSecurity, MdCalendarMonth,
  MdFactCheck, MdContactPage, MdOutlineBadge
} from 'react-icons/md';
import { BsCheckCircleFill, BsXCircleFill, BsPersonFill, BsStack } from 'react-icons/bs';
import { RiFileTextLine } from 'react-icons/ri';
import { HiOutlineCurrencyDollar, HiOutlineUserGroup } from 'react-icons/hi';
import { 
  useGetShiftsQuery, useCreateShiftMutation, useUpdateShiftMutation, useDeleteShiftMutation,
  useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation,
  useGetStaffQuery, useCreateStaffMutation, useUpdateStaffMutation, useDeleteStaffMutation,
  useGetAttendancesQuery, useCreateAttendanceMutation, useUpdateAttendanceMutation, useDeleteAttendanceMutation,
  useGetLeaveTypesQuery, useCreateLeaveTypeMutation, useUpdateLeaveTypeMutation, useDeleteLeaveTypeMutation,
  useGetLeavesQuery, useCreateLeaveMutation, useUpdateLeaveMutation, useDeleteLeaveMutation,
  useGetPayrollsQuery, useGetPayrollSummaryQuery, useCreatePayrollMutation, useUpdatePayrollMutation, useDeletePayrollMutation
} from '../store/api/staffApi';
import PayrollInvoicePDF from '../components/staff/PayrollInvoicePDF';
import { useTranslate, formatPrice } from '../utils/localeHelper';

import { 
  useGetHomeQuery,
  useGetContactQuery
} from '../store/api/cmsApi';

/* ── Constants & Animations ── */
const SLIDE = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.16 } },
};

const COLORS = {
  primary: '#2D3A2E',
  primaryLight: '#E8F5E0',
  accent: '#A8D5A2',
};

const TABS = [
  { id: 'staff', label: 'Staff', icon: MdPeople, color: '#E8F5E0', text: '#2D3A2E' },
  { id: 'attendance', label: 'Attendance', icon: MdSecurity, color: '#DCFCE7', text: '#16a34a' },
  { id: 'leaves', label: 'Leaves', icon: MdCalendarMonth, color: '#FEE2E2', text: '#DC2626' },
  { id: 'payroll', label: 'Payroll', icon: HiOutlineCurrencyDollar, color: '#E0F2FE', text: '#0284c7' },
  { id: 'shifts', label: 'Shifts', icon: MdAccessTime, color: '#FEF3C7', text: '#D97706' },
  { id: 'roles', label: 'Roles', icon: MdOutlineBadge, color: '#F3E8FF', text: '#9333ea' },
  { id: 'leave-types', label: 'Leave Types', icon: MdFactCheck, color: '#F5F5F5', text: '#666' },
];

/* ── Primitives ── */
const StatusBadge = ({ status }) => {
  const t = useTranslate();
  const isActive = ['Active', 'Approved', 'Paid', 'Present'].includes(status);
  const isPending = ['Pending', 'Unpaid', 'Late'].includes(status);
  
  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let icon = <BsCheckCircleFill size={10} className="text-emerald-500" />;

  if (isPending) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    icon = <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />;
  } else if (!isActive) {
    bg = 'bg-red-50 text-red-600 border-red-200';
    icon = <BsXCircleFill size={10} className="text-red-400" />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${bg}`}>
      {icon}
      {t(status)}
    </span>
  );
};

const SkeletonRow = ({ cols = 5 }) => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="border-b border-gray-50">
        {[...Array(cols)].map((_, j) => (
          <td key={j} className="px-4 py-4">
            <div className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const Pagination = ({ meta, onPage }) => {
  const t = useTranslate();
  if (!meta || meta.last_page <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        {t('Showing')} {((meta.current_page - 1) * meta.per_page) + 1}–
        {Math.min(meta.current_page * meta.per_page, meta.total)} {t('of')} {meta.total}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(meta.current_page - 1)} disabled={meta.current_page === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <MdChevronLeft size={18} className="text-gray-500" />
        </button>
        {[...Array(Math.min(meta.last_page, 5))].map((_, i) => (
          <button key={i} onClick={() => onPage(i + 1)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              meta.current_page === i + 1 ? 'bg-[#2D3A2E] text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}>{i + 1}</button>
        ))}
        <button onClick={() => onPage(meta.current_page + 1)} disabled={meta.current_page === meta.last_page}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <MdChevronRight size={18} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const inp = (err) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
    err ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20'
  }`;

const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  const [h, m] = timeStr.split(':');
  const hours = parseInt(h);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${m} ${ampm}`;
};

/* ── Main Component ── */
const StaffPage = () => {
  const [activeTab, setActiveTab] = useState('staff');
  const t = useTranslate();
  const { language, currency } = useSelector(state => state.locale);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
  });

  // Debounced Search
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when activeTab changes
  useEffect(() => setPage(1), [activeTab]);

  // Queries
  const { data: staffData, isFetching: staffLoading } = useGetStaffQuery({ search: debouncedSearch, page, ...filters }, { skip: activeTab !== 'staff' });
  const { data: shiftData, isFetching: shiftLoading } = useGetShiftsQuery({ search: debouncedSearch, page }, { skip: activeTab !== 'shifts' });
  const { data: roleData, isFetching: roleLoading } = useGetRolesQuery({ search: debouncedSearch, page }, { skip: activeTab !== 'roles' });
  const { data: attendanceData, isFetching: attendanceLoading } = useGetAttendancesQuery({ search: debouncedSearch, page, ...filters }, { skip: activeTab !== 'attendance' });
  const { data: leaveTypeData, isFetching: leaveTypeLoading } = useGetLeaveTypesQuery({ search: debouncedSearch, page }, { skip: activeTab !== 'leave-types' });
  const { data: leaveData, isFetching: leaveLoading } = useGetLeavesQuery({ search: debouncedSearch, page, ...filters }, { skip: activeTab !== 'leaves' });
  const { data: payrollData, isFetching: payrollLoading } = useGetPayrollsQuery({ search: debouncedSearch, page, ...filters }, { skip: activeTab !== 'payroll' });
  const { data: payrollSummary } = useGetPayrollSummaryQuery({ search: debouncedSearch, ...filters }, { skip: activeTab !== 'payroll' });
  
  // CMS Queries for Branding
  const { data: cmsHomeData } = useGetHomeQuery();
  const { data: cmsContactData } = useGetContactQuery();
  
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

  // Reference data for selects
  const { data: refRoles } = useGetRolesQuery({ status: 'Active' });
  const { data: refStaff } = useGetStaffQuery({ status: 'Active' });
  const { data: refShifts } = useGetShiftsQuery({ status: 'Active' });
  const { data: refLeaveTypes } = useGetLeaveTypesQuery({ status: 'Active' });

  // Mutations
  const [createStaff, { isLoading: sSaving }] = useCreateStaffMutation();
  const [updateStaff, { isLoading: sUpdating }] = useUpdateStaffMutation();
  const [deleteStaff, { isLoading: sDeleting }] = useDeleteStaffMutation();
  const [createShift, { isLoading: shiftSaving }] = useCreateShiftMutation();
  const [updateShift, { isLoading: shiftUpdating }] = useUpdateShiftMutation();
  const [deleteShift, { isLoading: shiftDeleting }] = useDeleteShiftMutation();
  const [createRole, { isLoading: rSaving }] = useCreateRoleMutation();
  const [updateRole, { isLoading: rUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: rDeleting }] = useDeleteRoleMutation();
  const [createAttendance, { isLoading: aSaving }] = useCreateAttendanceMutation();
  const [updateAttendance, { isLoading: aUpdating }] = useUpdateAttendanceMutation();
  const [deleteAttendance, { isLoading: aDeleting }] = useDeleteAttendanceMutation();
  const [createLeaveType, { isLoading: ltSaving }] = useCreateLeaveTypeMutation();
  const [updateLeaveType, { isLoading: ltUpdating }] = useUpdateLeaveTypeMutation();
  const [deleteLeaveType, { isLoading: ltDeleting }] = useDeleteLeaveTypeMutation();
  const [createLeave, { isLoading: lSaving }] = useCreateLeaveMutation();
  const [updateLeave, { isLoading: lUpdating }] = useUpdateLeaveMutation();
  const [deleteLeave, { isLoading: lDeleting }] = useDeleteLeaveMutation();
  const [createPayroll, { isLoading: pSaving }] = useCreatePayrollMutation();
  const [updatePayroll, { isLoading: pUpdating }] = useUpdatePayrollMutation();
  const [deletePayroll, { isLoading: pDeleting }] = useDeletePayrollMutation();

  const isActionLoading = sSaving || sUpdating || shiftSaving || shiftUpdating || rSaving || rUpdating || aSaving || aUpdating || ltSaving || ltUpdating || lSaving || lUpdating || pSaving || pUpdating;
  const isDeleting = sDeleting || shiftDeleting || rDeleting || aDeleting || ltDeleting || lDeleting || pDeleting;

  // Active dataset
  const currentData = useMemo(() => {
    switch(activeTab) {
      case 'staff':       return staffData;
      case 'shifts':      return shiftData;
      case 'roles':       return roleData;
      case 'attendance':  return attendanceData;
      case 'leave-types': return leaveTypeData;
      case 'leaves':      return leaveData;
      case 'payroll':     return payrollData;
      default:            return null;
    }
  }, [activeTab, staffData, shiftData, roleData, attendanceData, leaveTypeData, leaveData, payrollData]);

  const isLoading = staffLoading || shiftLoading || roleLoading || attendanceLoading || leaveTypeLoading || leaveLoading || payrollLoading;

  // Print PDF logic
  const handlePrintInvoice = async (payroll) => {
    try {
      const blob = await pdf(<PayrollInvoicePDF payroll={payroll} hotelInfo={hotelInfo} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Salary_Slip_${payroll.staff?.staff_code}_${payroll.month}_${payroll.year}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(t("pdf generated successfully!"));
    } catch (err) {
      toast.error(t("Failed to generate PDF"));
    }
  };

  const fmt = (n) => formatPrice(n, currency);

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5" style={{ scrollbarWidth: 'thin' }}>
      <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: '12px', fontSize: '13px' } }} />

      {/* ── Page Header ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: COLORS.primaryLight }}>
            <HiOutlineUserGroup size={24} style={{ color: COLORS.primary }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
              {t('Staff Management')}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{t('Manage employees, attendance, and payroll')}</p>
          </div>
        </div>
        <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: COLORS.primary, color: '#fff' }}>
          <MdAdd size={18} /> {t(`add ${activeTab}`)}
        </button>
      </div>

      {/* ── Tabs (Grid Style) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
              activeTab === tab.id 
              ? 'bg-white border-[#A8D5A2] shadow-md scale-[1.02]' 
              : 'bg-white/50 border-gray-100 hover:bg-white hover:border-gray-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: tab.color, color: tab.text }}>
              <tab.icon size={20} />
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === tab.id ? 'text-gray-800' : 'text-gray-400'}`}>
              {t(tab.label)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Summary Stats (For Payroll/Staff) ── */}
      {activeTab === 'payroll' && payrollSummary?.success && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HiOutlineCurrencyDollar size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{formatPrice(payrollSummary.data.total_amount, currency)}</p>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">{t('Total Payable')}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BsStack size={18} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{payrollSummary.data.count}</p>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">{t('Total Records')}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 md:col-span-1 col-span-2">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MdCalendarMonth size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{t(filters.month)} {filters.year}</p>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">{t('Payroll Period')}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Form Overlay ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div key="staff-form-wrapper" {...SLIDE}>
             <StaffForm 
                key={`${activeTab}-${editingItem?.id || 'new'}`}
                activeTab={activeTab} 
                initial={editingItem} 
                onCancel={() => setIsModalOpen(false)}
                onSave={async (formData) => {
                  const mutations = {
                    staff:      { create: createStaff, update: updateStaff },
                    shifts:     { create: createShift, update: updateShift },
                    roles:      { create: createRole, update: updateRole },
                    attendance: { create: createAttendance, update: updateAttendance },
                    'leave-types': { create: createLeaveType, update: updateLeaveType },
                    leaves:     { create: createLeave, update: updateLeave },
                    payroll:    { create: createPayroll, update: updatePayroll },
                  }[activeTab];

                  try {
                    if (editingItem) {
                      const payload = activeTab === 'staff' ? { id: editingItem.id, body: formData } : { id: editingItem.id, ...Object.fromEntries(formData.entries()) };
                      await mutations.update(payload).unwrap();
                      toast.success(t("Updated successfully!"));
                    } else {
                      const payload = activeTab === 'staff' ? formData : Object.fromEntries(formData.entries());
                      await mutations.create(payload).unwrap();
                      toast.success(t("Created successfully!"));
                    }
                    setIsModalOpen(false);
                  } catch (err) {
                    toast.error(err?.data?.message || t("Operation failed."));
                  }
                }}
                loading={isActionLoading}
                refs={{ roles: refRoles, staff: refStaff, shifts: refShifts, leaveTypes: refLeaveTypes }}
             />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content Card (Table) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[200px] max-w-xs">
            <MdSearch size={18} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`${t('Search')} ${t(TABS.find(tab => tab.id === activeTab)?.label || '').toLowerCase()}...`}
              className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
            />
            {search && <button onClick={() => setSearch('')}><MdClose size={15} className="text-gray-400" /></button>}
          </div>

          <div className="flex items-center gap-2">
            {['staff', 'attendance', 'leaves', 'payroll'].includes(activeTab) && (
              <>
                <input type="date" onChange={e => setFilters(p => ({ ...p, date_from: e.target.value }))}
                  className="text-[11px] bg-gray-50 border-gray-100 rounded-lg px-2 py-1.5 outline-none focus:border-[#A8D5A2]" />
                <span className="text-gray-300">/</span>
                <input type="date" onChange={e => setFilters(p => ({ ...p, date_to: e.target.value }))}
                  className="text-[11px] bg-gray-50 border-gray-100 rounded-lg px-2 py-1.5 outline-none focus:border-[#A8D5A2]" />
              </>
            )}
            
            {activeTab === 'payroll' && (
              <select value={filters.month} onChange={e => setFilters(p => ({ ...p, month: e.target.value }))}
                className="text-xs bg-gray-50 border-gray-100 rounded-xl px-3 py-2 outline-none">
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{t(m)}</option>
                ))}
              </select>
            )}

            <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
              className="text-xs bg-gray-50 border-gray-100 rounded-xl px-3 py-2 outline-none">
              <option value="">{t('All Status')}</option>
              <option value="Active">{t('Active')}</option>
              <option value="Inactive">{t('Inactive')}</option>
            </select>

            <button onClick={() => setPage(1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <MdRefresh size={18} className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {activeTab === 'staff' && [t('Staff Name'), t('Role/Shift'), t('NID Number'), t('Address'), t('Salary'), t('Joined'), t('Status'), t('Actions')].map(h => <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>)}
                {activeTab === 'attendance' && [t('Staff'), t('Date'), t('Time Details'), t('Status'), t('Actions')].map(h => <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>)}
                {activeTab === 'leaves' && [t('Staff'), t('Leave Type'), t('Period'), t('Reason'), t('Status'), t('Actions')].map(h => <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>)}
                {activeTab === 'payroll' && [t('Staff'), t('Date'), t('Period'), t('Amount Details'), t('Status'), t('Actions')].map(h => <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>)}
                {['shifts', 'roles', 'leave-types'].includes(activeTab) && [t('Name'), t('Details'), t('Status'), t('Actions')].map(h => <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? <SkeletonRow cols={7} /> :
               !currentData?.data?.length ? (
                 <tr>
                   <td colSpan={10} className="px-5 py-24 text-center">
                     <div className="flex flex-col items-center gap-3 opacity-30">
                        <BsStack size={48} />
                        <p className="text-sm font-medium">{t('No records found')} ({t(activeTab)})</p>
                     </div>
                   </td>
                 </tr>
               ) : currentData.data.map((item, idx) => (
                 <motion.tr key={item.id} 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors group">
                    
                    {activeTab === 'staff' && (
                      <>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <BsPersonFill className="w-full h-full p-2 text-gray-300" />}
                             </div>
                             <div>
                               <p className="font-bold text-gray-800 leading-tight">{item.name}</p>
                               <p className="text-[10px] text-gray-400">{item.email}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[11px]">
                          <p className="font-bold text-gray-700">{item.role?.name}</p>
                          <p className="text-emerald-600 font-bold tracking-tighter uppercase">{item.shift?.name}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-mono font-bold text-gray-600">{item.nid_number}</p>
                          <p className="text-[10px] text-gray-400">{item.phone}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="max-w-[120px] truncate text-xs text-gray-500 font-medium" title={item.address}>
                            {item.address || 'N/A'}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-800">{fmt(item.salary)}</td>
                        <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                           <div className="font-mono text-emerald-600 font-bold mb-0.5">{item.staff_code}</div>
                           {new Date(item.joined_at).toLocaleDateString(language === 'BAN' ? 'bn-BD' : 'en-US')}
                        </td>
                      </>
                    )}

                    {activeTab === 'attendance' && (
                      <>
                        <td className="px-5 py-4 font-bold text-gray-800">{item.staff?.name}</td>
                         <td className="px-5 py-4 text-xs text-gray-500">{new Date(item.date).toLocaleDateString(language === 'BAN' ? 'bn-BD' : 'en-US')}</td>
                        <td className="px-5 py-4">
                           <div className="flex items-center gap-2 text-[11px] font-mono font-bold">
                              <span className="text-emerald-600">{formatTime(item.check_in_time)}</span>
                              <span className="text-gray-300">→</span>
                              <span className="text-red-600">{formatTime(item.check_out_time)}</span>
                           </div>
                        </td>
                      </>
                    )}

                    {activeTab === 'leaves' && (
                      <>
                        <td className="px-5 py-4 font-bold text-gray-800">{item.staff?.name}</td>
                        <td className="px-5 py-4 text-xs font-semibold text-blue-600">{item.leave_type?.name}</td>
                        <td className="px-5 py-4 text-[11px] text-gray-500 whitespace-nowrap font-medium">
                          {new Date(item.start_date).toLocaleDateString(language === 'BAN' ? 'bn-BD' : 'en-US')} - {new Date(item.end_date).toLocaleDateString(language === 'BAN' ? 'bn-BD' : 'en-US')}
                        </td>
                        <td className="px-5 py-4">
                           <div className="max-w-[150px] truncate text-xs text-gray-500 font-medium" title={item.reason}>
                             {item.reason || '—'}
                           </div>
                        </td>
                      </>
                    )}

                    {activeTab === 'payroll' && (
                      <>
                        <td className="px-5 py-4 font-bold text-gray-800">{item.staff?.name}</td>
                        <td className="px-5 py-4 text-xs text-gray-500 font-mono font-bold whitespace-nowrap">{new Date(item.created_at).toLocaleDateString(language === 'BAN' ? 'bn-BD' : 'en-US')}</td>
                        <td className="px-5 py-4 text-xs text-gray-600 font-medium">{t(item.month)} {item.year}</td>
                        <td className="px-5 py-4">
                           <p className="font-bold text-emerald-700">{fmt(parseFloat(item.net_salary) + parseFloat(item.bonus) - parseFloat(item.deduction))}</p>
                           <p className="text-[9px] text-gray-400 flex gap-2">
                              <span>{t('Bon:')} +{item.bonus}</span>
                              <span className="text-red-300">{t('Ded:')} -{item.deduction}</span>
                           </p>
                        </td>
                      </>
                    )}

                    {['shifts', 'roles', 'leave-types'].includes(activeTab) && (
                      <>
                        <td className="px-5 py-4 font-bold text-gray-800">{item.name}</td>
                        <td className="px-5 py-4 text-xs text-gray-500">
                           {activeTab === 'shifts' && `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`}
                           {activeTab === 'leave-types' && `${item.days_allowed} ${t('Days Allowed')}`}
                           {activeTab === 'roles' && t('Staff Designation')}
                        </td>
                      </>
                    )}

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                         {activeTab === 'payroll' && item.status === 'Paid' && (
                           <button onClick={() => handlePrintInvoice(item)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" title={t("Print Slip")}>
                             <MdPrint size={16} />
                           </button>
                         )}
                         <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title={t("Edit")}>
                           <MdEdit size={16} />
                         </button>
                         <button onClick={() => setDeleteItem(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title={t("Delete")}>
                           <MdDelete size={16} />
                         </button>
                      </div>
                    </td>
                 </motion.tr>
               ))
              }
            </tbody>
          </table>
        </div>

        <Pagination meta={currentData?.meta} onPage={setPage} />
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {deleteItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-7 shadow-2xl max-w-sm w-full mx-4">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MdDelete size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-800 mb-2">{t('Confirm Delete')}</h3>
              <p className="text-sm text-center text-gray-400 mb-6">{t('Are you sure you want to delete this record? This action cannot be undone.')}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteItem(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 uppercase tracking-widest">{t('Cancel')}</button>
                <button onClick={async () => {
                  const delFn = { staff: deleteStaff, shifts: deleteShift, roles: deleteRole, attendance: deleteAttendance, 'leave-types': deleteLeaveType, leaves: deleteLeave, payroll: deletePayroll }[activeTab];
                  try { await delFn(deleteItem.id).unwrap(); toast.success(t("Deleted successfully!")); setDeleteItem(null); } catch (err) { toast.error(t("Failed to delete.")); }
                }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all uppercase tracking-widest">
                  {isDeleting ? t('Deleting...') : t('Delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

/* ── Form Component ── */
function StaffForm({ activeTab, initial, onSave, onCancel, loading, refs }) {
  const t = useTranslate();
  const [imagePreview, setImagePreview] = useState(initial?.image_url || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [basicSalary, setBasicSalary] = useState(initial?.net_salary || '');

  const handleStaffChange = (e) => {
    const staffId = e.target.value;
    const selectedStaff = refs.staff?.data?.find(s => s.id == staffId);
    if (selectedStaff) {
      setBasicSalary(selectedStaff.salary);
    } else {
      setBasicSalary('');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setRemoveImage(true);
  };

  const submit = (ev) => {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    if (removeImage) {
      formData.append('remove_image', '1');
    }
    onSave(formData);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-[#A8D5A2]/30 shadow-sm p-6 mb-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: COLORS.primaryLight }}>
           <RiFileTextLine size={18} style={{ color: COLORS.primary }} />
        </div>
        <h3 className="text-base font-bold text-gray-800">
           {initial 
             ? t('Edit — ') + (initial.name || initial.staff_code || t('Record')) 
             : t(`new ${activeTab}`)}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {activeTab === 'staff' && (
          <>
            <Field label={t("Staff Code *")}><input name="staff_code" defaultValue={initial?.staff_code} required placeholder={t("Enter Staff Code (e.g. EMP-001)")} className={inp()} /></Field>
            <Field label={t("Full Name *")}><input name="name" defaultValue={initial?.name} required className={inp()} /></Field>
            <Field label={t("Email *")}><input type="email" name="email" defaultValue={initial?.email} required className={inp()} /></Field>
            <Field label={t("Phone")}><input name="phone" defaultValue={initial?.phone} className={inp()} /></Field>
            <Field label={t("Address")}><input name="address" defaultValue={initial?.address} className={inp()} placeholder={t("Enter Address")} /></Field>
            <Field label={t("NID Number *")}><input name="nid_number" defaultValue={initial?.nid_number} required className={inp()} /></Field>
            <Field label={t("Salary *")}><input type="number" step="0.01" name="salary" defaultValue={initial?.salary} required className={inp()} /></Field>
            <Field label={t("Role *")}>
               <select name="role_id" defaultValue={initial?.role_id} required className={inp()}>
                  <option value="">{t("Select Role")}</option>
                  {refs.roles?.data?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
               </select>
            </Field>
            <Field label={t("Shift *")}>
               <select name="shift_id" defaultValue={initial?.shift_id} required className={inp()}>
                  <option value="">{t("Select Shift")}</option>
                  {refs.shifts?.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
            </Field>
            <Field label={t("Joined Date *")}><input type="date" name="joined_at" defaultValue={initial?.joined_at?.split('T')[0]} required className={inp()} /></Field>
            <Field label={t("Status")}>
               <select name="status" defaultValue={initial?.status || 'Active'} className={inp()}>
                  <option value="Active">{t("Active")}</option>
                  <option value="Inactive">{t("Inactive")}</option>
               </select>
            </Field>
            <div className="lg:col-span-3">
               <Field label={t("Profile Image")}>
                  <div className="flex items-center gap-4">
                     <input 
                        type="file" 
                        name="image" 
                        onChange={handleImageChange}
                        className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-[#E8F5E0] file:text-[#2D3A2E] hover:file:bg-[#A8D5A2]/30" 
                     />
                     {imagePreview && (
                        <div className="relative group">
                           <img src={imagePreview} className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-100 shadow-sm" alt="Preview" />
                           <button 
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                           >
                              <MdClose size={12} />
                           </button>
                           <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <p className="text-[8px] text-white font-bold uppercase tracking-tighter" style={{ fontSize: '8px' }}>{t('Preview')}</p>
                           </div>
                        </div>
                     )}
                  </div>
               </Field>
            </div>
          </>
        )}

        {activeTab === 'attendance' && (
          <>
            <div className="lg:col-span-3">
              <Field label={t("Staff *")}>
                <select name="staff_id" defaultValue={initial?.staff_id} required className={inp()}>
                   <option value="">{t("Select Employee")}</option>
                   {refs.staff?.data?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.staff_code})</option>)}
                </select>
              </Field>
            </div>
            <Field label={t("Date *")}><input type="date" name="date" defaultValue={initial?.date?.split('T')[0] || new Date().toISOString().split('T')[0]} required className={inp()} /></Field>
            <Field label={t("Status")}>
               <select name="status" defaultValue={initial?.status || 'Present'} className={inp()}>
                  <option value="Present">{t("Present")}</option>
                  <option value="Absent">{t("Absent")}</option>
                  <option value="Late">{t("Late")}</option>
                  <option value="On Leave">{t("On Leave")}</option>
               </select>
            </Field>
            <Field label={t("Check In")}><input type="time" name="check_in_time" defaultValue={initial?.check_in_time?.slice(0,5)} className={inp()} /></Field>
            <Field label={t("Check Out")}><input type="time" name="check_out_time" defaultValue={initial?.check_out_time?.slice(0,5)} className={inp()} /></Field>
          </>
        )}

        {activeTab === 'leaves' && (
          <>
            <div className="lg:col-span-2">
              <Field label={t("Staff *")}>
                <select name="staff_id" defaultValue={initial?.staff_id} required className={inp()}>
                   <option value="">{t("Select Employee")}</option>
                   {refs.staff?.data?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.staff_code})</option>)}
                </select>
              </Field>
            </div>
            <Field label={t("Leave Type *")}>
               <select name="leave_type_id" defaultValue={initial?.leave_type_id} required className={inp()}>
                  {refs.leaveTypes?.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
            </Field>
            <Field label={t("Start Date *")}><input type="date" name="start_date" defaultValue={initial?.start_date?.split('T')[0]} required className={inp()} /></Field>
            <Field label={t("End Date *")}><input type="date" name="end_date" defaultValue={initial?.end_date?.split('T')[0]} required className={inp()} /></Field>
            <Field label={t("Approval Status")}>
               <select name="status" defaultValue={initial?.status || 'Pending'} className={inp()}>
                  <option value="Pending">{t("Pending")}</option>
                  <option value="Approved">{t("Approved")}</option>
                  <option value="Rejected">{t("Rejected")}</option>
               </select>
            </Field>
            <div className="lg:col-span-3"><Field label={t("Reason")}><input name="reason" defaultValue={initial?.reason} className={inp()} /></Field></div>
          </>
        )}

        {activeTab === 'payroll' && (
          <>
            <div className="lg:col-span-2">
               <Field label={t("Select Employee *")}>
                  <select name="staff_id" defaultValue={initial?.staff_id} onChange={handleStaffChange} required className={inp()}>
                     <option value="">{t("Select Employee")}</option>
                     {refs.staff?.data?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.staff_code})</option>)}
                  </select>
               </Field>
            </div>
            <Field label={t("Month *")}>
               <select name="month" defaultValue={initial?.month || new Date().toLocaleString('default', { month: 'long' })} className={inp()}>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{t(m)}</option>
                  ))}
               </select>
            </Field>
            <Field label={t("Year *")}><input type="number" name="year" defaultValue={initial?.year || new Date().getFullYear()} required className={inp()} /></Field>
            <Field label={t("Basic Salary ($) *")}><input type="number" step="0.01" name="net_salary" value={basicSalary} readOnly placeholder={t("Auto-calculated")} required className={inp(false) + " bg-gray-50 opacity-80 cursor-not-allowed"} /></Field>
            <Field label={t("Bonus ($)")}><input type="number" step="0.01" name="bonus" defaultValue={initial?.bonus || 0} className={inp()} /></Field>
            <Field label={t("Deduction ($)")}><input type="number" step="0.01" name="deduction" defaultValue={initial?.deduction || 0} className={inp()} /></Field>
            <Field label={t("Payment Status")}>
               <select name="status" defaultValue={initial?.status || 'Unpaid'} className={inp()}>
                  <option value="Unpaid">{t("Unpaid")}</option>
                  <option value="Paid">{t("Paid")}</option>
               </select>
            </Field>
          </>
        )}

        {['shifts', 'roles', 'leave-types'].includes(activeTab) && (
          <>
            <div className="lg:col-span-2"><Field label={t("Name *")}><input name="name" defaultValue={initial?.name} required className={inp()} /></Field></div>
            {activeTab === 'shifts' && (
              <>
                <Field label={t("Start Time *")}><input type="time" name="start_time" defaultValue={initial?.start_time?.slice(0,5)} required className={inp()} /></Field>
                <Field label={t("End Time *")}><input type="time" name="end_time" defaultValue={initial?.end_time?.slice(0,5)} required className={inp()} /></Field>
              </>
            )}
            {activeTab === 'leave-types' && <Field label={t("Days Allowed *")}><input type="number" name="days_allowed" defaultValue={initial?.days_allowed} required className={inp()} /></Field>}
            <Field label={t("Status")}>
               <select name="status" defaultValue={initial?.status || 'Active'} className={inp()}>
                  <option value="Active">{t("Active")}</option>
                  <option value="Inactive">{t("Inactive")}</option>
               </select>
            </Field>
          </>
        )}

      </div>

      <div className="mt-8 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-100 text-[11px] font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-[2px] transition-all">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3 rounded-xl text-[11px] font-bold text-white uppercase tracking-[2px] shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
          style={{ background: COLORS.primary }}>
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdSave size={16} />}
          {loading ? t('Saving...') : initial ? t('Update') + ' ' + t(TABS.find(tab => tab.id === activeTab)?.label || '') : t('Create') + ' ' + t(TABS.find(tab => tab.id === activeTab)?.label || '')}
        </button>
      </div>
    </form>
  );
}

export default StaffPage;
