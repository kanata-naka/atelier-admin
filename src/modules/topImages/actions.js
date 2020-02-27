import { createAction } from "redux-actions"
import { MODULE_NAME } from "./models"

// トップ画像の一覧を表示する
export const list = createAction(MODULE_NAME + "_" + "list")
// トップ画像の一覧で項目を選択する
export const select = createAction(MODULE_NAME + "_" + "select")
// トップ画像を編集する
export const edit = createAction(MODULE_NAME + "_" + "edit")
// トップ画像の編集をキャンセルする
export const cancelEdit = createAction(MODULE_NAME + "_" + "cancelEdit")
