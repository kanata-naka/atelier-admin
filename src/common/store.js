import {
  createStore as _createStore,
  applyMiddleware,
  combineReducers
} from "redux"
import { reducer as formReducer } from "redux-form"
import logger from "redux-logger"
import commonReducers from "./reducers"

const createStore = (reducers, initialState) => {
  const reducersForCombine = {
    form: formReducer, // redux-formのreducer
    common: commonReducers,
    ...reducers
  }
  const middlewares = []
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    middlewares.push(logger)
  }
  const enhancer = applyMiddleware.apply({}, middlewares)
  const store = _createStore(
    combineReducers(reducersForCombine),
    initialState,
    enhancer
  )
  store.reducers = reducersForCombine
  return store
}

export const initializeStore = (reducers, initialState) => {
  if (typeof window === "undefined") {
    return createStore(reducers, initialState)
  }
  if (!window.store) {
    window.store = createStore(reducers, initialState)
  } else {
    // FIXME
    // store.replaceReducerを実行すると1つ前のページの再renderが発生してしまう（原因不明）
    // →過去のreducerとマージした上で実行することで回避する
    let reducersForCombine = window.store.reducers
    Object.keys(reducers)
      .filter(reducerName => !(reducerName in reducersForCombine))
      .forEach(reducerName => {
        reducersForCombine = {
          ...reducersForCombine,
          [reducerName]: reducers[reducerName]
        }
      })
    window.store.replaceReducer(combineReducers(reducersForCombine))
    window.store.reducers = reducersForCombine
  }
  return window.store
}
