import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axios';

/* ── helpers ── */
const page = (res) => ({ data: res.data.data, meta: res.data.meta });
const err  = (e)   => e.response?.data?.message || 'Request failed';

const formData = (payload) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    if (Array.isArray(v)) {
      v.forEach(item => fd.append(`${k}[]`, item));
    } else {
      fd.append(k, v);
    }
  });
  return fd;
};



/* ══ THUNK FACTORY ══ */
const mkCRUD = (name, endpoint) => ({
  fetch:  createAsyncThunk(`cms/fetch${name}`,
    async (p={}, { rejectWithValue }) => {
      try { return page(await axiosClient.get(endpoint, { params: p })); }
      catch(e) { return rejectWithValue(err(e)); }
    }),
  create: createAsyncThunk(`cms/create${name}`,
    async (payload, { rejectWithValue }) => {
      try {
        const isFD = payload instanceof FormData;
        const body = isFD ? payload : formData(payload);
        const config = isFD ? { headers: { 'Content-Type': null } } : {};
        return (await axiosClient.post(endpoint, body, config)).data.data;
      } catch(e) { return rejectWithValue(err(e)); }
    }),
  update: createAsyncThunk(`cms/update${name}`,
    async (payload, { rejectWithValue }) => {
      try {
        let fd;
        let id;
        let config = {};

        if (payload instanceof FormData) {
          fd = payload;
          id = fd.get('id');
          config = { headers: { 'Content-Type': null } };
        } else {
          id = payload.id;
          fd = formData(payload);
          fd.append('_method', 'PUT');
        }

        return (await axiosClient.post(
          `${endpoint}/${id}`, fd, config
        )).data.data;
      } catch(e) { return rejectWithValue(err(e)); }
    }),
  remove: createAsyncThunk(`cms/delete${name}`,
    async (id, { rejectWithValue }) => {
      try { await axiosClient.delete(`${endpoint}/${id}`); return id; }
      catch(e) { return rejectWithValue(err(e)); }
    }),
});

/* ══ CRUD sets ══ */
export const homeThunks    = mkCRUD('Home',    '/api/cms/home');
export const aboutThunks   = mkCRUD('About',   '/api/cms/home-about');
export const featureThunks = mkCRUD('Feature', '/api/cms/home-features');
export const offerThunks   = mkCRUD('Offer',   '/api/cms/home-offers');
export const galleryThunks = mkCRUD('Gallery', '/api/cms/home-gallery');
export const contactThunks = mkCRUD('Contact', '/api/cms/home-contact');

/* ══ HELPERS ══ */
const emptyState = () => ({
  data: [], meta: { current_page:1, last_page:1, per_page:15, total:0 },
  status: 'idle', error: null,
});

const upsert = (list, item) => {
  const i = list.findIndex(x => x.id === item.id);
  if (i !== -1) list[i] = item; else list.unshift(item);
};

const makeReducers = (builder, key, thunks) => {
  builder
    .addCase(thunks.fetch.pending,  (s) => { s[key].status = 'loading'; })
    .addCase(thunks.fetch.fulfilled,(s,a) => { s[key].status='succeeded'; s[key].data=a.payload.data; s[key].meta=a.payload.meta; })
    .addCase(thunks.fetch.rejected, (s,a) => { s[key].status='failed'; s[key].error=a.payload; })

    .addCase(thunks.create.pending,   (s) => { s.actionLoading=true; })
    .addCase(thunks.create.fulfilled, (s,a) => { s.actionLoading=false; s[key].data.unshift(a.payload); s[key].meta.total+=1; })
    .addCase(thunks.create.rejected,  (s,a) => { s.actionLoading=false; s.error=a.payload; })

    .addCase(thunks.update.pending,   (s) => { s.actionLoading=true; })
    .addCase(thunks.update.fulfilled, (s,a) => { s.actionLoading=false; upsert(s[key].data, a.payload); })
    .addCase(thunks.update.rejected,  (s,a) => { s.actionLoading=false; s.error=a.payload; })

    .addCase(thunks.remove.pending,   (s) => { s.actionLoading=true; })
    .addCase(thunks.remove.fulfilled, (s,a) => {
      s.actionLoading=false;
      s[key].data = s[key].data.filter(x => Number(x.id) !== Number(a.payload));
      s[key].meta.total -= 1;
    })
    .addCase(thunks.remove.rejected,  (s,a) => { s.actionLoading=false; s.error=a.payload; })
};

/* ══ SLICE ══ */
const cmsSlice = createSlice({
  name: 'cms',
  initialState: {
    home:    emptyState(),
    about:   emptyState(),
    feature: emptyState(),
    offer:   emptyState(),
    gallery: emptyState(),
    contact: emptyState(),
    actionLoading: false,
    error: null,
  },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    makeReducers(builder, 'home',    homeThunks);
    makeReducers(builder, 'about',   aboutThunks);
    makeReducers(builder, 'feature', featureThunks);
    makeReducers(builder, 'offer',   offerThunks);
    makeReducers(builder, 'gallery', galleryThunks);
    makeReducers(builder, 'contact', contactThunks);
  },
});

export const { clearError } = cmsSlice.actions;
export default cmsSlice.reducer;
