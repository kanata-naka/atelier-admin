import React from "react"
import { Form, ButtonGroup, Button } from "react-bootstrap"
import { reduxForm, Field } from "redux-form"
import { TextareaField, ImageField } from "../../../common/components/fields"
import { MODULE_NAME } from "../models"

const TopImageForm = ({
  // -- Redux Form --
  handleSubmit,
  initialize,
  dirty,
  submitting,
  reset,
  change
}) => {
  return (
    <Form
      onSubmit={async e => {
        if (!(await handleSubmit(e))) {
          // フォームを初期化する
          initialize()
        }
      }}
      className="top-image-upload-form">
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
  validate: validate
})(TopImageForm)
