import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PER_PAGE } from "@/constants";
import { ArtsState, ArtState, PaginationState } from "@/types";
import { createPagination } from "@/utils/pageUtil";

const initialState: ArtsState = {
  items: [],
  pagination: createPagination(PER_PAGE, 0),
  checkedItemIds: [],
};

export const slice = createSlice({
  name: "artsSlice",
  initialState,
  reducers: {
    fetchItems: (state, action: PayloadAction<ArtState[]>) => {
      state.items = action.payload;
      state.pagination = createPagination(PER_PAGE, action.payload.length);
      state.checkedItemIds = [];
    },
    movePage: (state, action: PayloadAction<PaginationState>) => {
      state.pagination = action.payload;
    },
    checkItem: (state, action: PayloadAction<string[]>) => {
      state.checkedItemIds = action.payload;
    },
    edit: (state, action: PayloadAction<string>) => {
      state.editingItemId = action.payload;
    },
    cancelEdit: (state) => {
      state.editingItemId = undefined;
    },
  },
});

export const { fetchItems, movePage, checkItem, edit, cancelEdit } = slice.actions;
export default slice.reducer;
