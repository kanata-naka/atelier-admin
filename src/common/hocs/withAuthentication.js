import React, { useEffect } from "react"
import { connect } from "react-redux"
import { signedIn, signedOut, signInFailed } from "../actions"
import { AUTH_STATE_SIGNED_IN, AUTH_STATE_SIGN_IN_FAILED } from "../models"
import { signInWithRedirect, onAuthStateChanged } from "../firebase"
import Error from "../../pages/_error"

export default Component => {
  const WithAuthentication = ({
    authState,
    onSignedIn,
    onSignInFailed,
    onSignedOut,
    ...props
  }) => {
    useEffect(() => {
      if (!authState) {
        // リダイレクトを経由してログインする
        signInWithRedirect(onSignedIn, onSignInFailed)
      }
      // 認証状態を監視する
      onAuthStateChanged(onSignedIn, onSignInFailed, onSignedOut)
    }, [])
    switch (authState) {
      case AUTH_STATE_SIGNED_IN:
        return <Component {...props} />
      case AUTH_STATE_SIGN_IN_FAILED:
        return <Error statusCode={401} />
      default:
        return <div className="logging-in">{"Logging in..."}</div>
    }
  }
  const mapStateToProps = state => ({
    authState: state["common"].authState,
    user: state["common"].user
  })
  const mapDispatchToProps = dispatch => ({
    onSignedIn: async user => {
      dispatch(signedIn(user))
    },
    onSignInFailed: async () => {
      dispatch(signInFailed())
    },
    onSignedOut: async () => {
      dispatch(signedOut())
    }
  })
  return connect(mapStateToProps, mapDispatchToProps)(WithAuthentication)
}
