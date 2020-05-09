import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { isDirty } from "redux-form"
import Router from "next/router"
import { callFunction } from "../../../common/firebase"
import { Globals } from "../../../common/models"
import { getItemsByPage } from "../../../common/selectors"
import Notification from "../../../common/components/Notification"
import { select, movePage, edit } from "../actions"
import { MODULE_NAME } from "../models"
import GalleryGrid from "../components/GalleryGrid"

const mapStateToProps = state => ({
  items: getItemsByPage(state[MODULE_NAME]),
  pagination: state[MODULE_NAME].pagination,
  selectedByItemId: state[MODULE_NAME].selectedByItemId,
  // Redux Form: フォームの値が初期状態から変更されているかどうか
  dirty: isDirty(MODULE_NAME)(state)
})

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      select,
      movePage
    },
    dispatch
  ),
  /**
   * 編集ボタンを押下した際の処理
   */
  onEdit: (id, dirty) => {
    // 値が変わっていればアラートを表示する
    if (dirty && !confirm("内容が変更されています。破棄してよろしいですか？")) {
      return
    }
    dispatch(edit(id))
  },
  /**
   * 編集キャンセルボタンを押下した際の処理
   */
  onCancelEdit: dirty => {
    // 値が変わっていればアラートを表示する
    if (dirty && !confirm("内容が変更されています。破棄してよろしいですか？")) {
      return
    }
    dispatch(edit(null))
  },
  /**
   * チェックした作品を削除ボタンを押下した際の処理
   */
  onDeleteSelected: async selectedByItemId => {
    if (!confirm("チェックした作品を削除します。本当によろしいですか？")) {
      return
    }
    const result = await Promise.allSettled(
      Object.entries(selectedByItemId).map(async entry => {
        if (!entry[1]) {
          return
        }
        try {
          await callFunction({
            name: "api-arts-deleteById",
            data: { id: entry[0] },
            globals: Globals
          })
        } catch (error) {
          console.error(error)
          Notification.error(
            `作品 [${entry[0]}] の削除に失敗しました。\n` +
              JSON.stringify(error)
          )
        }
      })
    )
    if (result.find(item => item.status === "fulfilled")) {
      Router.push("/gallery")
      Notification.success("作品を削除しました。")
    }
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(GalleryGrid)
