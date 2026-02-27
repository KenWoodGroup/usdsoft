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
                params.set('type', 'product');
                // Если поиск пустой, но выбран завод, передаем 'all'
                const searchTermForApi = (!search && location_id && location_id !== 'all') ? 'all' : search;
                params.set('searchTerm', searchTermForApi);

                if (location_id && location_id !== 'all') {
                    params.set('location_id', location_id);
                }

                return {
                    url: `erp/stock/by-name?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: ['Stock'],
        }),

        // Эндпоинт для поиска заводов по названию (возвращает массив заводов)
        searchFactoryByName: builder.query({
            query: ({ factoryName, location_id }) => {
                let url = `/erp/locations/by-name/factory/${factoryName}`;
                if (location_id) {
                    url += `?location_id=${location_id}`;
                }
                return {
                    url,
                    method: 'GET',
                };
            },
            providesTags: ['Stock'],
            // Трансформируем ответ для удобства
            transformResponse: (response) => {
                // API возвращает массив: [{ id: "...", name: "..." }, ...]
                return Array.isArray(response) ? response : [];
            },
        }),
    }),
});

export const {
    useStockGetSearchQuery,
    useSearchFactoryByNameQuery,
    useLazySearchFactoryByNameQuery,
} = stockApi;