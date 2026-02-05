// store/services/stock.api.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../baseQuary/axiosBaseQuery';

export const stockApi = createApi({
    reducerPath: 'stockApi',
    baseQuery: axiosBaseQuery({ usePublicApi: false }),
    tagTypes: ['Stock'],
    endpoints: (builder) => ({
        stockGetSearch: builder.query({
            query: ({ page = 1, search = '', location_id }) => {
                const params = new URLSearchParams();

                params.set('page', page);

                if (location_id && location_id !== 'all') {
                    params.set('location_id', location_id);
                }

                return {
                    url: search
                        ? `/stock/by-name/product/${search}?${params.toString()}`
                        : `/stock/by-name/product?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: ['Stock'],
        }),
    }),
});

export const { useStockGetSearchQuery } = stockApi;
