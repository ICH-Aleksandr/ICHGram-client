import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import postsSlice from "./slices/postsSlice";

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    posts: postsSlice.reducer,
  },
});

export default store;
