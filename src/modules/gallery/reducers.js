import { handleActions } from "redux-actions"
import { createSelector } from "reselect"
import { initializePagination } from "../../common/models"
import { list, movePage, select, edit } from "./actions"
import { PER_PAGE } from "./models"

const initialState = {
  // 作品一覧
  items: [],
  // ページネーション
  pagination: {},
  // 選択中の作品一覧
  selectedByItemId: {},
  // 編集中の作品ID
  editingItemId: null
}

const handlers = {
  [list]: (state, action) => ({
    ...state,
    ...{
      items: action.payload,
      pagination: initializePagination(action.payload, PER_PAGE),
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
}

export default handleActions(handlers, initialState)

/**
 * 作品の編集状態を更新する
 */
const updateEditing = (items, editingItemId) => {
  for (let item of items) {
    if (item.editing) {
      delete item.editing
    }
    if (item.id === editingItemId) {
      item.editing = true
    }
  }
  return [...items]
}

export const getItemsByPage = createSelector(
  [state => state.items, state => state.pagination],
  (items, pagination) => {
    const itemsByPage = items.slice(
      pagination.offset,
      pagination.offset + pagination.perPage
    )
    return [...itemsByPage]
  }
)

export const getItemById = createSelector(
  [state => state.items, state => state.editingItemId],
  (items, editingItemId) => {
    const item = items.find(_item => _item.id === editingItemId)
    return item || {}
  }
)
