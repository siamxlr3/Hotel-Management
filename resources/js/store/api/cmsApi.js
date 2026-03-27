import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const formData = (payload) => {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    if (Array.isArray(v)) {
      v.forEach(item => fd.append(`${k}[]`, item));
    } else {
      fd.append(k, v);
    }
  });
  return fd;
};

export const cmsApi = createApi({
  reducerPath: 'cmsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/cms',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Home', 'About', 'Feature', 'Offer', 'Gallery', 'Contact'],
  endpoints: (builder) => ({
    // Generic CMS factories to avoid duplication
    ...['Home', 'About', 'Feature', 'Offer', 'Gallery', 'Contact'].reduce((acc, name) => {
      const endpoint = name === 'Home' ? '/home' : `/home-${name.toLowerCase()}${name === 'Feature' || name === 'Offer' || name === 'Gallery' ? 's' : ''}`;
      const pluralEndpoint = name === 'Home' ? '/home' : 
                             name === 'About' ? '/home-about' :
                             name === 'Feature' ? '/home-features' :
                             name === 'Offer' ? '/home-offers' :
                             name === 'Gallery' ? '/home-gallery' :
                             '/home-contact';

      acc[`get${name}`] = builder.query({
        query: (params) => ({ url: pluralEndpoint, params }),
        providesTags: (res) => res?.data 
          ? [...res.data.map(i => ({ type: name, id: i.id })), { type: name, id: 'LIST' }] 
          : [{ type: name, id: 'LIST' }],
      });
      acc[`create${name}`] = builder.mutation({
        query: (payload) => ({ 
          url: pluralEndpoint, 
          method: 'POST', 
          body: formData(payload) 
        }),
        invalidatesTags: [{ type: name, id: 'LIST' }],
      });
      acc[`update${name}`] = builder.mutation({
        query: (payload) => {
          const fd = formData(payload);
          const id = payload instanceof FormData ? payload.get('id') : payload.id;
          if (!(payload instanceof FormData)) fd.append('_method', 'PUT');
          return { url: `${pluralEndpoint}/${id}`, method: 'POST', body: fd };
        },
        invalidatesTags: (res, err, payload) => {
          const id = payload instanceof FormData ? payload.get('id') : payload.id;
          return [{ type: name, id }, { type: name, id: 'LIST' }];
        },
      });
      acc[`delete${name}`] = builder.mutation({
        query: (id) => ({ url: `${pluralEndpoint}/${id}`, method: 'DELETE' }),
        invalidatesTags: [{ type: name, id: 'LIST' }],
      });
      return acc;
    }, {}),
  }),
});

export const {
  useGetHomeQuery, useCreateHomeMutation, useUpdateHomeMutation, useDeleteHomeMutation,
  useGetAboutQuery, useCreateAboutMutation, useUpdateAboutMutation, useDeleteAboutMutation,
  useGetFeatureQuery, useCreateFeatureMutation, useUpdateFeatureMutation, useDeleteFeatureMutation,
  useGetOfferQuery, useCreateOfferMutation, useUpdateOfferMutation, useDeleteOfferMutation,
  useGetGalleryQuery, useCreateGalleryMutation, useUpdateGalleryMutation, useDeleteGalleryMutation,
  useGetContactQuery, useCreateContactMutation, useUpdateContactMutation, useDeleteContactMutation,
} = cmsApi;
