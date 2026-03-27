import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const expenseApi = createApi({
  reducerPath: 'expenseApi',
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
  tagTypes: ['Expense', 'Summary', 'HotelInfo'],
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: (params) => ({ url: '/expenses', params }),
      providesTags: (res) => res?.data 
        ? [...res.data.map(i => ({ type: 'Expense', id: i.id })), { type: 'Expense', id: 'LIST' }] 
        : [{ type: 'Expense', id: 'LIST' }],
    }),
    getExpenseSummary: builder.query({
      query: (params) => ({ url: '/expenses/summary', params }),
      providesTags: [{ type: 'Summary', id: 'EXPENSE' }],
    }),
    getHotelInfo: builder.query({
      query: () => '/expenses/hotel-info',
      providesTags: [{ type: 'HotelInfo', id: 'GLOBAL' }],
      transformResponse: (res) => res?.data || res,
    }),
    createExpense: builder.mutation({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }, { type: 'Summary', id: 'EXPENSE' }],
    }),
    updateExpense: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/expenses/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Expense', id }, { type: 'Expense', id: 'LIST' }, { type: 'Summary', id: 'EXPENSE' }],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }, { type: 'Summary', id: 'EXPENSE' }],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpenseSummaryQuery,
  useGetHotelInfoQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi;
