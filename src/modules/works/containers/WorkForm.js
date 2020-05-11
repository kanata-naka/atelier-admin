import { connect } from "react-redux"
import Router from "next/router"
import uuidv4 from "uuid/v4"
import { callFunction, saveFile, deleteFile } from "../../../common/firebase"
import { Globals } from "../../../common/models"
import { getItemById } from "../../../common/selectors"
import Notification from "../../../common/components/Notification"
import { getNowUnixTimestamp } from "../../../utils/dateUtil"
import { resize } from "../../../utils/imageUtil"
import { MODULE_NAME, initialValues, IMAGE_MAX_WIDTH } from "../models"
import WorkForm from "../components/WorkForm"

const mapStateToProps = state => ({
  id: state[MODULE_NAME].editingItemId,
  initialValues: getItemById(state[MODULE_NAME]) || initialValues
})

const mapDispatchToProps = dispatch => ({
  onSubmit: async values => {
    const id = values.id || uuidv4()
    let images = []
    if (values.images && values.images.length) {
      images = await Promise.all(
        values.images.map(async imageValue => {
          // ストレージ上のパス
          let name = imageValue.name
          if (imageValue.removed) {
            try {
              // 画像を削除する
              await deleteFile(name)
            } catch (error) {
              console.error(error)
              Notification.error(
                `画像 [${name}] の削除に失敗しました。\n` +
                  JSON.stringify(error)
              )
            }
            return
          }
          if (imageValue.newFile) {
            let file = imageValue.newFile
            name = `works/${id}/images/${file.name}`
            // 画像をリサイズする
            file = await resize(file, IMAGE_MAX_WIDTH, IMAGE_MAX_WIDTH)
            try {
              // 新しい画像をアップロードする
              await saveFile(file, name)
            } catch (error) {
              console.error(error)
              Notification.error(
                `画像 [${name}] のアップロードに失敗しました。\n` +
                  JSON.stringify(error)
              )
              return
            }
          }
          return {
            name
          }
        })
      )
      // 削除された、またはアップロードに失敗した画像を除外する
      images = images.filter(image => image)
    }

    const data = {
      id,
      title: values.title,
      publishedDate: values.publishedDate || getNowUnixTimestamp(),
      images,
      description: values.description,
      pickupFlag: values.pickupFlag
    }

    if (values.id) {
      // 作品を更新する
      try {
        await callFunction({
          name: "api-works-update",
          data,
          globals: Globals
        })
        Router.push("/works")
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
          name: "api-works-create",
          data,
          globals: Globals
        })
        Router.push("/works")
        Notification.success("作品を登録しました。")
      } catch (error) {
        console.error(error)
        Notification.error(
          "作品の登録に失敗しました。\n" + JSON.stringify(error)
        )
      }
    }
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(WorkForm)
