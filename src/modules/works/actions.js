import { createAction } from "redux-actions"
import { MODULE_NAME } from "./models"

// 作品一覧を表示する
export const list = createAction(MODULE_NAME + "_" + "list")
// ページを移動する
export const movePage = createAction(MODULE_NAME + "_" + "movePage")
// 作品を選択する
export const select = createAction(MODULE_NAME + "_" + "select")
// 作品を編集する
export const edit = createAction(MODULE_NAME + "_" + "edit")
