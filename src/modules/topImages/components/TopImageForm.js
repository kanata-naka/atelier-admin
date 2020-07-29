import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Form, ButtonGroup, Button } from "react-bootstrap"
import { reduxForm, Field, initialize } from "redux-form"
import uuidv4 from "uuid/v4"
import { callFunction, saveFile } from "../../../common/firebase"
import { Globals } from "../../../common/models"
import { TextareaField, ImageField } from "../../../common/components/fields"
import Notification from "../../../common/components/Notification"
import { list } from "../actions"
import { MODULE_NAME } from "../models"
import { getLastOrder } from "../selectors"

const TopImageForm = ({
  // -- Redux Form --
  handleSubmit,
  dirty,
  submitting,
  reset,
  change
}) => {
  const lastOrder = useSelector(state => getLastOrder(state[MODULE_NAME]))
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initialize(MODULE_NAME, { order: lastOrder + 1 }))
  }, [lastOrder])

  return (
    <Form onSubmit={handleSubmit} className="top-image-upload-form">
      <ImageField
        name="image"
        classNamePrefix="image"
        label="画像"
        required
        change={change}
      />
      <p className="annotation">{"※縦横比は 5:3 です"}</p>
      <ImageField
        name="thumbnailImage"
        classNamePrefix="thumbnail-image"
        label="サムネイル画像"
        required
        change={change}
      />
      <p className="annotation">{"※縦横比は 1:1 (正方形)です"}</p>
      <Field
        name="description"
        component={TextareaField}
        label="説明"
        className="description-textarea"
      />
      <Field name="order" component="input" type="hidden" />
      <ButtonGroup>
        <Button variant="primary" type="submit" disabled={!dirty || submitting}>
          {"送信"}
        </Button>
        <Button
          variant="secondary"
          type="button"
          disabled={!dirty || submitting}
          onClick={reset}>
          {"リセット"}
        </Button>
      </ButtonGroup>
    </Form>
  )
}

const validate = values => {
  const errors = {}
  if (!values.image || !values.image.file) {
    errors.image = { file: "画像は必須です" }
  }
  if (!values.thumbnailImage || !values.thumbnailImage.file) {
    errors.thumbnailImage = { file: "サムネイル画像は必須です" }
  }
  return errors
}

export default reduxForm({
  form: MODULE_NAME,
  validate: validate,
  onSubmit: async (values, dispatch) => {
    const id = uuidv4()

    const image = {}
    try {
      // 画像をアップロードする
      image.name = `topImages/${id}/image/${values.image.file.name}`
      await saveFile(values.image.file, image.name)
    } catch (error) {
      console.error(error)
      Notification.error(
        `画像 [${image.name}] のアップロードに失敗しました。\n` +
          JSON.stringify(error)
      )
      throw error
    }

    const thumbnailImage = {}
    try {
      // サムネイル画像をアップロードする
      thumbnailImage.name = `topImages/${id}/thumbnailImage/${values.thumbnailImage.file.name}`
      await saveFile(values.thumbnailImage.file, thumbnailImage.name)
    } catch (error) {
      console.error(error)
      Notification.error(
        `サムネイル画像 [${thumbnailImage.name}] のアップロードに失敗しました。\n` +
          JSON.stringify(error)
      )
      throw error
    }

    const data = {
      id,
      image,
      thumbnailImage,
      description: values.description,
      order: values.order
    }

    try {
      // トップ画像を登録する
      await callFunction({
        name: "api-topImages-create",
        data,
        globals: Globals
      })
      Notification.success("トップ画像を登録しました。")
    } catch (error) {
      console.error(error)
      Notification.error(
        "トップ画像の登録に失敗しました。\n" + JSON.stringify(error)
      )
      throw error
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

    return {
      lastOrder: data.order
    }
  },
  onSubmitSuccess: (result, _dispatch, { initialize }) => {
    // フォームを初期化する
    initialize({ order: result.lastOrder + 1 })
  }
})(TopImageForm)
