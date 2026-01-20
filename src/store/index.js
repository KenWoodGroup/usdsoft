// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './services/auth.api';
import authReducer from './slices/auth.slice';

export const store = configureStore({
    reducer: {
        auth: authReducer,              
        [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authApi.middleware),
});

setupListeners(store.dispatch);
export default store;
