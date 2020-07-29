import React, { useRef, useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Form, ButtonGroup, Button, Badge } from "react-bootstrap"
import { bindActionCreators } from "redux"
import { reduxForm, Field, Fields, FieldArray } from "redux-form"
import { formatDateTimeFromUnixTimestamp } from "../../../utils/dateUtil"
import { callFunction, saveFile, deleteFile } from "../../../common/firebase"
import { useAdjustElementWidth, useDropFile } from "../../../common/hooks"
import {
  Globals,
  IMAGE_FILE_ACCEPTABLE_EXTENTIONS
} from "../../../common/models"
import { TextareaField } from "../../../common/components/fields"
import Grid from "../../../common/components/Grid"
import Notification from "../../../common/components/Notification"
import { list, select, edit, cancelEdit } from "../actions"
import { MODULE_NAME } from "../models"

const TopImageGrid = ({
  // -- Redux Form --
  initialize,
  handleSubmit,
  dirty,
  submitting,
  reset,
  change
}) => {
  const items = useSelector(state => state[MODULE_NAME].items)
  const selectedByItemId = useSelector(
    state => state[MODULE_NAME].selectedByItemId
  )
  const editing = useSelector(state => state[MODULE_NAME].editing)
  const dispatch = useDispatch()

  const load = async () => {
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
  }
  useEffect(() => {
    load()
  }, [])

  const handleSelect = bindActionCreators(select, dispatch)

  const handleEdit = useCallback(() => {
    dispatch(edit())
  }, [])

  const handleCancelEdit = useCallback(() => {
    // 値が変わっていればアラートを表示する
    if (dirty && !confirm("内容が変更されています。破棄してよろしいですか？")) {
      return
    }
    reset()
    dispatch(cancelEdit())
  }, [dirty])

  const handleDeleteSelected = useCallback(async () => {
    if (
      !confirm("チェックしたトップ画像を削除します。本当によろしいですか？")
    ) {
      return
    }
    const result = await Promise.allSettled(
      Object.entries(selectedByItemId)
        .filter(entry => entry[1])
        .map(entry =>
          callFunction({
            name: "api-topImages-deleteById",
            data: { id: entry[0] },
            globals: Globals
          }).catch(error => {
            console.error(error)
            Notification.error(
              `トップ画像 [${entry[0]}] の削除に失敗しました。\n` +
                JSON.stringify(error)
            )
          })
        )
    )
    if (result.find(item => item.status === "fulfilled")) {
      Notification.success("トップ画像を削除しました。")
      load()
    }
  }, [selectedByItemId])

  useEffect(() => {
    initialize({ topImages: items })
    dispatch(cancelEdit())
  }, [items])

  return (
    <Form onSubmit={handleSubmit}>
      <TopImageControl
        selectedByItemId={selectedByItemId}
        editing={editing}
        onEdit={handleEdit}
        onCancelEdit={handleCancelEdit}
        onDeleteSelected={handleDeleteSelected}
        dirty={dirty}
        submitting={submitting}
        reset={reset}
      />
      <FieldArray
        name="topImages"
        component={_TopImageGrid}
        items={items}
        selectedByItemId={selectedByItemId}
        onSelect={handleSelect}
        editing={editing}
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
        onClick={onDeleteSelected}>
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
            onClick={onCancelEdit}>
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
  items,
  selectedByItemId,
  onSelect,
  editing,
  change,
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
      items={items}
      selectedByItemId={selectedByItemId}
      onSelect={onSelect}
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
  const fieldRef = useRef(null)
  const previewImageRef = useRef(null)
  useAdjustElementWidth(fieldRef, previewImageRef, [url])

  const fileInputLabelRef = useRef(null)
  const changeFile = file => {
    change(names[1], URL.createObjectURL(file))
    change(names[2], file)
    change(names[3], url)
  }
  useDropFile(fileInputLabelRef, changeFile, IMAGE_FILE_ACCEPTABLE_EXTENTIONS, [
    editing
  ])

  const handleChange = e => {
    e.preventDefault()
    changeFile(e.target.files[0])
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
    <div className={`image-field ${classNamePrefix}-field`} ref={fieldRef}>
      <img
        className="preview-image"
        src={url}
        style={{ opacity: editing && !dirty ? 0.5 : 1 }}
        ref={previewImageRef}
      />
      {editing && (
        <label
          className="image-file-input-label"
          htmlFor={`topImages[${index}].${name}`}
          ref={fileInputLabelRef}>
          {!dirty && (
            <i className="fas fa-file-upload image-file-upload-icon"></i>
          )}
          <input
            className="image-file-input"
            type="file"
            id={`topImages[${index}].${name}`}
            accept=".gif, .jpg, .jpeg, .png"
            onChange={handleChange}
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
  validate: validate,
  onSubmit: async (values, dispatch) => {
    let data = await Promise.all(
      values.topImages.map(async (topImage, index) => {
        let imageName = topImage.image.name
        if (topImage.image.newFile) {
          let hasError = false
          try {
            // 画像を削除する
            await deleteFile(imageName)
          } catch (error) {
            console.error(error)
            Notification.error(
              `画像 [${imageName}] の削除に失敗しました。\n` +
                JSON.stringify(error)
            )
            hasError = true
          }
          if (!hasError) {
            const file = topImage.image.newFile
            imageName = `topImages/${topImage.id}/image/${file.name}`
            try {
              // 画像をアップロードする
              await saveFile(file, imageName)
            } catch (error) {
              console.error(error)
              Notification.error(
                `画像 [${imageName}] のアップロードに失敗しました。\n` +
                  JSON.stringify(error)
              )
              imageName = topImage.image.name
            }
          }
        }
        let thumbnailImageName = topImage.thumbnailImage.name
        if (topImage.thumbnailImage.newFile) {
          let hasError = false
          try {
            // 画像を削除する
            await deleteFile(thumbnailImageName)
          } catch (error) {
            console.error(error)
            Notification.error(
              `画像 [${thumbnailImageName}] の削除に失敗しました。\n` +
                JSON.stringify(error)
            )
            hasError = true
          }
          if (!hasError) {
            const file = topImage.thumbnailImage.newFile
            thumbnailImageName = `topImages/${topImage.id}/thumbnailImage/${file.name}`
            try {
              // サムネイル画像をアップロードする
              await saveFile(file, thumbnailImageName)
            } catch (error) {
              console.error(error)
              Notification.error(
                `画像 [${thumbnailImageName}] のアップロードに失敗しました。\n` +
                  JSON.stringify(error)
              )
              thumbnailImageName = topImage.thumbnailImage.name
            }
          }
        }
        return {
          id: topImage.id,
          image: {
            name: imageName
          },
          thumbnailImage: {
            name: thumbnailImageName
          },
          description: topImage.description,
          // 表示順を設定し直す
          order: index
        }
      })
    )
    // トップ画像を一括で更新する
    try {
      await callFunction({
        name: "api-topImages-bulkUpdate",
        data,
        globals: Globals
      })
      Notification.success("トップ画像を更新しました。")
    } catch (error) {
      console.error(error)
      Notification.error(
        "トップ画像の更新に失敗しました。\n" + JSON.stringify(error)
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
  }
})(TopImageGrid)
