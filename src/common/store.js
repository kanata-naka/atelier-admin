import { createStore, combineReducers } from "redux"
import { reducer as formReducer } from "redux-form"
import commonReducers from "./reducers"

export const initializeStore = (reducers, isServer, initialState) => {
  const combinedReducers = combineReducers({
    form: formReducer, // redux-formのreducer
    common: commonReducers,
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
