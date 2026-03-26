import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axios';

/* ── Async Thunks ── */

// Room Categories
export const fetchCategories = createAsyncThunk('room/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/api/room-categories', { params });
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load categories'); }
  }
);

export const fetchAllCategories = createAsyncThunk(
  'room/fetchAllCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/api/room-categories-all');
      // Handle both {data: [...]} and direct array responses safely
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      return list;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || 'Failed to load categories'
      );
    }
  }
);

export const createCategory = createAsyncThunk('room/createCategory',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post('/api/room-categories', payload);
      return data.data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to create'); }
  }
);

export const updateCategory = createAsyncThunk('room/updateCategory',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(`/api/room-categories/${id}`, payload);
      return data.data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to update'); }
  }
);

export const deleteCategory = createAsyncThunk('room/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/api/room-categories/${id}`);
      return id;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to delete'); }
  }
);

// Rooms
export const fetchRooms = createAsyncThunk('room/fetchRooms',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/api/rooms', { params });
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load rooms'); }
  }
);

export const createRoom = createAsyncThunk('room/createRoom',
  async (payload, { rejectWithValue }) => {
    try {
      // payload can be FormData or a regular object
      const { data } = await axiosClient.post('/api/rooms', payload);
      return data.data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to create'); }
  }
);

export const updateRoom = createAsyncThunk('room/updateRoom',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      // Laravel needs POST + _method: PUT for multipart/form-data updates
      if (payload instanceof FormData) {
        // Only append if it doesn't already exist
        if (!payload.has('_method')) {
          payload.append('_method', 'PUT');
        }
        const { data } = await axiosClient.post(`/api/rooms/${id}`, payload);
        return data.data;
      } else {
        const { data } = await axiosClient.put(`/api/rooms/${id}`, payload);
        return data.data;
      }
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to update'); }
  }
);

export const deleteRoom = createAsyncThunk('room/deleteRoom',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/api/rooms/${id}`);
      return id;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to delete'); }
  }
);

/* ── Slice ── */
const roomSlice = createSlice({
  name: 'room',
  initialState: {
    // Categories
    categories:     [],
    allCategories:  [],   // for dropdown (id + name only)
    categoryMeta:   { current_page:1, last_page:1, per_page:15, total:0 },
    categoryStatus: 'idle',   // idle | loading | succeeded | failed
    categoryError:  null,

    // Rooms
    rooms:       [],
    roomMeta:    { current_page:1, last_page:1, per_page:15, total:0 },
    roomStatus:  'idle',
    roomError:   null,

    // Action loading (save/delete buttons)
    actionLoading: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.categoryError = null;
      state.roomError     = null;
    },
  },
  extraReducers: (builder) => {
    /* Categories */
    builder
      .addCase(fetchCategories.pending,  (s) => { s.categoryStatus = 'loading'; })
      .addCase(fetchCategories.fulfilled,(s, a) => {
        s.categoryStatus = 'succeeded';
        s.categories     = a.payload.data;
        s.categoryMeta   = a.payload.meta;
      })
      .addCase(fetchCategories.rejected, (s, a) => { s.categoryStatus = 'failed'; s.categoryError = a.payload; })

      .addCase(fetchAllCategories.pending, (state) => {
        // keep existing allCategories while reloading
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.allCategories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        // silently fail — dropdown just stays empty
        console.warn('fetchAllCategories failed:', action.payload);
      })

      .addCase(createCategory.pending,  (s) => { s.actionLoading = true; })
      .addCase(createCategory.fulfilled,(s, a) => {
        s.actionLoading = false;
        s.categories.unshift(a.payload);
        s.categoryMeta.total += 1;
      })
      .addCase(createCategory.rejected, (s, a) => { s.actionLoading = false; s.categoryError = a.payload; })

      .addCase(updateCategory.pending,  (s) => { s.actionLoading = true; })
      .addCase(updateCategory.fulfilled,(s, a) => {
        s.actionLoading = false;
        const idx = s.categories.findIndex(c => c.id === a.payload.id);
        if (idx !== -1) s.categories[idx] = a.payload;
      })
      .addCase(updateCategory.rejected, (s, a) => { s.actionLoading = false; s.categoryError = a.payload; })

      .addCase(deleteCategory.pending,  (s) => { s.actionLoading = true; })
      .addCase(deleteCategory.fulfilled,(s, a) => {
        s.actionLoading = false;
        s.categories    = s.categories.filter(c => c.id !== a.payload);
        s.categoryMeta.total -= 1;
      })
      .addCase(deleteCategory.rejected, (s, a) => { s.actionLoading = false; s.categoryError = a.payload; })

    /* Rooms */
    builder
      .addCase(fetchRooms.pending,  (s) => { s.roomStatus = 'loading'; })
      .addCase(fetchRooms.fulfilled,(s, a) => {
        s.roomStatus = 'succeeded';
        s.rooms      = a.payload.data;
        s.roomMeta   = a.payload.meta;
      })
      .addCase(fetchRooms.rejected, (s, a) => { s.roomStatus = 'failed'; s.roomError = a.payload; })

      .addCase(createRoom.pending,  (s) => { s.actionLoading = true; })
      .addCase(createRoom.fulfilled,(s, a) => {
        s.actionLoading = false;
        s.rooms.unshift(a.payload);
        s.roomMeta.total += 1;
      })
      .addCase(createRoom.rejected, (s, a) => { s.actionLoading = false; s.roomError = a.payload; })

      .addCase(updateRoom.pending,  (s) => { s.actionLoading = true; })
      .addCase(updateRoom.fulfilled,(s, a) => {
        s.actionLoading = false;
        const idx = s.rooms.findIndex(r => r.id === a.payload.id);
        if (idx !== -1) s.rooms[idx] = a.payload;
      })
      .addCase(updateRoom.rejected, (s, a) => { s.actionLoading = false; s.roomError = a.payload; })

      .addCase(deleteRoom.pending,  (s) => { s.actionLoading = true; })
      .addCase(deleteRoom.fulfilled,(s, a) => {
        s.actionLoading = false;
        s.rooms = s.rooms.filter(r => r.id !== a.payload);
        s.roomMeta.total -= 1;
      })
      .addCase(deleteRoom.rejected, (s, a) => { s.actionLoading = false; s.roomError = a.payload; })
  },
});

export const { clearErrors } = roomSlice.actions;
export default roomSlice.reducer;
