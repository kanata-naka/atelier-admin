import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CommonState } from "@/types";

const initialState: CommonState = {
  isLoading: false,
};

export const slice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setLoading } = slice.actions;
export default slice.reducer;
