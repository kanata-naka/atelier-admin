import { connect } from "react-redux"
import Router from "next/router"
import uuidv4 from "uuid/v4"
import { callFunction, saveFile, deleteFile } from "../../../common/firebase"
import { Globals } from "../../../common/models"
import { getItemById } from "../../../common/selectors"
import Notification from "../../../common/components/Notification"
import { getNowUnixTimestamp } from "../../../utils/dateUtil"
import { MODULE_NAME, initialValues } from "../models"
import GalleryForm from "../components/GalleryForm"

const mapStateToProps = state => ({
  id: state[MODULE_NAME].editingItemId,
  initialValues: getItemById(state[MODULE_NAME]) || initialValues
})

const mapDispatchToProps = dispatch => ({
  onSubmit: async values => {
    const id = values.id || uuidv4()
    let images = await Promise.all(
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
              `画像 [${name}] の削除に失敗しました。\n` + JSON.stringify(error)
            )
          }
          return
        }
        if (imageValue.newFile) {
          const file = imageValue.newFile
          name = `arts/${id}/images/${file.name}`
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
    if (!images.length) {
      // 有効な画像が1件もなければ処理を中止する
      return
    }

    const data = {
      id,
      title: values.title,
      tags: [...values.tags],
      images,
      description: values.description,
      pickupFlag: values.pickupFlag,
      createdAt: values.createdAt || getNowUnixTimestamp()
    }

    if (values.id) {
      // イラストを更新する
      try {
        await callFunction({
          dispatch,
          name: "api-arts-update",
          data,
          globals: Globals
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
      // イラストを登録する
      try {
        await callFunction({
          dispatch,
          name: "api-arts-create",
          data,
          globals: Globals
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
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(GalleryForm)
