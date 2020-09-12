import { handleActions } from "redux-actions";
import { createPagination } from "../../common/models";
import { list, movePage, select, edit } from "./actions";
import { PER_PAGE } from "./models";

const initialState = {
  items: [],
  // ページネーション
  pagination: {},
  // 選択中の作品一覧
  selectedByItemId: {},
  // 編集中の作品ID
  editingItemId: null
};

const handlers = {
  [list]: (state, action) => ({
    ...state,
    ...{
      items: action.payload,
      pagination: createPagination(PER_PAGE, action.payload.length),
      selectedByItemId: {},
      editingItemId: null
    }
  }),
  [movePage]: (state, action) => ({
    ...state,
    ...{
      pagination: action.payload,
      // ページを切り替える際に全ての選択状態を解除する
      selectedByItemId: {}
    }
  }),
  [select]: (state, action) => ({
    ...state,
    ...{ selectedByItemId: action.payload }
  }),
  [edit]: (state, action) => ({
    ...state,
    ...{
      items: updateEditing(state.items, action.payload),
      editingItemId: action.payload
    }
  })
};

const updateEditing = (items, editingItemId) => {
  for (let item of items) {
    if (item.editing) {
      delete item.editing;
    }
    if (item.id === editingItemId) {
      item.editing = true;
    }
  }
  return [...items];
};

export default handleActions(handlers, initialState);
