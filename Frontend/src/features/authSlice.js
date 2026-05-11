import { createSlice } from "@reduxjs/toolkit";

const AuthSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        initialized: false
    },
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload
            state.isAuthenticated = true
            state.initialized = true
        },
        authInitialized: (state) => {
            state.initialized = true
        },
        logout: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.initialized = true
        }
    }
})

export const { loginSuccess, authInitialized, logout } = AuthSlice.actions
export default AuthSlice.reducer
