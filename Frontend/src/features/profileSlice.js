import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
    },
    reducers: {
        setProfile: (state, action) => {
            state.user = action.payload
        }
    }
})

export const { setProfile } = profileSlice.actions
export default profileSlice.reducer