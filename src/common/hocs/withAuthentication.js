import React, { useEffect } from "react"
import { connect } from "react-redux"
import { signedIn, signedOut, signInFailed } from "../actions"
import { SIGNED_IN, SIGN_IN_FAILED } from "../models"
import { onAuthStateChanged } from "../firebase"
import Error from "../../pages/_error"

export default Component => {
  const WithAuthentication = ({
    status,
    onSignedIn,
    onSignInFailed,
    onSignedOut,
    ...props
  }) => {
    useEffect(() => {
      onAuthStateChanged(onSignedIn, onSignInFailed, onSignedOut)
    }, [])
    switch (status) {
      case SIGNED_IN:
        return <Component {...props} />
      case SIGN_IN_FAILED:
        return <Error statusCode={401} />
      default:
        return <div className="logging-in">{"Logging in..."}</div>
    }
  }
  const mapStateToProps = state => ({
    status: state["common"].status,
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
