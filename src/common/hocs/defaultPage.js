import basePage from "./basePage"
import withAuthentication from "./withAuthentication"
import Sidebar from "../components/Sidebar"
import Notification from "../components/Notification"

export default (Component, reducers) => {
  const DefaultPage = withAuthentication(props => {
    return (
      <div>
        <Notification.Component />
        <div className="page-wrapper">
          <Sidebar />
          <div className="page-content">
            <Component {...props} />
          </div>
        </div>
      </div>
    )
  })
  DefaultPage.getInitialProps = Component.getInitialProps
  return basePage(DefaultPage, reducers)
}
