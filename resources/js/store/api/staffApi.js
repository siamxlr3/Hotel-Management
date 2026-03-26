import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const staffApi = createApi({
  reducerPath: 'staffApi',
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
  tagTypes: ['Shift', 'Role', 'Staff', 'Attendance', 'LeaveType', 'Leave', 'Payroll'],
  endpoints: (builder) => ({
    // Shifts
    getShifts: builder.query({
      query: (params) => ({ url: '/shifts', params }),
      providesTags: (res) => res?.data ? [...res.data.map(i => ({ type: 'Shift', id: i.id })), { type: 'Shift', id: 'LIST' }] : [{ type: 'Shift', id: 'LIST' }],
    }),
    createShift: builder.mutation({
      query: (body) => ({ url: '/shifts', method: 'POST', body }),
      invalidatesTags: [{ type: 'Shift', id: 'LIST' }],
    }),
    updateShift: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/shifts/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Shift', id }, { type: 'Shift', id: 'LIST' }],
    }),
    deleteShift: builder.mutation({
      query: (id) => ({ url: `/shifts/${id}`, method: 'DELETE' }),
      invalidatesTags: (res, err, id) => [{ type: 'Shift', id }, { type: 'Shift', id: 'LIST' }],
    }),

    // Roles
    getRoles: builder.query({
      query: (params) => ({ url: '/roles', params }),
      providesTags: (res) => res?.data ? [...res.data.map(i => ({ type: 'Role', id: i.id })), { type: 'Role', id: 'LIST' }] : [{ type: 'Role', id: 'LIST' }],
    }),
    createRole: builder.mutation({
      query: (body) => ({ url: '/roles', method: 'POST', body }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    updateRole: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/roles/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Role', id }, { type: 'Role', id: 'LIST' }],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: (res, err, id) => [{ type: 'Role', id }, { type: 'Role', id: 'LIST' }],
    }),

    // Staff
    getStaff: builder.query({
      query: (params) => ({ url: '/staff', params }),
      providesTags: (res) => res?.data ? [...res.data.map(i => ({ type: 'Staff', id: i.id })), { type: 'Staff', id: 'LIST' }] : [{ type: 'Staff', id: 'LIST' }],
    }),
    createStaff: builder.mutation({
      query: (body) => ({ url: '/staff', method: 'POST', body }),
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }, { type: 'Attendance', id: 'LIST' }, { type: 'Leave', id: 'LIST' }, { type: 'Payroll', id: 'LIST' }],
    }),
    updateStaff: builder.mutation({
      query: ({ id, body }) => {
        const formData = body instanceof FormData ? body : new FormData();
        if (!(body instanceof FormData)) {
          Object.entries(body).forEach(([k, v]) => formData.append(k, v));
        }
        formData.append('_method', 'PUT');
        return { url: `/staff/${id}`, method: 'POST', body: formData };
      },
      invalidatesTags: (res, err, { id }) => [{ type: 'Staff', id }, { type: 'Staff', id: 'LIST' }, { type: 'Attendance', id: 'LIST' }, { type: 'Leave', id: 'LIST' }, { type: 'Payroll', id: 'LIST' }],
    }),
    deleteStaff: builder.mutation({
      query: (id) => ({ url: `/staff/${id}`, method: 'DELETE' }),
      invalidatesTags: (res, err, id) => [{ type: 'Staff', id }, { type: 'Staff', id: 'LIST' }],
    }),

    // Attendance
    getAttendances: builder.query({
      query: (params) => ({ url: '/attendances', params }),
      providesTags: (res) => res?.data ? [...res.data.map(i => ({ type: 'Attendance', id: i.id })), { type: 'Attendance', id: 'LIST' }] : [{ type: 'Attendance', id: 'LIST' }],
    }),
    createAttendance: builder.mutation({
      query: (body) => ({ url: '/attendances', method: 'POST', body }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),
    updateAttendance: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/attendances/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Attendance', id }, { type: 'Attendance', id: 'LIST' }],
    }),
    deleteAttendance: builder.mutation({
      query: (id) => ({ url: `/attendances/${id}`, method: 'DELETE' }),
      invalidatesTags: (res, err, id) => [{ type: 'Attendance', id }, { type: 'Attendance', id: 'LIST' }],
    }),

    // Leave Types
    getLeaveTypes: builder.query({
      query: (params) => ({ url: '/leave-types', params }),
      providesTags: (res) => res?.data ? [...res.data.map(i => ({ type: 'LeaveType', id: i.id })), { type: 'LeaveType', id: 'LIST' }] : [{ type: 'LeaveType', id: 'LIST' }],
    }),
    createLeaveType: builder.mutation({
      query: (body) => ({ url: '/leave-types', method: 'POST', body }),
      invalidatesTags: [{ type: 'LeaveType', id: 'LIST' }],
    }),
    updateLeaveType: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/leave-types/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'LeaveType', id }, { type: 'LeaveType', id: 'LIST' }],
    }),
    deleteLeaveType: builder.mutation({
      query: (id) => ({ url: `/leave-types/${id}`, method: 'DELETE' }),
      invalidatesTags: (res, err, id) => [{ type: 'LeaveType', id }, { type: 'LeaveType', id: 'LIST' }],
    }),

    // Leaves
    getLeaves: builder.query({
      query: (params) => ({ url: '/leaves', params }),
      providesTags: (res) => res?.data ? [...res.data.map(i => ({ type: 'Leave', id: i.id })), { type: 'Leave', id: 'LIST' }] : [{ type: 'Leave', id: 'LIST' }],
    }),
    createLeave: builder.mutation({
      query: (body) => ({ url: '/leaves', method: 'POST', body }),
      invalidatesTags: [{ type: 'Leave', id: 'LIST' }],
    }),
    updateLeave: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/leaves/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Leave', id }, { type: 'Leave', id: 'LIST' }],
    }),
    deleteLeave: builder.mutation({
      query: (id) => ({ url: `/leaves/${id}`, method: 'DELETE' }),
      invalidatesTags: (res, err, id) => [{ type: 'Leave', id }, { type: 'Leave', id: 'LIST' }],
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        // Optimistic update for all active Leave queries
        const patchResults = [];
        const state = getState();
        const apiState = state[staffApi.reducerPath];
        
        // Find all subscriptions for getLeaves
        Object.keys(apiState.queries).forEach(key => {
          if (key.startsWith('getLeaves')) {
            patchResults.push(
              dispatch(
                staffApi.util.updateQueryData('getLeaves', apiState.queries[key].originalArgs, (draft) => {
                  if (draft?.data) {
                    draft.data = draft.data.filter(item => item.id !== id);
                  }
                })
              )
            );
          }
        });

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach(patchResult => patchResult.undo());
        }
      },
    }),

    // Payroll
    getPayrolls: builder.query({
      query: (params) => ({ url: '/payrolls', params }),
      providesTags: (res) => res?.data ? [...res.data.map(i => ({ type: 'Payroll', id: i.id })), { type: 'Payroll', id: 'LIST' }] : [{ type: 'Payroll', id: 'LIST' }],
    }),
    getPayrollSummary: builder.query({
      query: (params) => ({ url: '/payrolls/summary', params }),
      providesTags: [{ type: 'Payroll', id: 'SUMMARY' }],
    }),
    createPayroll: builder.mutation({
      query: (body) => ({ url: '/payrolls', method: 'POST', body }),
      invalidatesTags: [{ type: 'Payroll', id: 'LIST' }, { type: 'Payroll', id: 'SUMMARY' }],
    }),
    updatePayroll: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/payrolls/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Payroll', id }, { type: 'Payroll', id: 'LIST' }, { type: 'Payroll', id: 'SUMMARY' }],
    }),
    deletePayroll: builder.mutation({
      query: (id) => ({ url: `/payrolls/${id}`, method: 'DELETE' }),
      invalidatesTags: (res, err, id) => [{ type: 'Payroll', id }, { type: 'Payroll', id: 'LIST' }, { type: 'Payroll', id: 'SUMMARY' }],
    }),
    getHotelInfo: builder.query({
      query: () => '/expenses/hotel-info', // Reusing the endpoint from expenses module if available
    }),
  }),
});

export const {
  useGetShiftsQuery, useCreateShiftMutation, useUpdateShiftMutation, useDeleteShiftMutation,
  useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation,
  useGetStaffQuery, useCreateStaffMutation, useUpdateStaffMutation, useDeleteStaffMutation,
  useGetAttendancesQuery, useCreateAttendanceMutation, useUpdateAttendanceMutation, useDeleteAttendanceMutation,
  useGetLeaveTypesQuery, useCreateLeaveTypeMutation, useUpdateLeaveTypeMutation, useDeleteLeaveTypeMutation,
  useGetLeavesQuery, useCreateLeaveMutation, useUpdateLeaveMutation, useDeleteLeaveMutation,
  useGetPayrollsQuery, useGetPayrollSummaryQuery, useCreatePayrollMutation, useUpdatePayrollMutation, useDeletePayrollMutation,
  useGetHotelInfoQuery,
} = staffApi;
