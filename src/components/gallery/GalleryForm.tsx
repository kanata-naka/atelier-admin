import React, { KeyboardEventHandler, useEffect, useRef } from "react";
import { css } from "@emotion/react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import {
  useController,
  useForm,
  SubmitHandler,
  UseControllerProps,
  useFormContext,
  FormProvider,
  useFieldArray,
  FieldPathByValue,
} from "react-hook-form";
import Notification from "@/components/common/Notification";
import { Restrict, USE_CURRENT_DATE_TIME } from "@/constants";
import { useDispatch, useSelector } from "@/hooks";
import { GalleryFormValues, TagFieldValues } from "@/types";
import { edit, touchForm } from "./reducer";
import { convertArtStateToFormValues } from "./selectors";
import { createOrUpdateArt, fetchArts } from "./services";
import {
  DateTimeField,
  FieldErrorMessage,
  FieldLabel,
  ImageFileFieldArray,
  MarkdownTextareaField,
  RadioField,
  RequiredBadge,
  TextField,
} from "../common/form";
import { withLoading } from "../common/services";

const initialValues: GalleryFormValues = {
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
  const useFormReturn = useForm<GalleryFormValues>({ defaultValues: initialValues });
  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, defaultValues },
  } = useFormReturn;

  useEffect(() => {
    item ? reset(convertArtStateToFormValues(item)) : reset(initialValues);
  }, [item]);

  useEffect(() => {
    dispatch(touchForm(isDirty));
  }, [isDirty]);

  const submit: SubmitHandler<GalleryFormValues> = (data, event) => {
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
        <TextField name="title" label="タイトル" rules={{ required: "入力してください" }} />
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

function TagsField({
  label,
  name,
  rules,
}: {
  label: string;
} & UseControllerProps<GalleryFormValues, FieldPathByValue<GalleryFormValues, TagFieldValues[]>>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { control } = useFormContext<GalleryFormValues>();
  const {
    formState: { isSubmitSuccessful },
    fieldState: { error },
  } = useController({ name, control, rules });
  const { fields, append, remove } = useFieldArray({ control, name });

  const handleTagClick = (index: number) => {
    remove(index);
  };

  const addTag = () => {
    if (inputRef.current) {
      const value = inputRef.current.value.trim();
      if (value !== "") {
        append({ name: value });
        inputRef.current.value = "";
      }
    }
  };

  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (
      event.keyCode === 13 ||
      (event.keyCode === 32 && inputRef.current?.value !== inputRef.current?.value.trimEnd())
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
        onClick={() => inputRef.current?.focus()}
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

export default GalleryForm;
