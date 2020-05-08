import { handleActions } from "redux-actions"
import {
  signedIn,
  signedOut,
  signInFailed,
  fetchStart,
  fetchSucceeded,
  fetchFailed
} from "./actions"
import {
  AUTH_STATE_NOT_SIGNED_IN,
  AUTH_STATE_SIGNED_IN,
  AUTH_STATE_SIGN_IN_FAILED
} from "./models"

const initialState = {
  authState: AUTH_STATE_NOT_SIGNED_IN,
  user: null,
  fetching: {}
}

export default handleActions(
  {
    [signedIn]: (state, action) => ({
      ...state,
      ...{ authState: AUTH_STATE_SIGNED_IN, user: action.payload }
    }),
    [signedOut]: state => ({
      ...state,
      ...{ authState: AUTH_STATE_NOT_SIGNED_IN, user: null }
    }),
    [signInFailed]: state => ({
      ...state,
      ...{ authState: AUTH_STATE_SIGN_IN_FAILED, user: null }
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
  return { ...fetching, ...{ [payload.name]: isFetching } }
}
