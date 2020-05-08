import React, { useEffect } from "react"
import { Form, ButtonGroup, Button } from "react-bootstrap"
import { reduxForm, Field, FieldArray } from "redux-form"
import {
  InputField,
  MarkdownTextareaField,
  CheckboxField,
  DateTimeField,
  ImageFieldArray
} from "../../../common/components/fields"
import { MODULE_NAME, initialValues } from "../models"

const WorkForm = ({
  id,
  initialValues: values,
  // -- Redux Form --
  initialize,
  handleSubmit,
  dirty,
  submitting,
  reset,
  change
}) => {
  useEffect(() => {
    // 現在の作品の編集がキャンセルされた、または別の作品が編集中になった場合
    initialize(values)
  }, [id])

  return (
    <Form
      onSubmit={async e => {
        await handleSubmit(e)
        // フォームを初期化する
        initialize(initialValues)
      }}
      className="work-form">
      <Field
        name="title"
        component={InputField}
        type="text"
        label="タイトル"
        className="title-input"
        required
      />
      <Field
        name="publishedDate"
        component={DateTimeField}
        label="出版日"
        required
        useCurrentDateTimeCheckbox={true}
        useCurrentDateTimeCheckboxLabel="現在日を使用する"
      />
      <FieldArray
        name="images"
        label="画像"
        component={ImageFieldArray}
        change={change}
      />
      <Field
        name="description"
        component={MarkdownTextareaField}
        label="説明"
        className="description-textarea"
      />
      <Field
        name="pickupFlag"
        component={CheckboxField}
        label="トップページに表示する"
        className="pickup-flag-checkbox"
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
  return {
    title: !values.title ? "タイトルは必須です" : undefined
  }
}

export default reduxForm({
  form: MODULE_NAME,
  validate: validate
})(WorkForm)
