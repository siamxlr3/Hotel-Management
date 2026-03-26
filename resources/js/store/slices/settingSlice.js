import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axios';

/* ── helpers ── */
const paginate = (res) => ({ data: res.data.data, meta: res.data.meta });
const reject   = (e)   => e.response?.data?.message || 'Request failed';

/* ══════════════════════════════════════
   TAX thunks
══════════════════════════════════════ */
export const fetchTaxes = createAsyncThunk('setting/fetchTaxes',
  async (p = {}, { rejectWithValue }) => {
    try { return paginate(await axiosClient.get('/api/taxes', { params: p })); }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);
export const createTax = createAsyncThunk('setting/createTax',
  async (payload, { rejectWithValue }) => {
    try { return (await axiosClient.post('/api/taxes', payload)).data.data; }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);
export const updateTax = createAsyncThunk('setting/updateTax',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try { return (await axiosClient.put(`/api/taxes/${id}`, payload)).data.data; }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);
export const deleteTax = createAsyncThunk('setting/deleteTax',
  async (id, { rejectWithValue }) => {
    try { await axiosClient.delete(`/api/taxes/${id}`); return id; }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);

/* ══════════════════════════════════════
   GLOBAL DISCOUNT thunks
══════════════════════════════════════ */
export const fetchGlobalDiscounts = createAsyncThunk('setting/fetchGlobalDiscounts',
  async (p = {}, { rejectWithValue }) => {
    try { return paginate(await axiosClient.get('/api/global-discounts', { params: p })); }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);
export const createGlobalDiscount = createAsyncThunk('setting/createGlobalDiscount',
  async (payload, { rejectWithValue }) => {
    try { return (await axiosClient.post('/api/global-discounts', payload)).data.data; }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);
export const updateGlobalDiscount = createAsyncThunk('setting/updateGlobalDiscount',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try { return (await axiosClient.put(`/api/global-discounts/${id}`, payload)).data.data; }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);
export const deleteGlobalDiscount = createAsyncThunk('setting/deleteGlobalDiscount',
  async (id, { rejectWithValue }) => {
    try { await axiosClient.delete(`/api/global-discounts/${id}`); return id; }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);

/* ══════════════════════════════════════
   CATEGORY DISCOUNT thunks
══════════════════════════════════════ */
export const fetchCategoryDiscounts = createAsyncThunk('setting/fetchCategoryDiscounts',
  async (p = {}, { rejectWithValue }) => {
    try { return paginate(await axiosClient.get('/api/category-discounts', { params: p })); }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);
export const createCategoryDiscount = createAsyncThunk('setting/createCategoryDiscount',
  async (payload, { rejectWithValue }) => {
    try { return (await axiosClient.post('/api/category-discounts', payload)).data.data; }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);
export const updateCategoryDiscount = createAsyncThunk('setting/updateCategoryDiscount',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try { return (await axiosClient.put(`/api/category-discounts/${id}`, payload)).data.data; }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);
export const deleteCategoryDiscount = createAsyncThunk('setting/deleteCategoryDiscount',
  async (id, { rejectWithValue }) => {
    try { await axiosClient.delete(`/api/category-discounts/${id}`); return id; }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);

/* ══════════════════════════════════════
   DROPDOWN thunks
══════════════════════════════════════ */
export const fetchRoomsDropdown = createAsyncThunk('setting/fetchRoomsDropdown',
  async (_, { rejectWithValue }) => {
    try { return (await axiosClient.get('/api/rooms-dropdown')).data.data; }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);
export const fetchCategoriesDropdown = createAsyncThunk('setting/fetchCategoriesDropdown',
  async (_, { rejectWithValue }) => {
    try { return (await axiosClient.get('/api/categories-dropdown')).data.data; }
    catch (e) { return rejectWithValue(reject(e)); }
  }
);

/* ══════════════════════════════════════
   Initial State
══════════════════════════════════════ */
const emptyList = { data: [], meta: { current_page:1, last_page:1, per_page:15, total:0 } };

const initialState = {
  taxes:             emptyList,
  globalDiscounts:   emptyList,
  categoryDiscounts: emptyList,
  roomsDropdown:     [],
  categoriesDropdown:[],
  taxStatus:         'idle',
  globalStatus:      'idle',
  categoryStatus:    'idle',
  actionLoading:     false,
  error:             null,
};

/* ══════════════════════════════════════
   Helpers for reducers
══════════════════════════════════════ */
const upsert = (list, item) => {
  const idx = list.findIndex(x => x.id === item.id);
  if (idx !== -1) { list[idx] = item; } else { list.unshift(item); }
};
const remove = (list, id) => list.filter(x => x.id !== id);

/* ══════════════════════════════════════
   Slice
══════════════════════════════════════ */
const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {
    clearError: (s) => { s.error = null; },
  },
  extraReducers: (builder) => {
    /* ── Taxes ── */
    builder
      .addCase(fetchTaxes.pending,   (s) => { s.taxStatus = 'loading'; })
      .addCase(fetchTaxes.fulfilled, (s, a) => { s.taxStatus = 'succeeded'; s.taxes = a.payload; })
      .addCase(fetchTaxes.rejected,  (s, a) => { s.taxStatus = 'failed'; s.error = a.payload; })

      .addCase(createTax.pending,    (s) => { s.actionLoading = true; })
      .addCase(createTax.fulfilled,  (s, a) => {
        s.actionLoading = false;
        s.taxes.data.unshift(a.payload);
        s.taxes.meta.total += 1;
      })
      .addCase(createTax.rejected,   (s, a) => { s.actionLoading = false; s.error = a.payload; })

      .addCase(updateTax.pending,    (s) => { s.actionLoading = true; })
      .addCase(updateTax.fulfilled,  (s, a) => { s.actionLoading = false; upsert(s.taxes.data, a.payload); })
      .addCase(updateTax.rejected,   (s, a) => { s.actionLoading = false; s.error = a.payload; })

      .addCase(deleteTax.pending,    (s) => { s.actionLoading = true; })
      .addCase(deleteTax.fulfilled,  (s, a) => {
        s.actionLoading = false;
        s.taxes.data = remove(s.taxes.data, a.payload);
        s.taxes.meta.total -= 1;
      })
      .addCase(deleteTax.rejected,   (s, a) => { s.actionLoading = false; s.error = a.payload; })

    /* ── Global Discounts ── */
    builder
      .addCase(fetchGlobalDiscounts.pending,   (s) => { s.globalStatus = 'loading'; })
      .addCase(fetchGlobalDiscounts.fulfilled, (s, a) => { s.globalStatus = 'succeeded'; s.globalDiscounts = a.payload; })
      .addCase(fetchGlobalDiscounts.rejected,  (s, a) => { s.globalStatus = 'failed'; s.error = a.payload; })

      .addCase(createGlobalDiscount.pending,   (s) => { s.actionLoading = true; })
      .addCase(createGlobalDiscount.fulfilled, (s, a) => {
        s.actionLoading = false;
        s.globalDiscounts.data.unshift(a.payload);
        s.globalDiscounts.meta.total += 1;
      })
      .addCase(createGlobalDiscount.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; })

      .addCase(updateGlobalDiscount.pending,   (s) => { s.actionLoading = true; })
      .addCase(updateGlobalDiscount.fulfilled, (s, a) => { s.actionLoading = false; upsert(s.globalDiscounts.data, a.payload); })
      .addCase(updateGlobalDiscount.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; })

      .addCase(deleteGlobalDiscount.pending,   (s) => { s.actionLoading = true; })
      .addCase(deleteGlobalDiscount.fulfilled, (s, a) => {
        s.actionLoading = false;
        s.globalDiscounts.data = remove(s.globalDiscounts.data, a.payload);
        s.globalDiscounts.meta.total -= 1;
      })
      .addCase(deleteGlobalDiscount.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; })

    /* ── Category Discounts ── */
    builder
      .addCase(fetchCategoryDiscounts.pending,   (s) => { s.categoryStatus = 'loading'; })
      .addCase(fetchCategoryDiscounts.fulfilled, (s, a) => { s.categoryStatus = 'succeeded'; s.categoryDiscounts = a.payload; })
      .addCase(fetchCategoryDiscounts.rejected,  (s, a) => { s.categoryStatus = 'failed'; s.error = a.payload; })

      .addCase(createCategoryDiscount.pending,   (s) => { s.actionLoading = true; })
      .addCase(createCategoryDiscount.fulfilled, (s, a) => {
        s.actionLoading = false;
        s.categoryDiscounts.data.unshift(a.payload);
        s.categoryDiscounts.meta.total += 1;
      })
      .addCase(createCategoryDiscount.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; })

      .addCase(updateCategoryDiscount.pending,   (s) => { s.actionLoading = true; })
      .addCase(updateCategoryDiscount.fulfilled, (s, a) => { s.actionLoading = false; upsert(s.categoryDiscounts.data, a.payload); })
      .addCase(updateCategoryDiscount.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; })

      .addCase(deleteCategoryDiscount.pending,   (s) => { s.actionLoading = true; })
      .addCase(deleteCategoryDiscount.fulfilled, (s, a) => {
        s.actionLoading = false;
        s.categoryDiscounts.data = remove(s.categoryDiscounts.data, a.payload);
        s.categoryDiscounts.meta.total -= 1;
      })
      .addCase(deleteCategoryDiscount.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; })

    /* ── Dropdowns ── */
    builder
      .addCase(fetchRoomsDropdown.fulfilled,      (s, a) => { s.roomsDropdown = a.payload; })
      .addCase(fetchCategoriesDropdown.fulfilled, (s, a) => { s.categoriesDropdown = a.payload; })
  },
});

export const { clearError } = settingSlice.actions;
export default settingSlice.reducer;
