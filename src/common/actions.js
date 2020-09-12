import { createAction } from "redux-actions";

// ログインした
export const signedIn = createAction("AUTH/SIGNED_IN");
// ログアウトした
export const signedOut = createAction("AUTH/SIGNED_OUT");
// ログインに失敗した
export const signInFailed = createAction("AUTH/SIGN_IN_FAILED");
