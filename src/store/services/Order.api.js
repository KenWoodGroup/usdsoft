import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../baseQuary/axiosBaseQuery';

export const orderApi = createApi({
    reducerPath: 'orderApi',
    baseQuery: axiosBaseQuery({ usePublicApi: false }),
    tagTypes: ['Order'],
    endpoints: (builder) => ({
        CreateOrder: builder.mutation({
            query: (data) => ({
                url: `/offers`,
                method: 'POST',
                data
            }),
            providesTags: ['Order'],
        }),
        GetOrders: builder.query({
            query: ({ id, page }) => ({
                url: `/offers/location?location_id=${id}&page=${page}&limit=20`,
                method: 'GET',
            }),
            providesTags: ['Order'],
        }),
        GetOrderById: builder.query({
            query: (id) => ({
                url: `/offers/${id}`,
                method: 'GET',
            }),
            providesTags: ['Order'],
        }),
        DeleteOrders: builder.mutation({
            query: (id) => ({
                url: `/offers/${id}`,
                method: 'DELETE'
            }),
            providesTags: ['Order'],
        })
    }),
});

export const { useCreateOrderMutation, useGetOrdersQuery, useDeleteOrdersMutation, useGetOrderByIdQuery } = orderApi;