import React, { useState, useRef, useEffect, useCallback } from "react";
import { Form } from "react-bootstrap";
import DatePicker, { registerLocale } from "react-datepicker";
import { DndProvider, useDrag, useDrop } from "react-dnd-cjs";
import HTML5Backend from "react-dnd-html5-backend-cjs";
import { Fields } from "redux-form";
import ja from "date-fns/locale/ja";
import { useAdjustElementWidth, useDropFile } from "../hooks";
import {
  IMAGE_FILE_ACCEPTABLE_EXTENTIONS,
  IMAGE_FILE_MAX_SIZE
} from "../models";
import Notification from "./Notification";
import {
  getNowDate,
  getDateFromUnixTimestamp,
  getUnixTimestampFromDate
} from "../../utils/dateUtil";
import { renderMarkdown } from "../../utils/domUtil";
import { validateFile } from "../../utils/fileUtil";
import { RequiredLabel } from "./elements";

// ※date-fns/local/ja はデフォルトで月曜日始まり
// →日曜日始まりに変更する
ja.options.weekStartsOn = 0;
registerLocale("ja", ja);

export const InputField = ({
  type,
  label,
  required,
  placeholder,
  className,
  // -- Redux Form --
  input,
  meta: { touched, error }
}) => {
  return (
    <Form.Group controlId={input.name}>
      <Form.Label>{label}</Form.Label>
      {required && <RequiredLabel />}
      {touched && error && <span className="error-message">{error}</span>}
      <Form.Control
        type={type}
        className={className}
        placeholder={placeholder}
        {...input}
      />
    </Form.Group>
  );
};

export const TextareaField = ({
  label,
  required,
  placeholder,
  className,
  // -- Redux Form --
  input,
  meta: { touched, error }
}) => {
  return (
    <Form.Group controlId={input.name}>
      <Form.Label>{label}</Form.Label>
      {required && <RequiredLabel />}
      {touched && error && <span className="error-message">{error}</span>}
      <Form.Control
        as="textarea"
        className={className}
        placeholder={placeholder}
        {...input}>
        {input.value}
      </Form.Control>
    </Form.Group>
  );
};

export const MarkdownTextareaField = ({
  label,
  required,
  placeholder,
  className,
  // -- Redux Form --
  input,
  meta: { touched, error }
}) => {
  return (
    <Form.Group controlId={input.name}>
      <Form.Label>{label}</Form.Label>
      {required && <RequiredLabel />}
      {touched && error && <span className="error-message">{error}</span>}
      <div className="markdown-textarea-container">
        <div className="markdown-textarea-column--left">
          <Form.Control
            as="textarea"
            className={className}
            placeholder={placeholder}
            {...input}>
            {input.value}
          </Form.Control>
        </div>
        <div className="markdown-textarea-column--right">
          <div className="markdown-textarea-preview">
            {renderMarkdown(input.value)}
          </div>
        </div>
      </div>
    </Form.Group>
  );
};

export const CheckboxField = ({
  label,
  className,
  // -- Redux Form --
  input,
  meta: { touched, error }
}) => {
  return (
    <Form.Group controlId={input.name}>
      {touched && error && <span className="error-message">{error}</span>}
      <Form.Check
        className={`checkbox-container ${className || ""}`}
        checked={input.value}
        label={label}
        {...input}></Form.Check>
    </Form.Group>
  );
};

export const DateTimeField = ({
  name,
  label,
  required,
  className,
  dateFormat = "yyyy/MM/dd",
  showTimeInput,
  useCurrentDateTimeCheckbox = false,
  useCurrentDateTimeCheckboxLabel = "現在日時を使用する",
  // -- Redux Form --
  input,
  meta: { initial, dirty, touched, error }
}) => {
  const [useCurrentDateTime, setUseCurrentDateTime] = useState(
    useCurrentDateTimeCheckbox
  );

  const toggleUseCurrentDateTime = _useCurrentDateTime => {
    setUseCurrentDateTime(_useCurrentDateTime);
    // 初期化する
    if (_useCurrentDateTime) {
      input.onChange("");
    } else {
      input.onChange(initial);
    }
  };

  useEffect(() => {
    if (dirty) {
      return;
    }
    toggleUseCurrentDateTime(!initial);
  }, [initial, dirty]);

  const handleChange = date => {
    input.onChange(getUnixTimestampFromDate(date));
  };

  // 「現在日時を使用する」チェックボックスを切り替えた際の処理
  const handleChangeUseCurrentDateTime = () => {
    toggleUseCurrentDateTime(!useCurrentDateTime);
  };

  return (
    <Form.Group controlId={input.name}>
      <Form.Label>{label}</Form.Label>
      {required && <RequiredLabel />}
      {touched && error && <span className="error-message">{error}</span>}
      <div className="datepicker-wrapper">
        {useCurrentDateTimeCheckbox && (
          <div className="checkbox-container use-current-date-time-checkbox">
            <input
              type="checkbox"
              id={`${name}-useCurrentDateTime`}
              onChange={handleChangeUseCurrentDateTime}
              checked={useCurrentDateTime}
            />
            <label htmlFor={`${name}-useCurrentDateTime`}>
              {useCurrentDateTimeCheckboxLabel}
            </label>
          </div>
        )}
        <DatePicker
          selected={getDateFromUnixTimestamp(input.value, getNowDate())}
          onChange={handleChange}
          wrapperClassName={`datepicker-container ${className || ""}`}
          className={`form-control ${useCurrentDateTime ? "hidden" : ""}`}
          locale="ja"
          dateFormat={dateFormat}
          disabled={useCurrentDateTime}
          showTimeInput={showTimeInput}
        />
      </div>
    </Form.Group>
  );
};

export const ImageField = ({
  name,
  classNamePrefix,
  label,
  required,
  fit = "inside",
  change
}) => {
  return (
    <Fields
      names={[`${name}.url`, `${name}.file`]}
      component={_ImageField}
      name={name}
      classNamePrefix={classNamePrefix}
      label={label}
      required={required}
      fit={fit}
      change={change}
    />
  );
};

const _ImageField = ({
  names,
  change,
  name,
  classNamePrefix,
  label,
  required,
  fit,
  // -- Redux Form --
  [name]: {
    url: {
      input: { value: url }
    },
    file: {
      meta: { submitFailed, error }
    }
  }
}) => {
  const fieldRef = useRef(null);
  const previewImageRef = useRef(null);
  useAdjustElementWidth(fieldRef, previewImageRef, fit, [url]);

  const fileInputLabelRef = useRef(null);
  const validate = file => {
    const validationResult = validateFile(
      file,
      IMAGE_FILE_ACCEPTABLE_EXTENTIONS,
      IMAGE_FILE_MAX_SIZE
    );
    if (validationResult) {
      Notification.error(validationResult);
      return false;
    }
    return true;
  };
  const changeFile = file => {
    change(names[0], URL.createObjectURL(file));
    change(names[1], file);
  };
  useDropFile(fileInputLabelRef, validate, changeFile);

  const handleChange = useCallback(e => {
    e.preventDefault();
    const file = e.target.files[0];
    if (validate(file)) {
      changeFile(file);
    }
    // 同じファイルをアップロードしてもonChangeイベントを走らせるためvalueを空にする
    e.target.value = "";
  });

  return (
    <div className="image-field-wrapper">
      <label>{label}</label>
      {required && <RequiredLabel />}
      {submitFailed && error && <span className="error-message">{error}</span>}
      <div className={`image-field ${classNamePrefix}-field`} ref={fieldRef}>
        <img className="preview-image" src={url} ref={previewImageRef} />
        <label
          className={`image-file-input-label`}
          htmlFor={name}
          ref={fileInputLabelRef}>
          {!url && (
            <i className="fas fa-file-upload image-file-upload-icon"></i>
          )}
          <input
            className="image-file-input"
            type="file"
            id={name}
            accept={IMAGE_FILE_ACCEPTABLE_EXTENTIONS.join(", ")}
            onChange={handleChange}
          />
        </label>
      </div>
    </div>
  );
};

export const ImageFieldArray = ({
  label,
  required,
  fit = "inside",
  change,
  // -- Redux Form --
  fields,
  meta: { submitFailed, error }
}) => {
  const fileInputLabelRef = useRef(null);
  const validate = file => {
    const validationResult = validateFile(
      file,
      IMAGE_FILE_ACCEPTABLE_EXTENTIONS,
      IMAGE_FILE_MAX_SIZE
    );
    if (validationResult) {
      Notification.error(validationResult);
      return false;
    }
    return true;
  };
  const addFile = file => {
    fields.push({
      name: file.name,
      url: URL.createObjectURL(file),
      newFile: file
    });
  };

  useDropFile(fileInputLabelRef, validate, addFile);

  const handleChange = useCallback(
    e => {
      e.preventDefault();
      const file = e.target.files[0];
      if (validate(file)) {
        addFile(file);
      }
      // 同じファイルをアップロードしてもonChangeイベントを走らせるためvalueを空にする
      e.target.value = "";
    },
    [fields]
  );

  return (
    <div className="images-field-wrapper">
      <label>{label}</label>
      {required && <RequiredLabel />}
      {submitFailed && error && <span className="error-message">{error}</span>}
      <div className="images-field">
        <DndProvider backend={HTML5Backend}>
          {fields.map((field, index) => {
            return (
              <Fields
                key={field}
                fit={fit}
                names={[
                  `${field}.name`,
                  `${field}.url`,
                  `${field}.newFile`,
                  `${field}.removed`
                ]}
                component={ImageFieldArrayItem}
                index={index}
                change={change}
                fields={fields}
              />
            );
          })}
        </DndProvider>
        <div className="image-field">
          <label
            className="image-file-input-label"
            htmlFor="image"
            ref={fileInputLabelRef}>
            <i className="fas fa-file-upload image-file-upload-icon"></i>
            <input
              className="image-file-input"
              type="file"
              id="image"
              accept={IMAGE_FILE_ACCEPTABLE_EXTENTIONS.join(", ")}
              onChange={handleChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

const ImageFieldArrayItem = ({
  fit,
  names,
  index,
  change,
  fields: { name, move, remove },
  // -- Redux Form --
  [name]: { [index]: values }
}) => {
  const {
    url: {
      input: { value: url }
    },
    newFile: {
      input: { value: newFile }
    },
    removed: {
      input: { value: removed }
    }
  } = values;

  const fieldRef = useRef(null);
  const previewImageRef = useRef(null);
  useAdjustElementWidth(fieldRef, previewImageRef, fit, [url]);

  // ドラッグの設定
  const [{ isDragging }, drag] = useDrag({
    item: { type: "ImageFieldArrayItem", id: `${name}[${index}]`, index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });
  // ドロップの設定
  const [, drop] = useDrop({
    accept: "ImageFieldArrayItem",
    drop(item) {
      const dragIndex = item.index;
      const hoverIndex = index;
      // 要素を入れ替える
      move(dragIndex, hoverIndex);
    }
  });
  drag(drop(fieldRef));

  // 削除フラグがオンになっている既存の画像をクリックした際の処理
  const handleContainerClick = () => {
    if (removed) {
      change(names[3], false);
    }
  };

  // 削除ボタンをクリックした際の処理
  const handleRemoveButtonClick = () => {
    if (newFile) {
      // 新規にアップロードした画像なら要素ごと削除する
      remove(index);
    } else {
      // 削除フラグをオンにする
      change(names[3], true);
    }
  };

  return (
    <div
      className={
        "image-field" +
        (removed ? " removed" : "") +
        (isDragging ? " dragging" : "")
      }
      ref={fieldRef}
      onClick={handleContainerClick}>
      <img className="preview-image" src={url} ref={previewImageRef} />
      {!removed && (
        <div
          className="image-field-remove-button"
          onClick={handleRemoveButtonClick}>
          <i className="fas fa-times"></i>
        </div>
      )}
    </div>
  );
};
