import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector }                 from 'react-redux';
import { motion, AnimatePresence }                  from 'framer-motion';
import toast, { Toaster }                           from 'react-hot-toast';
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdSave,
  MdSearch, MdRefresh, MdChevronLeft, MdChevronRight,
  MdPercent, MdDiscount,
} from 'react-icons/md';
import { RiPercentLine, RiPriceTag3Line } from 'react-icons/ri';
import { BsCashCoin } from 'react-icons/bs';
import {
  useGetTaxesQuery, useCreateTaxMutation, useUpdateTaxMutation, useDeleteTaxMutation,
  useGetGlobalDiscountsQuery, useCreateGlobalDiscountMutation, useUpdateGlobalDiscountMutation, useDeleteGlobalDiscountMutation,
  useGetCategoryDiscountsQuery, useCreateCategoryDiscountMutation, useUpdateCategoryDiscountMutation, useDeleteCategoryDiscountMutation,
  useGetRoomsDropdownQuery, useGetCategoriesDropdownQuery,
} from '../store/api/settingApi';
import { translate } from '../utils/localeHelper';

/* ── constants ─────────────────────── */
const TABS = (language) => [
  { key: 'taxes',     label: translate('Tax', language),               icon: <RiPercentLine size={15}/> },
  { key: 'global',    label: translate('Global Discount', language),    icon: <RiPriceTag3Line size={15}/> },
  { key: 'category',  label: translate('Category Discount', language),  icon: <MdDiscount size={15}/> },
];

const SLIDE = {
  initial:  { opacity: 0, x: 32 },
  animate:  { opacity: 1, x: 0, transition: { duration: 0.26, ease: [0.4,0,0.2,1] } },
  exit:     { opacity: 0, x: -32, transition: { duration: 0.18 } },
};

/* ── Reusable primitives ────────────── */
function StatusBadge({ status, language }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
      status === 'Active'
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-red-50 text-red-600 border border-red-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status==='Active'?'bg-emerald-500':'bg-red-400'}`}/>
      {translate(status, language)}
    </span>
  );
}

function SkeletonRow({ cols }) {
  return <>
    {[...Array(4)].map((_,i) => (
      <tr key={i} className="border-b border-gray-50">
        {[...Array(cols)].map((_,j) => (
          <td key={j} className="px-5 py-4">
            <div className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{width:`${55+Math.random()*35}%`}}/>
          </td>
        ))}
      </tr>
    ))}
  </>;
}

function Pagination({ meta, onPage, language }) {
  if (!meta || meta.last_page <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        {((meta.current_page-1)*meta.per_page)+1}–
        {Math.min(meta.current_page*meta.per_page, meta.total)} {translate('of', language)} {meta.total}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={()=>onPage(meta.current_page-1)} disabled={meta.current_page===1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <MdChevronLeft size={18} className="text-gray-500"/>
        </button>
        {[...Array(Math.min(meta.last_page, 5))].map((_, i) => (
          <button key={i} onClick={() => onPage(i + 1)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              meta.current_page === i + 1
                ? 'bg-[#2D3A2E] text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}>{i + 1}</button>
        ))}
        <button onClick={()=>onPage(meta.current_page+1)} disabled={meta.current_page===meta.last_page}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <MdChevronRight size={18} className="text-gray-500"/>
        </button>
      </div>
    </div>
  );
}

function DeleteModal({ label, name, onConfirm, onCancel, loading, language }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.45)'}}>
      <motion.div initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.9,opacity:0}}
        className="bg-white rounded-2xl p-7 shadow-2xl max-w-sm w-full mx-4">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MdDelete size={28} className="text-red-500"/>
        </div>
        <h3 className="text-lg font-bold text-center text-gray-800 mb-2"
          style={{fontFamily:'"Plus Jakarta Sans",sans-serif'}}>{translate('Delete', language)} {label}?</h3>
        <p className="text-sm text-center text-gray-400 mb-6">
          "<span className="font-medium text-gray-600">{name}</span>" {translate('will be permanently deleted.', language)}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            {translate('Cancel', language)}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60">
            {loading ? translate('Deleting…', language) : translate('Delete', language)}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SaveBtn({ loading, label = 'Save', language }) {
  return (
    <button type="submit" disabled={loading}
      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      style={{background:'#2D3A2E', color:'#fff'}}>
      {loading
        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
        : <MdSave size={16}/>
      }
      {loading ? translate('Saving…', language) : translate(label, language)}
    </button>
  );
}

/* ── Field helpers ──────────────────── */
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

const inputCls = (err) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
    err
      ? 'border-red-300 bg-red-50'
      : 'border-gray-200 focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20'
  }`;

const selectCls = (err) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white transition-all ${
    err ? 'border-red-300' : 'border-gray-200 focus:border-[#A8D5A2]'
  }`;

/* ════════════════════════════════════════
   TAX FORM
════════════════════════════════════════ */
function TaxForm({ initial, onSave, onCancel, loading, language }) {
  const [form, setForm]     = useState({ name:'', rate:'', status:'Active', ...initial });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())              e.name = translate('Name is required', language);
    if (!form.rate && form.rate !== 0)  e.rate = translate('Rate is required', language);
    else if (form.rate < 0 || form.rate > 100) e.rate = translate('Rate must be 0–100', language);
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = (ev) => { ev.preventDefault(); if (validate()) onSave(form); };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5"
        style={{fontFamily:'"Plus Jakarta Sans",sans-serif'}}>
        {initial?.id ? translate('Edit Tax', language) : translate('New Tax', language)}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={translate('Tax Name', language)} error={errors.name}>
          <input value={form.name} onChange={e=>set('name',e.target.value)}
            placeholder={translate('e.g. VAT, GST', language)} className={inputCls(errors.name)}/>
        </Field>
        <Field label={translate('Rate (%)', language)} error={errors.rate}>
          <input type="number" min="0" max="100" step="0.01"
            value={form.rate} onChange={e=>set('rate',e.target.value)}
            placeholder={translate('e.g. 15', language)} className={inputCls(errors.rate)}/>
        </Field>
        <Field label={translate('Status', language)}>
          <select value={form.status} onChange={e=>set('status',e.target.value)}
            className={selectCls()}>
            <option value="Active">{translate('Active', language)}</option>
            <option value="Inactive">{translate('Inactive', language)}</option>
          </select>
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <MdClose size={16}/> {translate('Cancel', language)}
        </button>
        <SaveBtn loading={loading} language={language}/>
      </div>
    </form>
  );
}

/* ════════════════════════════════════════
   GLOBAL DISCOUNT FORM
════════════════════════════════════════ */
function GlobalDiscountForm({ initial, rooms, onSave, onCancel, loading, language }) {
  const blank = { name:'', value:'', description:'', status:'Active',
                  valid_from:'', valid_until:'', room_id:'' };
  const [form, setForm]     = useState({ ...blank, ...initial,
    valid_from:  initial?.valid_from  ? initial.valid_from.split('T')[0]  : '',
    valid_until: initial?.valid_until ? initial.valid_until.split('T')[0] : '',
    room_id:     initial?.room_id ?? '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = translate('Name is required', language);
    if (!form.value)        e.value = translate('Value is required', language);
    else if (form.value < 0 || form.value > 100) e.value = translate('Value must be 0–100', language);
    if (form.valid_from && form.valid_until && form.valid_until < form.valid_from)
      e.valid_until = translate('End date must be after start date', language);
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload = { ...form,
      room_id:     form.room_id     || null,
      valid_from:  form.valid_from  || null,
      valid_until: form.valid_until || null,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5"
        style={{fontFamily:'"Plus Jakarta Sans",sans-serif'}}>
        {initial?.id ? translate('Edit Global Discount', language) : translate('New Global Discount', language)}
      </h3>
      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-5">
        ⚠ {translate('Global discounts affect all room prices. If a Room is selected, only that room is affected.', language)}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={translate('Discount Name', language)} error={errors.name}>
          <input value={form.name} onChange={e=>set('name',e.target.value)}
            placeholder={translate('e.g. Summer Sale', language)} className={inputCls(errors.name)}/>
        </Field>
        <Field label={translate('Discount Value (%)', language)} error={errors.value}>
          <input type="number" min="0" max="100" step="0.01"
            value={form.value} onChange={e=>set('value',e.target.value)}
            placeholder={translate('e.g. 10', language)} className={inputCls(errors.value)}/>
        </Field>
        <Field label={translate('Apply to Room (optional)', language)}>
          <select value={form.room_id} onChange={e=>set('room_id',e.target.value)}
            className={selectCls()}>
            <option value="">{translate('All Rooms (Global)', language)}</option>
            {rooms.map(r=><option key={r.id} value={r.id}>{r.room_number}</option>)}
          </select>
        </Field>
        <Field label={translate('Status', language)}>
          <select value={form.status} onChange={e=>set('status',e.target.value)}
            className={selectCls()}>
            <option value="Active">{translate('Active', language)}</option>
            <option value="Inactive">{translate('Inactive', language)}</option>
          </select>
        </Field>
        <Field label={translate('Valid From', language)}>
          <input type="date" value={form.valid_from} onChange={e=>set('valid_from',e.target.value)}
            className={inputCls()}/>
        </Field>
        <Field label={translate('Valid Until', language)} error={errors.valid_until}>
          <input type="date" value={form.valid_until} onChange={e=>set('valid_until',e.target.value)}
            className={inputCls(errors.valid_until)}/>
        </Field>
        <Field label={translate('Description', language)} error={null}>
          <textarea value={form.description} onChange={e=>set('description',e.target.value)}
            rows={2} placeholder={translate('Optional notes…', language)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20 transition-all sm:col-span-2"/>
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <MdClose size={16}/> {translate('Cancel', language)}
        </button>
        <SaveBtn loading={loading} language={language}/>
      </div>
    </form>
  );
}

/* ════════════════════════════════════════
   CATEGORY DISCOUNT FORM
════════════════════════════════════════ */
function CategoryDiscountForm({ initial, rooms, categories, onSave, onCancel, loading, language }) {
  const blank = { category_id:'', room_id:'', name:'', value:'',
                  description:'', status:'Active', valid_from:'', valid_until:'' };
  const [form, setForm]     = useState({ ...blank, ...initial,
    valid_from:  initial?.valid_from  ? initial.valid_from.split('T')[0]  : '',
    valid_until: initial?.valid_until ? initial.valid_until.split('T')[0] : '',
    category_id: initial?.category_id ?? '',
    room_id:     initial?.room_id     ?? '',
  });
  const [errors, setErrors] = useState({});
  const filteredRooms = form.category_id
    ? rooms.filter(r => Number(r.category_id) === Number(form.category_id))
    : [];

  // Reset room if category changes
  useEffect(() => {
    if (form.room_id) {
      const exists = filteredRooms.find(r => Number(r.id) === Number(form.room_id));
      if (!exists) set('room_id', '');
    }
  }, [form.category_id, filteredRooms, form.room_id]);

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };

  const validate = () => {
    const e = {};
    if (!form.category_id)  e.category_id = translate('Category is required', language);
    if (!form.name.trim())  e.name        = translate('Name is required', language);
    if (!form.value)        e.value       = translate('Value is required', language);
    else if (form.value < 0 || form.value > 100) e.value = translate('Value must be 0–100', language);
    if (form.valid_from && form.valid_until && form.valid_until < form.valid_from)
      e.valid_until = translate('End date must be after start date', language);
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload = { ...form,
      category_id: Number(form.category_id),
      room_id:     form.room_id     ? Number(form.room_id) : null,
      value:       Number(form.value),
      valid_from:  form.valid_from  || null,
      valid_until: form.valid_until || null,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5"
        style={{fontFamily:'"Plus Jakarta Sans",sans-serif'}}>
        {initial?.id ? translate('Edit Category Discount', language) : translate('New Category Discount', language)}
      </h3>
      <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-5">
        ℹ {translate('Category discounts apply to all rooms in the selected category. Selecting a specific room narrows it further.', language)}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={translate('Category', language)} error={errors.category_id}>
          <select value={form.category_id} onChange={e=>set('category_id',e.target.value)}
            className={selectCls(errors.category_id)}>
            <option value="">{translate('— Select Category —', language)}</option>
            {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label={translate('Specific Room (optional)', language)}>
          <select value={form.room_id} onChange={e=>set('room_id',e.target.value)}
            className={selectCls()}>
            <option value="">{translate('All Rooms in Category', language)}</option>
            {filteredRooms.map(r=><option key={r.id} value={r.id}>{r.room_number}</option>)}
          </select>
        </Field>
        <Field label={translate('Discount Name', language)} error={errors.name}>
          <input value={form.name} onChange={e=>set('name',e.target.value)}
            placeholder={translate('e.g. Weekend Deal', language)} className={inputCls(errors.name)}/>
        </Field>
        <Field label={translate('Discount Value (%)', language)} error={errors.value}>
          <input type="number" min="0" max="100" step="0.01"
            value={form.value} onChange={e=>set('value',e.target.value)}
            placeholder={translate('e.g. 20', language)} className={inputCls(errors.value)}/>
        </Field>
        <Field label={translate('Status', language)}>
          <select value={form.status} onChange={e=>set('status',e.target.value)}
            className={selectCls()}>
            <option value="Active">{translate('Active', language)}</option>
            <option value="Inactive">{translate('Inactive', language)}</option>
          </select>
        </Field>
        <Field label={translate('Valid From', language)}>
          <input type="date" value={form.valid_from} onChange={e=>set('valid_from',e.target.value)}
            className={inputCls()}/>
        </Field>
        <Field label={translate('Valid Until', language)} error={errors.valid_until}>
          <input type="date" value={form.valid_until} onChange={e=>set('valid_until',e.target.value)}
            className={inputCls(errors.valid_until)}/>
        </Field>
        <Field label={translate('Description', language)}>
          <textarea value={form.description} onChange={e=>set('description',e.target.value)}
            rows={2} placeholder={translate('Optional notes…', language)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20 transition-all"/>
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <MdClose size={16}/> {translate('Cancel', language)}
        </button>
        <SaveBtn loading={loading} language={language}/>
      </div>
    </form>
  );
}

/* ════════════════════════════════════════
   TABLE HEADER
════════════════════════════════════════ */
function TableHead({ headers }) {
  return (
    <thead>
      <tr className="border-b border-gray-100 bg-gray-50/60">
        {headers.map(h => (
          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/* ════════════════════════════════════════
   ACTION BUTTONS (Edit / Delete)
════════════════════════════════════════ */
function Actions({ onEdit, onDelete, language }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={onEdit}
        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
        title={translate('Edit', language)}>
        <MdEdit size={16}/>
      </button>
      <button onClick={onDelete}
        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        title={translate('Delete', language)}>
        <MdDelete size={16}/>
      </button>
    </div>
  );
}

/* ════════════════════════════════════════
   DATE BADGE
════════════════════════════════════════ */
function DateRange({ from, until, language }) {
  if (!from && !until) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className="text-xs text-gray-500 font-medium">
      {from  ? new Date(from).toLocaleDateString(language==='BAN'?'bn-BD':'en-US')  : '∞'}
      {' → '}
      {until ? new Date(until).toLocaleDateString(language==='BAN'?'bn-BD':'en-US') : '∞'}
    </span>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function SettingPage() {
  const { language } = useSelector(s => s.locale);

  const [tab,         setTab]        = useState('taxes');
  const [showForm,    setShowForm]   = useState(false);
  const [editItem,    setEditItem]   = useState(null);
  const [deleteItem,  setDeleteItem] = useState(null);
  const [taxPage,     setTaxPage]    = useState(1);
  const [globalPage,  setGlobalPage] = useState(1);
  const [catPage,     setCatPage]    = useState(1);

  /* RTK Query Hooks */
  const { data: taxesDataResponse, isFetching: taxesLoading, refetch: refetchTaxes } = useGetTaxesQuery({ page: taxPage, per_page: 15 });
  const { data: globalDataResponse, isFetching: globalLoading, refetch: refetchGlobal } = useGetGlobalDiscountsQuery({ page: globalPage, per_page: 15 });
  const { data: catDataResponse, isFetching: catLoading, refetch: refetchCat } = useGetCategoryDiscountsQuery({ page: catPage, per_page: 15 });

  const { data: roomsDropdown = [] } = useGetRoomsDropdownQuery();
  const { data: categoriesDropdown = [] } = useGetCategoriesDropdownQuery();

  const [createTaxFn, { isLoading: creatingTax }] = useCreateTaxMutation();
  const [updateTaxFn, { isLoading: updatingTax }] = useUpdateTaxMutation();
  const [deleteTaxFn, { isLoading: deletingTax }] = useDeleteTaxMutation();

  const [createGlobalFn, { isLoading: creatingGlobal }] = useCreateGlobalDiscountMutation();
  const [updateGlobalFn, { isLoading: updatingGlobal }] = useUpdateGlobalDiscountMutation();
  const [deleteGlobalFn, { isLoading: deletingGlobal }] = useDeleteGlobalDiscountMutation();

  const [createCatFn, { isLoading: creatingCat }] = useCreateCategoryDiscountMutation();
  const [updateCatFn, { isLoading: updatingCat }] = useUpdateCategoryDiscountMutation();
  const [deleteCatFn, { isLoading: deletingCat }] = useDeleteCategoryDiscountMutation();

  const taxes = taxesDataResponse?.data || [];
  const taxMeta = taxesDataResponse?.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 };
  
  const globalDiscounts = globalDataResponse?.data || [];
  const globalMeta = globalDataResponse?.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 };

  const categoryDiscounts = catDataResponse?.data || [];
  const categoryMeta = catDataResponse?.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 };

  const actionLoading = creatingTax || updatingTax || deletingTax || 
                        creatingGlobal || updatingGlobal || deletingGlobal ||
                        creatingCat || updatingCat || deletingCat;

  /* ── Handlers ── */
  const openCreate = () => { setEditItem(null); setShowForm(true); };
  const openEdit   = (item) => { setEditItem(item); setShowForm(true); };
  const closeForm  = () => { setShowForm(false); setEditItem(null); };

  const handleSave = async (form) => {
    try {
      if (tab === 'taxes') {
        if (editItem) await updateTaxFn({ id: editItem.id, ...form }).unwrap();
        else await createTaxFn(form).unwrap();
      } else if (tab === 'global') {
        if (editItem) await updateGlobalFn({ id: editItem.id, ...form }).unwrap();
        else await createGlobalFn(form).unwrap();
      } else {
        if (editItem) await updateCatFn({ id: editItem.id, ...form }).unwrap();
        else await createCatFn(form).unwrap();
      }
      toast.success(editItem ? translate('Updated successfully!', language) : translate('Created successfully!', language));
      closeForm();
    } catch (err) {
      toast.error(err?.data?.message || translate('Something went wrong', language));
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      if (tab === 'taxes') await deleteTaxFn(deleteItem.id).unwrap();
      else if (tab === 'global') await deleteGlobalFn(deleteItem.id).unwrap();
      else await deleteCatFn(deleteItem.id).unwrap();
      toast.success(translate('Deleted permanently!', language));
    } catch (err) {
      toast.error(err?.data?.message || translate('Cannot delete', language));
    }
    setDeleteItem(null);
  };

  /* ── Tab meta ── */
  const tabMeta = {
    taxes:    { data: taxes,             meta: taxMeta,             status: taxesLoading ? 'loading' : 'idle',      cols: 4 },
    global:   { data: globalDiscounts,   meta: globalMeta,          status: globalLoading ? 'loading' : 'idle',   cols: 7 },
    category: { data: categoryDiscounts, meta: categoryMeta,        status: catLoading ? 'loading' : 'idle', cols: 8 },
  };
  const current = tabMeta[tab];

  /* ── Render ── */
  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5" style={{scrollbarWidth:'thin'}}>
      <Toaster position="top-right" toastOptions={{ duration: 3500,
        style: { borderRadius:'12px', fontSize:'13px' }}}/>

      {/* Page header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{background:'#E8F5E0'}}>
            <BsCashCoin size={22} style={{color:'#2D3A2E'}}/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800"
              style={{fontFamily:'"Plus Jakarta Sans",sans-serif'}}>
              {translate('Tax & Discount Settings', language)}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {translate('Manage taxes, global and category-based discounts', language)}
            </p>
          </div>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{background:'#2D3A2E', color:'#fff'}}>
          <MdAdd size={18}/>
          {translate('Add', language)} {TABS(language).find(t=>t.key===tab)?.label || ''}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS(language).map(t => (
          <button key={t.key}
            onClick={() => { setTab(t.key); setShowForm(false); setEditItem(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-white shadow-sm text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: translate('Total Taxes', language),             value: taxMeta.total,             color:'#E8F5E0', text:'#2D5A30', icon:<RiPercentLine size={20}/> },
          { label: translate('Global Discounts', language),        value: globalMeta.total,   color:'#FEF3C7', text:'#92400E', icon:<RiPriceTag3Line size={20}/> },
          { label: translate('Category Discounts', language),      value: categoryMeta.total, color:'#EDE9FE', text:'#5B21B6', icon:<MdDiscount size={20}/> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{background:s.color, color:s.text}}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800"
                style={{fontFamily:'"Plus Jakarta Sans",sans-serif'}}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Animated content */}
      <AnimatePresence mode="wait">

        {/* ══ TAX tab ══ */}
        {tab === 'taxes' && (
          <motion.div key="taxes" {...SLIDE} className="flex flex-col gap-4">
            <AnimatePresence>
              {showForm && (
                <motion.div key="tax-form"
                  initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:-14}} transition={{duration:0.2}}>
                  <TaxForm initial={editItem} onSave={handleSave}
                    onCancel={closeForm} loading={actionLoading} language={language}/>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  {translate('All Taxes', language)} <span className="text-gray-400 font-normal ml-1">({taxMeta.total})</span>
                </p>
                <button onClick={() => refetchTaxes()}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <MdRefresh size={16} className={`text-gray-400 ${taxesLoading ? 'animate-spin' : ''}`}/>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <TableHead headers={[translate('Name',language), translate('Rate (%)',language), translate('Status',language), translate('Actions',language)]}/>
                  <tbody>
                    {taxesLoading ? <SkeletonRow cols={4}/> :
                     taxes.length === 0
                       ? <tr><td colSpan={4} className="px-5 py-14 text-center text-gray-400 text-sm">{translate('No taxes found.', language)}</td></tr>
                       : taxes.map((t, i) => (
                          <motion.tr key={t.id}
                            initial={{opacity:0,y:5}} animate={{opacity:1,y:0}}
                            transition={{delay:i*0.03}}
                            className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5 font-semibold text-gray-800">{t.name}</td>
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-1 rounded-lg bg-[#E8F5E0] text-[#2D5A30] text-xs font-semibold">
                                {t.rate}%
                              </span>
                            </td>
                            <td className="px-5 py-3.5"><StatusBadge status={t.status} language={language}/></td>
                            <td className="px-5 py-3.5">
                              <Actions onEdit={()=>openEdit(t)} onDelete={()=>setDeleteItem(t)} language={language}/>
                            </td>
                          </motion.tr>
                       ))
                    }
                  </tbody>
                </table>
              </div>
              <Pagination meta={taxMeta} onPage={setTaxPage} language={language}/>
            </div>
          </motion.div>
        )}

        {/* ══ GLOBAL DISCOUNT tab ══ */}
        {tab === 'global' && (
          <motion.div key="global" {...SLIDE} className="flex flex-col gap-4">
            <AnimatePresence>
              {showForm && (
                <motion.div key="global-form"
                  initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:-14}} transition={{duration:0.2}}>
                  <GlobalDiscountForm initial={editItem} rooms={roomsDropdown}
                    onSave={handleSave} onCancel={closeForm} loading={actionLoading} language={language}/>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  {translate('Global Discounts', language)}
                  <span className="text-gray-400 font-normal ml-1">({globalMeta.total})</span>
                </p>
                <button onClick={() => refetchGlobal()}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <MdRefresh size={16} className={`text-gray-400 ${globalLoading ? 'animate-spin' : ''}`}/>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <TableHead headers={[translate('Name',language),translate('Value (%)',language),translate('Room',language),translate('Validity',language),translate('Status',language),translate('Desc',language),translate('Actions',language)]}/>
                  <tbody>
                    {globalLoading ? <SkeletonRow cols={7}/> :
                     globalDiscounts.length === 0
                       ? <tr><td colSpan={7} className="px-5 py-14 text-center text-gray-400 text-sm">{translate('No global discounts found.', language)}</td></tr>
                       : globalDiscounts.map((g, i) => (
                          <motion.tr key={g.id}
                            initial={{opacity:0,y:5}} animate={{opacity:1,y:0}}
                            transition={{delay:i*0.03}}
                            className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5 font-semibold text-gray-800">{g.name}</td>
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">
                                {g.value}%
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-gray-500 text-xs">
                              {g.room ? (
                                <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium">
                                  {g.room.room_number}
                                </span>
                              ) : (
                                <span className="text-gray-400">{translate('All Rooms', language)}</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <DateRange from={g.valid_from} until={g.valid_until} language={language}/>
                            </td>
                            <td className="px-5 py-3.5"><StatusBadge status={g.status} language={language}/></td>
                            <td className="px-5 py-3.5 text-gray-400 text-xs max-w-[140px] truncate">
                              {g.description || '—'}
                            </td>
                            <td className="px-5 py-3.5">
                              <Actions onEdit={()=>openEdit(g)} onDelete={()=>setDeleteItem(g)} language={language}/>
                            </td>
                          </motion.tr>
                       ))
                    }
                  </tbody>
                </table>
              </div>
              <Pagination meta={globalMeta} onPage={setGlobalPage} language={language}/>
            </div>
          </motion.div>
        )}

        {/* ══ CATEGORY DISCOUNT tab ══ */}
        {tab === 'category' && (
          <motion.div key="category" {...SLIDE} className="flex flex-col gap-4">
            <AnimatePresence>
              {showForm && (
                <motion.div key="cat-form"
                  initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:-14}} transition={{duration:0.2}}>
                  <CategoryDiscountForm
                    initial={editItem}
                    rooms={roomsDropdown}
                    categories={categoriesDropdown}
                    onSave={handleSave}
                    onCancel={closeForm}
                    loading={actionLoading}
                    language={language}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  {translate('Category Discounts', language)}
                  <span className="text-gray-400 font-normal ml-1">({categoryMeta.total})</span>
                </p>
                <button onClick={() => refetchCat()}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <MdRefresh size={16} className={`text-gray-400 ${catLoading ? 'animate-spin' : ''}`}/>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <TableHead headers={[translate('Name',language),translate('Category',language),translate('Room',language),translate('Value (%)',language),translate('Validity',language),translate('Status',language),translate('Actions',language)]}/>
                  <tbody>
                    {catLoading ? <SkeletonRow cols={7}/> :
                     categoryDiscounts.length === 0
                       ? <tr><td colSpan={7} className="px-5 py-14 text-center text-gray-400 text-sm">{translate('No category discounts found.', language)}</td></tr>
                       : categoryDiscounts.map((cd, i) => (
                          <motion.tr key={cd.id}
                            initial={{opacity:0,y:5}} animate={{opacity:1,y:0}}
                            transition={{delay:i*0.03}}
                            className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5 font-semibold text-gray-800">{cd.name}</td>
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-1 rounded-lg bg-[#E8F5E0] text-[#2D5A30] text-xs font-semibold">
                                {cd.category?.name || '—'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs">
                              {cd.room
                                ? <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 font-medium">{cd.room.room_number}</span>
                                : <span className="text-gray-400">{translate('All in Category', language)}</span>
                              }
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold">
                                {cd.value}%
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <DateRange from={cd.valid_from} until={cd.valid_until} language={language}/>
                            </td>
                            <td className="px-5 py-3.5"><StatusBadge status={cd.status} language={language}/></td>
                            <td className="px-5 py-3.5">
                              <Actions onEdit={()=>openEdit(cd)} onDelete={()=>setDeleteItem(cd)} language={language}/>
                            </td>
                          </motion.tr>
                       ))
                    }
                  </tbody>
                </table>
              </div>
              <Pagination meta={categoryDiscounts.meta} onPage={setCatPage} language={language}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteItem && (
          <DeleteModal
            label={TABS(language).find(t=>t.key===tab)?.label}
            name={deleteItem.name}
            onConfirm={handleDelete}
            onCancel={() => setDeleteItem(null)}
            loading={actionLoading}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
