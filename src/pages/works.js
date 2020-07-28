import React from "react"
import Head from "next/head"
import Sidebar from "../common/components/Sidebar"
import withAuthentication from "../common/hocs/withAuthentication"
import withRedux from "../common/hocs/withRedux"
import { MODULE_NAME } from "../modules/works/models"
import reducers from "../modules/works/reducers"
import WorkGrid from "../modules/works/containers/WorkGrid"
import WorkForm from "../modules/works/containers/WorkForm"

const Component = withAuthentication(() => {
  return (
    <div>
      <Head>
        <title>{"投稿管理 > WORKS - カナタノアトリエ (admin)"}</title>
      </Head>
      <Sidebar currentKey={"works"} />
      <div className="page-content">
        <h1 className="page-heading">{"投稿管理 > WORKS"}</h1>
        <hr />
        <WorkForm />
        <hr />
        <WorkGrid />
      </div>
    </div>
  )
})

export default withRedux(Component, {
  [MODULE_NAME]: reducers
})
