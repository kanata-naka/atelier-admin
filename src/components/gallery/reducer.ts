import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PER_PAGE } from "@/constants";
import { GalleryState, ArtState, PaginationState } from "@/types";
import { createPagination } from "@/utils/pageUtil";

const initialState: GalleryState = {
  items: [],
  pagination: createPagination(PER_PAGE, 0),
  selectedItemIds: [],
  isFormDirty: false,
};

export const slice = createSlice({
  name: "gallerySlice",
  initialState,
  reducers: {
    fetchItems: (state, action: PayloadAction<ArtState[]>) => {
      state.items = action.payload;
      state.pagination = createPagination(PER_PAGE, action.payload.length);
      state.selectedItemIds = [];
    },
    movePage: (state, action: PayloadAction<PaginationState>) => {
      state.pagination = action.payload;
    },
    selectItem: (state, action: PayloadAction<string[]>) => {
      state.selectedItemIds = action.payload;
    },
    edit: (state, action: PayloadAction<string>) => {
      state.editingItemId = action.payload;
    },
    cancelEdit: (state) => {
      state.editingItemId = undefined;
    },
    touchForm: (state, action: PayloadAction<boolean>) => {
      state.isFormDirty = action.payload;
    },
  },
});

export const { fetchItems, movePage, selectItem, edit, cancelEdit, touchForm } = slice.actions;
export default slice.reducer;
