import React from "react"

export default class Error extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null
    return { statusCode }
  }

  render() {
    const { statusCode } = this.props
    let message
    switch (statusCode) {
      case 401:
        message = "401 Unauthorized"
        break
      default:
        message = statusCode
        break
    }
    return (
      <div>
        <h1>{message}</h1>
      </div>
    )
  }
}
