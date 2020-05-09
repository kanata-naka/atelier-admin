import React, { useRef, useEffect, useCallback } from "react"
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

const GalleryForm = ({
  id,
  initialValues: values,
  // -- Redux Form --
  initialize,
  handleSubmit,
  submitting,
  reset,
  dirty,
  change
}) => {
  useEffect(() => {
    // 現在の作品の編集がキャンセルされた、または別の作品が編集中になった場合
    initialize(values)
  }, [id])

  return (
    <Form
      onSubmit={async e => {
        if (!await handleSubmit(e)) {
          // フォームを初期化する
          initialize(initialValues)
        }
      }}
      className="gallery-form">
      <Field
        name="title"
        component={InputField}
        type="text"
        label="タイトル"
        className="title-input"
        required
      />
      <Field
        name="createdAt"
        component={DateTimeField}
        label="投稿日時"
        required
        useCurrentDateTimeCheckbox={true}
        dateFormat="yyyy/MM/dd HH:mm:ss"
        showTimeInput
      />
      <FieldArray
        name="images"
        label="画像"
        required
        component={ImageFieldArray}
        change={change}
      />
      <FieldArray name="tags" component={TagFieldArray} />
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

const TagFieldArray = ({ fields, meta: { error } }) => {
  const inputRef = useRef(null)

  const handleTagClick = useCallback(index => {
    fields.remove(index)
  })

  const handleConfirm = useCallback(() => {
    let value = inputRef.current.value.trim()
    if (value === "") {
      return
    }
    fields.push(value)
    // 現在の入力内容を削除する
    inputRef.current.value = ""
  })

  const handleKeyUp = useCallback(e => {
    if (
      e.keyCode === 13 ||
      (e.keyCode === 32 &&
        inputRef.current.value !== inputRef.current.value.trimEnd())
    ) {
      // スペースキーorエンターキーが(日本語入力の場合は確定後に)押下された場合、タグを追加する
      handleConfirm()
    }
  })

  return (
    <Form.Group controlId={"tags"}>
      <Form.Label>{"タグ"}</Form.Label>
      {error && <span className="error-message">{error}</span>}
      <div className="tags-field" onClick={() => inputRef.current.focus()}>
        <ul className="tag-list">
          {fields.map((field, index) => {
            return (
              <li
                key={field}
                className="tag"
                onClick={() => handleTagClick(index)}>
                {fields.get(index)}
              </li>
            )
          })}
        </ul>
        <input
          className="tag-input"
          type="text"
          id="tag"
          placeholder="タグ"
          autoComplete="off"
          ref={inputRef}
          onKeyDown={e => {
            if (e.keyCode === 13) {
              e.preventDefault()
            }
          }}
          onKeyUp={handleKeyUp}
          onBlur={handleConfirm}
        />
      </div>
    </Form.Group>
  )
}

const validate = values => {
  const errors = {}
  if (!values.title) {
    errors.title = "タイトルは必須です"
  }
  if (!values.images || !values.images.length) {
    errors.images = { _error: "画像は必須です" }
  }
  return errors
}

export default reduxForm({
  form: MODULE_NAME,
  validate: validate
})(GalleryForm)
