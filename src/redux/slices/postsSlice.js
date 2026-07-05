import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lastCreatedAt: 0,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    postCreated(state) {
      state.lastCreatedAt = Date.now();
    },
  },
});

export const { postCreated } = postsSlice.actions;
export default postsSlice;
