import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer from './slices/auth.slice';
import { apis } from './services';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ...Object.fromEntries(
            apis.map((api) => [api.reducerPath, api.reducer])
        ),
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            apis.map((api) => api.middleware)
        ),
});

setupListeners(store.dispatch);

export default store;
