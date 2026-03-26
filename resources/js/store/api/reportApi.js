import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Report', 'Reservation', 'Expense', 'Payroll'],
  endpoints: (builder) => ({
    getDashboardReport: builder.query({
      query: ({ from_date, to_date }) => ({
        url: '/reports',
        params: { from_date, to_date },
      }),
      providesTags: ['Report'],
    }),
  }),
});

export const { useGetDashboardReportQuery } = reportApi;
