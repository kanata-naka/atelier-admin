import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PER_PAGE } from "@/constants";
import { EpisodesState, PaginationState } from "@/types";
import { ComicGetResponse } from "@/types/api/comics";
import { createPagination, resetPagination } from "@/utils/pageUtil";

const initialState: EpisodesState = {
  items: [],
  pagination: createPagination(PER_PAGE, 0),
  selectedItemIds: [],
  isFormDirty: false,
};

export const slice = createSlice({
  name: "episodesSlice",
  initialState,
  reducers: {
    fetchItems: (state, action: PayloadAction<ComicGetResponse>) => {
      state.parent = action.payload;
      state.items = action.payload.episodes;
      state.pagination = resetPagination(state.pagination.page, PER_PAGE, action.payload.episodes.length);
      state.selectedItemIds = [];
    },
    movePage: (state, action: PayloadAction<PaginationState>) => {
      state.pagination = action.payload;
    },
    selectItem: (state, action: PayloadAction<string[]>) => {
      state.selectedItemIds = action.payload;
    },
    edit: (state, action: PayloadAction<{ id: string; episode?: ComicGetResponse.Episode }>) => {
      if (action.payload.episode)
        state.items[state.items.findIndex((item) => item.id === action.payload.id)] = action.payload.episode;
      state.editingItemId = action.payload.id;
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
