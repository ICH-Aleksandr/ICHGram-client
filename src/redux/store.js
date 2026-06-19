import { configureStore } from "@reduxjs/toolkit";
import templateSlice from "./slices/templateSlice";

const store = configureStore({
  reducer: {
    template: templateSlice.reducer,
  },
});

export default store;
