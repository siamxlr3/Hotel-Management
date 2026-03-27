import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const reservationApi = createApi({
  reducerPath: 'reservationApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Reservation', 'Checkout'],
  endpoints: (builder) => ({
    getReservations: builder.query({
      query: (params) => ({ url: '/reservations', params }),
      providesTags: (res) => res?.data 
        ? [...res.data.map(i => ({ type: 'Reservation', id: i.id })), { type: 'Reservation', id: 'LIST' }] 
        : [{ type: 'Reservation', id: 'LIST' }],
    }),
    getCheckouts: builder.query({
      query: (params) => ({ url: '/reservations/checkouts', params }),
      providesTags: [{ type: 'Checkout', id: 'LIST' }],
    }),
    createReservation: builder.mutation({
      query: (body) => ({ url: '/reservations', method: 'POST', body }),
      invalidatesTags: [{ type: 'Reservation', id: 'LIST' }, { type: 'Checkout', id: 'LIST' }],
    }),
    updateReservation: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/reservations/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Reservation', id }, { type: 'Reservation', id: 'LIST' }, { type: 'Checkout', id: 'LIST' }],
    }),
    cancelReservation: builder.mutation({
      query: (id) => ({ url: `/reservations/${id}/cancel`, method: 'POST' }),
      invalidatesTags: (res, err, id) => [{ type: 'Reservation', id }, { type: 'Reservation', id: 'LIST' }, { type: 'Checkout', id: 'LIST' }],
    }),
    deleteReservation: builder.mutation({
      query: (id) => ({ url: `/reservations/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Reservation', id: 'LIST' }, { type: 'Checkout', id: 'LIST' }],
    }),
    getActiveReservation: builder.query({
      query: (roomId) => `/reservations/active/${roomId}`,
      providesTags: (res, err, roomId) => [{ type: 'Reservation', id: `ACTIVE-${roomId}` }],
      transformResponse: (res) => res?.data || res,
    }),
  }),
});

export const {
  useGetReservationsQuery,
  useGetCheckoutsQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useCancelReservationMutation,
  useDeleteReservationMutation,
  useGetActiveReservationQuery,
} = reservationApi;
