import { User } from "@firebase/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "@/types";

const initialState: AuthState = {
  status: "not_signed_in",
  user: null,
};

export const slice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    notSignedIn: (state) => {
      state.status = "not_signed_in";
      state.user = null;
    },
    signingIn: (state) => {
      state.status = "signing_in";
      state.user = null;
    },
    signedIn: (state, action: PayloadAction<User>) => {
      state.status = "signed_in";
      state.user = action.payload;
    },
    signInFailed: (state) => {
      state.status = "sign_in_failed";
      state.user = null;
    },
  },
});

export const { signingIn, signedIn, signInFailed, notSignedIn } = slice.actions;
export default slice.reducer;
