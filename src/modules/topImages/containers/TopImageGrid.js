import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { initialize } from "redux-form"
import Router from "next/router"
import { callFunction } from "../../../common/firebase"
import Notification from "../../../common/components/Notification"
import { select, edit, cancelEdit } from "../actions"
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
  onSubmit: async values => {
    console.log(values)
    try {
      const data = await Promise.all(
        values.topImages.map(async (topImage, index) => {
          let imageName
          if (topImage.image.file) {
            // 画像をアップロードする
            const file = topImage.image.file
            imageName = `topImages/${topImage.id}/images/${topImage.image.file.name}`
            await upload(file, imageName)
          } else {
            imageName = topImage.image.name
          }

          let thumbnailImageName
          if (topImage.thumbnailImage.file) {
            // 画像をアップロードする
            const file = topImage.thumbnailImage.file
            thumbnailImageName = `topImages/${topImage.id}/images/${topImage.thumbnailImage.file.name}`
            await upload(file, thumbnailImageName)
          } else {
            thumbnailImageName = topImage.thumbnailImage.name
          }

          return {
            image: {
              imageName
            },
            thumbnailImage: {
              thumbnailImageName
            },
            description: topImage.description,
            // 表示順を設定し直す
            order: index
          }
        })
      )

      await callFunction({
        dispatch,
        name: "api-topImages-update",
        data
      })
      Router.push("/topImages")
      Notification.success("トップ画像を更新しました。")
    } catch (error) {
      console.error(error)
      Notification.error(
        "トップ画像の更新に失敗しました。\n" + JSON.stringify(error)
      )
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
  /**
   * チェックした作品を削除ボタンを押下した際の処理
   */
  onDeleteSelected: async selectedByItemId => {
    if (confirm("チェックしたトップ画像を削除します。本当によろしいですか？")) {
      try {
        await Promise.all(
          Object.entries(selectedByItemId).map(async entry => {
            if (entry[1]) {
              await callFunction({
                dispatch,
                name: "api-topImages-deleteById",
                data: { id: entry[0] }
              })
            }
          })
        )
        Router.push("/topImages")
        Notification.success("トップ画像を削除しました。")
      } catch (error) {
        console.error(error)
        Notification.error(
          "トップ画像の削除に失敗しました。\n" + JSON.stringify(error)
        )
      }
    }
  },
  initialize: values => initialize(`${MODULE_NAME}_list`, values)
})

export default connect(mapStateToProps, mapDispatchToProps)(TopImageGrid)
