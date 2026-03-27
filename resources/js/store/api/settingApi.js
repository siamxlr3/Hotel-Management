import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const settingApi = createApi({
  reducerPath: 'settingApi',
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
  tagTypes: ['Tax', 'GlobalDiscount', 'CategoryDiscount', 'Dropdown'],
  endpoints: (builder) => ({
    // Taxes
    getTaxes: builder.query({
      query: (params) => ({ url: '/taxes', params }),
      providesTags: (res) => res?.data 
        ? [...res.data.map(i => ({ type: 'Tax', id: i.id })), { type: 'Tax', id: 'LIST' }] 
        : [{ type: 'Tax', id: 'LIST' }],
    }),
    createTax: builder.mutation({
      query: (body) => ({ url: '/taxes', method: 'POST', body }),
      invalidatesTags: [{ type: 'Tax', id: 'LIST' }],
    }),
    updateTax: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/taxes/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Tax', id }, { type: 'Tax', id: 'LIST' }],
    }),
    deleteTax: builder.mutation({
      query: (id) => ({ url: `/taxes/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Tax', id: 'LIST' }],
    }),

    // Global Discounts
    getGlobalDiscounts: builder.query({
      query: (params) => ({ url: '/global-discounts', params }),
      providesTags: (res) => res?.data 
        ? [...res.data.map(i => ({ type: 'GlobalDiscount', id: i.id })), { type: 'GlobalDiscount', id: 'LIST' }] 
        : [{ type: 'GlobalDiscount', id: 'LIST' }],
    }),
    createGlobalDiscount: builder.mutation({
      query: (body) => ({ url: '/global-discounts', method: 'POST', body }),
      invalidatesTags: [{ type: 'GlobalDiscount', id: 'LIST' }],
    }),
    updateGlobalDiscount: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/global-discounts/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'GlobalDiscount', id }, { type: 'GlobalDiscount', id: 'LIST' }],
    }),
    deleteGlobalDiscount: builder.mutation({
      query: (id) => ({ url: `/global-discounts/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'GlobalDiscount', id: 'LIST' }],
    }),

    // Category Discounts
    getCategoryDiscounts: builder.query({
      query: (params) => ({ url: '/category-discounts', params }),
      providesTags: (res) => res?.data 
        ? [...res.data.map(i => ({ type: 'CategoryDiscount', id: i.id })), { type: 'CategoryDiscount', id: 'LIST' }] 
        : [{ type: 'CategoryDiscount', id: 'LIST' }],
    }),
    createCategoryDiscount: builder.mutation({
      query: (body) => ({ url: '/category-discounts', method: 'POST', body }),
      invalidatesTags: [{ type: 'CategoryDiscount', id: 'LIST' }],
    }),
    updateCategoryDiscount: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/category-discounts/${id}`, method: 'PUT', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'CategoryDiscount', id }, { type: 'CategoryDiscount', id: 'LIST' }],
    }),
    deleteCategoryDiscount: builder.mutation({
      query: (id) => ({ url: `/category-discounts/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'CategoryDiscount', id: 'LIST' }],
    }),

    // Dropdowns
    getRoomsDropdown: builder.query({
      query: () => '/rooms-dropdown',
      providesTags: [{ type: 'Dropdown', id: 'ROOMS' }],
      transformResponse: (res) => res?.data || res,
    }),
    getCategoriesDropdown: builder.query({
      query: () => '/categories-dropdown',
      providesTags: [{ type: 'Dropdown', id: 'CATEGORIES' }],
      transformResponse: (res) => res?.data || res,
    }),
  }),
});

export const {
  useGetTaxesQuery, useCreateTaxMutation, useUpdateTaxMutation, useDeleteTaxMutation,
  useGetGlobalDiscountsQuery, useCreateGlobalDiscountMutation, useUpdateGlobalDiscountMutation, useDeleteGlobalDiscountMutation,
  useGetCategoryDiscountsQuery, useCreateCategoryDiscountMutation, useUpdateCategoryDiscountMutation, useDeleteCategoryDiscountMutation,
  useGetRoomsDropdownQuery, useGetCategoriesDropdownQuery,
} = settingApi;
