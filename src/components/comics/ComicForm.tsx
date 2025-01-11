import React, { useEffect } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import Notification from "@/components/common/Notification";
import { ComicType, Restrict, USE_CURRENT_DATE_TIME } from "@/constants";
import { useDispatch, useSelector } from "@/hooks";
import { ComicFormValues } from "@/types";
import { edit, touchForm } from "./reducer";
import { convertComicStateToFormValues } from "./selectors";
import { createOrUpdateComic, fetchComics } from "./services";
import {
  CheckBoxField,
  DateTimeField,
  ImageFileField,
  MarkdownTextareaField,
  RadioField,
  TextField,
} from "../common/form";
import { withLoading } from "../common/services";

const initialValues: ComicFormValues = {
  id: null,
  title: "",
  image: {
    name: null,
    url: null,
    file: null,
    beforeUrl: null,
  },
  description: "",
  type: ComicType.ONE_SHOT,
  completed: false,
  restrict: Restrict.ALL,
  createdAt: USE_CURRENT_DATE_TIME,
};

function ComicForm() {
  const item = useSelector((state) => state.comics.items.find((item) => item.id === state.comics.editingItemId));
  const dispatch = useDispatch();
  const useFormReturn = useForm<ComicFormValues>({ defaultValues: initialValues });
  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, defaultValues },
    getValues,
  } = useFormReturn;

  useEffect(() => {
    item ? reset(convertComicStateToFormValues(item)) : reset(initialValues);
  }, [item]);

  useEffect(() => {
    dispatch(touchForm(isDirty));
  }, [isDirty]);

  const submit: SubmitHandler<ComicFormValues> = (data, event) => {
    event?.preventDefault();
    withLoading(async () => {
      await createOrUpdateComic(data)
        .then(async (id) => {
          Notification.success("作品を登録しました。");
          await fetchComics(dispatch).catch((error) => {
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
        <ImageFileField name="image" label="画像" width={200} height={200} uploadIconWidth={64} />
        <MarkdownTextareaField name="description" label="説明" />
        <RadioField
          name="type"
          label="種別"
          options={[
            {
              label: "連載",
              value: ComicType.SERIES,
            },
            {
              label: "読み切り",
              value: ComicType.ONE_SHOT,
            },
          ]}
        />
        {getValues("type") === ComicType.SERIES && <CheckBoxField name="completed" label="完結" />}
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

export default ComicForm;
