import basePage from "./basePage"
import withAuthentication from "./withAuthentication"
import GlobalNav from "../components/GlobalNav"
import Notification from "../components/Notification"

export default (Component, reducer) => {
  const DefaultPage = withAuthentication(props => {
    return (
      <div>
        <Notification.Component />
        <div className="page-wrapper">
          <div className="sidebar">
            <GlobalNav />
          </div>
          <div className="page-content">
            <Component {...props} />
          </div>
        </div>
      </div>
    )
  })
  DefaultPage.getInitialProps = Component.getInitialProps
  return basePage(DefaultPage, reducer)
}
