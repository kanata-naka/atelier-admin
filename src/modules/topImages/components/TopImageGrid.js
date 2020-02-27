import React, { useRef, useEffect, useCallback } from "react"
import { Form, ButtonGroup, Button, Badge } from "react-bootstrap"
import { reduxForm, Field, Fields, FieldArray } from "redux-form"
import Router from "next/router"
import { formatDateTimeFromUnixTimestamp } from "../../../utils/dateUtil"
import { adjust } from "../../../utils/domUtils"
import { TextareaField } from "../../../common/components/fields"
import Grid from "../../../common/components/Grid"
import { MODULE_NAME } from "../models"

const TopImageGrid = props => {
  const { topImages, handleSubmit, initialize } = props

  useEffect(() => {
    initialize({topImages})
  }, [topImages])

  return (
    <Form onSubmit={handleSubmit}>
      <TopImageControl {...props} />
      <FieldArray name="topImages" component={_TopImageGrid} {...props} />
    </Form>
  )
}

const TopImageControl = ({
  selectedByItemId,
  onEdit,
  editing,
  onCancelEdit,
  onDeleteSelected,
  dirty,
  submitting,
  reset
}) => {
  return (
    <div className="controls top-image-controls">
      <Button
        variant="danger"
        type="button"
        className="delete-button"
        disabled={!Object.keys(selectedByItemId).length}
        onClick={() => onDeleteSelected(selectedByItemId)}>
        {"チェックした作品を削除"}
      </Button>
      {editing ? (
        <ButtonGroup>
          <Button
            variant="primary"
            type="submit"
            disabled={!dirty || submitting}>
            {"保存"}
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              reset()
              onCancelEdit(dirty)
            }}>
            {"キャンセル"}
          </Button>
        </ButtonGroup>
      ) : (
        <Button
          variant="outline-secondary"
          type="button"
          onClick={onEdit}>
          {"編集"}
        </Button>
      )}
    </div>
  )
}

const _TopImageGrid = props => {
  const { topImages, fields, selectedByItemId, select, editing, change } = props

  // 「上へ移動」ボタンをクリックした際の処理
  const handleMoveUpButtonClick = useCallback(currentIndex => {
    if (currentIndex == 0) {
      return
    }
    fields.move(currentIndex, currentIndex - 1)
  })

  // 「下へ移動」ボタンをクリックした際の処理
  const handleMoveBelowButtonClick = useCallback(currentIndex => {
    if (currentIndex == fields.length - 1) {
      return
    }
    fields.move(currentIndex, currentIndex + 1)
  })

  return (
    <Grid
      items={topImages}
      selectedByItemId={selectedByItemId}
      onSelect={select}
      className="top-image-grid"
      striped
      columns={[
        {
          title: "画像",
          className: "column-image",
          render: (unused, index) => {
            return (
              <Fields
                names={[
                  `topImages[${index}].image.name`,
                  `topImages[${index}].image.url`,
                  `topImages[${index}].image.file`,
                  `topImages[${index}].image.originalUrl`
                ]}
                component={ImageField}
                index={index}
                change={change}
                editing={editing}
              />
            )
          }
        },
        {
          title: "サムネイル画像",
          className: "column-thumbnail-image",
          render: (unused, index) => {
            return (
              <Fields
                names={[
                  `topImages[${index}].thumbnailImage.name`,
                  `topImages[${index}].thumbnailImage.url`,
                  `topImages[${index}].thumbnailImage.file`,
                  `topImages[${index}].thumbnailImage.originalUrl`
                ]}
                component={ThumbnailImageField}
                index={index}
                change={change}
                editing={editing}
              />
            )
          }
        },
        {
          title: "説明",
          className: "column-description",
          render: (item, index) =>
            editing ? (
              <Field
                name={`topImages[${index}].description`}
                component={TextareaField}
                className="description-textarea"
              />
            ) : (
              <span className="description__fixed-label">
                {item.description}
              </span>
            )
        },
        {
          className: "column-date",
          render: (item) => (
            <div className="dates">
              <div className="date-row">
                <Badge variant="secondary">投稿日時</Badge>
                <span className="date-value">
                  {formatDateTimeFromUnixTimestamp(item.createdAt)}
                </span>
              </div>
              <div className="date-row">
                <Badge variant="secondary">更新日時</Badge>
                <span className="date-value">
                  {formatDateTimeFromUnixTimestamp(item.updatedAt)}
                </span>
              </div>
            </div>
          )
        },
        {
          className: "column-controls",
          render: (unused, index) =>
            editing ? (
              <ButtonGroup vertical>
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() => {
                    handleMoveUpButtonClick(index)
                  }}>
                  {"上へ移動"}
                </Button>
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() => {
                    handleMoveBelowButtonClick(index)
                  }}>
                  {"下へ移動"}
                </Button>
              </ButtonGroup>
            ) : (
              <div></div>
            )
        }
      ]}
    />
  )
}

const ImageField = props => {
  const { topImages, index, editing, change, names } = props
  const topImage = topImages[index]
  const containerRef = useRef(null)

  useEffect(() => {
    // componentDidMount と同じタイミングで実行する
    const containerElement = containerRef.current
    const innerElement = containerElement.children[0]
    innerElement.onload = () => {
      adjust(containerElement, innerElement)
    }
  }, [])

  const handleSelect = useCallback(
    e => {
      e.preventDefault()
      const file = e.target.files[0]
      change(names[1], URL.createObjectURL(file))
      change(names[2], file)
      change(names[3], topImage.image.url.input.value)
      console.log("Image uploaded:", file.name)
      // 同じファイルをアップロードしてもonChangeイベントを走らせるためvalueを空にする
      e.target.value = ""
    },
    [change]
  )

  // 取り消しボタンをクリックした際の処理
  const handleRemoveButtonClick = useCallback(e => {
    e.preventDefault()
    change(names[1], topImage.image.originalUrl.input.value)
    change(names[2], null)
  })

  const dirty =
    topImage.image.originalUrl.input.value &&
    topImage.image.url.input.value !== topImage.image.originalUrl.input.value

  return (
    <div className="image-container" ref={containerRef}>
      <img
        className="image"
        src={topImage.image.url.input.value}
        style={{ opacity: editing && !dirty ? 0.5 : 1 }}
      />
      {editing && (
        <label className="image-file" htmlFor={`topImages[${index}].image`}>
          {!dirty && <i className="fas fa-file-upload upload-icon"></i>}
          <input
            className="image-file-input"
            type="file"
            id={`topImages[${index}].image`}
            accept=".gif, .jpg, .jpeg, .png"
            onChange={handleSelect}
          />
        </label>
      )}
      {editing && dirty && (
        <div
          className="image-remove-button"
          onClick={handleRemoveButtonClick}>
          <i className="fas fa-times"></i>
        </div>
      )}
    </div>
  )
}

const ThumbnailImageField = props => {
  const { topImages, index, editing, change, names } = props
  const topImage = topImages[index]
  const containerRef = useRef(null)

  useEffect(() => {
    // componentDidMount と同じタイミングで実行する
    const containerElement = containerRef.current
    const innerElement = containerElement.children[0]
    innerElement.onload = () => {
      adjust(containerElement, innerElement)
    }
  }, [])

  const handleSelect = useCallback(
    e => {
      e.preventDefault()
      const file = e.target.files[0]
      change(names[1], URL.createObjectURL(file))
      change(names[2], file)
      change(names[3], topImage.thumbnailImage.url.input.value)
      console.log("Image uploaded:", file.name)
      // 同じファイルをアップロードしてもonChangeイベントを走らせるためvalueを空にする
      e.target.value = ""
    },
    [change]
  )

  // 取り消しボタンをクリックした際の処理
  const handleRemoveButtonClick = useCallback(e => {
    e.preventDefault()
    change(names[1], topImage.thumbnailImage.originalUrl.input.value)
    change(names[2], null)
  })

  const dirty =
    topImage.thumbnailImage.originalUrl.input.value &&
    topImage.thumbnailImage.url.input.value !==
      topImage.thumbnailImage.originalUrl.input.value

  return (
    <div className="thumbnail-image-container" ref={containerRef}>
      <img
        className="thumbnail-image"
        src={topImage.thumbnailImage.url.input.value}
        style={{ opacity: editing && !dirty ? 0.5 : 1 }}
      />
      {editing && (
        <label
          className="thumbnail-image-file"
          htmlFor={`topImages[${index}].thumbnailImage`}>
          {!dirty && <i className="fas fa-file-upload upload-icon"></i>}
          <input
            className="image-file-input"
            type="file"
            id={`topImages[${index}].thumbnailImage`}
            accept=".gif, .jpg, .jpeg, .png"
            onChange={handleSelect}
          />
        </label>
      )}
      {editing && dirty && (
        <div
          className="thumbnail-image-remove-button"
          onClick={handleRemoveButtonClick}>
          <i className="fas fa-times"></i>
        </div>
      )}
    </div>
  )
}

const validate = values => {
  return {}
}

export default reduxForm({
  form: `${MODULE_NAME}_list`,
  validate: validate
})(TopImageGrid)
