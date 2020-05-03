import { handleActions } from "redux-actions"
import { list, select, edit, cancelEdit } from "./actions"

const initialState = {
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
  [edit]: state => ({
    ...state,
    ...{ editing: true }
  }),
  [cancelEdit]: state => ({
    ...state,
    ...{ editing: false }
  })
}

export default handleActions(handlers, initialState)
