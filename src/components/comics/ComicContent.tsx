import { useEffect } from "react";
import Notification from "@/components/common/Notification";
import { useDispatch } from "@/hooks";
import ComicForm from "./ComicForm";
import ComicGrid from "./ComicGrid";
import { fetchComics } from "./services";
import PageContent from "../common/PageContent";
import PageHeading from "../common/PageHeading";
import { withLoading } from "../common/services";

function ComicContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    withLoading(
      () =>
        fetchComics(dispatch).catch((error) => {
          console.error(error);
          Notification.error("読み込みに失敗しました。");
        }),
      dispatch
    );
  }, []);

  return (
    <PageContent>
      <PageHeading>COMICS</PageHeading>
      <hr />
      <ComicForm />
      <hr />
      <ComicGrid />
    </PageContent>
  );
}

export default ComicContent;
