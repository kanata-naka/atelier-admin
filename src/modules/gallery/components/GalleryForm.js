import React, { useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Form, ButtonGroup, Button } from "react-bootstrap";
import { reduxForm, Field, FieldArray } from "redux-form";
import uuidv4 from "uuid/v4";
import { callFunction, saveFile } from "../../../common/firebase";
import { Globals } from "../../../common/models";
import { getItemById } from "../../../common/selectors";
import {
  InputField,
  MarkdownTextareaField,
  CheckboxField,
  DateTimeField,
  ImageFieldArray
} from "../../../common/components/fields";
import Notification from "../../../common/components/Notification";
import { getNowUnixTimestamp } from "../../../utils/dateUtil";
import { getExtension } from "../../../utils/fileUtil";
import { list } from "../actions";
import { MODULE_NAME, initialValues } from "../models";

const GalleryForm = ({
  // -- Redux Form --
  initialize,
  handleSubmit,
  dirty,
  submitting,
  reset,
  change
}) => {
  const id = useSelector(state => state[MODULE_NAME].editingItemId);
  const values = useSelector(
    state => getItemById(state[MODULE_NAME]) || initialValues
  );

  useEffect(() => {
    // 現在の作品の編集がキャンセルされた、または別の作品が編集中になった場合
    initialize(values);
  }, [id]);

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
      <Field
        name="createdAt"
        component={DateTimeField}
        label="投稿日時"
        required
        useCurrentDateTimeCheckbox={true}
        dateFormat={["yyyy/MM/dd HH:mm", "yyyy年MM月dd日 HH:mm"]}
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
  );
};

const TagFieldArray = ({ fields, meta: { error } }) => {
  const inputRef = useRef(null);

  const handleTagClick = useCallback(index => {
    fields.remove(index);
  });

  const handleConfirm = useCallback(() => {
    let value = inputRef.current.value.trim();
    if (value === "") {
      return;
    }
    fields.push(value);
    // 現在の入力内容を削除する
    inputRef.current.value = "";
  });

  const handleKeyUp = useCallback(e => {
    if (
      e.keyCode === 13 ||
      (e.keyCode === 32 &&
        inputRef.current.value !== inputRef.current.value.trimEnd())
    ) {
      // スペースキーorエンターキーが(日本語入力の場合は確定後に)押下された場合、タグを追加する
      handleConfirm();
    }
  });

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
            );
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
              e.preventDefault();
            }
          }}
          onKeyUp={handleKeyUp}
          onBlur={handleConfirm}
        />
      </div>
    </Form.Group>
  );
};

const validate = values => {
  const errors = {};
  if (!values.title) {
    errors.title = "タイトルは必須です";
  }
  if (!values.images || !values.images.filter(image => !image.removed).length) {
    errors.images = { _error: "画像は必須です" };
  }
  return errors;
};

export default reduxForm({
  form: MODULE_NAME,
  validate: validate,
  onSubmit: async (values, dispatch) => {
    const id = values.id || uuidv4();

    let images = values.images
      .filter(imageValue => !imageValue.removed)
      .map(imageValue => {
        if (imageValue.newFile) {
          imageValue.name = `arts/${id}/images/${uuidv4()}.${getExtension(
            imageValue.newFile.name
          )}`;
        }
        return {
          name: imageValue.name
        };
      });
    if (!images.length) {
      return;
    }

    const data = {
      id,
      title: values.title,
      tags: values.tags || [],
      images,
      description: values.description,
      pickupFlag: values.pickupFlag,
      createdAt: values.createdAt || getNowUnixTimestamp()
    };

    if (values.id) {
      // イラストを更新する
      try {
        await callFunction({
          name: "api-arts-update",
          data,
          globals: Globals
        });
      } catch (error) {
        console.error(error);
        Notification.error(
          "イラストの編集に失敗しました。\n" + JSON.stringify(error)
        );
        throw error;
      }
    } else {
      // イラストを登録する
      try {
        await callFunction({
          name: "api-arts-create",
          data,
          globals: Globals
        });
      } catch (error) {
        console.error(error);
        Notification.error(
          "イラストの登録に失敗しました。\n" + JSON.stringify(error)
        );
        throw error;
      }
    }

    await Promise.all(
      values.images
        .filter(imageValue => imageValue.newFile)
        .map(async imageValue => {
          try {
            // 新しい画像をアップロードする
            await saveFile(imageValue.newFile, imageValue.name);
          } catch (error) {
            console.error(error);
            Notification.error(
              `画像 [${name}] のアップロードに失敗しました。\n` +
                JSON.stringify(error)
            );
          }
        })
    );

    Notification.success(
      values.id ? "イラストを編集しました。" : "イラストを登録しました。"
    );

    callFunction({
      name: "api-arts-get",
      data: {},
      globals: Globals
    })
      .then(response => dispatch(list(response.data.result)))
      .catch(error => {
        console.error(error);
        Notification.error(
          "読み込みに失敗しました。\n" + JSON.stringify(error)
        );
      });
  },
  onSubmitSuccess: (_result, _dispatch, { initialize }) => {
    // フォームを初期化する
    initialize(initialValues);
  }
})(GalleryForm);
