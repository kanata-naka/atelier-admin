import React from "react"
import Head from "next/head"
import { callFunction } from "../common/firebase"
import Notification from "../common/components/Notification"
import Sidebar from "../common/components/Sidebar"
import withAuthentication from "../common/hocs/withAuthentication"
import withRedux from "../common/hocs/withRedux"
import { list } from "../modules/gallery/actions"
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

Component.getInitialProps = async ({ store: { dispatch }, globals }) => {
  let items = []
  try {
    const response = await callFunction({
      dispatch,
      name: "api-arts-get",
      data: {},
      globals
    })
    items = response.data.result
    dispatch(list(items))
  } catch (error) {
    console.error(error)
    Notification.error("読み込みに失敗しました。\n" + JSON.stringify(error))
  }
}

export default withRedux(Component, {
  [MODULE_NAME]: reducers
})
