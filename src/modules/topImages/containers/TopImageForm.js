import { connect } from "react-redux"
import { initialize } from "redux-form"
import Router from "next/router"
import uuidv4 from "uuid/v4"
import { callFunction, saveFile } from "../../../common/firebase"
import { Globals } from "../../../common/models"
import Notification from "../../../common/components/Notification"
import { MODULE_NAME } from "../models"
import { getLastOrder } from "../selectors"
import TopImageForm from "../components/TopImageForm"

const mapStateToProps = state => ({
  lastOrder: getLastOrder(state[MODULE_NAME]),
  initialValues: {}
})

const mapDispatchToProps = dispatch => ({
  dispatch,
  initialize: () => {
    initialize(MODULE_NAME, {})
  }
})

const mergeProps = (state, { dispatch }) => ({
  onSubmit: async values => {
    const id = uuidv4()
    const image = {}
    try {
      // 画像をアップロードする
      image.name = `topImages/${id}/images/${values.image.file.name}`
      await saveFile(values.image.file, image.name)
    } catch (error) {
      console.error(error)
      Notification.error(
        `画像 [${image.name}] のアップロードに失敗しました。\n` +
          JSON.stringify(error)
      )
      return
    }

    const thumbnailImage = {}
    try {
      // サムネイル画像をアップロードする
      thumbnailImage.name = `topImages/${id}/thumbnailImages/${values.thumbnailImage.file.name}`
      await saveFile(values.thumbnailImage.file, thumbnailImage.name)
    } catch (error) {
      console.error(error)
      Notification.error(
        `サムネイル画像 [${thumbnailImage.name}] のアップロードに失敗しました。\n` +
          JSON.stringify(error)
      )
      return
    }

    const data = {
      id,
      image,
      thumbnailImage,
      description: values.description,
      order: state.lastOrder + 1
    }

    try {
      // トップ画像を登録する
      await callFunction({
        dispatch,
        name: "api-topImages-create",
        data,
        globals: Globals
      })
      Router.push("/topImages")
      Notification.success("トップ画像を登録しました。")
    } catch (error) {
      console.error(error)
      Notification.error(
        "トップ画像の登録に失敗しました。\n" + JSON.stringify(error)
      )
    }
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(TopImageForm)
