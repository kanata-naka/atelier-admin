import { useSelector, useDispatch } from "react-redux"
import { Button } from "react-bootstrap"
import { signedOut } from "../actions"
import { signOut } from "../firebase"
import GlobalNav from "./GlobalNav"

/**
 * サイドバー
 */
export default ({ currentKey }) => {
  return (
    <div className="sidebar">
      <Header />
      <hr />
      <GlobalNav currentKey={currentKey} />
      <Footer />
    </div>
  )
}

const Header = () => {
  const user = useSelector(state => state["common"].user)
  return (
    <div className="sidebar-header">
      <div className="sidebar-header-profile">
        <div className="profile-column--left">
          <img
            className="profile-image"
            src={user.photoURL}
            alt={user.displayName}
          />
        </div>
        <div className="profile-column--right">
          <div className="display-name">{user.displayName}</div>
          <div className="email">{`(${user.email})`}</div>
        </div>
      </div>
    </div>
  )
}

const Footer = () => {
  const dispatch = useDispatch()
  return (
    <div className="sidebar-footer">
      <Button
        variant="secondary"
        type="button"
        className="logout-button"
        onClick={() => {
          signOut(dispatch(signedOut()))
        }}>
        {"ログアウト"}
      </Button>
    </div>
  )
}
