import React from "react"
import Head from "next/head"
import Sidebar from "../common/components/Sidebar"
import withAuthentication from "../common/hocs/withAuthentication"
import withRedux from "../common/hocs/withRedux"
import { MODULE_NAME } from "../modules/topImages/models"
import reducers from "../modules/topImages/reducers"
import TopImageGrid from "../modules/topImages/containers/TopImageGrid"
import TopImageForm from "../modules/topImages/containers/TopImageForm"

const Component = withAuthentication(() => {
  return (
    <div>
      <Head>
        <title>{"トップ画像 - カナタノアトリエ (admin)"}</title>
      </Head>
      <Sidebar currentKey={"topImages"} />
      <div className="page-content">
        <h1 className="page-heading">{"トップ画像 "}</h1>
        <hr />
        <TopImageForm />
        <hr />
        <TopImageGrid />
      </div>
    </div>
  )
})

export default withRedux(Component, {
  [MODULE_NAME]: reducers
})
