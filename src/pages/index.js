import React from "react"
import basePage from "../common/hocs/basePage"
import "../styles/index.scss"

class Component extends React.Component {
  render() {
    return <div>{"test"}</div>
  }
}

export default basePage(Component, {})
