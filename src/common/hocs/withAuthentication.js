import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useRouter } from "next/router";
import { signedIn, signedOut, signInFailed } from "../actions";
import { AUTH_STATE_SIGNED_IN, AUTH_STATE_SIGN_IN_FAILED } from "../models";
import { onAuthStateChanged } from "../firebase";
import LoadingEffect from "../components/LoadingEffect";
import Error from "../../pages/_error";

export default Component => {
  const WithAuthentication = ({
    authState,
    onSignedIn,
    onSignInFailed,
    onSignedOut,
    ...props
  }) => {
    const router = useRouter();
    const handleSignedOut = () => {
      onSignedOut();
      // ログインページにリダイレクトする
      router.push("/login");
    };
    useEffect(() => {
      onAuthStateChanged(onSignedIn, onSignInFailed, handleSignedOut);
    }, []);
    switch (authState) {
      case AUTH_STATE_SIGNED_IN:
        return <Component {...props} />;
      case AUTH_STATE_SIGN_IN_FAILED:
        return <Error statusCode={401} />;
      default:
        return <LoadingEffect />;
    }
  };
  const mapStateToProps = state => ({
    authState: state["common"].authState,
    user: state["common"].user
  });
  const mapDispatchToProps = dispatch => ({
    onSignedIn: user => {
      dispatch(signedIn(user));
    },
    onSignInFailed: () => {
      dispatch(signInFailed());
    },
    onSignedOut: () => {
      dispatch(signedOut());
    }
  });
  return connect(mapStateToProps, mapDispatchToProps)(WithAuthentication);
};
