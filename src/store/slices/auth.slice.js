// store/slices/auth.slice.js
import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
    access_token: Cookies.get('access_token') || null,
    refresh_token: Cookies.get('refresh_token') || null,
    role: Cookies.get('role') || null,
    isAuthenticated: !!Cookies.get('access_token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth(state, action) {
            const { access_token, refresh_token, role, location_id, user_id } = action.payload;

            state.access_token = access_token;
            state.refresh_token = refresh_token;
            state.role = role;
            state.location_id = location_id;
            state.user_id = user_id;
            state.isAuthenticated = true;

            Cookies.set('access_token', access_token);
            Cookies.set('refresh_token', refresh_token);
            Cookies.set('role', role);
            Cookies.set('location_id', location_id);
            Cookies.set('user_id', user_id);
        },

        logout(state) {
            state.access_token = null;
            state.refresh_token = null;
            state.role = null;
            state.location_id = null;
            state.user_id = null;
            state.isAuthenticated = false;
            
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            Cookies.remove('role');
            Cookies.remove('location_id');
            Cookies.remove('user_id');
        },
    },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
