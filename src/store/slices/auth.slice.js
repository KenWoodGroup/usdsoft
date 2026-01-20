// store/slices/auth.slice.js
import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
    token: Cookies.get('token') || null,
    role: Cookies.get('role') || null,
    isAuthenticated: !!Cookies.get('token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth(state, action) {
            const { token, role } = action.payload;
            state.token = token;
            state.role = role;
            state.isAuthenticated = !!token;

            Cookies.set('token', token);
            Cookies.set('role', role);
        },
        logout(state) {
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;

            Cookies.remove('token');
            Cookies.remove('role');
        },
    },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
