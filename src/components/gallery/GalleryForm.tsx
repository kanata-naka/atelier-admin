import React, {
  ChangeEvent,
  KeyboardEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
  MouseEventHandler,
} from "react";
import { css } from "@emotion/react";
import { Button, ButtonGroup, CloseButton, Form } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  useController,
  useForm,
  SubmitHandler,
  FieldValues,
  UseControllerProps,
  useFormContext,
  useWatch,
  FormProvider,
  PathValue,
  useFieldArray,
  UseFieldArrayReturn,
  FieldArrayWithId,
} from "react-hook-form";
import Notification from "@/components/common/Notification";
import { IMAGE_FILE_ACCEPTABLE_EXTENTIONS, IMAGE_FILE_MAX_SIZE, Restrict, USE_CURRENT_DATE_TIME } from "@/constants";
import { useDispatch, useDropFile, useSelector } from "@/hooks";
import { GalleryFormState, ImageState, SpecifiedTypeField, TagState } from "@/types";
import { getDateFromUnixTimestamp, getNowUnixTimestamp, getUnixTimestampFromDate } from "@/utils/dateUtil";
import { renderMarkdown } from "@/utils/domUtil";
import { validateFile } from "@/utils/fIleUtil";
import { edit, touchForm } from "./reducer";
import { createOrUpdateArt, fetchArts } from "./services";
import { RequiredBadge } from "../common/form";
import { withLoading } from "../common/services";

const initialValues: GalleryFormState = {
  title: "",
  tags: [],
  images: [],
  description: "",
  restrict: Restrict.ALL,
  createdAt: USE_CURRENT_DATE_TIME,
};

function GalleryForm() {
  const item = useSelector((state) => state.gallery.items.find((item) => item.id === state.gallery.editingItemId));
  const dispatch = useDispatch();
  const useFormReturn = useForm<GalleryFormState>({ defaultValues: initialValues });
  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, defaultValues },
  } = useFormReturn;

  useEffect(() => {
    item ? reset(item) : reset(initialValues);
  }, [item]);

  useEffect(() => {
    dispatch(touchForm(isDirty));
  }, [isDirty]);

  const submit: SubmitHandler<GalleryFormState> = (data, event) => {
    event?.preventDefault();
    withLoading(async () => {
      await createOrUpdateArt(data)
        .then(async (id) => {
          Notification.success("作品を登録しました。");
          await fetchArts(dispatch).catch((error) => {
            console.error(error);
            Notification.error("読み込みに失敗しました。");
          });
          dispatch(edit(id));
        })
        .catch((error) => {
          console.error(error);
          Notification.error("作品の登録に失敗しました。");
        });
    }, dispatch);
  };

  return (
    <FormProvider {...useFormReturn}>
      <Form onSubmit={handleSubmit(submit)}>
        <TextFieldProps name="title" label="タイトル" rules={{ required: "入力してください" }} />
        <DateTimeField
          name="createdAt"
          label="投稿日時"
          defaultValue={defaultValues?.createdAt}
          useCurrentDateTimeCheckbox={true}
          dateFormat={["yyyy/MM/dd HH:mm", "yyyy年MM月dd日 HH:mm"]}
          showTimeInput={true}
          rules={{ required: "選択してください" }}
        />
        <ImageFileFieldArray
          name="images"
          label="画像"
          width={200}
          height={200}
          uploadIconWidth={64}
          rules={{ required: "選択してください" }}
        />
        <TagsField name="tags" label="タグ" />
        <MarkdownTextareaField name="description" label="説明" />
        <RadioField
          name="restrict"
          label="公開範囲"
          options={[
            {
              label: "トップページに表示する",
              value: Restrict.ALL,
            },
            {
              label: "ギャラリーにのみ表示する",
              value: Restrict.LIMITED,
            },
            {
              label: "非公開",
              value: Restrict.PRIVATE,
            },
          ]}
        />
        <ButtonGroup>
          <Button variant="primary" type="submit" disabled={!isDirty || isSubmitting}>
            送信
          </Button>
          <Button variant="secondary" type="button" disabled={!isDirty || isSubmitting} onClick={() => reset()}>
            リセット
          </Button>
        </ButtonGroup>
      </Form>
    </FormProvider>
  );
}

type TextFieldProps<T extends FieldValues> = {
  label: string;
} & UseControllerProps<T, SpecifiedTypeField<T, string>>;

function TextFieldProps<T extends FieldValues>({ label, name, rules }: TextFieldProps<T>) {
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

function FieldLabel({ children }: { children: ReactNode }) {
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

function FieldErrorMessage({ children }: { children: ReactNode }) {
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

type DateTimeFieldProps<T extends FieldValues> = {
  label: string;
  dateFormat?: string | string[];
  showTimeInput?: boolean;
  useCurrentDateTimeCheckbox?: boolean;
} & UseControllerProps<T, SpecifiedTypeField<T, number>>;

function DateTimeField<T extends FieldValues>({
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

type ImageFileFieldArrayProps = {
  label: string;
  width: number;
  height: number;
  fit?: "contain" | "cover";
  uploadIconWidth: number;
} & UseControllerProps<GalleryFormState, SpecifiedTypeField<GalleryFormState, ImageState[]>>;

export function ImageFileFieldArray({
  label,
  name,
  rules,
  width,
  height,
  fit = "contain",
  uploadIconWidth,
}: ImageFileFieldArrayProps) {
  const fileInputLabelRef = useRef<HTMLLabelElement>(null);
  const { control } = useFormContext<GalleryFormState>();
  const {
    fieldState: { error },
    formState: { isSubmitSuccessful },
  } = useController<GalleryFormState>({ name, control });
  const useFieldArrayReturn = useFieldArray({ control, name, rules });
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
    });
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

function ImageFileFieldArrayItem({
  field,
  index,
  width,
  height,
  fit,
  move,
  update,
  remove,
}: {
  field: FieldArrayWithId<GalleryFormState, SpecifiedTypeField<GalleryFormState, ImageState[]>, "id">;
  index: number;
  width: number;
  height: number;
  fit?: "contain" | "cover";
} & UseFieldArrayReturn<GalleryFormState, SpecifiedTypeField<GalleryFormState, ImageState[]>>) {
  const fieldRef = useRef<HTMLDivElement>(null);

  const [, drag] = useDrag<DragObject>({
    type: "ImageFileFieldArrayItem",
    item: { id: field.id, index },
  });

  const [, drop] = useDrop<DragObject>({
    accept: "ImageFileFieldArrayItem",
    drop: (item) => move(item.index, index),
  });

  drag(drop(fieldRef));

  const handleContainerClick = () => {
    if (field.removed) {
      update(index, { ...field, removed: false });
    }
  };

  const handleRemoveButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    if (field.beforeUrl) {
      update(index, { ...field, removed: true });
    } else {
      remove(index);
    }
  };

  return (
    <div
      ref={fieldRef}
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

type TagsFieldProps = {
  label: string;
} & UseControllerProps<GalleryFormState, SpecifiedTypeField<GalleryFormState, TagState[]>>;

function TagsField({ label, name, rules }: TagsFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { control } = useFormContext<GalleryFormState>();
  const {
    formState: { isSubmitSuccessful },
    fieldState: { error },
  } = useController({ name, control, rules });
  const { fields, append, remove } = useFieldArray({ control, name });

  const handleTagClick = (index: number) => {
    remove(index);
  };

  const addTag = () => {
    const value = inputRef.current!.value.trim();
    if (value !== "") {
      append({ name: value });
      inputRef.current!.value = "";
    }
  };

  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (
      event.keyCode === 13 ||
      (event.keyCode === 32 && inputRef.current!.value !== inputRef.current!.value.trimEnd())
    ) {
      // エンターキーorスペースキーが(日本語入力の場合は確定後に)押下された場合、タグを追加する
      addTag();
    }
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
        onClick={() => inputRef.current!.focus()}
        css={css`
          width: 100%;
          padding: 0.375rem 0.75rem;
          background-color: #fff;
          background-clip: padding-box;
          border: 1px solid #ced4da;
          border-radius: 0.25rem;
          color: #495057;
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          cursor: text;
        `}
      >
        <ul
          css={css`
            display: inline;
            margin: 0;
            padding: 0;
            list-style-type: none;
          `}
        >
          {fields.map((field, index) => {
            return (
              <li
                key={field.id}
                onClick={() => handleTagClick(index)}
                css={css`
                  display: inline;
                  margin-right: 12px;
                  padding: 2px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  cursor: pointer;

                  &:hover {
                    text-decoration: line-through;
                  }
                `}
              >
                {field.name}
              </li>
            );
          })}
        </ul>
        <input
          type="text"
          placeholder="タグ"
          autoComplete="off"
          ref={inputRef}
          onKeyDown={(event) => event.keyCode === 13 && event.preventDefault()}
          onKeyUp={handleKeyUp}
          onBlur={addTag}
          css={css`
            border: none;
            flex-grow: 1;
            outline: none;
          `}
        />
      </div>
    </Form.Group>
  );
}

type MarkdownTextareaFieldProps<T extends FieldValues> = {
  label: string;
} & UseControllerProps<T, SpecifiedTypeField<T, string>>;

function MarkdownTextareaField<T extends FieldValues>({ label, name, rules }: MarkdownTextareaFieldProps<T>) {
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
} & UseControllerProps<T, SpecifiedTypeField<T, R>>;

type RadioFieldOption<R extends string | number> = {
  label: string;
  value: R;
};

function RadioField<T extends FieldValues, R extends string | number>({
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

export default GalleryForm;
