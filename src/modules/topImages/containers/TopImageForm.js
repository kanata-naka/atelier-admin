import { connect } from "react-redux"
import { initialize } from "redux-form"
import Router from "next/router"
import uuidv4 from "uuid/v4"
import { callFunction, upload } from "../../../common/firebase"
import Notification from "../../../common/components/Notification"
import { MODULE_NAME } from "../models"
import { getLastOrder } from "../reducers"
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

const mergeProps = (state, { dispatch })  => ({
    onSubmit: async values => {
      const id = uuidv4()
      try {
        const image = {
          name: `topImages/${id}/images/${values.image.file.name}`
        }
        await upload(values.image.file, image.name)

        const thumbnailImage = {
          name: `topImages/${id}/images/${values.thumbnailImage.file.name}`
        }
        await upload(values.thumbnailImage.file, thumbnailImage.name)

        const data = {
          id,
          image,
          thumbnailImage,
          description: values.description,
          order: state.lastOrder + 1
        }

        await callFunction({
          dispatch,
          name: "api-topImages-create",
          data
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(TopImageForm)
