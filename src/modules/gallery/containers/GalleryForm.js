import { connect } from "react-redux"
import { initialize } from "redux-form"
import Router from "next/router"
import uuidv4 from "uuid/v4"
import { callFunction, upload } from "../../../common/firebase"
import Notification from "../../../common/components/Notification"
import { MODULE_NAME } from "../models"
import { getItemById } from "../reducers"
import GalleryForm from "../components/GalleryForm"

const mapStateToProps = state => ({
  id: state[MODULE_NAME].editingItemId,
  initialValues: getItemById(state[MODULE_NAME])
})

const mapDispatchToProps = dispatch => ({
  onSubmit: async values => {
    const id = values.id || uuidv4()
    let images
    try {
      images = await Promise.all(values.images.map(async _image => {
        console.log(_image)
        let name
        if (_image.newFile) {
          // 画像をアップロードする
          const file = _image.newFile
          name = `arts/${id}/images/${file.name}`
          await upload(file, name)
        } else {
          name = _image.name
        }
        return {
          name,
          newFile: !!_image.newFile,
          removed: _image.removed
        }
      }))
    } catch (error) {
      console.error(error)
      Notification.error(
        "作品のアップロードに失敗しました。\n" + JSON.stringify(error)
      )
      return
    }

    const data = {
      id,
      title: values.title,
      tags: values.tags,
      images,
      description: values.description
    }

    if (values.id) {
      // イラストの情報を更新する
      try {
        await callFunction({
          dispatch,
          name: "api-arts-update",
          data
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
      // イラストの情報を登録する
      try {
        await callFunction({
          dispatch,
          name: "api-arts-create",
          data
        })
        initialize(MODULE_NAME, {})
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
