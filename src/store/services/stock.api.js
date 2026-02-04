// store/services/stock.api.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../baseQuary/axiosBaseQuery';

export const stockApi = createApi({
    reducerPath: 'stockApi',
    baseQuery: axiosBaseQuery({ usePublicApi: false }),
    tagTypes: ['Stock'],
    endpoints: (builder) => ({
        stockGetSearch: builder.query({
            query: ({ page = 1, search = '' }) => ({
                url: search
                    ? `/stock/by-name/product/${search}?page=${page}`
                    : `/stock/by-name/product?page=${page}`,
                method: 'GET',
            }),
            providesTags: ['Stock'],
        }),
    }),
});

export const { useStockGetSearchQuery } = stockApi;