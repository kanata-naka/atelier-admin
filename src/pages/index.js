import React from "react"
import Head from "next/head"
import Sidebar from "../common/components/Sidebar"
import withAuthentication from "../common/hocs/withAuthentication"

const Component = withAuthentication(() => {
  return (
    <div>
      <Head>
        <title>{"ダッシュボード - カナタノアトリエ (admin)"}</title>
      </Head>
      <Sidebar />
      <div className="page-content">
        <h1 className="page-heading">{"ダッシュボード"}</h1>
      </div>
    </div>
  )
})

export default Component
