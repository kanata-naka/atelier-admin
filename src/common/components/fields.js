import { Form } from "react-bootstrap"
import { RequiredLabel } from "./elements"

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
