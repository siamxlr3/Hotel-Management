import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const roomApi = createApi({
  reducerPath: 'roomApi',
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
  tagTypes: ['Room', 'Category'],
  endpoints: (builder) => ({
    // Rooms
    getRooms: builder.query({
      query: (params) => ({ url: '/rooms', params }),
      providesTags: (res) => res?.data 
        ? [...res.data.map(i => ({ type: 'Room', id: i.id })), { type: 'Room', id: 'LIST' }] 
        : [{ type: 'Room', id: 'LIST' }],
    }),
    createRoom: builder.mutation({
      query: (body) => ({ url: '/rooms', method: 'POST', body }),
      invalidatesTags: [{ type: 'Room', id: 'LIST' }],
    }),
    updateRoom: builder.mutation({
      query: ({ id, payload }) => {
        const body = payload instanceof FormData ? payload : payload;
        const method = payload instanceof FormData ? 'POST' : 'PUT';
        if (payload instanceof FormData && !payload.has('_method')) {
          payload.append('_method', 'PUT');
        }
        return { url: `/rooms/${id}`, method, body };
      },
      invalidatesTags: (res, err, { id }) => [{ type: 'Room', id }, { type: 'Room', id: 'LIST' }],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({ url: `/rooms/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Room', id: 'LIST' }],
    }),
    updateRoomStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/rooms/${id}/status`, method: 'PUT', body: { status } }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Room', id }, { type: 'Room', id: 'LIST' }],
    }),

    // Categories
    getCategories: builder.query({
      query: (params) => ({ url: '/room-categories', params }),
      providesTags: (res) => res?.data 
        ? [...res.data.map(i => ({ type: 'Category', id: i.id })), { type: 'Category', id: 'LIST' }] 
        : [{ type: 'Category', id: 'LIST' }],
    }),
    getAllCategories: builder.query({
      query: () => '/room-categories-all',
      transformResponse: (res) => Array.isArray(res) ? res : (res?.data || []),
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: '/room-categories', method: 'POST', body }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/room-categories/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Category', id }, { type: 'Category', id: 'LIST' }],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/room-categories/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetCategoriesQuery,
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateRoomStatusMutation,
} = roomApi;
