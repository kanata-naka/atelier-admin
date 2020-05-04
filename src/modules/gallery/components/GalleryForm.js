import React, { useState, useRef, useEffect, useCallback } from "react"
import { Form, ButtonGroup, Button } from "react-bootstrap"
import { DndProvider, useDrag, useDrop } from "react-dnd-cjs"
import HTML5Backend from "react-dnd-html5-backend-cjs"
import { reduxForm, Field, FieldArray, Fields } from "redux-form"
import { adjustElementWidth } from "../../../utils/domUtils"
import { RequiredLabel } from "../../../common/components/elements"
import { InputField, TextareaField, CheckboxField } from "../../../common/components/fields"
import { MODULE_NAME } from "../models"

const GalleryForm = ({
  id,
  initialValues,
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
    initialize(initialValues)
  }, [id])

  return (
    <Form
      onSubmit={async e => {
        await handleSubmit(e)
        // フォームを初期化する
        initialize()
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
      <FieldArray name="images" component={ImagesField} change={change} />
      <FieldArray name="tags" component={TagsField} />
      <Field
        name="description"
        component={TextareaField}
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

const ImagesField = ({ fields, change, meta: { error } }) => {
  const handleSelect = useCallback(
    e => {
      e.preventDefault()
      const file = e.target.files[0]
      fields.push({
        name: file.name,
        url: URL.createObjectURL(file),
        newFile: file
      })
      // 同じファイルをアップロードしてもonChangeイベントを走らせるためvalueを空にする
      e.target.value = ""
    },
    [fields]
  )

  return (
    <div className="image-outer">
      <label>{"画像"}</label>
      <RequiredLabel />
      {error && <span className="error-message">{error}</span>}
      <div className="image-list">
        <DndProvider backend={HTML5Backend}>
          <ImageFields fields={fields} change={change} />
        </DndProvider>
        <div className="image-container">
          <label className="image-file" htmlFor="image">
            <i className="fas fa-file-upload upload-icon"></i>
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
    </div>
  )
}

const ImageFields = ({ fields, change }) => {
  return fields.map((field, index) => {
    return (
      <Fields
        key={field}
        names={[
          `${field}.name`,
          `${field}.url`,
          `${field}.newFile`,
          `${field}.removed`
        ]}
        index={index}
        component={ImageField}
        change={change}
        fields={fields}
      />
    )
  })
}

const ImageField = ({ images, change, index, fields }) => {
  const image = images[index]
  const containerRef = useRef(null)
  const removed = image.removed.input.value

  useEffect(() => {
    const containerElement = containerRef.current
    const innerElement = containerElement.children[0]
    innerElement.onload = () => {
      adjustElementWidth(containerElement, innerElement)
    }
  }, [index])

  // ドラッグの設定
  const [{ isDragging }, drag] = useDrag({
    item: { type: "ImageField", id: `images[${index}]`, index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  })
  // ドロップの設定
  const [, drop] = useDrop({
    accept: "ImageField",
    drop(item) {
      const dragIndex = item.index
      const hoverIndex = index
      // 要素を入れ替える
      fields.move(dragIndex, hoverIndex)
    }
  })
  drag(drop(containerRef))

  // 削除フラグがオンになっている既存の画像をクリックした際の処理
  const handleContainerClick = useCallback(() => {
    if (removed) {
      change(`images[${index}].removed`, false)
    }
  }, [index])

  // 削除ボタンをクリックした際の処理
  const handleRemoveButtonClick = useCallback(() => {
    if (image.newFile.input.value) {
      // 新規にアップロードした画像なら要素ごと削除する
      fields.remove(index)
    } else {
      // 削除フラグをオンにする
      change(`images[${index}].removed`, true)
    }
  }, [index])

  return (
    <div
      className={
        "image-container" +
        (removed ? " removed" : "") +
        (isDragging ? " dragging" : "")
      }
      ref={containerRef}
      onClick={handleContainerClick}>
      <img className="image" src={image.url.input.value} />
      {!removed && (
        <div className="image-remove-button" onClick={handleRemoveButtonClick}>
          <i className="fas fa-times"></i>
        </div>
      )}
    </div>
  )
}

const TagsField = ({ fields, meta: { error } }) => {
  const [beforeKeyCode, setBeforeKeyCode] = useState(null)
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

  const handleKeyUp = useCallback(
    e => {
      if (
        (beforeKeyCode !== 229 && e.keyCode === 32) ||
        (beforeKeyCode === 229 && e.keyCode === 229) ||
        e.keyCode === 13
      ) {
        // スペースキーorエンターキーが(日本語入力の場合は確定後に)押下された場合、タグを追加する
        handleConfirm()
      }
      setBeforeKeyCode(e.keyCode)
    },
    [beforeKeyCode]
  )

  return (
    <Form.Group controlId={"tags"}>
      <Form.Label>{"タグ"}</Form.Label>
      {error && <span className="error-message">{error}</span>}
      <div className="tags-container" onClick={() => inputRef.current.focus()}>
        <ul className="tags">
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
          onKeyUp={handleKeyUp}
          onBlur={handleConfirm}
        />
      </div>
    </Form.Group>
  )
}

const validate = values => {
  // TODO
  return {
    title: !values.title ? "タイトルは必須です" : undefined
  }
}

export default reduxForm({
  form: MODULE_NAME,
  validate: validate
})(GalleryForm)
