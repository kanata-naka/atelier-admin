import React, { useRef, useEffect, useCallback } from "react"
import { Form, Badge, ButtonGroup, Button } from "react-bootstrap"
import { DndProvider, useDrag, useDrop } from "react-dnd-cjs"
import HTML5Backend from "react-dnd-html5-backend-cjs"
import { reduxForm, Field, FieldArray, Fields } from "redux-form"
import { adjust } from "../../../utils/domUtils"
import { InputField, TextareaField } from "../../../common/components/fields"
import { MODULE_NAME } from "../models"

class GalleryForm extends React.Component {
  componentDidUpdate(prevProps) {
    if (prevProps.initialValues.id !== this.props.initialValues.id) {
      // 現在の作品の編集がキャンセルされた、または別の作品が編集中になった場合
      this.props.initialize(this.props.initialValues)
    }
  }

  render() {
    const { handleSubmit, dirty, submitting, reset, change } = this.props
    return (
      <Form onSubmit={handleSubmit} className="gallery-form">
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
}

class ImagesField extends React.Component {
  /**
   * 新しい画像をアップロードする
   * @param e イベントオブジェクト
   */
  uploadNewImage(e) {
    const { fields } = this.props
    e.preventDefault()
    const file = e.target.files[0]
    fields.push({
      name: file.name,
      url: URL.createObjectURL(file),
      newFile: file
    })
    console.log("Image uploaded:", file.name)
    // 同じファイルをアップロードしてもonChangeイベントを走らせるためvalueを空にする
    e.target.value = ""
  }

  render() {
    const {
      fields,
      change,
      meta: { error }
    } = this.props
    return (
      <div className="image-outer">
        <label>{"画像"}</label>
        <Badge pill variant="danger">
          必須
        </Badge>
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
                onChange={e => this.uploadNewImage(e)}
              />
            </label>
          </div>
        </div>
      </div>
    )
  }
}

class ImageFields extends React.Component {
  render() {
    const { fields, change } = this.props

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
}

const ImageField = props => {
  const { images, change, index, fields } = props
  const image = images[index]
  const containerRef = useRef(null)
  const removed = image.removed.input.value

  useEffect(() => {
    // componentDidMount と同じタイミングで実行する
    const containerElement = containerRef.current
    const innerElement = containerElement.children[0]
    innerElement.onload = () => {
      adjust(containerElement, innerElement)
    }
  }, [])

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
      console.log("moved", dragIndex, "to", hoverIndex)
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
  })
  // 削除ボタンをクリックした際の処理
  const handleRemoveButtonClick = useCallback(() => {
    if (image.newFile.input.value) {
      // 新規にアップロードした画像なら要素ごと削除する
      fields.remove(index)
    } else {
      // 削除フラグをオンにする
      change(`images[${index}].removed`, true)
    }
  })

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

class TagsField extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      beforeKeyCode: null
    }
    this.inputRef = React.createRef()
  }

  /**
   * タグを削除する
   * @param index インデックス
   */
  removeTag(index) {
    const { fields } = this.props
    fields.remove(index)
  }

  onKeyUp(e) {
    const { beforeKeyCode } = this.state
    // ※for Chrome
    if (
      (beforeKeyCode !== 229 && e.keyCode === 32) ||
      (beforeKeyCode === 229 && e.keyCode === 229) ||
      e.keyCode === 13
    ) {
      // スペースキーorエンターキーが(日本語入力の場合は確定後に)押下された場合、タグを追加する
      this.addTag(e.target)
    }
    this.setState({
      beforeKeyCode: e.keyCode
    })
  }

  addTag(input) {
    const { fields } = this.props
    let value = input.value.trim()
    if (value === "") {
      return
    }
    fields.push(value)
    // 現在の入力内容を削除する
    input.value = ""
  }

  render() {
    const {
      fields,
      meta: { error }
    } = this.props
    return (
      <Form.Group controlId={"tags"}>
        <Form.Label>{"タグ"}</Form.Label>
        {error && <span className="error-message">{error}</span>}
        <div
          className="tags-container"
          onClick={() => this.inputRef.current.focus()}>
          <ul className="tags">
            {fields.map((field, index) => {
              return (
                <li
                  key={field}
                  className="tag"
                  onClick={() => this.removeTag(index)}>
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
            ref={this.inputRef}
            onKeyUp={e => this.onKeyUp(e)}
            onBlur={e => this.addTag(e.target)}
          />
        </div>
      </Form.Group>
    )
  }
}

const validate = values => {
  return {
    title: !values.title ? "タイトルは必須です" : undefined
  }
}

export default reduxForm({
  form: MODULE_NAME,
  validate: validate
})(GalleryForm)
