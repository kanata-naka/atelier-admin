import { useEffect } from "react";
import Notification from "@/components/common/Notification";
import { useDispatch } from "@/hooks";
import { fetchWorks } from "./services";
import WorkForm from "./WorkForm";
import WorkGrid from "./WorkGrid";
import PageContent from "../common/PageContent";
import PageHeading from "../common/PageHeading";
import { withLoading } from "../common/services";

function WorkContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    withLoading(
      () =>
        fetchWorks(dispatch).catch((error) => {
          console.error(error);
          Notification.error("読み込みに失敗しました。");
        }),
      dispatch
    );
  }, []);

  return (
    <PageContent>
      <PageHeading>WORKS</PageHeading>
      <hr />
      <WorkForm />
      <hr />
      <WorkGrid />
    </PageContent>
  );
}

export default WorkContent;
