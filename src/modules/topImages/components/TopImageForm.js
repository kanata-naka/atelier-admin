import React, { useRef, useEffect, useCallback } from "react"
import { Form, ButtonGroup, Button } from "react-bootstrap"
import { reduxForm, Field, Fields } from "redux-form"
import { adjust } from "../../../utils/domUtils"
import { RequiredLabel } from "../../../common/components/elements"
import { TextareaField } from "../../../common/components/fields"
import { MODULE_NAME } from "../models"

const TopImageForm = props => {
  const { handleSubmit, initialize, dirty, submitting, reset, change } = props
  return (
    <Form onSubmit={async e => {
        await handleSubmit(e)
        // フォームを初期化する
        initialize()
      }} className="top-image-upload-form">
      <Fields
        names={[`image.url`, `image.file`]}
        component={ImageField}
        change={change}
      />
      <Fields
        names={[`thumbnailImage.url`, `thumbnailImage.file`]}
        component={ThumbnailImageField}
        change={change}
      />
      <Field
        name="description"
        component={TextareaField}
        label="説明"
        className="description-textarea"
      />
      <ButtonGroup>
        <Button
          variant="primary"
          type="submit"
          disabled={!dirty || submitting}>
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

const ImageField = props => {
  const { image, names, change } = props
  const containerRef = useRef(null)
  const error = null

  useEffect(() => {
    // componentDidMount と同じタイミングで実行する
    const containerElement = containerRef.current
    const innerElement = containerElement.children[0]
    innerElement.onload = () => {
      adjust(containerElement, innerElement)
    }
  }, [])

  const handleSelect = useCallback(e => {
    e.preventDefault()
    const file = e.target.files[0]
    change(names[0], URL.createObjectURL(file))
    change(names[1], file)
    console.log("Image uploaded:", file.name)
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

const ThumbnailImageField = props => {
  const { thumbnailImage, names, change } = props
  const containerRef = useRef(null)
  const error = null

  useEffect(() => {
    // componentDidMount と同じタイミングで実行する
    const containerElement = containerRef.current
    const innerElement = containerElement.children[0]
    innerElement.onload = () => {
      adjust(containerElement, innerElement)
    }
  }, [])

  const handleSelect = useCallback(e => {
    e.preventDefault()
    const file = e.target.files[0]
    change(names[0], URL.createObjectURL(file))
    change(names[1], file)
    console.log("Image uploaded:", file.name)
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
  return {}
}

export default reduxForm({
  form: MODULE_NAME,
  validate: validate
})(TopImageForm)
