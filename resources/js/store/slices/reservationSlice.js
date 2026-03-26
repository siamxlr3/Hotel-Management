import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axios';

const reject = (e) => e.response?.data?.message || 'Request failed';

/* ── Thunks ── */

// Fetch all reservations (Paginated, Searchable, Filterable)
export const fetchReservations = createAsyncThunk('reservation/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/api/reservations', { params });
      return data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

// Use roomSlice or custom fetch for rooms on the reservation page
export const fetchReservationRooms = createAsyncThunk('reservation/fetchRooms',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/api/rooms', { params });
      return data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

// Fetch today's checkouts (or by specific date)
export const fetchTodayCheckouts = createAsyncThunk('reservation/fetchCheckouts',
  async (params = {}, { rejectWithValue }) => {
    try {
      return (await axiosClient.get('/api/reservations/checkouts', { params })).data.data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

// Create a new reservation/booking
export const createReservation = createAsyncThunk('reservation/create',
  async (payload, { rejectWithValue }) => {
    try {
      return (await axiosClient.post('/api/reservations', payload)).data.data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

// Update a reservation (e.g. check out / payment)
export const updateReservation = createAsyncThunk('reservation/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      return (await axiosClient.put(`/api/reservations/${id}`, payload)).data.data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

// Cancel a reservation
export const cancelReservation = createAsyncThunk('reservation/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return (await axiosClient.post(`/api/reservations/${id}/cancel`)).data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

// Quick room status update (e.g. Cleaning -> Available)
export const fastUpdateRoomStatus = createAsyncThunk('reservation/updateRoomStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return (await axiosClient.put(`/api/rooms/${id}`, { status, _force: true })).data;
    } catch (e) { return rejectWithValue(reject(e)); }
  }
);

/* ── API helpers ── */
// Fetch the active reservation for a given room
export const fetchActiveReservationForRoom = async (roomId) => {
  const { data } = await axiosClient.get('/api/reservations', { params: { room_id: roomId, status: 'Unpaid', per_page: 1 } });
  return data?.data?.length > 0 ? data.data[0] : null;
};

/* ── Slice ── */
const reservationSlice = createSlice({
  name: 'reservation',
  initialState: {
    reservations: [], // Complete reservations list (CheckInPage)
    reservationMeta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    rooms: [], // Rooms used for the grid (ReservationPage)
    roomMeta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    checkouts: [], // Today's checkouts list
    loadingReservations: false,
    loadingRooms: false,
    loadingCheckouts: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    updateRoomStateOptimization: (state, action) => {
        // Optimistic UI update for room status
        const idx = state.rooms.findIndex(r => r.id === action.payload.id);
        if(idx !== -1) {
            state.rooms[idx].status = action.payload.status;
        }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Reservations
      .addCase(fetchReservations.pending, (state) => { state.loadingReservations = true; })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loadingReservations = false;
        state.reservations = action.payload.data;
        state.reservationMeta = action.payload.meta;
      })
      .addCase(fetchReservations.rejected, (state, action) => { 
        state.loadingReservations = false; 
        state.error = action.payload; 
      })

      // Fetch Rooms
      .addCase(fetchReservationRooms.pending, (state) => { state.loadingRooms = true; })
      .addCase(fetchReservationRooms.fulfilled, (state, action) => {
        state.loadingRooms = false;
        state.rooms = action.payload.data;
        state.roomMeta = action.payload.meta;
      })
      .addCase(fetchReservationRooms.rejected, (state, action) => { 
        state.loadingRooms = false; 
        state.error = action.payload; 
      })
      
      // Fetch Checkouts
      .addCase(fetchTodayCheckouts.pending, (state) => { state.loadingCheckouts = true; })
      .addCase(fetchTodayCheckouts.fulfilled, (state, action) => {
        state.loadingCheckouts = false;
        state.checkouts = action.payload;
      })
      .addCase(fetchTodayCheckouts.rejected, (state, action) => { 
        state.loadingCheckouts = false; 
        state.error = action.payload; 
      })

      // Create Reservation
      .addCase(createReservation.pending, (state) => { state.actionLoading = true; })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.actionLoading = false;
        // The room status will be updated via optimistic UI update
      })
      .addCase(createReservation.rejected, (state, action) => { 
        state.actionLoading = false; 
        state.error = action.payload; 
      })

      // Update Reservation
      .addCase(updateReservation.pending, (state) => { state.actionLoading = true; })
      .addCase(updateReservation.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(updateReservation.rejected, (state, action) => { 
        state.actionLoading = false; 
        state.error = action.payload; 
      })

      // Cancel Reservation
      .addCase(cancelReservation.pending, (state) => { state.actionLoading = true; })
      .addCase(cancelReservation.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(cancelReservation.rejected, (state, action) => { 
        state.actionLoading = false; 
        state.error = action.payload; 
      });
  },
});

export const { clearError, updateRoomStateOptimization } = reservationSlice.actions;
export default reservationSlice.reducer;
