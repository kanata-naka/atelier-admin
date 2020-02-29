import { handleActions } from "redux-actions"
import { createSelector } from "reselect"
import { list, select, edit, cancelEdit } from "./actions"

const initialState = {
  // トップ画像一覧
  items: [],
  // 選択中のトップ画像一覧
  selectedByItemId: {},
  editing: false
}

const handlers = {
  [list]: (state, action) => ({
    ...state,
    ...{
      items: action.payload,
      selectedByItemId: {}
    }
  }),
  [select]: (state, action) => ({
    ...state,
    ...{ selectedByItemId: action.payload }
  }),
  [edit]: (state, action) => ({
    ...state,
    ...{ editing: true }
  }),
  [cancelEdit]: (state, action) => ({
    ...state,
    ...{ editing: false }
  })
}

export default handleActions(handlers, initialState)

/**
 * 最後の表示順を取得する
 */
export const getLastOrder = createSelector([state => state.items], items => {
  const orders = items.map(item => item.order)
  return Math.max(...orders)
})
