import { createSlice } from "@reduxjs/toolkit";

const initialState = { currentUser: null, loading: false, error: false };

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
    },
    signInSuccess: (state, action) => {
      state.loading = false;
      state.currentUser = action.payload;
    },
    signInFailure: (state) => {
      state.loading = false;
      state.error = true;
    },
    logout: (state) => {
      state.currentUser = null;
    },
  },
});

export const { signInStart, signInSuccess, signInFailure, logout } =
  userSlice.actions;

export default userSlice.reducer;
