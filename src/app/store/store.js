import { configureStore } from "@reduxjs/toolkit";
import mimeReducer from "./mimeSlice";

export const store = configureStore({
  reducer: {
    mime: mimeReducer,
    // Add other reducers here as your app grows
  },
});
