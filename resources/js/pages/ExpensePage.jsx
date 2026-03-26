import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdRefresh,
  MdSearch, MdChevronLeft, MdChevronRight, MdPrint,
  MdReceipt, MdTrendingUp,
} from 'react-icons/md';
import {
  BsCashStack, BsCheckCircleFill, BsXCircleFill,
} from 'react-icons/bs';
import { RiFileTextLine } from 'react-icons/ri';
import {
  fetchExpenses, fetchSummary,
  createExpense, updateExpense, deleteExpense,
} from '../store/slices/expenseSlice';
import { homeThunks, contactThunks } from '../store/slices/cmsSlice';
import ExpenseInvoicePDF from '../components/expense/ExpenseInvoicePDF';
import { useTranslate, formatPrice } from '../utils/localeHelper';

/* ── Constants ── */
const CATEGORIES = ['Kg', 'Lt', 'Box', 'Packet', 'Carton'];

const SLIDE = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.16 } },
};

/* ── Primitives ── */
function StatusBadge({ status }) {
  const t = useTranslate();
  const paid = status === 'Paid';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      text-[11px] font-semibold ${paid
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-red-50 text-red-600 border border-red-200'
      }`}>
      {paid
        ? <BsCheckCircleFill size={10} className="text-emerald-500" />
        : <BsXCircleFill size={10} className="text-red-400" />
      }
      {t(status)}
    </span>
  );
}

function SkeletonRow() {
  return <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="border-b border-gray-50">
        {[...Array(13)].map((_, j) => (
          <td key={j} className="px-4 py-4">
            <div className="h-4 bg-gray-100 rounded-lg animate-pulse"
              style={{ width: `${50 + Math.random() * 40}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </>;
}

function Pagination({ meta, onPage }) {
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
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${meta.current_page === i + 1
                ? 'bg-[#2D3A2E] text-white'
                : 'text-gray-500 hover:bg-gray-100'
              }`}>{i + 1}</button>
        ))}
        <button onClick={() => onPage(meta.current_page + 1)} disabled={meta.current_page === meta.last_page}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <MdChevronRight size={18} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}

function DeleteModal({ item, onConfirm, onCancel, loading }) {
  const t = useTranslate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}>
      <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: .9, opacity: 0 }}
        className="bg-white rounded-2xl p-7 shadow-2xl max-w-sm w-full mx-4">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MdDelete size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-center text-gray-800 mb-2"
          style={{ fontFamily: '"Plus Jakarta Sans",sans-serif' }}>{t('Delete Expense?')}</h3>
        <p className="text-sm text-center text-gray-400 mb-2">
          {t('Transaction')}: <span className="font-semibold text-gray-700">{item?.transaction_id}</span>
        </p>
        <p className="text-sm text-center text-gray-400 mb-6">
          {t('Supplier')}: <span className="font-medium text-gray-600">{item?.supplier_name}</span>
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            {t('Cancel')}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60">
            {loading ? t('Deleting…') : t('Delete')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Field helper ── */
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inp = (err) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${err ? 'border-red-300 bg-red-50'
    : 'border-gray-200 focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20'
  }`;

/* ════════════════════════════════════════
   EXPENSE FORM
   ════════════════════════════════════════ */
function ExpenseForm({ initial, onSave, onCancel, loading, currency }) {
  const t = useTranslate();
  const blankRow = { items: '', category: 'Kg', qty: '', price: '', total: 0 };
  
  const blank = {
    supplier_name: '', contact_person: '', phone: '', address: '',
    rows: [blankRow],
    date: new Date().toISOString().split('T')[0], status: 'Unpaid',
  };

  const [form, setForm] = useState(() => {
    if (initial?.id) {
      // If editing, use existing line_items
      return {
        ...blank, ...initial,
        rows: initial.line_items || [{ ...blankRow }],
        date: initial.date ? (typeof initial.date === 'string' ? initial.date.split('T')[0] : initial.date) : blank.date,
      };
    }
    return blank;
  });
  
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const updateRow = (idx, k, v) => {
    const nextRows = [...form.rows];
    const row = { ...nextRows[idx], [k]: v };
    if (k === 'qty' || k === 'price') {
      const q = parseFloat(k === 'qty' ? v : row.qty) || 0;
      const p = parseFloat(k === 'price' ? v : row.price) || 0;
      row.total = (q * p).toFixed(2);
    }
    nextRows[idx] = row;
    setForm(f => ({ ...f, rows: nextRows }));
  };

  const addRow = () => setForm(f => ({ ...f, rows: [...f.rows, { ...blankRow }] }));
  const removeRow = (idx) => {
    if (form.rows.length <= 1) return;
    setForm(f => ({ ...f, rows: f.rows.filter((_, i) => i !== idx) }));
  };

  const totalAll = form.rows.reduce((acc, r) => acc + parseFloat(r.total || 0), 0);

  const validate = () => {
    const e = {};
    if (!form.supplier_name.trim()) e.supplier_name = t('Supplier name is required');
    if (!form.date) e.date = t('Date is required');
    
    const rowErrs = form.rows.map(r => {
      const re = {};
      if (!r.items.trim()) re.items = t('Required');
      if (!r.qty || r.qty <= 0) re.qty = t('Invalid');
      if (!r.price || r.price < 0) re.price = t('Invalid');
      return re;
    });

    if (rowErrs.some(r => Object.keys(r).length > 0)) {
      e.rows = rowErrs;
    }

    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    
    const payload = {
      ...form,
      line_items: form.rows,
      grand_total: totalAll,
    };
    delete payload.rows;
    if (initial?.id) payload.id = initial.id;
    onSave(payload);
  };

  return (
    <form onSubmit={submit}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-visible">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: '#E8F5E0' }}>
          <RiFileTextLine size={18} style={{ color: '#2D3A2E' }} />
        </div>
        <h3 className="text-base font-bold text-gray-800"
          style={{ fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
          {initial?.id ? `${t('Edit —')} ${initial.transaction_id}` : t('New Expense')}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Field label={t('Supplier Name *')} error={errors.supplier_name}>
          <input value={form.supplier_name}
            onChange={e => set('supplier_name', e.target.value)}
            placeholder={t('e.g. ABC Supplies Ltd.')} className={inp(errors.supplier_name)} />
        </Field>

        <Field label={t('Phone')}>
          <input value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="+1 234 567 890" className={inp()} />
        </Field>

        <Field label={t('Contact Person')}>
          <input value={form.contact_person}
            onChange={e => set('contact_person', e.target.value)}
            placeholder="John Doe" className={inp()} />
        </Field>

        <div className="sm:col-span-2">
          <Field label={t('Address')}>
            <input value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder={t('Address')} className={inp()} />
          </Field>
        </div>

        <Field label={t('Date *')} error={errors.date}>
          <input type="date" value={form.date}
            onChange={e => set('date', e.target.value)}
            className={inp(errors.date)} />
        </Field>

        <Field label={t('Status')}>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className={inp()}>
            <option value="Unpaid">{t('Unpaid')}</option>
            <option value="Paid">{t('Paid')}</option>
          </select>
        </Field>
      </div>

      {/* Dynamic Items Section */}
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <MdReceipt size={14} /> {t('Items & Description')}
      </h4>

      <div className="space-y-3 mb-6">
        <AnimatePresence initial={false}>
          {form.rows.map((row, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="grid grid-cols-12 gap-3 items-start"
            >
              <div className="col-span-12 sm:col-span-5">
                <input
                  value={row.items}
                  onChange={e => updateRow(idx, 'items', e.target.value)}
                  placeholder={t('Items / Description...')}
                  className={inp(errors.rows?.[idx]?.items)}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <select
                  value={row.category}
                  onChange={e => updateRow(idx, 'category', e.target.value)}
                  className={inp()}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{t(c)}</option>)}
                </select>
              </div>
              <div className="col-span-3 sm:col-span-2">
                <input
                  type="number" step="0.01"
                  value={row.qty}
                  onChange={e => updateRow(idx, 'qty', e.target.value)}
                  placeholder={t('Qty')}
                  className={inp(errors.rows?.[idx]?.qty)}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <input
                  type="number" step="0.01"
                  value={row.price}
                  onChange={e => updateRow(idx, 'price', e.target.value)}
                  placeholder={t('Price')}
                  className={inp(errors.rows?.[idx]?.price)}
                />
              </div>
              <div className="col-span-1 flex justify-center pt-2.5">
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  disabled={form.rows.length <= 1}
                >
                  <MdDelete size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-gray-50">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#2D3A2E] bg-[#E8F5E0] hover:bg-[#D4EBC7] transition-all"
        >
          <MdAdd size={18} /> {t('Add More Items')}
        </button>

        <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t('Grand Total')}</span>
          <span className="text-xl font-black text-[#2D3A2E] tracking-tight">
            {formatPrice(totalAll, currency)}
          </span>
        </div>
      </div>

      <div className="flex gap-4 mt-8 pt-4">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all flex items-center justify-center gap-2">
          <MdClose size={18} /> {t('Cancel')}
        </button>
        <button type="submit" disabled={loading}
          className="flex-[2] py-3 rounded-xl text-sm font-bold shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: '#2D3A2E', color: '#fff' }}>
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdSave size={18} />}
          {loading ? t('Processing…') : initial?.id ? t('Update Expense') : t('Confirm & Save')}
        </button>
      </div>
    </form>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════ */
export default function ExpensePage() {
  const dispatch = useDispatch();
  const t = useTranslate();
  const { expenses, meta, summary, status, actionLoading } =
    useSelector(s => s.expense);
  const { language, currency } = useSelector(s => s.locale);

  // Dynamic Hotel Branding from CMS store
  const cmsHome = useSelector(s => s.cms.home.data?.[0]);
  const cmsContact = useSelector(s => s.cms.contact.data?.[0]);

  const hotelInfo = useMemo(() => ({
    hotel_name: cmsHome?.hotel_name || 'HOTEL MANAGEMENT',
    logo: cmsHome?.logo_url,
    address: cmsContact?.address || 'Hotel Address',
    phone: cmsContact?.phone || 'N/A',
    email: cmsContact?.email || 'N/A'
  }), [cmsHome, cmsContact]);

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQ, setSearchQ] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [datePreset, setDatePreset] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [printingId, setPrintingId] = useState(null);

  /* Load data */
  useEffect(() => {
    dispatch(fetchExpenses({
      page,
      per_page: 15,
      search,
      status: statusFilter,
      date_from: dateRange.from,
      date_to: dateRange.to
    }));
  }, [page, search, statusFilter, dateRange, dispatch]);

  useEffect(() => {
    dispatch(fetchSummary({
      date_from: dateRange.from,
      date_to: dateRange.to
    }));
  }, [dateRange, dispatch]);

  useEffect(() => {
    if (!cmsHome) dispatch(homeThunks.fetch());
    if (!cmsContact) dispatch(contactThunks.fetch());
  }, [cmsHome, cmsContact, dispatch]);

  /* Debounced search */
  useEffect(() => {
    const tm = setTimeout(() => { setSearch(searchQ); setPage(1); }, 400);
    return () => clearTimeout(tm);
  }, [searchQ]);

  /* Handlers */
  const openCreate = () => { setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const handleSave = async (payload) => {
    const res = await dispatch(
      payload.id ? updateExpense(payload) : createExpense(payload)
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(payload.id ? t('Updated successfully!') : t('Created successfully!'));
      closeForm();
      dispatch(fetchSummary({
        date_from: dateRange.from,
        date_to: dateRange.to
      }));
    } else {
      toast.error(res.payload || t('Something went wrong'));
    }
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteExpense(deleteItem.id));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(t('Deleted successfully!'));
      dispatch(fetchSummary({
        date_from: dateRange.from,
        date_to: dateRange.to
      }));
    } else {
      toast.error(res.payload || t('Cannot delete'));
    }
    setDeleteItem(null);
  };

  /* PDF print handler */
  const handlePrint = useCallback(async (expense) => {
    setPrintingId(expense.id);
    try {
      const blob = await pdf(
        <ExpenseInvoicePDF expense={expense} hotelInfo={hotelInfo} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${expense.transaction_id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`${t('Invoice')} ${expense.transaction_id} ${t('downloaded!')}`);
    } catch (err) {
      console.error(err);
      toast.error(t('Failed to generate PDF'));
    } finally {
      setPrintingId(null);
    }
  }, [hotelInfo, t]);

  const handleDatePreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];

    if (preset === 'today') {
      setDateRange({ from: fmt(today), to: fmt(today) });
    } else if (preset === 'this_week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      const start = new Date(today.setDate(diff));
      setDateRange({ from: fmt(start), to: fmt(new Date()) });
    } else if (preset === 'this_month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateRange({ from: fmt(start), to: fmt(new Date()) });
    } else if (preset === 'all') {
      setDateRange({ from: '', to: '' });
    }
    setPage(1);
  };

  /* ── Render ── */
  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5"
      style={{ scrollbarWidth: 'thin' }}>
      <Toaster position="top-right"
        toastOptions={{ duration: 3500, style: { borderRadius: '12px', fontSize: '13px' } }} />

      {/* ── Page header ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5
                      flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: '#E8F5E0' }}>
            <BsCashStack size={22} style={{ color: '#2D3A2E' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800"
              style={{ fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
              {t('Expense Management')}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('Track and manage hotel expenses')}
            </p>
          </div>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                     transition-all hover:opacity-90"
          style={{ background: '#2D3A2E', color: '#fff' }}>
          <MdAdd size={18} /> {t('Add Expense')}
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: t('Total Expenses'), value: formatPrice(summary.total_expenses, currency),
            count: summary.total_count, color: '#E8F5E0', text: '#2D5A30',
            icon: <MdReceipt size={18} />
          },
          {
            label: t('Total Paid'), value: formatPrice(summary.paid_total, currency),
            count: summary.paid_count, color: '#DCFCE7', text: '#16a34a',
            icon: <BsCheckCircleFill size={16} />
          },
          {
            label: t('Total Unpaid'), value: formatPrice(summary.unpaid_total, currency),
            count: summary.unpaid_count, color: '#FEE2E2', text: '#DC2626',
            icon: <BsXCircleFill size={16} />
          },
        ].map((s, i) => (
          <div key={i}
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm
                       p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.color, color: s.text }}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-gray-800 truncate"
                style={{ fontFamily: '"Plus Jakarta Sans",sans-serif' }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.count} {t('transactions')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div key="expense-form" {...SLIDE}>
            <ExpenseForm
              initial={editItem}
              onSave={handleSave}
              onCancel={closeForm}
              loading={actionLoading}
              currency={currency}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap
                        items-center gap-3 justify-between">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2
                          flex-1 min-w-[200px] max-w-xs">
            <MdSearch size={18} className="text-gray-400 flex-shrink-0" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder={t('Search TXN, supplier, phone…')}
              className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
            />
            {searchQ && (
              <button onClick={() => setSearchQ('')}>
                <MdClose size={15} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Date filter */}
            <div className="flex items-center gap-2">
              <select
                value={datePreset}
                onChange={e => handleDatePreset(e.target.value)}
                className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
                           outline-none text-gray-600 focus:border-[#A8D5A2] transition-all">
                <option value="all">{t('All Dates')}</option>
                <option value="today">{t('Today')}</option>
                <option value="this_week">{t('This Week')}</option>
                <option value="this_month">{t('This Month')}</option>
                <option value="custom">{t('Custom Range')}</option>
              </select>

              {datePreset === 'custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={e => { setDateRange(prev => ({ ...prev, from: e.target.value })); setPage(1); }}
                    className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={e => { setDateRange(prev => ({ ...prev, to: e.target.value })); setPage(1); }}
                    className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
                         outline-none text-gray-600 focus:border-[#A8D5A2] transition-all">
              <option value="">{t('All Status')}</option>
              <option value="Paid">{t('Paid')}</option>
              <option value="Unpaid">{t('Unpaid')}</option>
            </select>

            {/* Refresh */}
            <button
              onClick={() => dispatch(fetchExpenses({
                page, per_page: 15, search, status: statusFilter,
                date_from: dateRange.from, date_to: dateRange.to
              }))}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <MdRefresh size={18} className={`text-gray-400 ${status === 'loading' ? 'animate-spin' : ''}`} />
            </button>

            <span className="text-xs text-gray-400 whitespace-nowrap">{meta.total} {t('records')}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed min-w-[1500px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[140px]">{t('Transaction ID')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[180px]">{t('Supplier')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[150px]">{t('Contact')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[130px]">{t('Phone')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[200px]">{t('Address')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[150px]">{t('Items')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[80px]">{t('Qty')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[100px]">{t('Category')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[120px]">{t('Unit Price')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[120px]">{t('Total')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[120px]">{t('Date')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[120px]">{t('Status')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[100px] text-center">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' ? <SkeletonRow /> :
                expenses.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center
                                       justify-center">
                          <BsCashStack size={28} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 text-sm">{t('No expenses found.')}</p>
                      </div>
                    </td>
                  </tr>
                ) : expenses.map((exp, i) => (
                  <motion.tr key={exp.id}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">

                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-semibold text-[#2D3A2E]
                                      bg-[#E8F5E0] px-2 py-1 rounded-lg">
                        {exp.transaction_id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                      {exp.supplier_name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">
                      {exp.contact_person || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      {exp.phone || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs max-w-[120px]">
                      <p className="truncate" title={exp.address}>{exp.address || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-[140px]">
                      {(exp.line_items || []).map((l, idx) => (
                        <div key={idx} className="truncate text-[10px] leading-tight mb-1 last:mb-0 text-gray-700" title={l.items}>
                          • {l.items}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-center">
                      {(exp.line_items || []).map((l, idx) => (
                        <div key={idx} className="text-[10px] leading-tight mb-1 last:mb-0 text-gray-500">
                          {l.qty}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {(exp.line_items || []).map((l, idx) => (
                        <div key={idx} className="mb-1 last:mb-0">
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600
                                          text-[9px] font-semibold whitespace-nowrap">
                            {t(l.category)}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-right whitespace-nowrap">
                      {(exp.line_items || []).map((l, idx) => (
                        <div key={idx} className="text-[10px] leading-tight mb-1 last:mb-0 text-gray-500">
                          {formatPrice(l.price, currency)}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-gray-900 text-right whitespace-nowrap">
                      {formatPrice(exp.grand_total, currency)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      {exp.date ? new Date(exp.date).toLocaleDateString(language === 'BAN' ? 'bn-BD' : 'en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      }) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={exp.status}/>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {/* Edit */}
                        <button onClick={() => openEdit(exp)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400
                                    hover:text-blue-600 transition-colors" title={t('Edit')}>
                          <MdEdit size={15} />
                        </button>
                        {/* Print Invoice — only for Paid */}
                        {exp.status === 'Paid' && (
                          <button
                            onClick={() => handlePrint(exp)}
                            disabled={printingId === exp.id}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400
                                      hover:text-emerald-600 transition-colors disabled:opacity-50"
                            title={t('Download Invoice PDF')}>
                            {printingId === exp.id
                              ? <span className="w-3.5 h-3.5 border-2 border-emerald-400/40
                                                border-t-emerald-500 rounded-full animate-spin
                                                inline-block"/>
                              : <MdPrint size={15} />
                            }
                          </button>
                        )}
                        {/* Delete */}
                        <button onClick={() => setDeleteItem(exp)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400
                                    hover:text-red-500 transition-colors" title={t('Delete')}>
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPage={setPage}/>
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteItem && (
          <DeleteModal
            item={deleteItem}
            loading={actionLoading}
            onConfirm={handleDelete}
            onCancel={() => setDeleteItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
