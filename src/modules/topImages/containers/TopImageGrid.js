import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { initialize } from "redux-form"
import { callFunction, saveFile, deleteFile } from "../../../common/firebase"
import { Globals } from "../../../common/models"
import Notification from "../../../common/components/Notification"
import { list, select, edit, cancelEdit } from "../actions"
import { MODULE_NAME } from "../models"
import TopImageGrid from "../components/TopImageGrid"

const mapStateToProps = state => ({
  topImages: state[MODULE_NAME].items,
  selectedByItemId: state[MODULE_NAME].selectedByItemId,
  editing: state[MODULE_NAME].editing,
  initialValues: {
    topImages: state[MODULE_NAME].items
  }
})

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      select
    },
    dispatch
  ),
  initialize: values => initialize(`${MODULE_NAME}_list`, values),
  onLoad: async () => {
    try {
      const response = await callFunction({
        name: "api-topImages-get",
        data: {},
        globals: Globals
      })
      dispatch(list(response.data.result))
    } catch (error) {
      console.error(error)
      Notification.error("読み込みに失敗しました。\n" + JSON.stringify(error))
    }
  },
  /**
   * 編集ボタンを押下した際の処理
   */
  onEdit: () => {
    dispatch(edit())
  },
  /**
   * 編集キャンセルボタンを押下した際の処理
   */
  onCancelEdit: dirty => {
    // 値が変わっていればアラートを表示する
    if (dirty && !confirm("内容が変更されています。破棄してよろしいですか？")) {
      return
    }
    dispatch(cancelEdit())
  },
  onSubmit: async values => {
    let data = await Promise.all(
      values.topImages.map(async (topImage, index) => {
        let imageName = topImage.image.name
        if (topImage.image.newFile) {
          let hasError = false
          try {
            // 画像を削除する
            await deleteFile(imageName)
          } catch (error) {
            console.error(error)
            Notification.error(
              `画像 [${imageName}] の削除に失敗しました。\n` +
                JSON.stringify(error)
            )
            hasError = true
          }
          if (!hasError) {
            const file = topImage.image.newFile
            imageName = `topImages/${topImage.id}/image/${file.name}`
            try {
              // 画像をアップロードする
              await saveFile(file, imageName)
            } catch (error) {
              console.error(error)
              Notification.error(
                `画像 [${imageName}] のアップロードに失敗しました。\n` +
                  JSON.stringify(error)
              )
              imageName = topImage.image.name
            }
          }
        }
        let thumbnailImageName = topImage.thumbnailImage.name
        if (topImage.thumbnailImage.newFile) {
          let hasError = false
          try {
            // 画像を削除する
            await deleteFile(thumbnailImageName)
          } catch (error) {
            console.error(error)
            Notification.error(
              `画像 [${thumbnailImageName}] の削除に失敗しました。\n` +
                JSON.stringify(error)
            )
            hasError = true
          }
          if (!hasError) {
            const file = topImage.thumbnailImage.newFile
            thumbnailImageName = `topImages/${topImage.id}/thumbnailImage/${file.name}`
            try {
              // サムネイル画像をアップロードする
              await saveFile(file, thumbnailImageName)
            } catch (error) {
              console.error(error)
              Notification.error(
                `画像 [${thumbnailImageName}] のアップロードに失敗しました。\n` +
                  JSON.stringify(error)
              )
              thumbnailImageName = topImage.thumbnailImage.name
            }
          }
        }
        return {
          id: topImage.id,
          image: {
            name: imageName
          },
          thumbnailImage: {
            name: thumbnailImageName
          },
          description: topImage.description,
          // 表示順を設定し直す
          order: index
        }
      })
    )
    // トップ画像を一括で更新する
    try {
      await callFunction({
        name: "api-topImages-bulkUpdate",
        data,
        globals: Globals
      })
      Notification.success("トップ画像を更新しました。")
    } catch (error) {
      console.error(error)
      Notification.error(
        "トップ画像の更新に失敗しました。\n" + JSON.stringify(error)
      )
      return
    }

    try {
      const response = await callFunction({
        name: "api-topImages-get",
        data: {},
        globals: Globals
      })
      dispatch(list(response.data.result))
    } catch (error) {
      console.error(error)
      Notification.error("読み込みに失敗しました。\n" + JSON.stringify(error))
    }
  },
  /**
   * チェックした作品を削除ボタンを押下した際の処理
   */
  onDeleteSelected: async selectedByItemId => {
    if (
      !confirm("チェックしたトップ画像を削除します。本当によろしいですか？")
    ) {
      return
    }
    const result = await Promise.allSettled(
      Object.entries(selectedByItemId).map(async entry => {
        if (!entry[1]) {
          return
        }
        try {
          await callFunction({
            name: "api-topImages-deleteById",
            data: { id: entry[0] },
            globals: Globals
          })
        } catch (error) {
          console.error(error)
          Notification.error(
            `トップ画像 [${entry[0]}] の削除に失敗しました。\n` +
              JSON.stringify(error)
          )
        }
      })
    )
    if (result.find(item => item.status === "fulfilled")) {
      Notification.success("トップ画像を削除しました。")
    } else {
      return
    }

    try {
      const response = await callFunction({
        name: "api-topImages-get",
        data: {},
        globals: Globals
      })
      dispatch(list(response.data.result))
    } catch (error) {
      console.error(error)
      Notification.error("読み込みに失敗しました。\n" + JSON.stringify(error))
    }
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(TopImageGrid)
