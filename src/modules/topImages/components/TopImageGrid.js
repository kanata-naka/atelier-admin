import React, { useRef, useEffect, useCallback } from "react"
import { Form, ButtonGroup, Button, Badge } from "react-bootstrap"
import { reduxForm, Field, Fields, FieldArray } from "redux-form"
import { formatDateTimeFromUnixTimestamp } from "../../../utils/dateUtil"
import { adjustElementWidth } from "../../../utils/domUtil"
import { TextareaField } from "../../../common/components/fields"
import Grid from "../../../common/components/Grid"
import { MODULE_NAME } from "../models"

const TopImageGrid = ({
  topImages,
  selectedByItemId,
  editing,
  initialize,
  onEdit,
  onCancelEdit,
  onDeleteSelected,
  // -- actions --
  select,
  // -- Redux Form --
  handleSubmit,
  dirty,
  submitting,
  reset,
  change
}) => {
  useEffect(() => {
    initialize({ topImages })
    onCancelEdit()
  }, [topImages])

  return (
    <Form onSubmit={handleSubmit}>
      <TopImageControl
        selectedByItemId={selectedByItemId}
        editing={editing}
        onEdit={onEdit}
        onCancelEdit={onCancelEdit}
        onDeleteSelected={onDeleteSelected}
        dirty={dirty}
        submitting={submitting}
        reset={reset}
      />
      <FieldArray
        name="topImages"
        component={_TopImageGrid}
        topImages={topImages}
        selectedByItemId={selectedByItemId}
        editing={editing}
        select={select}
        change={change}
      />
    </Form>
  )
}

const TopImageControl = ({
  selectedByItemId,
  editing,
  onEdit,
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
        <Button variant="outline-secondary" type="button" onClick={onEdit}>
          {"編集"}
        </Button>
      )}
    </div>
  )
}

const _TopImageGrid = ({
  topImages,
  selectedByItemId,
  editing,
  change,
  // -- actions --
  select,
  // -- Redux Form --
  fields
}) => {
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
              <ImageField
                name="image"
                classNamePrefix="image"
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
              <ImageField
                name="thumbnailImage"
                classNamePrefix="thumbnail-image"
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
          render: item => (
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

export const ImageField = ({
  name,
  classNamePrefix,
  index,
  change,
  editing
}) => {
  return (
    <Fields
      names={[
        `topImages[${index}].${name}.name`,
        `topImages[${index}].${name}.url`,
        `topImages[${index}].${name}.newFile`,
        `topImages[${index}].${name}.originalUrl`
      ]}
      component={_ImageField}
      name={name}
      classNamePrefix={classNamePrefix}
      index={index}
      change={change}
      editing={editing}
    />
  )
}

const _ImageField = ({
  name,
  classNamePrefix,
  index,
  change,
  editing,
  // -- Redux Form --
  names,
  topImages: {
    [index]: {
      [name]: {
        url: {
          input: { value: url }
        },
        originalUrl: {
          input: { value: originalUrl }
        }
      }
    }
  }
}) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const containerElement = containerRef.current
    const innerElement = containerElement.children[0]
    innerElement.onload = () => {
      adjustElementWidth(containerElement, innerElement)
    }
  }, [url])

  const handleSelect = e => {
    e.preventDefault()
    const file = e.target.files[0]
    change(names[1], URL.createObjectURL(file))
    change(names[2], file)
    change(names[3], url)
    // 同じファイルをアップロードしてもonChangeイベントを走らせるためvalueを空にする
    e.target.value = ""
  }

  // 取り消しボタンをクリックした際の処理
  const handleRemoveButtonClick = e => {
    e.preventDefault()
    change(names[1], originalUrl)
    change(names[2], null)
  }

  const dirty = originalUrl && url !== originalUrl

  return (
    <div className={`image-field ${classNamePrefix}-field`} ref={containerRef}>
      <img
        className="preview-image"
        src={url}
        style={{ opacity: editing && !dirty ? 0.5 : 1 }}
      />
      {editing && (
        <label
          className="image-file-input-label"
          htmlFor={`topImages[${index}].${name}`}>
          {!dirty && (
            <i className="fas fa-file-upload image-file-upload-icon"></i>
          )}
          <input
            className="image-file-input"
            type="file"
            id={`topImages[${index}].${name}`}
            accept=".gif, .jpg, .jpeg, .png"
            onChange={handleSelect}
          />
        </label>
      )}
      {editing && dirty && (
        <div
          className="image-field-remove-button"
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
