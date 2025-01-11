import React, { useEffect } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import {
  DateTimeField,
  ImageFileField,
  ImageFileFieldArray,
  MarkdownTextareaField,
  RadioField,
  TextField,
} from "@/components/common/form";
import Notification from "@/components/common/Notification";
import { withLoading } from "@/components/common/services";
import { Restrict, USE_CURRENT_DATE_TIME } from "@/constants";
import { useDispatch, useSelector } from "@/hooks";
import { EpisodeFormValues } from "@/types";
import { touchForm } from "./reducer";
import { convertEpisodeStateToFormValues, getLastNo } from "./selectors";
import { createOrUpdateEpisode, fetchEpisode } from "./services";

const initialValues: EpisodeFormValues = {
  id: null,
  no: -1,
  title: "",
  image: {
    name: null,
    url: null,
    file: null,
    beforeUrl: null,
  },
  description: "",
  pages: [],
  restrict: Restrict.ALL,
  createdAt: USE_CURRENT_DATE_TIME,
};

function EpisodeForm() {
  const { parent, item, lastNo } = useSelector((state) => ({
    parent: state.episodes.parent,
    item: state.episodes.items.find((item) => item.id === state.episodes.editingItemId),
    lastNo: getLastNo(state.episodes.items),
  }));
  const dispatch = useDispatch();
  const useFormReturn = useForm<EpisodeFormValues>({ defaultValues: initialValues });
  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, defaultValues },
  } = useFormReturn;

  useEffect(() => {
    item ? reset(convertEpisodeStateToFormValues(item)) : reset(initialValues);
  }, [item]);

  useEffect(() => {
    dispatch(touchForm(isDirty));
  }, [isDirty]);

  const submit: SubmitHandler<EpisodeFormValues> = (data, event) => {
    event?.preventDefault();
    withLoading(async () => {
      await createOrUpdateEpisode(parent!.id, data, lastNo, item)
        .then(async (id) => {
          Notification.success("作品を登録しました。");
          fetchEpisode(dispatch, parent!.id, id).catch((error) => {
            console.error(error);
            Notification.error("読み込みに失敗しました。");
          });
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
        <ImageFileFieldArray
          name="pages"
          label="ページ画像"
          width={400}
          height={400}
          uploadIconWidth={128}
          rules={{ required: "選択してください" }}
        />
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

export default EpisodeForm;
