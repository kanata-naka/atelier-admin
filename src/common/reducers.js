import { handleActions } from "redux-actions";
import { signedIn, signedOut, signInFailed } from "./actions";
import {
  AUTH_STATE_NOT_SIGNED_IN,
  AUTH_STATE_SIGNED_IN,
  AUTH_STATE_SIGN_IN_FAILED,
  AUTH_STATE_SIGNED_OUT
} from "./models";

const initialState = {
  authState: AUTH_STATE_NOT_SIGNED_IN,
  user: null
};

export default handleActions(
  {
    [signedIn]: (state, action) => ({
      ...state,
      ...{ authState: AUTH_STATE_SIGNED_IN, user: action.payload }
    }),
    [signedOut]: state => ({
      ...state,
      ...{ authState: AUTH_STATE_SIGNED_OUT, user: null }
    }),
    [signInFailed]: state => ({
      ...state,
      ...{ authState: AUTH_STATE_SIGN_IN_FAILED, user: null }
    })
  },
  initialState
);
