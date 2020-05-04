import React, { useRef, useEffect, useCallback } from "react"
import { Form, ButtonGroup, Button } from "react-bootstrap"
import { reduxForm, Field, Fields } from "redux-form"
import { adjustElementWidth } from "../../../utils/domUtil"
import { RequiredLabel } from "../../../common/components/elements"
import { TextareaField } from "../../../common/components/fields"
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
        await handleSubmit(e)
        // フォームを初期化する
        initialize()
      }}
      className="top-image-upload-form">
      <Fields
        names={[`image.url`, `image.file`]}
        component={ImageField}
        change={change}
      />
      <p className="annotation">{"※縦横比は 5:3 です"}</p>
      <Fields
        names={[`thumbnailImage.url`, `thumbnailImage.file`]}
        component={ThumbnailImageField}
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

const ImageField = ({ image, names, change }) => {
  const containerRef = useRef(null)
  const error = null

  useEffect(() => {
    // componentDidMount と同じタイミングで実行する
    const containerElement = containerRef.current
    const innerElement = containerElement.children[0]
    innerElement.onload = () => {
      adjustElementWidth(containerElement, innerElement)
    }
  }, [])

  const handleSelect = useCallback(e => {
    e.preventDefault()
    const file = e.target.files[0]
    change(names[0], URL.createObjectURL(file))
    change(names[1], file)
    // 同じファイルをアップロードしてもonChangeイベントを走らせるためvalueを空にする
    e.target.value = ""
  })

  return (
    <div className="image-outer">
      <label>{"画像"}</label>
      <RequiredLabel />
      {error && <span className="error-message">{error}</span>}
      <div className="image-container" ref={containerRef}>
        <img className="image" src={image.url.input.value} />
        <label className="image-file" htmlFor="image">
          {!image.url.input.value && (
            <i className="fas fa-file-upload upload-icon"></i>
          )}
          <input
            className="image-file-input"
            type="file"
            id="image"
            accept=".gif, .jpg, .jpeg, .png"
            onChange={handleSelect}
          />
        </label>
      </div>
    </div>
  )
}

const ThumbnailImageField = ({ thumbnailImage, names, change }) => {
  const containerRef = useRef(null)
  const error = null

  useEffect(() => {
    // componentDidMount と同じタイミングで実行する
    const containerElement = containerRef.current
    const innerElement = containerElement.children[0]
    innerElement.onload = () => {
      adjustElementWidth(containerElement, innerElement)
    }
  }, [])

  const handleSelect = useCallback(e => {
    e.preventDefault()
    const file = e.target.files[0]
    change(names[0], URL.createObjectURL(file))
    change(names[1], file)
    // 同じファイルをアップロードしてもonChangeイベントを走らせるためvalueを空にする
    e.target.value = ""
  })

  return (
    <div className="image-outer">
      <label>{"サムネイル画像"}</label>
      <RequiredLabel />
      {error && <span className="error-message">{error}</span>}
      <div className="thumbnail-image-container" ref={containerRef}>
        <img className="image" src={thumbnailImage.url.input.value} />
        <label className="thumbnail-image-file" htmlFor="thumbnailImage">
          {!thumbnailImage.url.input.value && (
            <i className="fas fa-file-upload upload-icon"></i>
          )}
          <input
            className="image-file-input"
            type="file"
            id="thumbnailImage"
            accept=".gif, .jpg, .jpeg, .png"
            onChange={handleSelect}
          />
        </label>
      </div>
    </div>
  )
}

const validate = values => {
  // TODO
  return {}
}

export default reduxForm({
  form: MODULE_NAME,
  validate: validate
})(TopImageForm)
