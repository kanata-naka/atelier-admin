import React from "react"
import Head from "next/head"
import { callFunction } from "../common/firebase"
import defaultPage from "../common/hocs/defaultPage"
import { list } from "../modules/gallery/actions"
import { MODULE_NAME } from "../modules/gallery/models"
import reducer from "../modules/gallery/reducer"
import GalleryGrid from "../modules/gallery/containers/GalleryGrid"
import GalleryForm from "../modules/gallery/containers/GalleryForm"
import "../styles/gallery.scss"

class Component extends React.Component {
  static async getInitialProps({ store: { dispatch }, globals }) {
    const result = await callFunction({
      dispatch,
      name: "api-arts-get",
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
          <title>{"投稿管理 > GALLERY - カナタノアトリエ (admin)"}</title>
        </Head>
        <h1 className="page-heading">{"投稿管理 > GALLERY"}</h1>
        <hr />
        <GalleryForm />
        <hr />
        <GalleryGrid />
      </div>
    )
  }
}

export default defaultPage(Component, {
  [MODULE_NAME]: reducer
})
