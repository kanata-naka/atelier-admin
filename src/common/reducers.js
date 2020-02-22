import { handleActions } from "redux-actions"
import {
  signedIn,
  signedOut,
  fetchStart,
  fetchSucceeded,
  fetchFailed
} from "./actions"

const initialState = {
  user: null,
  fetching: {}
}

export default handleActions(
  {
    [signedIn]: (state, action) => ({
      ...state,
      ...{ user: action.payload }
    }),
    [signedOut]: state => ({
      ...state,
      ...{ user: {} }
    }),
    [fetchStart]: (state, action) => ({
      ...state,
      ...{ fetching: updateFetching(state.fetching, action.payload, true) }
    }),
    [fetchSucceeded]: (state, action) => ({
      ...state,
      ...{ fetching: updateFetching(state.fetching, action.payload, false) }
    }),
    [fetchFailed]: (state, action) => ({
      ...state,
      ...{ fetching: updateFetching(state.fetching, action.payload, false) }
    })
  },
  initialState
)

const updateFetching = (fetching, payload, isFetching) => {
  const name = payload.config.name || payload.config.url
  return { ...fetching, ...{ [name]: isFetching } }
}
