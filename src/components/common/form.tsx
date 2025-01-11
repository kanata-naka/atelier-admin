import { ChangeEvent, MouseEventHandler, ReactNode, useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import Image from "next/image";
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
import { DragObject, FieldArrayPathByValue, ImageFieldValues, RadioFieldOption } from "@/types";
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

export function TextField<TFieldValues extends FieldValues, TPath extends FieldPathByValue<TFieldValues, string>>({
  label,
  name,
  rules,
}: {
  label: string;
} & UseControllerProps<TFieldValues, TPath>) {
  const { control, register } = useFormContext<TFieldValues>();
  const {
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
      {error && <FieldErrorMessage>{error.message}</FieldErrorMessage>}
      <Form.Control type="text" {...register(name, rules)} />
    </Form.Group>
  );
}

export function DateTimeField<
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, number | typeof USE_CURRENT_DATE_TIME>
>({
  label,
  name,
  defaultValue,
  rules,
  dateFormat = "yyyy/MM/dd",
  showTimeInput = false,
  useCurrentDateTimeCheckbox = false,
}: {
  label: string;
  dateFormat?: string | string[];
  showTimeInput?: boolean;
  useCurrentDateTimeCheckbox?: boolean;
} & UseControllerProps<TFieldValues, TPath>) {
  const [useCurrentDateTime, setUseCurrentDateTime] = useState(useCurrentDateTimeCheckbox);
  const { control, register, setValue, resetField } = useFormContext<TFieldValues>();
  const {
    formState: { isDirty, isSubmitted },
    fieldState: { error },
  } = useController({ name, control, rules });
  const { onBlur, ref } = register(name, rules);
  const value = useWatch({ name, control });

  useEffect(() => {
    if (useCurrentDateTimeCheckbox && !isDirty) {
      changeUseCurrentDateTime(defaultValue === USE_CURRENT_DATE_TIME);
    }
  }, [defaultValue, isDirty]);

  const change = (value?: number | typeof USE_CURRENT_DATE_TIME) => {
    setValue(name, value as PathValue<TFieldValues, TPath>, { shouldDirty: true, shouldValidate: isSubmitted });
  };

  const changeUseCurrentDateTime = (useCurrentDateTime: boolean) => {
    setUseCurrentDateTime(useCurrentDateTime);
    if (useCurrentDateTime) {
      change(USE_CURRENT_DATE_TIME);
    } else {
      if (defaultValue === USE_CURRENT_DATE_TIME) {
        change(getNowUnixTimestamp());
      } else {
        resetField(name);
      }
    }
  };

  const handleChange = (date: Date) => {
    change(getUnixTimestampFromDate(date));
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
      {error && <FieldErrorMessage>{error.message}</FieldErrorMessage>}
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

export function ImageFileField<
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, ImageFieldValues>
>({
  label,
  name,
  rules,
  width,
  height,
  fit = "contain",
  uploadIconWidth,
}: {
  label: string;
  width: number;
  height: number;
  fit?: "contain" | "cover";
  uploadIconWidth: number;
} & UseControllerProps<TFieldValues, TPath>) {
  const fileInputLabelRef = useRef<HTMLLabelElement>(null);
  const { control, setValue } = useFormContext<TFieldValues>();
  const {
    fieldState: { error },
    formState: { isSubmitted },
  } = useController({ name, control, rules });
  const value: ImageFieldValues = useWatch({ name, control });

  const validate = (file: File) => {
    const validationResult = validateFile(file, IMAGE_FILE_ACCEPTABLE_EXTENTIONS, IMAGE_FILE_MAX_SIZE);
    if (validationResult) {
      Notification.error(validationResult);
      return false;
    }
    return true;
  };

  const change = (value: ImageFieldValues) => {
    setValue(name, value as PathValue<TFieldValues, TPath>, { shouldDirty: true, shouldValidate: isSubmitted });
  };

  const setFile = (file: File) => {
    change({
      name: value.name,
      url: URL.createObjectURL(file),
      file,
      beforeUrl: value.beforeUrl,
    });
  };

  useDropFile(fileInputLabelRef, validate, setFile);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const file = e.target.files[0];
      if (validate(file)) {
        setFile(file);
      }
    }
    // 同じファイルをアップロードしてもonChangeイベントを走らせるためvalueを空にする
    e.target.value = "";
  };

  const handleRemoveButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    change({
      name: value.name,
      url: value.beforeUrl,
      file: null,
      beforeUrl: value.beforeUrl,
    });
  };

  return (
    <div
      css={css`
        padding: 8px 0;
      `}
    >
      <FieldLabel>{label}</FieldLabel>
      {rules?.required && <RequiredBadge />}
      {error?.root && <FieldErrorMessage>{error.root.message}</FieldErrorMessage>}
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 4px;
          overflow: hidden;
          border: 1px dotted #ababab;
          width: ${width}px;
          height: ${height}px;
        `}
      >
        {value.url && (
          <Image
            src={value.url}
            width={width}
            height={height}
            alt={label}
            css={css`
              object-fit: ${fit};
              opacity: ${value.removed ? 0.2 : 1};
            `}
          />
        )}
        <label
          ref={fileInputLabelRef}
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
          {!value.url && (
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
          )}
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
        {!value.removed && (
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
    </div>
  );
}

export function ImageFileFieldArray<
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, ImageFieldValues[]>
>({
  label,
  name,
  rules,
  width,
  height,
  fit = "contain",
  uploadIconWidth,
}: {
  label: string;
  width: number;
  height: number;
  fit?: "contain" | "cover";
  uploadIconWidth: number;
} & UseControllerProps<TFieldValues, TPath>) {
  const fileInputLabelRef = useRef<HTMLLabelElement>(null);
  const { control } = useFormContext<TFieldValues>();
  const {
    fieldState: { error },
  } = useController({ name, control, rules });
  const useFieldArrayReturn = useFieldArray({
    control,
    name: name as FieldArrayPathByValue<TFieldValues, ImageFieldValues>,
  });
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
    } as PathValue<TFieldValues, TPath>);
  };

  useDropFile(fileInputLabelRef, validate, addFile, []);

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
      {error?.root && <FieldErrorMessage>{error.root.message}</FieldErrorMessage>}
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
            ref={fileInputLabelRef}
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

function ImageFileFieldArrayItem<
  TFieldValues extends FieldValues,
  TArrayPath extends FieldArrayPathByValue<TFieldValues, ImageFieldValues>
>({
  field,
  index,
  width,
  height,
  fit,
  move,
  update,
  remove,
}: {
  field: FieldArrayWithId<TFieldValues, TArrayPath>;
  index: number;
  width: number;
  height: number;
  fit?: "contain" | "cover";
} & UseFieldArrayReturn<TFieldValues, TArrayPath>) {
  const itemRef = useRef<HTMLDivElement>(null);
  const item = field as any as ImageFieldValues;

  const [, drag] = useDrag<DragObject>({
    type: "ImageFileFieldArrayItem",
    item: { id: field.id, index },
  });

  const [, drop] = useDrop<DragObject>({
    accept: "ImageFileFieldArrayItem",
    drop: (item) => move(item.index, index),
  });

  drag(drop(itemRef));

  const handleContainerClick = () => {
    if (item.removed) {
      update(index, { ...field, removed: false });
    }
  };

  const handleRemoveButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    if (item.beforeUrl) {
      update(index, { ...field, removed: true });
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
        cursor: ${item.removed ? "pointer" : "move"};
      `}
    >
      {item.url && (
        <Image
          src={item.url}
          width={width}
          height={height}
          alt={""}
          css={css`
            object-fit: ${fit};
            ${item.removed &&
            css`
              opacity: 0.2;
            `};
          `}
        />
      )}
      {!item.removed && (
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

export function MarkdownTextareaField<
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, string>
>({
  label,
  name,
  rules,
}: {
  label: string;
} & UseControllerProps<TFieldValues, TPath>) {
  const { control, register } = useFormContext<TFieldValues>();
  const {
    fieldState: { error },
  } = useController({ name, control, rules });
  const value = useWatch({ name, control });

  return (
    <Form.Group
      controlId={name}
      css={css`
        margin-bottom: 1rem;
      `}
    >
      <FieldLabel>{label}</FieldLabel>
      {rules?.required && <RequiredBadge />}
      {error && <FieldErrorMessage>{error.message}</FieldErrorMessage>}
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

export function RadioField<
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, string | number>
>({
  label,
  name,
  rules,
  options,
}: {
  label: string;
  options: RadioFieldOption[];
} & UseControllerProps<TFieldValues, TPath>) {
  const { control, register } = useFormContext<TFieldValues>();
  const {
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
      {error && <FieldErrorMessage>{error.message}</FieldErrorMessage>}
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

export function CheckBoxField<
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, string | number>
>({
  label,
  name,
  rules,
}: {
  label: string;
} & UseControllerProps<TFieldValues, TPath>) {
  const { control, register } = useFormContext<TFieldValues>();
  const {
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <Form.Group
      controlId={name}
      css={css`
        margin-bottom: 1rem;
      `}
    >
      {error && <FieldErrorMessage>{error.message}</FieldErrorMessage>}
      <Form.Check id={name} type="checkbox" label={label} {...register(name, rules)} />
    </Form.Group>
  );
}
