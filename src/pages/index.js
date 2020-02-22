import React from "react"
import defaultPage from "../common/hocs/defaultPage"
import "../styles/index.scss"

class Component extends React.Component {
  render() {
    return <div>{"test"}</div>
  }
}

export default defaultPage(Component, {})
