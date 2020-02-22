import { connect } from "react-redux"
import { initialize } from "redux-form"
import Router from "next/router"
import { callFunction } from "../../../common/firebase"
import Notification from "../../../common/components/Notification"
import { MODULE_NAME } from "../models"
import { getItemById } from "../reducer"
import GalleryForm from "../components/GalleryForm"

const mapStateToProps = state => ({
  id: state[MODULE_NAME].editingItemId,
  initialValues: getItemById(state[MODULE_NAME])
})

const mapDispatchToProps = dispatch => ({
  onSubmit: async values => {
    const files = []
    const images = values.images.map(_image => {
      if (_image.newFile) {
        files.push(_image.newFile)
      }
      return {
        name: _image.name,
        newFile: !!_image.newFile,
        removed: _image.removed
      }
    })

    const formData = new FormData()
    files.forEach(file => formData.append("files", file))
    formData.append("title", values.title)
    formData.append("tags[]", values.tags)
    formData.append("description", values.description)

    if (values.id) {
      // 作品を更新する
      formData.append("images", JSON.stringify(images))
      try {
        await callFunction({
          dispatch,
          name: "api-arts-update",
          data: formData,
          globals: {}
        })
        Router.push("/gallery")
        Notification.success("作品を編集しました。")
      } catch (error) {
        console.error(error)
        Notification.error(
          "作品の編集に失敗しました。\n" + JSON.stringify(error)
        )
      }
    } else {
      // 作品を登録する
      try {
        await callFunction({
          dispatch,
          name: "api-arts-create",
          data: formData
        })
        Router.push("/gallery")
        Notification.success("作品を登録しました。")
      } catch (error) {
        console.error(error)
        Notification.error(
          "作品の登録に失敗しました。\n" + JSON.stringify(error)
        )
      }
    }
  },
  initialize: values => initialize(MODULE_NAME, values)
})

export default connect(mapStateToProps, mapDispatchToProps)(GalleryForm)
