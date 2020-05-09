import React from "react"
import Head from "next/head"
import Sidebar from "../common/components/Sidebar"
import withAuthentication from "../common/hocs/withAuthentication"
import withRedux from "../common/hocs/withRedux"

const Component = withAuthentication(() => {
  return (
    <div>
      <Head>
        <title>{"ダッシュボード - カナタノアトリエ (admin)"}</title>
      </Head>
      <Sidebar currentKey={"home"} />
      <div className="page-content"></div>
    </div>
  )
})

export default withRedux(Component, {})
