import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector }                 from 'react-redux';
import { motion, AnimatePresence }                  from 'framer-motion';
import toast, { Toaster }                           from 'react-hot-toast';
import {
  MdMeetingRoom, MdCategory, MdAdd, MdEdit, MdDelete,
  MdSearch, MdClose, MdSave, MdRefresh, MdChevronLeft, MdChevronRight,
} from 'react-icons/md';
import { BsBuildingsFill } from 'react-icons/bs';
import { FaLayerGroup }    from 'react-icons/fa';
import {
  fetchCategories, fetchAllCategories, createCategory, updateCategory, deleteCategory,
  fetchRooms, createRoom, updateRoom, deleteRoom, clearErrors,
} from '../store/slices/roomSlice';
import { useTranslate, formatPrice } from '../utils/localeHelper';

/* ─── constants ─────────────────────────────── */
const SLIDE = {
  initial:  { opacity: 0, x: 40 },
  animate:  { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.4,0,0.2,1] } },
  exit:     { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

/* ─── SkeletonRow ────────────────────────────── */
function SkeletonRow({ cols }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          {[...Array(cols)].map((_, j) => (
            <td key={j} className="px-5 py-4">
              <div className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${60 + Math.random()*30}%` }}/>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ─── StatusBadge ────────────────────────────── */
function StatusBadge({ status }) {
  const t = useTranslate();
  const configs = {
    'Available':   { bg:'bg-emerald-50',  text:'text-emerald-700', border:'border-emerald-200', dot:'bg-emerald-500' },
    'Occupied':    { bg:'bg-red-50',      text:'text-red-700',     border:'border-red-200',     dot:'bg-red-500' },
    'Reserved':    { bg:'bg-amber-50',    text:'text-amber-700',   border:'border-amber-200',   dot:'bg-amber-500' },
    'Maintenance': { bg:'bg-gray-50',     text:'text-gray-700',    border:'border-gray-200',    dot:'bg-gray-500' },
    'Cleaning':    { bg:'bg-blue-50',     text:'text-blue-700',    border:'border-blue-200',    dot:'bg-blue-500' },
    'Active':      { bg:'bg-emerald-50',  text:'text-emerald-700', border:'border-emerald-200', dot:'bg-emerald-500' },
    'Inactive':    { bg:'bg-gray-50',     text:'text-gray-700',    border:'border-gray-200',    dot:'bg-gray-500' },
  };
  const c = configs[status] || configs['Available'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}/>
      {t(status)}
    </span>
  );
}

/* ─── Pagination ─────────────────────────────── */
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
        <button
          onClick={() => onPage(meta.current_page - 1)}
          disabled={meta.current_page === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <MdChevronLeft size={18} className="text-gray-500"/>
        </button>
        {[...Array(meta.last_page)].map((_, i) => (
          <button
            key={i}
            onClick={() => onPage(i + 1)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              meta.current_page === i + 1
                ? 'bg-[#2D3A2E] text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPage(meta.current_page + 1)}
          disabled={meta.current_page === meta.last_page}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <MdChevronRight size={18} className="text-gray-500"/>
        </button>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ───────────────────── */
function DeleteModal({ item, label, onConfirm, onCancel, loading }) {
  const t = useTranslate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(0,0,0,0.4)' }}>
      <motion.div
        initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
        className="bg-white rounded-2xl p-7 shadow-2xl max-w-sm w-full mx-4"
      >
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MdDelete size={28} className="text-red-500"/>
        </div>
        <h3 className="text-lg font-bold text-center text-gray-800 mb-2" style={{ fontFamily:'"Plus Jakarta Sans",sans-serif' }}>
          {t(`Delete ${label}?`)}
        </h3>
        <p className="text-sm text-center text-gray-400 mb-6">
          "<span className="font-medium text-gray-600">{item?.name || item?.room_number}</span>" {t('will be permanently deleted.')}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            {t('Cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {loading ? t('Deleting…') : t('Delete')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Category Form ──────────────────────────── */
function CategoryForm({ initial, onSave, onCancel, loading }) {
  const t = useTranslate();
  const [form, setForm] = useState({ name:'', description:'', status:'Active', ...initial });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name   = t('Name is required');
    if (!form.status)          e.status = t('Status is required');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5" style={{ fontFamily:'"Plus Jakarta Sans",sans-serif' }}>
        {initial?.id ? t('Edit Category') : t('New Category')}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t('Category Name')}</label>
          <input
            type="text"
            value={form.name}
            onChange={e => { setForm(f => ({...f, name:e.target.value})); setErrors(er => ({...er, name:''})); }}
            placeholder="e.g. Deluxe, Suite"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all
              ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20'}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t('Description')}</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({...f, description:e.target.value}))}
            rows={3}
            placeholder={t('Optional description...')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t('Status')}</label>
          <select
            value={form.status}
            onChange={e => { setForm(f => ({...f, status:e.target.value})); setErrors(er => ({...er,status:''})); }}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#A8D5A2] transition-all bg-white"
          >
            <option value="Active">{t('Active')}</option>
            <option value="Inactive">{t('Inactive')}</option>
          </select>
          {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <MdClose size={16}/> {t('Cancel')}
        </button>
        <button
          onClick={() => validate() && onSave(form)}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background:'#2D3A2E', color:'#fff' }}
        >
          {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : <MdSave size={16}/>}
          {loading ? t('Saving…') : t('Save')}
        </button>
      </div>
    </div>
  );
}

/* ─── RoomInputField ─────────────────────────── */
function RoomInputField({ label, name, type='text', form, setForm, errors, setErrors, ...rest }) {
  const t = useTranslate();
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t(label)}</label>
      <input
        type={type}
        value={form[name]}
        onChange={e => { setForm(f => ({...f,[name]:e.target.value})); setErrors(er => ({...er,[name]:''})); }}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all
          ${errors[name] ? 'border-red-300 bg-red-50':'border-gray-200 focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20'}`}
        {...rest}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );
}

/* ─── Room Form ──────────────────────────────── */
function RoomForm({ initial, categories = [], onSave, onCancel, loading }) {
  const t = useTranslate();
  const [form, setForm] = useState({
    room_number: initial?.room_number || '',
    category_id: initial?.category_id || '',
    base_price:  initial?.base_price || '',
    capacity:     initial?.capacity || '',
    floor:        initial?.floor || '',
    status:       initial?.status || 'Available',
    features:     initial?.features || [],
  });
  const [existingImages, setExistingImages] = useState(initial?.images || []);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [featureInput, setFeatureInput] = useState('');

  // Cleanup previews on unmount
  useEffect(() => {
    return () => previews.forEach(p => URL.revokeObjectURL(p));
  }, [previews]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
    
    // Create new previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExisting = (path) => {
    setExistingImages(prev => prev.filter(p => p !== path));
  };

  const removeNew = (index) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e = {};
    if (!String(form.room_number).trim())       e.room_number  = t('Room number is required');
    if (!form.category_id)                      e.category_id  = t('Category is required');
    if (!form.base_price || form.base_price < 0) e.base_price = t('Valid price required');
    if (!form.capacity || form.capacity < 1)     e.capacity   = t('Capacity must be ≥ 1');
    if (!form.floor || form.floor < 1)           e.floor      = t('Floor must be ≥ 1');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addFeature = () => {
    const f = featureInput.trim();
    if (f && !form.features.includes(f)) {
      setForm(prev => ({ ...prev, features: [...prev.features, f] }));
    }
    setFeatureInput('');
  };

  const removeFeature = (f) => {
    setForm(prev => ({ ...prev, features: prev.features.filter(x => x !== f) }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5" style={{ fontFamily:'"Plus Jakarta Sans",sans-serif' }}>
        {initial?.id ? t('Edit Room') : t('New Room')}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <RoomInputField label="Room Number" name="room_number" placeholder="e.g. 101" form={form} setForm={setForm} errors={errors} setErrors={setErrors}/>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t('Category')}</label>
          <select
            value={form.category_id}
            onChange={e => {
              setForm(f => ({ ...f, category_id: e.target.value }));
              setErrors(er => ({ ...er, category_id: '' }));
            }}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white transition-all
              ${errors.category_id
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20'
              }`}
          >
            {categories.length === 0
              ? <option value="" disabled>{t('Loading categories…')}</option>
              : <>
                  <option value="">{t('— Select category —')}</option>
                  {categories.map(c => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </>
            }
          </select>
          {errors.category_id && (
            <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>
          )}
        </div>
        <RoomInputField label="Base Price ($)" name="base_price" type="number" min="0" step="0.01" placeholder="0.00" form={form} setForm={setForm} errors={errors} setErrors={setErrors}/>
        <RoomInputField label="Capacity" name="capacity" type="number" min="1" placeholder="e.g. 2" form={form} setForm={setForm} errors={errors} setErrors={setErrors}/>
        <RoomInputField label="Floor" name="floor" type="number" min="1" placeholder="e.g. 3" form={form} setForm={setForm} errors={errors} setErrors={setErrors}/>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t('Status')}</label>
          <select
            value={form.status}
            onChange={e => setForm(f => ({...f, status:e.target.value}))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-[#A8D5A2] transition-all"
          >
            {['Available', 'Occupied', 'Reserved', 'Maintenance', 'Cleaning'].map(s => (
              <option key={s} value={s}>{t(s)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Features */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{t('Features')}</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={featureInput}
            onChange={e => setFeatureInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            placeholder={t('Type feature + Enter')}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#A8D5A2] transition-all"
          />
          <button
            type="button"
            onClick={addFeature}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
          >
            {t('Add')}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.features.map(f => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full bg-[#E8F5E0] text-[#2D5A30] text-[10px] font-medium border border-[#A8D5A2] flex items-center gap-1.5"
            >
              {f}
              <button type="button" onClick={() => removeFeature(f)} className="hover:text-red-500 transition-colors">
                <MdClose size={12}/>
              </button>
            </span>
          ))}
          {form.features.length === 0 && <span className="text-xs text-gray-400 italic">{t('No features added yet.')}</span>}
        </div>
      </div>
      {/* Multi-Image Upload */}
      <div className="mt-6 border-t border-gray-100 pt-6">
        <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          {t('Room Images')} <span className="text-gray-400 capitalize">({t('Support multiple')})</span>
        </label>
        
        <div className="flex flex-col gap-4">
          <div className="relative group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center group-hover:border-[#A8D5A2] group-hover:bg-[#F9FBF9] transition-all">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MdAdd size={24} className="text-gray-400 group-hover:text-[#2D3A2E]"/>
              </div>
              <p className="text-sm font-semibold text-gray-600">{t('Drop images here or click to browse')}</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">{t('JPG, PNG, WebP (Max 2MB per file)')}</p>
            </div>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {existingImages.map((path, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm group/img">
                  <img src={`/storage/${path}`} className="w-full h-full object-cover" alt="Existing" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => removeExisting(path)}
                      className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <MdDelete size={16}/>
                    </button>
                  </div>
                  <div className="absolute top-1 left-1">
                    <span className="text-[8px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded uppercase tracking-tighter">Existing</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {previews.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm group/img">
                  <img src={url} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => removeNew(i)}
                      className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <MdDelete size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <MdClose size={16}/> {t('Cancel')}
        </button>
        <button
          onClick={() => validate() && onSave({ ...form, existing_images: existingImages, new_images: newImages })}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background:'#2D3A2E', color:'#fff' }}
        >
          {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : <MdSave size={16}/>}
          {loading ? t('Saving…') : t('Save')}
        </button>
      </div>
    </div>
  );
}

export default function RoomPage() {
  const dispatch = useDispatch();
  const t = useTranslate();
  const { language, currency } = useSelector(state => state.locale);
  const {
    categories, allCategories, categoryMeta, categoryStatus,
    rooms, roomMeta, roomStatus,
    actionLoading,
  } = useSelector(s => s.room);

  const [tab,            setTab]           = useState('rooms');        // 'rooms' | 'categories'
  const [catSearch,      setCatSearch]     = useState('');
  const [roomSearch,     setRoomSearch]    = useState('');
  const [catPage,        setCatPage]       = useState(1);
  const [roomPage,       setRoomPage]      = useState(1);
  const [showCatForm,    setShowCatForm]   = useState(false);
  const [showRoomForm,   setShowRoomForm]  = useState(false);
  const [editCat,        setEditCat]       = useState(null);
  const [editRoom,       setEditRoom]      = useState(null);
  const [deleteCat,      setDeleteCat]     = useState(null);
  const [deleteRm,       setDeleteRm]      = useState(null);

  /* Load data */
  useEffect(() => {
    dispatch(fetchCategories({ search: catSearch, page: catPage, per_page: 15 }));
  }, [catSearch, catPage, dispatch]);

  useEffect(() => {
    dispatch(fetchRooms({ search: roomSearch, page: roomPage, per_page: 15 }));
  }, [roomSearch, roomPage, dispatch]);

  // Fetch dropdown categories on mount AND whenever room form opens
  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  // Re-fetch when form opens to ensure fresh data
  useEffect(() => {
    if (showRoomForm) {
      dispatch(fetchAllCategories());
    }
  }, [showRoomForm, dispatch]);

  /* Debounced search */
  const [catQ,  setCatQ]  = useState('');
  const [roomQ, setRoomQ] = useState('');
  useEffect(() => {
    const t_timer = setTimeout(() => { setCatSearch(catQ); setCatPage(1); }, 400);
    return () => clearTimeout(t_timer);
  }, [catQ]);
  useEffect(() => {
    const t_timer = setTimeout(() => { setRoomSearch(roomQ); setRoomPage(1); }, 400);
    return () => clearTimeout(t_timer);
  }, [roomQ]);

  /* Handlers — Categories */
  const handleSaveCat = async (form) => {
    const action = editCat
      ? dispatch(updateCategory({ id: editCat.id, ...form }))
      : dispatch(createCategory(form));
    const res = await action;
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(editCat ? t('Updated successfully!') : t('Created successfully!'));
      setShowCatForm(false); setEditCat(null);
    } else {
      toast.error(res.payload || t('Something went wrong'));
    }
  };

  const handleDeleteCat = async () => {
    const res = await dispatch(deleteCategory(deleteCat.id));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(t('Deleted permanently!'));
      // Re-fetch to sync table
      dispatch(fetchCategories({ search: catSearch, page: catPage, per_page: 15 }));
    } else {
      toast.error(res.payload || t('Cannot delete'));
    }
    setDeleteCat(null);
  };

  /* Handlers — Rooms */
  const handleSaveRoom = async (roomData) => {
    const formData = new FormData();
    
    // Append basic fields
    formData.append('room_number', roomData.room_number);
    formData.append('category_id', roomData.category_id);
    formData.append('base_price', roomData.base_price);
    formData.append('capacity', roomData.capacity);
    formData.append('floor', roomData.floor);
    formData.append('status', roomData.status);

    // Append features (as array)
    roomData.features.forEach((f) => {
      formData.append('features[]', f);
    });

    // Append existing images to keep
    roomData.existing_images.forEach((path) => {
      formData.append('existing_images[]', path);
    });

    // Append new images (if any)
    if (roomData.new_images && roomData.new_images.length > 0) {
      roomData.new_images.forEach((img) => {
        formData.append('new_images[]', img);
      });
    }

    const action = editRoom
      ? dispatch(updateRoom({ id: editRoom.id, payload: formData }))
      : dispatch(createRoom(formData));
    
    // Important: we wrap formData in updateRoom payload but it's an instance of FormData
    // The thunk has been updated to handle this.
    
    const res = await action;
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(editRoom ? t('Updated successfully!') : t('Created successfully!'));
      setShowRoomForm(false); setEditRoom(null);
      // Re-fetch to sync
      dispatch(fetchRooms({ search: roomSearch, page: roomPage, per_page: 15 }));
    } else {
      toast.error(res.payload || t('Something went wrong'));
    }
  };

  const handleDeleteRoom = async () => {
    const res = await dispatch(deleteRoom(deleteRm.id));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(t('Deleted permanently!'));
      // Re-fetch to sync table
      dispatch(fetchRooms({ search: roomSearch, page: roomPage, per_page: 15 }));
    } else {
      toast.error(res.payload || t('Cannot delete'));
    }
    setDeleteRm(null);
  };

  /* ── Render ── */
  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5" style={{ scrollbarWidth:'thin' }}>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius:'12px', fontSize:'13px' } }}/>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background:'#E8F5E0' }}>
            <BsBuildingsFill size={22} style={{ color:'#2D3A2E' }}/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily:'"Plus Jakarta Sans",sans-serif' }}>{t('Room Management')}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{t('Manage rooms and categories')}</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (tab === 'categories') { setEditCat(null); setShowCatForm(true); setShowRoomForm(false); }
            else { setEditRoom(null); setShowRoomForm(true); setShowCatForm(false); }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background:'#2D3A2E', color:'#fff' }}
        >
          <MdAdd size={18}/> {tab === 'categories' ? t('Add Category') : t('Add Room')}
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key:'rooms',      label:t('Rooms'),      icon:<MdMeetingRoom size={16}/> },
          { key:'categories', label:t('Categories'), icon:<FaLayerGroup size={14}/> },
        ].map(t_item => (
          <button
            key={t_item.key}
            onClick={() => { setTab(t_item.key); setShowCatForm(false); setShowRoomForm(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t_item.key
                ? 'bg-white shadow-sm text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t_item.icon} {t_item.label}
          </button>
        ))}
      </div>

      {/* Animated tab content */}
      <AnimatePresence mode="wait">

        {/* ── ROOMS tab ── */}
        {tab === 'rooms' && (
          <motion.div key="rooms" {...SLIDE} className="flex flex-col gap-4">

            {/* Form */}
            <AnimatePresence>
              {showRoomForm && (
                <motion.div key="room-form" initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }} transition={{ duration:0.22 }}>
                  <RoomForm
                    initial={editRoom}
                    categories={allCategories}
                    onSave={handleSaveRoom}
                    onCancel={() => { setShowRoomForm(false); setEditRoom(null); }}
                    loading={actionLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 max-w-xs">
                  <MdSearch size={18} className="text-gray-400 flex-shrink-0"/>
                  <input
                    value={roomQ}
                    onChange={e => setRoomQ(e.target.value)}
                    placeholder={t('Search rooms...')}
                    className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
                  />
                  {roomQ && <button onClick={() => setRoomQ('')}><MdClose size={16} className="text-gray-400 hover:text-gray-600"/></button>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MdRefresh
                    size={16}
                    className="cursor-pointer hover:text-gray-600 transition-colors"
                    onClick={() => dispatch(fetchRooms({ search: roomSearch, page: roomPage }))}
                  />
                  {roomMeta.total} {t('rooms')}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {['Room #','Images','Category','Price','Capacity','Floor','Features','Status','Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{t(h)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roomStatus === 'loading' ? (
                      <SkeletonRow cols={9}/>
                    ) : rooms.length === 0 ? (
                      <tr><td colSpan={9} className="px-5 py-16 text-center text-gray-400 text-sm">{t('No rooms found.')}</td></tr>
                    ) : rooms.map((room, i) => (
                      <motion.tr
                        key={room.id}
                        initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-semibold text-gray-800">{room.room_number}</td>
                        <td className="px-5 py-3.5">
                          {room.images && room.images.length > 0 ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm group/img">
                              <img 
                                src={`/storage/${room.images[0]}`} 
                                className="w-full h-full object-cover transition-transform group-hover/img:scale-110" 
                                alt="Room" 
                              />
                              {room.images.length > 1 && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <span className="text-[9px] font-bold text-white">+{room.images.length - 1}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                              <span className="text-[10px] text-gray-300">N/A</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-[#E8F5E0] text-[#2D5A30] text-xs font-medium">
                            {room.category?.name || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-700">{formatPrice(room.base_price, currency)}</td>
                        <td className="px-5 py-3.5 text-gray-600">{room.capacity}</td>
                        <td className="px-5 py-3.5 text-gray-600">{room.floor}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {(room.features || []).slice(0,3).map(f => (
                              <span key={f} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">{f}</span>
                            ))}
                            {(room.features || []).length > 3 && (
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[10px]">+{room.features.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={room.status} /></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditRoom(room); setShowRoomForm(true); setShowCatForm(false); }}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                              title={t('Edit')}
                            >
                              <MdEdit size={16}/>
                            </button>
                            <button
                              onClick={() => setDeleteRm(room)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              title={t('Delete')}
                            >
                              <MdDelete size={16}/>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination meta={roomMeta} onPage={setRoomPage}/>
            </div>
          </motion.div>
        )}

        {/* ── CATEGORIES tab ── */}
        {tab === 'categories' && (
          <motion.div key="categories" {...SLIDE} className="flex flex-col gap-4">

            {/* Form */}
            <AnimatePresence>
              {showCatForm && (
                <motion.div key="cat-form" initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }} transition={{ duration:0.22 }}>
                  <CategoryForm
                    initial={editCat}
                    onSave={handleSaveCat}
                    onCancel={() => { setShowCatForm(false); setEditCat(null); }}
                    loading={actionLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 max-w-xs">
                  <MdSearch size={18} className="text-gray-400 flex-shrink-0"/>
                  <input
                    value={catQ}
                    onChange={e => setCatQ(e.target.value)}
                    placeholder={t('Search categories...')}
                    className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
                  />
                  {catQ && <button onClick={() => setCatQ('')}><MdClose size={16} className="text-gray-400 hover:text-gray-600"/></button>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MdRefresh
                    size={16}
                    className="cursor-pointer hover:text-gray-600 transition-colors"
                    onClick={() => dispatch(fetchCategories({ search: catSearch, page: catPage }))}
                  />
                  {categoryMeta.total} {t('categories')}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {['Name','Description','Rooms','Status','Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{t(h)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categoryStatus === 'loading' ? (
                      <SkeletonRow cols={5}/>
                    ) : categories.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-16 text-center text-gray-400 text-sm">{t('No categories found.')}</td></tr>
                    ) : categories.map((cat, i) => (
                      <motion.tr
                        key={cat.id}
                        initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}
                        className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-semibold text-gray-800">{cat.name}</td>
                        <td className="px-5 py-3.5 text-gray-500 max-w-[260px] truncate">{cat.description || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-[#E8F5E0] text-[#2D5A30] text-xs font-semibold">
                            {cat.rooms_count ?? 0} {t('rooms').toLowerCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={cat.status}/></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditCat(cat); setShowCatForm(true); setShowRoomForm(false); }}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                              title={t('Edit')}
                            >
                              <MdEdit size={16}/>
                            </button>
                            <button
                              onClick={() => setDeleteCat(cat)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              title={t('Delete')}
                            >
                              <MdDelete size={16}/>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination meta={categoryMeta} onPage={setCatPage}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modals */}
      <AnimatePresence>
        {deleteCat && (
          <DeleteModal
            item={deleteCat} label="Category"
            onConfirm={handleDeleteCat}
            onCancel={() => setDeleteCat(null)}
            loading={actionLoading}
          />
        )}
        {deleteRm && (
          <DeleteModal
            item={deleteRm} label="Room"
            onConfirm={handleDeleteRoom}
            onCancel={() => setDeleteRm(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
