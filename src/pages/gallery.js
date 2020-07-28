import React from "react"
import Head from "next/head"
import Sidebar from "../common/components/Sidebar"
import withAuthentication from "../common/hocs/withAuthentication"
import withRedux from "../common/hocs/withRedux"
import { MODULE_NAME } from "../modules/gallery/models"
import reducers from "../modules/gallery/reducers"
import GalleryGrid from "../modules/gallery/containers/GalleryGrid"
import GalleryForm from "../modules/gallery/containers/GalleryForm"

const Component = withAuthentication(() => {
  return (
    <div>
      <Head>
        <title>{"投稿管理 > GALLERY - カナタノアトリエ (admin)"}</title>
      </Head>
      <Sidebar currentKey={"gallery"} />
      <div className="page-content">
        <h1 className="page-heading">{"投稿管理 > GALLERY"}</h1>
        <hr />
        <GalleryForm />
        <hr />
        <GalleryGrid />
      </div>
    </div>
  )
})

export default withRedux(Component, {
  [MODULE_NAME]: reducers
})
