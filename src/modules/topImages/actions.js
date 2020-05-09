import { createAction } from "redux-actions"
import { MODULE_NAME } from "./models"

// トップ画像の一覧を表示する
export const list = createAction(`${MODULE_NAME}/LIST`)
// トップ画像の一覧で項目を選択する
export const select = createAction(`${MODULE_NAME}/SELECT`)
// トップ画像を編集する
export const edit = createAction(`${MODULE_NAME}/EDIT`)
// トップ画像の編集をキャンセルする
export const cancelEdit = createAction(`${MODULE_NAME}/CANCEL_EDIT`)
