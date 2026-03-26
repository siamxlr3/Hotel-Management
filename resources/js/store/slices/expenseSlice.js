import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axios';

const reject = (e) => e.response?.data?.message || 'Request failed';

/* ── Thunks ── */
export const fetchExpenses = createAsyncThunk('expense/fetchExpenses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/api/expenses', { params });
      return data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

export const fetchSummary = createAsyncThunk('expense/fetchSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      return (await axiosClient.get('/api/expenses/summary', { params })).data.data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

export const fetchHotelInfo = createAsyncThunk('expense/fetchHotelInfo',
  async (_, { rejectWithValue }) => {
    try {
      return (await axiosClient.get('/api/expenses/hotel-info')).data.data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

export const createExpense = createAsyncThunk('expense/createExpense',
  async (payload, { rejectWithValue }) => {
    try {
      return (await axiosClient.post('/api/expenses', payload)).data.data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

export const updateExpense = createAsyncThunk('expense/updateExpense',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      return (await axiosClient.put(`/api/expenses/${id}`, payload)).data.data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

export const deleteExpense = createAsyncThunk('expense/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/api/expenses/${id}`);
      return id;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

/* ── Slice ── */
const expenseSlice = createSlice({
  name: 'expense',
  initialState: {
    expenses:      [],
    meta:          { current_page:1, last_page:1, per_page:15, total:0 },
    summary:       { total_expenses:0, paid_total:0, unpaid_total:0,
                     total_count:0, paid_count:0, unpaid_count:0 },
    hotelInfo:     { hotel_name:'', phone:'', email:'', address:'' },
    status:        'idle',
    actionLoading: false,
    error:         null,
  },
  reducers: {
    clearError: (s) => { s.error = null; },
  },
  extraReducers: (builder) => {
    builder
      /* Fetch list */
      .addCase(fetchExpenses.pending,   (s) => { s.status = 'loading'; })
      .addCase(fetchExpenses.fulfilled, (s, a) => {
        s.status   = 'succeeded';
        s.expenses = a.payload.data;
        s.meta     = a.payload.meta;
      })
      .addCase(fetchExpenses.rejected,  (s, a) => { s.status='failed'; s.error=a.payload; })

      /* Summary */
      .addCase(fetchSummary.fulfilled,   (s, a) => { s.summary   = a.payload; })
      /* Hotel info */
      .addCase(fetchHotelInfo.fulfilled, (s, a) => { s.hotelInfo = a.payload; })

      /* Create */
      .addCase(createExpense.pending,   (s) => { s.actionLoading=true; })
      .addCase(createExpense.fulfilled, (s, a) => {
        s.actionLoading = false;
        s.expenses.unshift(a.payload);
        s.meta.total += 1;
      })
      .addCase(createExpense.rejected,  (s, a) => { s.actionLoading=false; s.error=a.payload; })

      /* Update */
      .addCase(updateExpense.pending,   (s) => { s.actionLoading=true; })
      .addCase(updateExpense.fulfilled, (s, a) => {
        s.actionLoading = false;
        const idx = s.expenses.findIndex(e => e.id === a.payload.id);
        if (idx !== -1) s.expenses[idx] = a.payload;
      })
      .addCase(updateExpense.rejected,  (s, a) => { s.actionLoading=false; s.error=a.payload; })

      /* Delete */
      .addCase(deleteExpense.pending,   (s) => { s.actionLoading=true; })
      .addCase(deleteExpense.fulfilled, (s, a) => {
        s.actionLoading = false;
        s.expenses      = s.expenses.filter(e => e.id !== a.payload);
        s.meta.total   -= 1;
      })
      .addCase(deleteExpense.rejected,  (s, a) => { s.actionLoading=false; s.error=a.payload; })
  },
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer;
