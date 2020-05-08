import { handleActions } from "redux-actions"
import {
  signedIn,
  signedOut,
  signInFailed,
  fetchStart,
  fetchSucceeded,
  fetchFailed
} from "./actions"
import { NOT_SIGNED_IN, SIGNED_IN, SIGN_IN_FAILED } from "./models"

const initialState = {
  status: NOT_SIGNED_IN,
  user: null,
  fetching: {}
}

export default handleActions(
  {
    [signedIn]: (state, action) => ({
      ...state,
      ...{ status: SIGNED_IN, user: action.payload }
    }),
    [signedOut]: state => ({
      ...state,
      ...{ status: NOT_SIGNED_IN, user: null }
    }),
    [signInFailed]: state => ({
      ...state,
      ...{ status: SIGN_IN_FAILED, user: null }
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
