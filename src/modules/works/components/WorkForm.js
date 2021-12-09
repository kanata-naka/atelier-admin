import React, { useEffect } from "react";
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
  RadioField,
  DateTimeField,
  ImageFieldArray
} from "../../../common/components/fields";
import Notification from "../../../common/components/Notification";
import { getNowUnixTimestamp } from "../../../utils/dateUtil";
import { getExtension } from "../../../utils/fileUtil";
import { list } from "../actions";
import { MODULE_NAME, initialValues } from "../models";

const WorkForm = ({
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
    <Form onSubmit={handleSubmit} className="work-form">
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
        dateFormat={["yyyy/MM/dd", "yyyy年MM月dd日"]}
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
        name="restrict"
        component={RadioField}
        label="公開範囲"
        options={[
          {label: "トップページに表示する", value: "0"},
          {label: "ギャラリーにのみ表示する", value: "1"},
          {label: "非公開", value: "2"}
        ]}
        className="restrict-radio"
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

const validate = values => {
  const errors = {};
  if (!values.title) {
    errors.title = "タイトルは必須です";
  }
  return errors;
};

export default reduxForm({
  form: MODULE_NAME,
  validate: validate,
  onSubmit: async (values, dispatch) => {
    const id = values.id || uuidv4();

    let images = [];
    if (values.images && values.images.length) {
      images = values.images
        .filter(imageValue => !imageValue.removed)
        .map(imageValue => {
          if (imageValue.newFile) {
            imageValue.name = `works/${id}/images/${uuidv4()}.${getExtension(
              imageValue.newFile.name
            )}`;
          }
          return {
            name: imageValue.name
          };
        });
    }

    const data = {
      id,
      title: values.title,
      publishedDate: values.publishedDate || getNowUnixTimestamp(),
      images,
      description: values.description,
      restrict: values.restrict
    };

    if (values.id) {
      // 作品を更新する
      try {
        await callFunction({
          name: "works-update",
          data,
          globals: Globals
        });
      } catch (error) {
        console.error(error);
        Notification.error(
          "作品の編集に失敗しました。\n" + JSON.stringify(error)
        );
        throw error;
      }
    } else {
      // 作品を登録する
      try {
        await callFunction({
          name: "works-create",
          data,
          globals: Globals
        });
      } catch (error) {
        console.error(error);
        Notification.error(
          "作品の登録に失敗しました。\n" + JSON.stringify(error)
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
      values.id ? "作品を編集しました。" : "作品を登録しました。"
    );

    callFunction({
      name: "works-get",
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
})(WorkForm);
