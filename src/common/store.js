import { createStore, combineReducers } from "redux"
import { reducer as formReducer } from "redux-form"
import commonReducers from "./reducers"

export const initialize = (reducers, isServer, initialState) => {
  const combinedReducers = combineReducers({
    common: commonReducers,
    // redux-formのreducerを追加する
    form: formReducer,
    ...reducers
  })
  const store = createStore(combinedReducers, initialState)
  if (isServer && typeof window === "undefined") {
    return store
  }
  if (!window.store) {
    window.store = store
  }
  return window.store
}
