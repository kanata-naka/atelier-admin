import { createAction } from "redux-actions"

export const signedIn = createAction("auth_signedIn")
export const signedOut = createAction("auth_signedOut")

export const fetchStart = createAction("api_fetchStart")
export const fetchSucceeded = createAction("api_fetchSucceded")
export const fetchFailed = createAction("api_fetchFailed")
