import React, { MouseEvent, ChangeEvent, useRef, useEffect, ReactNode } from "react";
import { css, SerializedStyles } from "@emotion/react";
import Image from "next/image";
import { Badge, Button, ButtonGroup, CloseButton, Form, FormControlProps } from "react-bootstrap";
import {
  FieldPathByValue,
  FormProvider,
  SubmitHandler,
  UseControllerProps,
  useFieldArray,
  UseFieldArrayAppend,
  UseFieldArrayMove,
  UseFieldArrayRemove,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import Notification from "@/components/common/Notification";
import { IMAGE_FILE_ACCEPTABLE_EXTENTIONS, IMAGE_FILE_MAX_SIZE } from "@/constants";
import { useDispatch, useDropFile, useSelector } from "@/hooks";
import { TopImagesFormValues, TopImageFieldValues, ImageFieldValues, Nullable } from "@/types";
import { formatDateTimeFromUnixTimestamp } from "@/utils/dateUtil";
import { validateFile } from "@/utils/fIleUtil";
import { edit, cancelEdit } from "./reducer";
import { convertTopImageStateToFieldValues, getLastOrder } from "./selectors";
import { bulkUpdateTopImages } from "./services";
import { RequiredBadge } from "../common/form";
import Grid from "../common/Grid";
import { withLoading } from "../common/services";

function TopImageGrid() {
  const { items, editing } = useSelector((state) => ({
    items: state.topImages.items,
    editing: state.topImages.editing,
  }));
  const useFormReturn = useForm<TopImagesFormValues>();
  const dispatch = useDispatch();
  const {
    control,
    watch,
    formState: { errors },
    handleSubmit,
    reset,
  } = useFormReturn;
  const { fields, append, move, remove } = useFieldArray<TopImagesFormValues>({ control, name: "items" });

  useEffect(() => {
    reset({ items: items.map((item) => convertTopImageStateToFieldValues(item)) });
  }, [items]);

  const submit: SubmitHandler<TopImagesFormValues> = (data, event) => {
    console.log("onSubmit: ", data);
    event?.preventDefault();
    withLoading(
      () =>
        bulkUpdateTopImages(data.items, items, dispatch)
          .then(() => {
            Notification.success("トップ画像を登録しました。");
          })
          .catch((error) => {
            console.error(error);
            Notification.error("トップ画像の登録に失敗しました。\n" + JSON.stringify(error));
          }),
      dispatch
    );
  };

  return (
    <FormProvider {...useFormReturn}>
      <Form onSubmit={handleSubmit(submit)}>
        <GridControl />
        <Grid
          columns={[
            {
              css: css`
                width: 40px;
              `,
              render: (item, index) =>
                editing ? <GridItemRemoveControl item={item} index={index} remove={remove} /> : <></>,
            },
            {
              label: (
                <>
                  画像{" "}
                  {editing && (
                    <>
                      <RequiredBadge />
                      <GridColumnAnnotation>※縦横比は 5:3 です</GridColumnAnnotation>
                    </>
                  )}
                </>
              ),
              css: css`
                width: 200px;
              `,
              render: (_, index) => {
                const message = errors.items && errors.items[index]?.image?.url?.message;
                return (
                  <>
                    <ImageFileInput
                      name={`items.${index}.image`}
                      label="画像"
                      width={200}
                      height={120}
                      uploadIconWidth={48}
                      fit="cover"
                      disabled={!editing}
                    />
                    {message && <GridItemErrorMessage>{message}</GridItemErrorMessage>}
                  </>
                );
              },
            },
            {
              label: (
                <>
                  サムネイル画像{" "}
                  {editing && (
                    <>
                      <RequiredBadge />
                    </>
                  )}
                </>
              ),
              css: css`
                width: 160px;
              `,
              render: (_, index) => {
                const message = errors.items && errors.items[index]?.thumbnailImage?.url?.message;
                return (
                  <div
                    css={css`
                      margin-left: 30px;
                    `}
                  >
                    <ImageFileInput
                      name={`items.${index}.thumbnailImage`}
                      label="サムネイル画像"
                      width={80}
                      height={80}
                      uploadIconWidth={32}
                      fit="cover"
                      disabled={!editing}
                    />
                    {message && <GridItemErrorMessage>{message}</GridItemErrorMessage>}
                  </div>
                );
              },
            },
            {
              label: "説明",
              css: css`
                min-width: 250px;
                vertical-align: middle;
                white-space: pre-wrap;
              `,
              render: (item, index) =>
                editing ? (
                  <TextareaInput
                    name={`items.${index}.description`}
                    css={css`
                      height: 120px;
                    `}
                  />
                ) : (
                  <span>{item.description}</span>
                ),
            },
            {
              css: css`
                width: 210px;
              `,
              render: (item) => (
                <>
                  {item.createdAt && <DateRow label="投稿日時" unixTimestamp={item.createdAt} />}
                  {item.updatedAt && <DateRow label="更新日時" unixTimestamp={item.updatedAt} />}
                </>
              ),
            },
            {
              css: css`
                width: 90px;
              `,
              render: (_, index) =>
                editing ? <GridItemMoveControl index={index} length={fields.length} move={move} /> : <></>,
            },
          ]}
          items={fields}
          itemIdField="id"
          itemRowStyle={(_, index) => css`
            background-color: ${watch(`items.${index}.removed`) ? "darkgray" : "inherit"};
          `}
        />
        {editing && <GridItemAppendControl append={append} />}
      </Form>
    </FormProvider>
  );
}

function GridControl() {
  const { editing } = useSelector((state) => ({
    editing: state.topImages.editing,
  }));
  const dispatch = useDispatch();
  const {
    reset,
    formState: { isDirty, isSubmitting },
  } = useFormContext<TopImagesFormValues>();

  const handleEdit = () => {
    dispatch(edit());
  };

  const handleCancelEdit = () => {
    if (isDirty && !confirm("内容が変更されています。破棄してよろしいですか？")) {
      return;
    }
    reset();
    dispatch(cancelEdit());
  };

  return (
    <div
      css={css`
        padding: 0 12px 24px;
      `}
    >
      {editing ? (
        <ButtonGroup>
          <Button variant="primary" type="submit" disabled={!isDirty || isSubmitting}>
            {"保存"}
          </Button>
          <Button variant="secondary" type="button" disabled={isSubmitting} onClick={handleCancelEdit}>
            {"キャンセル"}
          </Button>
        </ButtonGroup>
      ) : (
        <Button variant="outline-secondary" type="button" onClick={handleEdit}>
          {"編集"}
        </Button>
      )}
    </div>
  );
}

function GridColumnAnnotation({ children }: { children: ReactNode }) {
  return (
    <span
      css={css`
        margin-left: 8px;
        font-size: 0.9em;
        font-weight: lighter;
      `}
    >
      {children}
    </span>
  );
}

function GridItemRemoveControl({
  item,
  index,
  remove,
}: {
  item: TopImageFieldValues;
  index: number;
  remove: UseFieldArrayRemove;
}) {
  const beforeItems = useSelector((state) => state.topImages.items);
  const { watch, setValue } = useFormContext<TopImagesFormValues>();

  const handleRemove = () => {
    if (beforeItems.find((beforeItem) => beforeItem.id === item.originalId)) {
      setValue(`items.${index}.removed`, true, { shouldDirty: true });
    } else {
      remove(index);
    }
  };

  const handleRestore = () => {
    setValue(`items.${index}.removed`, false, { shouldDirty: true });
  };

  return !watch(`items.${index}.removed`) ? (
    <div
      onClick={handleRemove}
      css={css`
        vertical-align: middle;
        cursor: pointer;

        i {
          color: gray;
          font-size: 1.5em;
        }
      `}
    >
      <i className="fas fa-trash" />
    </div>
  ) : (
    <div
      onClick={handleRestore}
      css={css`
        vertical-align: middle;
        cursor: pointer;

        i {
          color: gray;
          font-size: 1.5em;
        }
      `}
    >
      <i className="fas fa-trash-restore" />
    </div>
  );
}

function GridItemErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div
      css={css`
        margin-top: 4px;
        color: darkred;
        font-size: 0.9em;
      `}
    >
      {children}
    </div>
  );
}

function ImageFileInput({
  label,
  name,
  width,
  height,
  fit = "contain",
  uploadIconWidth,
  disabled = false,
}: {
  label: string;
  width: number;
  height: number;
  fit?: "contain" | "cover";
  uploadIconWidth: number;
  disabled?: boolean;
} & UseControllerProps<TopImagesFormValues, FieldPathByValue<TopImagesFormValues, ImageFieldValues>>) {
  const { register, control, setValue } = useFormContext<TopImagesFormValues>();
  const fileInputLabelRef = useRef<HTMLLabelElement>(null);
  const value: ImageFieldValues = useWatch({ name, control });
  const isDirty = !!value.file;

  register(`${name}.url`, { required: "選択してください" });

  const validate = (file: File) => {
    const validationResult = validateFile(file, IMAGE_FILE_ACCEPTABLE_EXTENTIONS, IMAGE_FILE_MAX_SIZE);
    if (validationResult) {
      Notification.error(validationResult);
      return false;
    }
    return true;
  };

  const setFile = (file: File) => {
    setValue(
      name,
      {
        name: value.name,
        url: URL.createObjectURL(file),
        file,
        beforeUrl: value.beforeUrl,
      },
      { shouldDirty: true }
    );
  };

  useDropFile(fileInputLabelRef, validate, setFile, [disabled]);

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

  const handleRemoveButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setValue<typeof name>(
      name,
      {
        name: value.name,
        url: value.beforeUrl,
        file: null,
        beforeUrl: value.beforeUrl,
      },
      { shouldDirty: true }
    );
  };

  return (
    <>
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
              opacity: ${!disabled && !isDirty ? 0.2 : 1};
            `}
          />
        )}
        {!disabled && (
          <>
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
              {!isDirty && (
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
                    text-shadow: 0 0 5px gray;
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
            {isDirty && (
              <CloseButton
                onClick={handleRemoveButtonClick}
                css={css`
                  position: absolute;
                  top: 8px;
                  right: 8px;
                `}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

function TextareaInput({
  name,
  ...props
}: {
  css?: SerializedStyles;
} & UseControllerProps<TopImagesFormValues, FieldPathByValue<TopImagesFormValues, Nullable<string>>> &
  FormControlProps) {
  const { register } = useFormContext();
  return <Form.Control as="textarea" {...register(name)} {...props}></Form.Control>;
}

function DateRow({ label, unixTimestamp }: { label: string; unixTimestamp?: number }) {
  return (
    <div
      css={css`
        padding-bottom: 8px;
      `}
    >
      <Badge bg="secondary">{label}</Badge>
      <span
        css={css`
          padding-left: 4px;
        `}
      >
        {unixTimestamp && formatDateTimeFromUnixTimestamp(unixTimestamp)}
      </span>
    </div>
  );
}

function GridItemMoveControl({ index, length, move }: { index: number; length: number; move: UseFieldArrayMove }) {
  return (
    <ButtonGroup
      vertical
      css={css`
        width: 64px;
      `}
    >
      <Button variant="outline-secondary" type="button" disabled={index === 0} onClick={() => move(index, index - 1)}>
        <i className="fas fa-arrow-up" />
      </Button>
      <Button
        variant="outline-secondary"
        type="button"
        disabled={index === length - 1}
        onClick={() => move(index, index + 1)}
      >
        <i className="fas fa-arrow-down" />
      </Button>
    </ButtonGroup>
  );
}

function GridItemAppendControl({ append }: { append: UseFieldArrayAppend<TopImagesFormValues, "items"> }) {
  const lastOrder = useSelector((state) => getLastOrder(state));
  const handleAppend = () => {
    append({
      id: crypto.randomUUID(),
      image: {
        name: null,
        url: null,
        file: null,
        beforeUrl: null,
      },
      thumbnailImage: {
        name: null,
        url: null,
        file: null,
        beforeUrl: null,
      },
      description: null,
      order: lastOrder + 1,
      originalId: null,
      removed: false,
    });
  };
  return (
    <div
      css={css`
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
      `}
    >
      <Button
        onClick={handleAppend}
        css={css`
          margin-right: 12px;
        `}
      >
        <i className="fas fa-plus" /> 追加
      </Button>
    </div>
  );
}

export default TopImageGrid;
