import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TopImageState, TopImagesState } from "@/types";

const initialState: TopImagesState = {
  items: [],
  editing: false,
};

export const slice = createSlice({
  name: "topImagesSlice",
  initialState,
  reducers: {
    fetchItems: (state, action: PayloadAction<TopImageState[]>) => {
      state.items = action.payload;
    },
    edit: (state) => {
      state.editing = true;
    },
    cancelEdit: (state) => {
      state.editing = false;
    },
  },
});

export const { fetchItems, edit, cancelEdit } = slice.actions;
export default slice.reducer;
