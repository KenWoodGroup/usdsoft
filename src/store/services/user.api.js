import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../baseQuary/axiosBaseQuery';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: axiosBaseQuery({ usePublicApi: false }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        getUserByLocationId: builder.query({
            query: (id) => ({
                url: `/user/locationId/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [
                { type: 'User', id },
            ],
        }),

        editUser: builder.mutation({
            query: ({ id, data }) => ({
                url: `/user/${id}`,
                method: 'PUT',
                data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'User', id },
            ],
        }),
        
        changePassword: builder.mutation({
            query: ({ id, data }) => ({
                url: `/user/change-password/${id}`,
                method: 'POST',
                data
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'User', id },
            ],
        })
    }),
});


export const { useGetUserByLocationIdQuery, useEditUserMutation, useChangePasswordMutation } = userApi;
