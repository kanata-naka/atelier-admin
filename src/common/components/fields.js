import React from "react"
import { Form, Badge } from "react-bootstrap"

export class InputField extends React.Component {
  render() {
    const {
      input,
      type,
      label,
      required,
      placeholder,
      className,
      meta: { touched, error }
    } = this.props
    return (
      <Form.Group controlId={input.name}>
        <Form.Label>{label}</Form.Label>
        {required && (
          <Badge pill variant="danger">
            必須
          </Badge>
        )}
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
}

export class TextareaField extends React.Component {
  render() {
    const {
      input,
      label,
      required,
      placeholder,
      className,
      meta: { touched, error }
    } = this.props
    return (
      <Form.Group controlId={input.name}>
        <Form.Label>{label}</Form.Label>
        {required && (
          <Badge pill variant="danger">
            必須
          </Badge>
        )}
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
}
