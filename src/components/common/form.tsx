import { ChangeEvent, MouseEventHandler, ReactNode, useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { Badge, CloseButton, Form } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  FieldArrayWithId,
  FieldPathByValue,
  FieldValues,
  PathValue,
  useController,
  UseControllerProps,
  useFieldArray,
  UseFieldArrayReturn,
  useFormContext,
  useWatch,
} from "react-hook-form";
import Notification from "@/components/common/Notification";
import { IMAGE_FILE_ACCEPTABLE_EXTENTIONS, IMAGE_FILE_MAX_SIZE, USE_CURRENT_DATE_TIME } from "@/constants";
import { useDropFile } from "@/hooks";
import { FieldArrayPathByValue, ImageState } from "@/types";
import { getDateFromUnixTimestamp, getNowUnixTimestamp, getUnixTimestampFromDate } from "@/utils/dateUtil";
import { renderMarkdown } from "@/utils/domUtil";
import { validateFile } from "@/utils/fIleUtil";

export function RequiredBadge() {
  return (
    <Badge pill bg="danger">
      {"必須"}
    </Badge>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Form.Label
      css={css`
        padding-right: 4px;
        font-weight: bold;
      `}
    >
      {children}
    </Form.Label>
  );
}

export function FieldErrorMessage({ children }: { children: ReactNode }) {
  return (
    <span
      css={css`
        padding-left: 8px;
        color: darkred;
      `}
    >
      {children}
    </span>
  );
}

type TextFieldProps<T extends FieldValues> = {
  label: string;
} & UseControllerProps<T, FieldPathByValue<T, string>>;

export function TextField<T extends FieldValues>({ label, name, rules }: TextFieldProps<T>) {
  const { control, register } = useFormContext<T>();
  const {
    formState: { isSubmitSuccessful },
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <Form.Group
      controlId={name}
      css={css`
        margin-bottom: 1rem;
      `}
    >
      <FieldLabel>{label}</FieldLabel>
      {rules?.required && <RequiredBadge />}
      {!isSubmitSuccessful && error && <FieldErrorMessage>{error.message}</FieldErrorMessage>}
      <Form.Control type="text" {...register(name, rules)} />
    </Form.Group>
  );
}

type DateTimeFieldProps<T extends FieldValues> = {
  label: string;
  dateFormat?: string | string[];
  showTimeInput?: boolean;
  useCurrentDateTimeCheckbox?: boolean;
} & UseControllerProps<T, FieldPathByValue<T, number>>;

export function DateTimeField<T extends FieldValues>({
  label,
  name,
  defaultValue,
  rules,
  dateFormat = "yyyy/MM/dd",
  showTimeInput,
  useCurrentDateTimeCheckbox = false,
}: DateTimeFieldProps<T>) {
  const [useCurrentDateTime, setUseCurrentDateTime] = useState(useCurrentDateTimeCheckbox);
  const { control, register, setValue, resetField } = useFormContext<T>();
  const {
    formState: { isDirty, isSubmitSuccessful },
    fieldState: { error },
  } = useController({ name, control, rules });
  const { onBlur, ref } = register(name, rules);
  const value = useWatch<T>({ name, control });

  useEffect(() => {
    if (useCurrentDateTimeCheckbox && !isDirty) {
      changeUseCurrentDateTime(defaultValue === USE_CURRENT_DATE_TIME);
    }
  }, [defaultValue, isDirty]);

  const changeUseCurrentDateTime = (useCurrentDateTime: boolean) => {
    setUseCurrentDateTime(useCurrentDateTime);
    if (useCurrentDateTime) {
      setValue(name, USE_CURRENT_DATE_TIME as PathValue<T, typeof name>, { shouldDirty: true });
    } else {
      if (defaultValue === USE_CURRENT_DATE_TIME) {
        setValue(name, getNowUnixTimestamp() as PathValue<T, typeof name>, { shouldDirty: true });
      } else {
        resetField(name);
      }
    }
  };

  const handleChange = (date: Date) => {
    setValue(name, getUnixTimestampFromDate(date) as PathValue<T, typeof name>, { shouldDirty: true });
  };

  return (
    <Form.Group
      controlId={name}
      css={css`
        margin-bottom: 1rem;
      `}
    >
      <FieldLabel>{label}</FieldLabel>
      {rules?.required && <RequiredBadge />}
      {!isSubmitSuccessful && error && <FieldErrorMessage>{error.message}</FieldErrorMessage>}
      <div
        css={css`
          display: flex;
          align-items: baseline;

          .react-datepicker-wrapper {
            width: 200px !important;
          }
        `}
      >
        {useCurrentDateTimeCheckbox && (
          <Form.Check
            type="checkbox"
            id={`${name}_useCurrentDateTime`}
            onChange={() => changeUseCurrentDateTime(!useCurrentDateTime)}
            checked={useCurrentDateTime}
            label="現在日時を使用する"
            css={css`
              margin-right: 16px;
            `}
          />
        )}
        <ReactDatePicker
          name={name}
          onBlur={onBlur}
          onChange={handleChange}
          disabled={useCurrentDateTime}
          selected={value === USE_CURRENT_DATE_TIME ? null : getDateFromUnixTimestamp(value)}
          locale="ja"
          dateFormat={dateFormat}
          showTimeInput={showTimeInput}
          customInput={<Form.Control type="text" ref={ref} />}
          css={
            useCurrentDateTime &&
            css`
              visibility: hidden;
            `
          }
        />
      </div>
    </Form.Group>
  );
}

type ImageFileFieldArrayProps<T extends FieldValues> = {
  label: string;
  width: number;
  height: number;
  fit?: "contain" | "cover";
  uploadIconWidth: number;
} & UseControllerProps<T, FieldPathByValue<T, ImageState[]>>;

export function ImageFileFieldArray<T extends FieldValues>({
  label,
  name,
  rules,
  width,
  height,
  fit = "contain",
  uploadIconWidth,
}: ImageFileFieldArrayProps<T>) {
  const fileInputLabelRef = useRef<HTMLLabelElement>(null);
  const { control } = useFormContext<T>();
  const {
    fieldState: { error },
    formState: { isSubmitSuccessful },
  } = useController<T, typeof name>({ name, control, rules });
  const useFieldArrayReturn = useFieldArray({ control, name: name as FieldArrayPathByValue<T, ImageState> });
  const { fields, append } = useFieldArrayReturn;

  const validate = (file: File) => {
    const validationResult = validateFile(file, IMAGE_FILE_ACCEPTABLE_EXTENTIONS, IMAGE_FILE_MAX_SIZE);
    if (validationResult) {
      Notification.error(validationResult);
      return false;
    }
    return true;
  };

  const addFile = (file: File) => {
    append({
      url: URL.createObjectURL(file),
      file,
    } as PathValue<T, typeof name>);
  };

  useDropFile(fileInputLabelRef, validate, addFile);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const file = e.target.files[0];
      if (validate(file)) {
        addFile(file);
      }
    }
    // 同じファイルをアップロードしてもonChangeイベントを走らせるためvalueを空にする
    e.target.value = "";
  };

  return (
    <div
      css={css`
        padding: 8px 0;
      `}
    >
      <FieldLabel>{label}</FieldLabel>
      {rules?.required && <RequiredBadge />}
      {!isSubmitSuccessful && error?.root && <FieldErrorMessage>{error.root.message}</FieldErrorMessage>}
      <div
        css={css`
          display: flex;
          flex-wrap: wrap;
        `}
      >
        <DndProvider backend={HTML5Backend}>
          {fields.map((field, index) => (
            <ImageFileFieldArrayItem
              key={field.id}
              field={field}
              index={index}
              width={width}
              height={height}
              fit={fit}
              {...useFieldArrayReturn}
            />
          ))}
        </DndProvider>
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 200px;
            height: 200px;
            margin: 0 8px 8px 0;
            overflow: hidden;
            border: 1px dotted #ababab;
            cursor: move;
          `}
        >
          <label
            htmlFor={name}
            css={css`
              display: block;
              position: absolute;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              margin: 0;
              cursor: pointer;
            `}
          >
            <i
              className="fas fa-file-upload"
              css={css`
                display: block;
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                margin: auto;
                color: lightgray;
                text-align: center;
                width: ${uploadIconWidth}px;
                height: ${uploadIconWidth}px;
                font-size: ${uploadIconWidth}px;
                line-height: ${uploadIconWidth}px;
              `}
            ></i>
            <input
              type="file"
              id={name}
              accept={IMAGE_FILE_ACCEPTABLE_EXTENTIONS.join(", ")}
              onChange={handleChange}
              css={css`
                display: none;
              `}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

type DragObject = {
  id: string;
  index: number;
};

function ImageFileFieldArrayItem<T extends FieldValues>({
  field: fieldWithId,
  index,
  width,
  height,
  fit,
  move,
  update,
  remove,
}: {
  field: FieldArrayWithId<T, FieldArrayPathByValue<T, ImageState>>;
  index: number;
  width: number;
  height: number;
  fit?: "contain" | "cover";
} & UseFieldArrayReturn<T, FieldArrayPathByValue<T, ImageState>>) {
  const itemRef = useRef<HTMLDivElement>(null);
  const field = fieldWithId as ImageState;

  const [, drag] = useDrag<DragObject>({
    type: "ImageFileFieldArrayItem",
    item: { id: fieldWithId.id, index },
  });

  const [, drop] = useDrop<DragObject>({
    accept: "ImageFileFieldArrayItem",
    drop: (item) => move(item.index, index),
  });

  drag(drop(itemRef));

  const handleContainerClick = () => {
    if (field.removed) {
      update(index, { ...fieldWithId, removed: false });
    }
  };

  const handleRemoveButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    if (field.beforeUrl) {
      update(index, { ...fieldWithId, removed: true });
    } else {
      remove(index);
    }
  };

  return (
    <div
      ref={itemRef}
      onClick={handleContainerClick}
      css={css`
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: ${width}px;
        height: ${height}px;
        margin: 0 8px 8px 0;
        overflow: hidden;
        border: 1px dotted #ababab;
        cursor: ${field.removed ? "pointer" : "move"};
      `}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={field.url}
        alt={""}
        css={css`
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          object-fit: ${fit};
          ${field.removed &&
          css`
            opacity: 0.2;
          `};
        `}
      />
      {!field.removed && (
        <CloseButton
          onClick={handleRemoveButtonClick}
          css={css`
            position: absolute;
            top: 8px;
            right: 8px;
          `}
        />
      )}
    </div>
  );
}

type MarkdownTextareaFieldProps<T extends FieldValues> = {
  label: string;
} & UseControllerProps<T, FieldPathByValue<T, string>>;

export function MarkdownTextareaField<T extends FieldValues>({ label, name, rules }: MarkdownTextareaFieldProps<T>) {
  const { control, register } = useFormContext<T>();
  const {
    formState: { isSubmitSuccessful },
    fieldState: { error },
  } = useController({ name, control, rules });
  const value = useWatch<T>({ name, control });

  return (
    <Form.Group
      controlId={name}
      css={css`
        margin-bottom: 1rem;
      `}
    >
      <FieldLabel>{label}</FieldLabel>
      {rules?.required && <RequiredBadge />}
      {!isSubmitSuccessful && error && <FieldErrorMessage>{error.message}</FieldErrorMessage>}
      <div
        css={css`
          display: flex;
        `}
      >
        <div
          css={css`
            flex: 1;
          `}
        >
          <Form.Control
            as="textarea"
            {...register(name, rules)}
            css={css`
              height: 512px;
              resize: vertical;
            `}
          />
        </div>
        <div
          css={css`
            flex: 1;
            margin-left: 8px;
          `}
        >
          <div
            css={css`
              height: 512px;
              padding: 8px;
              border: 1px dotted #cdcdcd;
              overflow: scroll;
            `}
          >
            {renderMarkdown(value)}
          </div>
        </div>
      </div>
    </Form.Group>
  );
}

type RadioFieldProps<T extends FieldValues, R extends string | number> = {
  label: string;
  options: RadioFieldOption<R>[];
} & UseControllerProps<T, FieldPathByValue<T, R>>;

type RadioFieldOption<R extends string | number> = {
  label: string;
  value: R;
};

export function RadioField<T extends FieldValues, R extends string | number>({
  label,
  name,
  rules,
  options,
}: RadioFieldProps<T, R>) {
  const { control, register } = useFormContext<T>();
  const {
    formState: { isSubmitSuccessful },
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <Form.Group
      controlId={name}
      css={css`
        margin-bottom: 1rem;
      `}
    >
      <FieldLabel>{label}</FieldLabel>
      {rules?.required && <RequiredBadge />}
      {!isSubmitSuccessful && error && <FieldErrorMessage>{error.message}</FieldErrorMessage>}
      <div>
        {options.map((option, index) => (
          <Form.Check
            key={index}
            id={`${name}_${option.value}`}
            type="radio"
            inline
            label={option.label}
            value={option.value}
            {...register(name, rules)}
          />
        ))}
      </div>
    </Form.Group>
  );
}
