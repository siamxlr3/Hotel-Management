import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector }            from 'react-redux';
import { motion, AnimatePresence }             from 'framer-motion';
import toast, { Toaster }                      from 'react-hot-toast';
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdRefresh,
  MdChevronLeft, MdChevronRight, MdImage, MdMap,
} from 'react-icons/md';
import {
  RiHomeSmileLine, RiInformationLine, RiStarLine,
  RiGiftLine, RiGalleryLine, RiPhoneLine,
  RiExternalLinkLine,
} from 'react-icons/ri';
import {
  FaFacebook, FaInstagram, FaTiktok,
} from 'react-icons/fa';
import {
  homeThunks, aboutThunks, featureThunks,
  offerThunks, galleryThunks, contactThunks,
} from '../store/slices/cmsSlice';
import { useTranslate, translate } from '../utils/localeHelper';

/* ── Tabs config ── */
const TABS = (language) => [
  { key:'home',    label:translate('Home', language),           icon:<RiHomeSmileLine size={15}/> },
  { key:'about',   label:translate('About', language),          icon:<RiInformationLine size={15}/> },
  { key:'feature', label:translate('Features', language),       icon:<RiStarLine size={15}/> },
  { key:'offer',   label:translate('Offers', language),         icon:<RiGiftLine size={15}/> },
  { key:'gallery', label:translate('Gallery', language),        icon:<RiGalleryLine size={15}/> },
  { key:'contact', label:translate('Contact', language),        icon:<RiPhoneLine size={15}/> },
];

const THUNKS = {
  home: homeThunks, about: aboutThunks, feature: featureThunks,
  offer: offerThunks, gallery: galleryThunks, contact: contactThunks,
};

const SLIDE = {
  initial:  { opacity:0, x:30 },
  animate:  { opacity:1, x:0, transition:{ duration:0.25, ease:[0.4,0,0.2,1] } },
  exit:     { opacity:0, x:-30, transition:{ duration:0.18 } },
};

/* ════════════════════════
   PRIMITIVES
════════════════════════ */
function Skeleton({ cols }) {
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

function Pagination({ meta, onPage }) {
  const t = useTranslate();
  if (!meta || meta.last_page <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        {((meta.current_page-1)*meta.per_page)+1}–
        {Math.min(meta.current_page*meta.per_page, meta.total)} {t('of')} {meta.total}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={()=>onPage(meta.current_page-1)} disabled={meta.current_page===1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <MdChevronLeft size={18} className="text-gray-500"/>
        </button>
        {[...Array(Math.min(meta.last_page, 5))].map((_,i) => (
          <button key={i} onClick={()=>onPage(i+1)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              meta.current_page===i+1
                ? 'bg-[#2D3A2E] text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}>{i+1}</button>
        ))}
        <button onClick={()=>onPage(meta.current_page+1)} disabled={meta.current_page===meta.last_page}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <MdChevronRight size={18} className="text-gray-500"/>
        </button>
      </div>
    </div>
  );
}

function DeleteModal({ name, label, onConfirm, onCancel, loading }) {
  const t = useTranslate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.45)'}}>
      <motion.div initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.9,opacity:0}}
        className="bg-white rounded-2xl p-7 shadow-2xl max-w-sm w-full mx-4">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MdDelete size={28} className="text-red-500"/>
        </div>
        <h3 className="text-lg font-bold text-center text-gray-800 mb-2"
          style={{fontFamily:'"Plus Jakarta Sans",sans-serif'}}>{t('Delete')} {label}?</h3>
        <p className="text-sm text-center text-gray-400 mb-6">
          "<span className="font-medium text-gray-600">{name}</span>" {t('will be permanently deleted.')}
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

/* Image preview thumbnail */
function ImgThumb({ src, alt = '' }) {
  if (!src) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <img src={src} alt={alt}
      className="w-12 h-10 rounded-lg object-cover border border-gray-100 shadow-sm"/>
  );
}

/* Multi-image strip */
function ImgStrip({ urls = [] }) {
  if (!urls.length) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <div className="flex gap-1.5 flex-wrap">
      {urls.slice(0,4).map((u,i) => (
        <img key={i} src={u} alt=""
          className="w-10 h-9 rounded-md object-cover border border-gray-100"/>
      ))}
      {urls.length > 4 && (
        <span className="w-10 h-9 rounded-md bg-gray-100 text-gray-400 text-[10px] flex items-center justify-center font-semibold">
          +{urls.length-4}
        </span>
      )}
    </div>
  );
}

/* Field wrapper */
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inp = (err) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
    err ? 'border-red-300 bg-red-50'
        : 'border-gray-200 focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20'
  }`;

const ta = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-[#A8D5A2] focus:ring-2 focus:ring-[#A8D5A2]/20 transition-all';

function SaveBtn({ loading }) {
  const t = useTranslate();
  return (
    <button type="submit" disabled={loading}
      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      style={{background:'#2D3A2E',color:'#fff'}}>
      {loading
        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
        : <MdSave size={16}/>}
      {loading ? t('Saving…') : t('Save')}
    </button>
  );
}

/* File input with preview */
function FileInput({ label, name, multiple=false, onChange, previews=[], error }) {
  const t = useTranslate();
  const ref = useRef();
  return (
    <Field label={label} error={error}>
      <div
        onClick={() => ref.current.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-[#A8D5A2] transition-colors text-center"
      >
        <MdImage size={24} className="text-gray-300 mx-auto mb-1"/>
        <p className="text-xs text-gray-400">
          {t('Click to select')} {multiple ? t('images') : t('image')}
        </p>
        <input ref={ref} type="file" accept="image/*" multiple={multiple}
          className="hidden" onChange={e => onChange(name, e.target.files)}/>
      </div>
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {previews.map((u,i) => (
            <img key={i} src={u} alt=""
              className="w-16 h-14 rounded-lg object-cover border border-gray-100"/>
          ))}
        </div>
      )}
    </Field>
  );
}

/* Map preview iframe — safely renders iframe src */
function MapPreview({ html }) {
  if (!html) return null;
  // Extract src from iframe string
  const match = html.match(/src=["']([^"']+)["']/);
  const src = match ? match[1] : null;
  if (!src) return null;
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-gray-200" style={{height:'200px'}}>
      <iframe
        src={src}
        width="100%" height="200"
        style={{border:0}}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Map Preview"
      />
    </div>
  );
}

/* ════════════════════════
   FORMS
════════════════════════ */

/*
 * SingleImageManager
 * Shows existing image with Edit (replace) and X (remove) controls.
 * When editing: clicking pencil opens file picker.
 * When removing: image is hidden and remove flag is set.
 */
function SingleImageManager({ label, existingUrl, onFileChange, onRemove, removed }) {
  const t = useTranslate();
  const ref = useRef();

  if (!existingUrl || removed) {
    // No image or removed — show upload input
    return (
      <FileInput
        label={label}
        name="image"
        onChange={onFileChange}
        previews={[]}
      />
    );
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative inline-block group">
        <img
          src={existingUrl}
          alt={label}
          className="w-32 h-28 rounded-xl object-cover border border-gray-200 shadow-sm"
        />

        {/* Overlay buttons — appear on hover */}
        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100
                        transition-opacity duration-200 flex items-center justify-center gap-2">

          {/* Replace / Edit button */}
          <button
            type="button"
            title={t('Replace image')}
            onClick={() => ref.current.click()}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center
                       hover:bg-blue-50 transition-colors shadow-md"
          >
            <MdEdit size={15} className="text-blue-600"/>
          </button>

          {/* Remove button */}
          <button
            type="button"
            title={t('Remove image')}
            onClick={onRemove}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center
                       hover:bg-red-50 transition-colors shadow-md"
          >
            <MdClose size={15} className="text-red-500"/>
          </button>
        </div>

        {/* Hidden file input triggered by pencil button */}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => onFileChange('image', e.target.files)}
        />
      </div>

      <p className="mt-1.5 text-[11px] text-gray-400">
        {t('Hover the image to edit or remove it.')}
      </p>
    </div>
  );
}

/*
 * MultiImageManager
 * Shows all existing images in a grid.
 * Each image has an X button to mark it for removal.
 * A "+ Add More" tile opens a file picker to append new images.
 * Tracks: keptPaths (existing to keep), newFiles (new uploads),
 *         removedPaths (existing to delete on server).
 */
function MultiImageManager({ label, existingUrls = [], existingPaths = [],
                              onStateChange }) {
  const t = useTranslate();
  // kept = existing paths user hasn't removed
  const [kept,    setKept]    = useState(existingPaths);
  const [keptUrls,setKeptUrls]= useState(existingUrls);
  const [newFiles,setNewFiles] = useState([]);
  const [newPreviews,setNewPreviews] = useState([]);
  const addRef = useRef();

  // Notify parent whenever state changes
  const notify = (nextKept, nextKeptUrls, nextNew) => {
    const removed = existingPaths.filter(p => !nextKept.includes(p));
    onStateChange({
      keepPaths:    nextKept,
      removedPaths: removed,
      newFiles:     nextNew,
    });
  };

  // Remove an existing image
  const removeExisting = (idx) => {
    const nextKept     = kept.filter((_, i) => i !== idx);
    const nextKeptUrls = keptUrls.filter((_, i) => i !== idx);
    setKept(nextKept);
    setKeptUrls(nextKeptUrls);
    notify(nextKept, nextKeptUrls, newFiles);
  };

  // Remove a newly added (not yet uploaded) image
  const removeNew = (idx) => {
    const nextFiles    = newFiles.filter((_, i) => i !== idx);
    const nextPreviews = newPreviews.filter((_, i) => i !== idx);
    setNewFiles(nextFiles);
    setNewPreviews(nextPreviews);
    notify(kept, keptUrls, nextFiles);
  };

  // Add more images
  const handleAdd = (e) => {
    const arr  = Array.from(e.target.files);
    const prev = arr.map(f => URL.createObjectURL(f));
    const nextFiles    = [...newFiles, ...arr];
    const nextPreviews = [...newPreviews, ...prev];
    setNewFiles(nextFiles);
    setNewPreviews(nextPreviews);
    notify(kept, keptUrls, nextFiles);
    // Reset input so same file can be re-added
    e.target.value = '';
  };

  const totalCount = kept.length + newFiles.length;

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        {label}
        <span className="ml-2 text-gray-400 font-normal normal-case">
          ({totalCount} {t('image')}{totalCount !== 1 ? 's' : ''})
        </span>
      </label>

      <div className="flex flex-wrap gap-3">

        {/* Existing images (kept) */}
        {keptUrls.map((url, idx) => (
          <div key={`kept-${idx}`} className="relative group">
            <img
              src={url}
              alt=""
              className="w-24 h-20 rounded-xl object-cover border border-gray-200 shadow-sm"
            />
            {/* Remove overlay */}
            <button
              type="button"
              title={t('Remove this image')}
              onClick={() => removeExisting(idx)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full
                         flex items-center justify-center shadow-md opacity-0
                         group-hover:opacity-100 transition-opacity duration-150
                         hover:bg-red-600"
            >
              <MdClose size={13} className="text-white"/>
            </button>
            {/* Existing label badge */}
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md
                             bg-black/50 text-white text-[9px] font-medium">
              {t('saved')}
            </span>
          </div>
        ))}

        {/* New images (pending upload) */}
        {newPreviews.map((url, idx) => (
          <div key={`new-${idx}`} className="relative group">
            <img
              src={url}
              alt=""
              className="w-24 h-20 rounded-xl object-cover border-2 border-dashed border-[#A8D5A2] shadow-sm"
            />
            {/* Remove overlay */}
            <button
              type="button"
              title={t('Cancel this upload')}
              onClick={() => removeNew(idx)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full
                         flex items-center justify-center shadow-md opacity-0
                         group-hover:opacity-100 transition-opacity duration-150
                         hover:bg-red-600"
            >
              <MdClose size={13} className="text-white"/>
            </button>
            {/* New badge */}
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md
                             bg-[#2D3A2E]/80 text-white text-[9px] font-medium">
              {t('new')}
            </span>
          </div>
        ))}

        {/* Add More tile */}
        <button
          type="button"
          onClick={() => addRef.current.click()}
          className="w-24 h-20 rounded-xl border-2 border-dashed border-gray-200
                     flex flex-col items-center justify-center gap-1
                     hover:border-[#A8D5A2] hover:bg-[#F0FAE8] transition-colors
                     text-gray-400 hover:text-[#2D5A30]"
        >
          <MdAdd size={20}/>
          <span className="text-[10px] font-medium">{t('Add More')}</span>
        </button>

        <input
          ref={addRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleAdd}
        />
      </div>

      {totalCount === 0 && (
        <p className="mt-2 text-xs text-amber-600">
          ⚠ {t('No images remaining. At least one image is recommended.')}
        </p>
      )}
    </div>
  );
}

/* HOME FORM */
function HomeForm({ initial, onSave, onCancel, loading }) {
  const t = useTranslate();
  const isEdit = !!initial?.id;

  const [form,        setForm]        = useState({ hotel_name: initial?.hotel_name || '' });
  const [errors,      setErrors]      = useState({});

  // Logo state
  const [logoFile,    setLogoFile]    = useState(null);
  const [logoPreview, setLogoPreview] = useState(initial?.logo_url || null);
  const [logoRemoved, setLogoRemoved] = useState(false);

  // Hero state
  const [heroState,   setHeroState]   = useState({
    keepPaths:    initial?.hero     || [],
    removedPaths: [],
    newFiles:     [],
  });

  // New logo preview on file select
  const handleLogoFile = (_, files) => {
    const f = files[0];
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
    setLogoRemoved(false);
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoRemoved(true);
  };

  const validate = () => {
    const e = {};
    if (!form.hotel_name.trim()) e.hotel_name = t('Hotel name is required');
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = { ...form };
    if (isEdit) payload.id = initial.id;

    // Logo
    if (logoRemoved)     payload.remove_logo = 1;
    else if (logoFile)   payload.logo = logoFile;

    // Hero — send keep list + new files
    heroState.keepPaths.forEach(p    => { /* appended below in formData */ });
    heroState.removedPaths.forEach(p => { /* appended below */ });
    heroState.newFiles.forEach(f     => { /* appended below */ });

    // Build FormData manually for arrays
    const fd = new FormData();
    fd.append('hotel_name', form.hotel_name);
    if (isEdit) { fd.append('id', initial.id); fd.append('_method', 'PUT'); }
    if (logoRemoved)   fd.append('remove_logo', '1');
    else if (logoFile) fd.append('logo', logoFile);
    heroState.keepPaths.forEach(p    => fd.append('keep_hero[]', p));
    heroState.removedPaths.forEach(p => fd.append('remove_hero[]', p));
    heroState.newFiles.forEach(f     => fd.append('hero[]', f));

    onSave(fd);   // pass FormData directly
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5"
          style={{ fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
        {isEdit ? t('Edit Home') : t('New Home')}
      </h3>

      <div className="grid grid-cols-1 gap-5">
        {/* Hotel Name */}
        <Field label={t('Hotel Name')} error={errors.hotel_name}>
          <input
            value={form.hotel_name}
            onChange={e => { setForm(f => ({...f, hotel_name: e.target.value})); setErrors(er => ({...er, hotel_name: ''})); }}
            placeholder={t('e.g. Grand Palace Hotel')}
            className={inp(errors.hotel_name)}
          />
        </Field>

        {/* Logo — SingleImageManager in edit mode, FileInput in create mode */}
        {isEdit ? (
          <SingleImageManager
            label={t('Logo')}
            existingUrl={logoPreview}
            onFileChange={handleLogoFile}
            onRemove={handleLogoRemove}
            removed={logoRemoved}
          />
        ) : (
          <FileInput label={t('Logo')} name="logo"
            onChange={(_, files) => { setLogoFile(files[0]); setLogoPreview(URL.createObjectURL(files[0])); }}
            previews={logoPreview ? [logoPreview] : []}
          />
        )}

        {/* Hero — MultiImageManager in edit mode, FileInput in create mode */}
        {isEdit ? (
          <MultiImageManager
            label={t('Hero Images')}
            existingUrls={initial?.hero_urls || []}
            existingPaths={initial?.hero     || []}
            onStateChange={setHeroState}
          />
        ) : (
          <FileInput label={t('Hero Images')} name="hero" multiple
            onChange={(_, files) => setHeroState(s => ({...s, newFiles: Array.from(files)}))}
            previews={heroState.newFiles.map(f => URL.createObjectURL(f))}
          />
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <MdClose size={16}/> {t('Cancel')}
        </button>
        <SaveBtn loading={loading}/>
      </div>
    </form>
  );
}

/* ABOUT FORM */
function AboutForm({ initial, onSave, onCancel, loading }) {
  const t = useTranslate();
  const isEdit = !!initial?.id;

  const [desc,        setDesc]        = useState(initial?.description || '');
  const [imgFile,     setImgFile]     = useState(null);
  const [imgPreview,  setImgPreview]  = useState(initial?.image_url || null);
  const [imgRemoved,  setImgRemoved]  = useState(false);
  const [errors,      setErrors]      = useState({});

  const handleFile = (_, files) => {
    const f = files[0];
    setImgFile(f);
    setImgPreview(URL.createObjectURL(f));
    setImgRemoved(false);
  };

  const validate = () => {
    const e = {};
    if (!desc.trim()) e.description = t('Description is required');
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append('description', desc);
    if (isEdit) { fd.append('id', initial.id); fd.append('_method', 'PUT'); }
    if (imgRemoved)  fd.append('remove_image', '1');
    else if (imgFile) fd.append('image', imgFile);

    onSave(fd);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5"
          style={{ fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
        {isEdit ? t('Edit About') : t('New About Section')}
      </h3>

      <div className="grid grid-cols-1 gap-5">
        <Field label={t('Description')} error={errors.description}>
          <textarea
            value={desc}
            onChange={e => { setDesc(e.target.value); setErrors(er => ({...er, description: ''})); }}
            rows={4}
            placeholder={t('Write about the hotel…')}
            className={ta}
          />
        </Field>

        {isEdit ? (
          <SingleImageManager
            label={t('About Image')}
            existingUrl={imgPreview}
            onFileChange={handleFile}
            onRemove={() => { setImgRemoved(true); setImgPreview(null); setImgFile(null); }}
            removed={imgRemoved}
          />
        ) : (
          <FileInput label={t('About Image')} name="image"
            onChange={(_, files) => { setImgFile(files[0]); setImgPreview(URL.createObjectURL(files[0])); }}
            previews={imgPreview ? [imgPreview] : []}
          />
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <MdClose size={16}/> {t('Cancel')}
        </button>
        <SaveBtn loading={loading}/>
      </div>
    </form>
  );
}

/* FEATURE FORM */
function FeatureForm({ initial, onSave, onCancel, loading }) {
  const t = useTranslate();
  const [form,   setForm]   = useState({ title: initial?.title||'', description: initial?.description||'' });
  const [errors, setErrors] = useState({});
  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = t('Title is required');
    if (!form.description.trim()) e.description = t('Description is required');
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (initial?.id) payload.id = initial.id;
    onSave(payload);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5" style={{fontFamily:'"Plus Jakarta Sans",sans-serif'}}>
        {initial?.id ? t('Edit Feature') : t('New Feature')}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <Field label={t('Title')} error={errors.title}>
          <input value={form.title} onChange={e=>set('title',e.target.value)}
            placeholder={t('e.g. Free WiFi')} className={inp(errors.title)}/>
        </Field>
        <Field label={t('Description')} error={errors.description}>
          <textarea value={form.description} onChange={e=>set('description',e.target.value)}
            rows={3} placeholder={t('Describe this feature…')} className={ta}/>
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <MdClose size={16}/> {t('Cancel')}
        </button>
        <SaveBtn loading={loading}/>
      </div>
    </form>
  );
}

/* OFFER FORM */
function OfferForm({ initial, onSave, onCancel, loading }) {
  const t = useTranslate();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState({
    title:       initial?.title       || '',
    description: initial?.description || '',
    discount:    initial?.discount    || '',
    start_date:  initial?.start_date  || '',
    end_date:    initial?.end_date    || '',
  });
  const [imgFile,    setImgFile]    = useState(null);
  const [imgPreview, setImgPreview] = useState(initial?.image_url || null);
  const [imgRemoved, setImgRemoved] = useState(false);
  const [errors,     setErrors]     = useState({});

  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setErrors(e => ({...e, [k]: ''})); };

  const handleFile = (_, files) => {
    const f = files[0];
    setImgFile(f);
    setImgPreview(URL.createObjectURL(f));
    setImgRemoved(false);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())        e.title       = t('Title is required');
    if (!form.description.trim())  e.description = t('Description is required');
    if (!form.discount && form.discount !== 0) e.discount = t('Discount is required');
    if (form.start_date && form.end_date && form.end_date < form.start_date)
      e.end_date = t('End date must be after start date');
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
    if (isEdit) { fd.append('id', initial.id); fd.append('_method', 'PUT'); }
    if (imgRemoved)   fd.append('remove_image', '1');
    else if (imgFile) fd.append('image', imgFile);

    onSave(fd);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5"
          style={{ fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
        {isEdit ? t('Edit Offer') : t('New Offer')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('Title')} error={errors.title}>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            placeholder={t('e.g. Summer Special')} className={inp(errors.title)}/>
        </Field>
        <Field label={`${t('Discount')} (%)`} error={errors.discount}>
          <input type="number" min="0" max="100" step="0.01"
            value={form.discount} onChange={e => set('discount', e.target.value)}
            placeholder="e.g. 25" className={inp(errors.discount)}/>
        </Field>
        <Field label={t('Start Date')}>
          <input type="date" value={form.start_date}
            onChange={e => set('start_date', e.target.value)} className={inp()}/>
        </Field>
        <Field label={t('End Date')} error={errors.end_date}>
          <input type="date" value={form.end_date}
            onChange={e => set('end_date', e.target.value)} className={inp(errors.end_date)}/>
        </Field>
        <div className="sm:col-span-2">
          <Field label={t('Description')} error={errors.description}>
            <textarea value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3} placeholder={t('Offer details…')} className={ta}/>
          </Field>
        </div>

        {/* Image manager */}
        <div className="sm:col-span-2">
          {isEdit ? (
            <SingleImageManager
              label={t('Offer Image')}
              existingUrl={imgPreview}
              onFileChange={handleFile}
              onRemove={() => { setImgRemoved(true); setImgPreview(null); setImgFile(null); }}
              removed={imgRemoved}
            />
          ) : (
            <FileInput label={t('Offer Image')} name="image"
              onChange={(_, files) => { setImgFile(files[0]); setImgPreview(URL.createObjectURL(files[0])); }}
              previews={imgPreview ? [imgPreview] : []}
            />
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <MdClose size={16}/> {t('Cancel')}
        </button>
        <SaveBtn loading={loading}/>
      </div>
    </form>
  );
}

/* GALLERY FORM */
function GalleryForm({ initial, onSave, onCancel, loading }) {
  const t = useTranslate();
  const isEdit = !!initial?.id;

  const [galleryState, setGalleryState] = useState({
    keepPaths:    initial?.gallery      || [],
    removedPaths: [],
    newFiles:     [],
  });

  const submit = (ev) => {
    ev.preventDefault();

    const fd = new FormData();
    if (isEdit) { fd.append('id', initial.id); fd.append('_method', 'PUT'); }
    galleryState.keepPaths.forEach(p    => fd.append('keep_gallery[]', p));
    galleryState.removedPaths.forEach(p => fd.append('remove_gallery[]', p));
    galleryState.newFiles.forEach(f     => fd.append('gallery[]', f));

    onSave(fd);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5"
          style={{ fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
        {isEdit ? t('Edit Gallery') : t('New Gallery')}
      </h3>

      {isEdit ? (
        <MultiImageManager
          label={t('Gallery Images')}
          existingUrls={initial?.gallery_urls || []}
          existingPaths={initial?.gallery      || []}
          onStateChange={setGalleryState}
        />
      ) : (
        <FileInput label={t('Gallery Images')} name="gallery" multiple
          onChange={(_, files) => setGalleryState(s => ({...s, newFiles: Array.from(files)}))}
          previews={galleryState.newFiles.map(f => URL.createObjectURL(f))}
        />
      )}

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <MdClose size={16}/> {t('Cancel')}
        </button>
        <SaveBtn loading={loading}/>
      </div>
    </form>
  );
}

/* CONTACT FORM */
function ContactForm({ initial, onSave, onCancel, loading }) {
  const t = useTranslate();
  const blank = { phone:'',email:'',address:'',facebook:'',instagram:'',tiktok:'',maps_iframe:'' };
  const [form, setForm] = useState({ ...blank, ...initial });
  const [errors, setErrors] = useState({});
  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };

  const validate = () => {
    const e = {};
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('Invalid email');
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (initial?.id) payload.id = initial.id;
    onSave(payload);
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5" style={{fontFamily:'"Plus Jakarta Sans",sans-serif'}}>
        {initial?.id ? t('Edit Contact') : t('New Contact')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('Phone')}>
          <input value={form.phone} onChange={e=>set('phone',e.target.value)}
            placeholder="+1 234 567 890" className={inp()}/>
        </Field>
        <Field label={t('Email')} error={errors.email}>
          <input type="email" value={form.email} onChange={e=>set('email',e.target.value)}
            placeholder="info@hotel.com" className={inp(errors.email)}/>
        </Field>
        <div className="sm:col-span-2">
          <Field label={t('Address')}>
            <input value={form.address} onChange={e=>set('address',e.target.value)}
              placeholder={t('123 Hotel Street, City')} className={inp()}/>
          </Field>
        </div>
        <Field label={t('Facebook URL')}>
          <input value={form.facebook} onChange={e=>set('facebook',e.target.value)}
            placeholder="https://facebook.com/..." className={inp()}/>
        </Field>
        <Field label={t('Instagram URL')}>
          <input value={form.instagram} onChange={e=>set('instagram',e.target.value)}
            placeholder="https://instagram.com/..." className={inp()}/>
        </Field>
        <Field label={t('TikTok URL')}>
          <input value={form.tiktok} onChange={e=>set('tiktok',e.target.value)}
            placeholder="https://tiktok.com/@..." className={inp()}/>
        </Field>
        <div className="sm:col-span-2">
          <Field label={t('Google Maps Embed (paste full iframe code or src URL)')}>
            <textarea value={form.maps_iframe} onChange={e=>set('maps_iframe',e.target.value)}
              rows={3} placeholder={t('Paste map iframe or URL…')}
              className={ta}/>
            {/* LIVE MAP PREVIEW */}
            <MapPreview html={form.maps_iframe}/>
          </Field>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <MdClose size={16}/> {t('Cancel')}
        </button>
        <SaveBtn loading={loading}/>
      </div>
    </form>
  );
}

/* ════════════════════════
   TABLE SECTION
════════════════════════ */
function TableWrapper({ title, total, onRefresh, loading, headers, children, meta, onPage }) {
  const t = useTranslate();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">
          {title} <span className="text-gray-400 font-normal ml-1">({total})</span>
        </p>
        <button onClick={onRefresh}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <MdRefresh size={16} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`}/>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {headers.map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      <Pagination meta={meta} onPage={onPage}/>
    </div>
  );
}

function ActionBtns({ onEdit, onDelete }) {
  const t = useTranslate();
  return (
    <div className="flex items-center gap-1">
      <button onClick={onEdit}
        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title={t('Edit')}>
        <MdEdit size={16}/>
      </button>
      <button onClick={onDelete}
        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title={t('Delete')}>
        <MdDelete size={16}/>
      </button>
    </div>
  );
}

/* ════════════════════════
   MAIN PAGE
════════════════════════ */
export default function CMSPage() {
  const t = useTranslate();
  const dispatch = useDispatch();
  const cms = useSelector(s => s.cms);
  const { language } = useSelector(s => s.locale);

  const [tab,        setTab]       = useState('home');
  const [showForm,   setShowForm]  = useState(false);
  const [editItem,   setEditItem]  = useState(null);
  const [deleteItem, setDeleteItem]= useState(null);
  const [pages,      setPages]     = useState(
    { home:1, about:1, feature:1, offer:1, gallery:1, contact:1 }
  );

  /* Load data for each tab */
  useEffect(() => {
    dispatch(homeThunks.fetch({ page: pages.home,    per_page:15 }));
  }, [pages.home,    dispatch]);
  useEffect(() => {
    dispatch(aboutThunks.fetch({ page: pages.about,  per_page:15 }));
  }, [pages.about,   dispatch]);
  useEffect(() => {
    dispatch(featureThunks.fetch({ page: pages.feature, per_page:15 }));
  }, [pages.feature, dispatch]);
  useEffect(() => {
    dispatch(offerThunks.fetch({ page: pages.offer,  per_page:15 }));
  }, [pages.offer,   dispatch]);
  useEffect(() => {
    dispatch(galleryThunks.fetch({ page: pages.gallery, per_page:15 }));
  }, [pages.gallery, dispatch]);
  useEffect(() => {
    dispatch(contactThunks.fetch({ page: pages.contact, per_page:15 }));
  }, [pages.contact, dispatch]);

  const openCreate = () => { setEditItem(null); setShowForm(true); };
  const openEdit   = (item) => { setEditItem(item); setShowForm(true); };
  const closeForm  = () => { setShowForm(false); setEditItem(null); };
  const setPage    = (t, p) => setPages(prev => ({...prev, [t]: p}));

  const handleSave = async (payload) => {
    const thunks = THUNKS[tab];

    /*
     * payload may be a FormData (from image forms)
     * or a plain object (from Feature, Contact forms).
     * The cmsSlice update thunk already uses POST + _method:PUT,
     * so FormData passes through correctly.
     */
    const isFormData = payload instanceof FormData;
    const id = isFormData ? payload.get('id') : payload.id;

    const action = id
      ? thunks.update(isFormData ? payload : payload)
      : thunks.create(payload);

    const res = await dispatch(action);
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(id ? t('Updated successfully!') : t('Created successfully!'));
      closeForm();
    } else {
      toast.error(res.payload || t('Something went wrong'));
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const activeTab = tab;                         // capture before async
    const id = Number(deleteItem.id);
    const res = await dispatch(THUNKS[activeTab].remove(id));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(t('Deleted permanently!'));
    } else {
      toast.error(res.payload || t('Cannot delete'));
    }
    setDeleteItem(null);
  };

  const FORMS = {
    home:    <HomeForm    initial={editItem} onSave={handleSave} onCancel={closeForm} loading={cms.actionLoading}/>,
    about:   <AboutForm   initial={editItem} onSave={handleSave} onCancel={closeForm} loading={cms.actionLoading}/>,
    feature: <FeatureForm initial={editItem} onSave={handleSave} onCancel={closeForm} loading={cms.actionLoading}/>,
    offer:   <OfferForm   initial={editItem} onSave={handleSave} onCancel={closeForm} loading={cms.actionLoading}/>,
    gallery: <GalleryForm initial={editItem} onSave={handleSave} onCancel={closeForm} loading={cms.actionLoading}/>,
    contact: <ContactForm initial={editItem} onSave={handleSave} onCancel={closeForm} loading={cms.actionLoading}/>,
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5" style={{scrollbarWidth:'thin'}}>
      <Toaster position="top-right" toastOptions={{duration:3500,style:{borderRadius:'12px',fontSize:'13px'}}}/>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:'#E8F5E0'}}>
            <RiHomeSmileLine size={22} style={{color:'#2D3A2E'}}/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{fontFamily:'"Plus Jakarta Sans",sans-serif'}}>
              {t('CMS Management')}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{t('Manage hotel website content')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{background:'#2D3A2E',color:'#fff'}}>
            <MdAdd size={18}/> {language === 'BAN' 
              ? `${TABS(language).find(t=>t.key===tab)?.label || ''} ${t('Add')}` 
              : `${t('Add')} ${TABS(language).find(t=>t.key===tab)?.label || ''}`}
          </button>
          <Link to="/home"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-gray-200 text-gray-700 hover:bg-gray-50">
            <RiExternalLinkLine size={18}/> {t('Live Link')}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS(language).map(t => (
          <button key={t.key}
            onClick={() => { setTab(t.key); setShowForm(false); setEditItem(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              tab===t.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Animated tab content */}
      <AnimatePresence mode="wait">

        {/* ══ HOME ══ */}
        {tab==='home' && (
          <motion.div key="home" {...SLIDE} className="flex flex-col gap-4">
            <AnimatePresence>
              {showForm && (
                <motion.div key="home-form" initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-14}} transition={{duration:0.2}}>
                  {FORMS.home}
                </motion.div>
              )}
            </AnimatePresence>
            <TableWrapper title={t('Home Sections')} total={cms.home.meta.total}
              onRefresh={()=>dispatch(homeThunks.fetch({page:pages.home,per_page:15}))}
              loading={cms.home.status==='loading'}
              headers={[t('Hotel Name'), t('Logo'), t('Hero Images'), t('Actions')]}
              meta={cms.home.meta} onPage={p=>setPage('home',p)}>
              {cms.home.status==='loading' ? <Skeleton cols={4}/> :
               cms.home.data.length===0
                 ? <tr><td colSpan={4} className="px-5 py-14 text-center text-gray-400 text-sm">{t('No entries found.')}</td></tr>
                 : cms.home.data.map((item,i) => (
                    <motion.tr key={item.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{item.hotel_name}</td>
                      <td className="px-5 py-3.5"><ImgThumb src={item.logo_url}/></td>
                      <td className="px-5 py-3.5"><ImgStrip urls={item.hero_urls||[]}/></td>
                      <td className="px-5 py-3.5">
                        <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDeleteItem(item)}/>
                      </td>
                    </motion.tr>
                  ))
              }
            </TableWrapper>
          </motion.div>
        )}

        {/* ══ ABOUT ══ */}
        {tab==='about' && (
          <motion.div key="about" {...SLIDE} className="flex flex-col gap-4">
            <AnimatePresence>
              {showForm && (
                <motion.div key="about-form" initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-14}} transition={{duration:0.2}}>
                  {FORMS.about}
                </motion.div>
              )}
            </AnimatePresence>
            <TableWrapper title={t('About Sections')} total={cms.about.meta.total}
              onRefresh={()=>dispatch(aboutThunks.fetch({page:pages.about,per_page:15}))}
              loading={cms.about.status==='loading'}
              headers={[t('Description'), t('Image'), t('Actions')]}
              meta={cms.about.meta} onPage={p=>setPage('about',p)}>
              {cms.about.status==='loading' ? <Skeleton cols={3}/> :
               cms.about.data.length===0
                 ? <tr><td colSpan={3} className="px-5 py-14 text-center text-gray-400 text-sm">{t('No entries found.')}</td></tr>
                 : cms.about.data.map((item,i) => (
                    <motion.tr key={item.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-gray-600 max-w-xs">
                        <p className="line-clamp-2 text-xs leading-relaxed">{item.description}</p>
                      </td>
                      <td className="px-5 py-3.5"><ImgThumb src={item.image_url}/></td>
                      <td className="px-5 py-3.5">
                        <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDeleteItem(item)}/>
                      </td>
                    </motion.tr>
                  ))
              }
            </TableWrapper>
          </motion.div>
        )}

        {/* ══ FEATURES ══ */}
        {tab==='feature' && (
          <motion.div key="feature" {...SLIDE} className="flex flex-col gap-4">
            <AnimatePresence>
              {showForm && (
                <motion.div key="feature-form" initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-14}} transition={{duration:0.2}}>
                  {FORMS.feature}
                </motion.div>
              )}
            </AnimatePresence>
            <TableWrapper title={t('Features')} total={cms.feature.meta.total}
              onRefresh={()=>dispatch(featureThunks.fetch({page:pages.feature,per_page:15}))}
              loading={cms.feature.status==='loading'}
              headers={[t('Title'), t('Description'), t('Actions')]}
              meta={cms.feature.meta} onPage={p=>setPage('feature',p)}>
              {cms.feature.status==='loading' ? <Skeleton cols={3}/> :
               cms.feature.data.length===0
                 ? <tr><td colSpan={3} className="px-5 py-14 text-center text-gray-400 text-sm">{t('No entries found.')}</td></tr>
                 : cms.feature.data.map((item,i) => (
                    <motion.tr key={item.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{item.title}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs max-w-xs">
                        <p className="line-clamp-2">{item.description}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDeleteItem(item)}/>
                      </td>
                    </motion.tr>
                  ))
              }
            </TableWrapper>
          </motion.div>
        )}

        {/* ══ OFFERS ══ */}
        {tab==='offer' && (
          <motion.div key="offer" {...SLIDE} className="flex flex-col gap-4">
            <AnimatePresence>
              {showForm && (
                <motion.div key="offer-form" initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-14}} transition={{duration:0.2}}>
                  {FORMS.offer}
                </motion.div>
              )}
            </AnimatePresence>
            <TableWrapper title={t('Offers')} total={cms.offer.meta.total}
              onRefresh={()=>dispatch(offerThunks.fetch({page:pages.offer,per_page:15}))}
              loading={cms.offer.status==='loading'}
              headers={[t('Title'), t('Discount'), t('Image'), t('Validity'), t('Actions')]}
              meta={cms.offer.meta} onPage={p=>setPage('offer',p)}>
              {cms.offer.status==='loading' ? <Skeleton cols={5}/> :
               cms.offer.data.length===0
                 ? <tr><td colSpan={5} className="px-5 py-14 text-center text-gray-400 text-sm">{t('No entries found.')}</td></tr>
                 : cms.offer.data.map((item,i) => (
                    <motion.tr key={item.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{item.title}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">
                          {item.discount}% {t('OFF')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><ImgThumb src={item.image_url}/></td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">
                        {item.start_date
                          ? `${new Date(item.start_date).toLocaleDateString(language === 'BAN' ? 'bn-BD' : 'en-US')} → ${item.end_date ? new Date(item.end_date).toLocaleDateString(language === 'BAN' ? 'bn-BD' : 'en-US') : '∞'}`
                          : <span className="text-gray-300">—</span>
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDeleteItem(item)}/>
                      </td>
                    </motion.tr>
                  ))
              }
            </TableWrapper>
          </motion.div>
        )}

        {/* ══ GALLERY ══ */}
        {tab==='gallery' && (
          <motion.div key="gallery" {...SLIDE} className="flex flex-col gap-4">
            <AnimatePresence>
              {showForm && (
                <motion.div key="gallery-form" initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-14}} transition={{duration:0.2}}>
                  {FORMS.gallery}
                </motion.div>
              )}
            </AnimatePresence>
            <TableWrapper title={t('Gallery Groups')} total={cms.gallery.meta.total}
              onRefresh={()=>dispatch(galleryThunks.fetch({page:pages.gallery,per_page:15}))}
              loading={cms.gallery.status==='loading'}
              headers={[t('Images'), t('Count'), t('Created'), t('Actions')]}
              meta={cms.gallery.meta} onPage={p=>setPage('gallery',p)}>
              {cms.gallery.status==='loading' ? <Skeleton cols={4}/> :
               cms.gallery.data.length===0
                 ? <tr><td colSpan={4} className="px-5 py-14 text-center text-gray-400 text-sm">{t('No entries found.')}</td></tr>
                 : cms.gallery.data.map((item,i) => (
                    <motion.tr key={item.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5"><ImgStrip urls={item.gallery_urls||[]}/></td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#E8F5E0] text-[#2D5A30] text-xs font-semibold">
                          {(item.gallery||[]).length} {t('photos')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString(language === 'BAN' ? 'bn-BD' : 'en-US')}
                      </td>
                      <td className="px-5 py-3.5">
                        <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDeleteItem(item)}/>
                      </td>
                    </motion.tr>
                  ))
              }
            </TableWrapper>
          </motion.div>
        )}

        {/* ══ CONTACT ══ */}
        {tab==='contact' && (
          <motion.div key="contact" {...SLIDE} className="flex flex-col gap-4">
            <AnimatePresence>
              {showForm && (
                <motion.div key="contact-form" initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-14}} transition={{duration:0.2}}>
                  {FORMS.contact}
                </motion.div>
              )}
            </AnimatePresence>
            <TableWrapper title={t('Contact Info')} total={cms.contact.meta.total}
              onRefresh={()=>dispatch(contactThunks.fetch({page:pages.contact,per_page:15}))}
              loading={cms.contact.status==='loading'}
              headers={[t('Phone'), t('Email'), t('Address'), t('Social'), t('Map'), t('Actions')]}
              meta={cms.contact.meta} onPage={p=>setPage('contact',p)}>
              {cms.contact.status==='loading' ? <Skeleton cols={6}/> :
               cms.contact.data.length===0
                 ? <tr><td colSpan={6} className="px-5 py-14 text-center text-gray-400 text-sm">{t('No entries found.')}</td></tr>
                 : cms.contact.data.map((item,i) => (
                    <motion.tr key={item.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-gray-700 text-xs whitespace-nowrap">{item.phone||'—'}</td>
                      <td className="px-5 py-3.5 text-gray-700 text-xs">{item.email||'—'}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs max-w-[140px] truncate">{item.address||'—'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {item.facebook  && <a href={item.facebook}  target="_blank" rel="noreferrer"><FaFacebook  size={15} className="text-blue-500 hover:text-blue-700"/></a>}
                          {item.instagram && <a href={item.instagram} target="_blank" rel="noreferrer"><FaInstagram size={15} className="text-pink-500 hover:text-pink-700"/></a>}
                          {item.tiktok    && <a href={item.tiktok}    target="_blank" rel="noreferrer"><FaTiktok    size={15} className="text-gray-700 hover:text-gray-900"/></a>}
                          {!item.facebook && !item.instagram && !item.tiktok && <span className="text-gray-300 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {item.maps_iframe
                          ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <MdMap size={14}/> {t('Set')}
                            </span>
                          : <span className="text-gray-300 text-xs">—</span>
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setDeleteItem(item)}/>
                      </td>
                    </motion.tr>
                  ))
              }
            </TableWrapper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteItem && (
          <DeleteModal
            label={TABS(language).find(t=>t.key===tab)?.label}
            name={deleteItem.hotel_name || deleteItem.title || deleteItem.phone || `${t('Entry')} #${deleteItem.id}`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteItem(null)}
            loading={cms.actionLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
