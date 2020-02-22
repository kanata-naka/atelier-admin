import { handleActions } from "redux-actions"
import { loggedIn, loggedOut, fetchStart, fetchSucceeded, fetchFailed } from "./actions"

const initialState = {
  user: {},
  fetching: {}
}

export default handleActions(
  {
    [loggedIn]: (state, action) => ({
      ...state,
      ...{ user: action.payload }
    }),
    [loggedOut]: (state) => ({
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
