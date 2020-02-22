import { createAction } from "redux-actions"

// ログインした
export const signedIn = createAction("signedIn")
// ログアウトした
export const signedOut = createAction("signedOut")

// APIの呼び出しを開始する
export const fetchStart = createAction("api_" + "fetchStart")
// APIの呼び出しに成功した
export const fetchSucceeded = createAction("api_" + "fetchSucceded")
// APIの呼び出しに失敗した
export const fetchFailed = createAction("api_" + "fetchFailed")
