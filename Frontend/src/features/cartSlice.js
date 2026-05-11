import { createSlice } from "@reduxjs/toolkit";

const CartSlice = createSlice({
    name: "cart",
    initialState: {
        cartItems: [],
        total: 0
    },
    reducers: {
        getCart: (state, action) => {
            state.cartItems = Array.isArray(action.payload.items)
            ? action.payload.items
            : [action.payload.items]; // convert object → array
            state.total = Number(action.payload.total) || 0;
        },
        addToCart: (state, action) => {
            if (!Array.isArray(state.cartItems)) {
                state.cartItems = [];
            }
            const cartItem = action.payload;
            const item = state.cartItems.find((item) => item.id === cartItem.id);

            if (item) {
                item.quantity = cartItem.quantity;
            }
            else {
                state.cartItems.push(cartItem);
            }
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((item) => item.id !== action.payload.id)
        },
        updateCart: (state, action) => {
            const {id, quantity} = action.payload
            const item = state.cartItems.find((item) => item.id === id)
            if(item){
                item.quantity = quantity
            }
        },
        clearCart: (state) => {
            state.cartItems = []
            state.total = 0
        }
    }, 
});

export const { addToCart, getCart, removeFromCart, updateCart, clearCart } = CartSlice.actions;
export default CartSlice.reducer; 
