import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../baseQuary/axiosBaseQuery';

export const locationApi = createApi({
    reducerPath: 'locationApi',
    baseQuery: axiosBaseQuery({ usePublicApi: false }),
    tagTypes: ['Location'],
    endpoints: (builder) => ({
        getLocationById: builder.query({
            query: (id) => ({
                url: `/locations/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [
                { type: 'Location', id },
            ],
        }),
        GetFactory: builder.query({
            query: (FactoryName ) => ({
                url: `/locations/by-name/factory/12`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [
                { type: 'factory', id },
            ],
        }),
    }),
});

export const { useGetLocationByIdQuery,useGetFactoryQuery } = locationApi;
