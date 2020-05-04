import React, { useState, useEffect } from "react"
import { Form } from "react-bootstrap"
import DatePicker, { registerLocale } from "react-datepicker"
import ja from "date-fns/locale/ja"
import {
  getNowDate,
  getDateFromUnixTimestamp,
  getUnixTimestampFromDate
} from "../../utils/dateUtil"
import { renderMarkdown } from "../../utils/domUtil"
import { RequiredLabel } from "./elements"

// ※date-fns/local/ja はデフォルトで月曜日始まり
// →日曜日始まりに変更する
ja.options.weekStartsOn = 0
registerLocale("ja", ja)

export const InputField = ({
  input,
  type,
  label,
  required,
  placeholder,
  className,
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
  )
}

/**
 * テキストエリア
 */
export const TextareaField = ({
  input,
  label,
  required,
  placeholder,
  className,
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
  )
}

/**
 * テキストエリア（Markdown用）
 */
export const MarkdownTextareaField = ({
  input,
  label,
  required,
  placeholder,
  className,
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
            { renderMarkdown(input.value) }
          </div>
        </div>
      </div>
    </Form.Group>
  )
}

/**
 * チェックボックス
 */
export const CheckboxField = ({
  input,
  label,
  className,
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
  )
}

/**
 * 日時（datepicker）
 * ※ value: UNIXタイムスタンプ
 */
export const DateTimeField = ({
  input,
  name,
  label,
  required,
  className,
  dateFormat,
  useCurrentDateTimeCheckbox = false,
  useCurrentDateTimeCheckboxLabel = "現在日時を使用する",
  meta: { initial, dirty, touched, error }
}) => {
  const [useCurrentDateTime, setUseCurrentDateTime] = useState(
    useCurrentDateTimeCheckbox
  )

  const toggleUseCurrentDateTime = value => {
    setUseCurrentDateTime(value)
    if (value) {
      // 初期化する
      input.onChange("")
    }
  }

  useEffect(() => {
    if (dirty) {
      return
    }
    toggleUseCurrentDateTime(!initial)
  }, [initial, dirty])

  const handleChange = date => {
    input.onChange(getUnixTimestampFromDate(date))
  }

  // 「現在日時を使用する」チェックボックスを切り替えた際の処理
  const handleChangeUseCurrentDateTime = () => {
    toggleUseCurrentDateTime(!useCurrentDateTime)
  }

  return (
    <Form.Group controlId={input.name}>
      <Form.Label>{label}</Form.Label>
      {required && <RequiredLabel />}
      {touched && error && <span className="error-message">{error}</span>}
      <div className="datepicker-container">
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
          wrapperClassName={className}
          className="form-control"
          locale="ja"
          dateFormat={dateFormat || "yyyy/MM/dd"}
          disabled={useCurrentDateTime}
        />
      </div>
    </Form.Group>
  )
}
