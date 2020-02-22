import React, { useEffect } from "react"
import { connect } from "react-redux"
import { signedIn, signedOut } from "../actions"
import { onAuthStateChanged } from "../firebase"

export default Component => {
  const WithAuthentication = ({
    user,
    onSignedIn,
    onSignInFailed,
    onSignedOut,
    ...props
  }) => {
    useEffect(() => {
      onAuthStateChanged(onSignedIn, onSignInFailed, onSignedOut)
    }, [])
    if (!user) {
      return <div></div>
    }
    return <Component {...props} />
  }
  const mapStateToProps = state => ({
    user: state["common"].user
  })
  const mapDispatchToProps = dispatch => ({
    onSignedIn: async user => {
      dispatch(signedIn(user))
    },
    onSignInFailed: async () => {
      // TODO
    },
    onSignedOut: async () => {
      dispatch(signedOut())
    }
  })
  return connect(mapStateToProps, mapDispatchToProps)(WithAuthentication)
}
