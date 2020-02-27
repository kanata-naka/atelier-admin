import React from "react"
import Head from "next/head"
import { callFunction } from "../common/firebase"
import defaultPage from "../common/hocs/defaultPage"
import { list } from "../modules/topImages/actions"
import { MODULE_NAME } from "../modules/topImages/models"
import reducers from "../modules/topImages/reducers"
import TopImageGrid from "../modules/topImages/containers/TopImageGrid"
import TopImageForm from "../modules/topImages/containers/TopImageForm"
import "../styles/topImages.scss"

class Component extends React.Component {
  static async getInitialProps({ store: { dispatch }, globals }) {
    const result = await callFunction({
      dispatch,
      name: "api-topImages-get",
      globals
    })
    dispatch(list(result.data))
    return {
      items: result.data
    }
  }

  render() {
    return (
      <div>
        <Head>
          <title>{"トップ画像 - カナタノアトリエ (admin)"}</title>
        </Head>
        <h1 className="page-heading">{"トップ画像 "}</h1>
        <hr />
        <TopImageForm />
        <hr />
        <TopImageGrid />
      </div>
    )
  }
}

export default defaultPage(Component, {
  [MODULE_NAME]: reducers
})
