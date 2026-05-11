import { configureStore } from "@reduxjs/toolkit";
import cartReducer from './cartSlice'
import authReducer from "./authSlice";
import profileReducer from './profileSlice'

const store = configureStore({
    reducer: {
        cart: cartReducer,
        auth: authReducer,
        profile: profileReducer,
    },
});

export default store