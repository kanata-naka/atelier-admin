import { createSlice } from "@reduxjs/toolkit";
import { CommonState } from "@/types";

const initialState: CommonState = {
  isLoading: false,
};

export const slice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {
    loadStart: (state) => {
      state.isLoading = true;
    },
    loadEnd: (state) => {
      state.isLoading = false;
    },
  },
});

export const { loadStart, loadEnd } = slice.actions;
export default slice.reducer;
