import React, { useEffect } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import Notification from "@/components/common/Notification";
import { Restrict, USE_CURRENT_DATE_TIME } from "@/constants";
import { useDispatch, useSelector } from "@/hooks";
import { WorkFormValues } from "@/types";
import { edit, touchForm } from "./reducer";
import { convertWorkStateToFormValues } from "./selectors";
import { createOrUpdateWork, fetchWorks } from "./services";
import { DateTimeField, ImageFileFieldArray, MarkdownTextareaField, RadioField, TextField } from "../common/form";
import { withLoading } from "../common/services";

const initialValues: WorkFormValues = {
  id: null,
  title: "",
  publishedDate: USE_CURRENT_DATE_TIME,
  images: [],
  description: "",
  restrict: Restrict.ALL,
};

function WorkForm() {
  const item = useSelector((state) => state.works.items.find((item) => item.id === state.works.editingItemId));
  const dispatch = useDispatch();
  const useFormReturn = useForm<WorkFormValues>({ defaultValues: initialValues });
  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, defaultValues },
  } = useFormReturn;

  useEffect(() => {
    item ? reset(convertWorkStateToFormValues(item)) : reset(initialValues);
  }, [item]);

  useEffect(() => {
    dispatch(touchForm(isDirty));
  }, [isDirty]);

  const submit: SubmitHandler<WorkFormValues> = (data, event) => {
    event?.preventDefault();
    withLoading(async () => {
      await createOrUpdateWork(data)
        .then(async (id) => {
          Notification.success("作品を登録しました。");
          await fetchWorks(dispatch).catch((error) => {
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
          name="publishedDate"
          label="出版日"
          defaultValue={defaultValues?.publishedDate}
          useCurrentDateTimeCheckbox={true}
          dateFormat={["yyyy/MM/dd", "yyyy年MM月dd日"]}
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

export default WorkForm;
