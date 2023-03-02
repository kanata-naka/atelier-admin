import { useEffect } from "react";
import Notification from "@/components/common/Notification";
import { useDispatch } from "@/hooks";
import { fetchTopImages } from "./services";
import TopImageGrid from "./TopImageGrid";
import PageContent from "../common/PageContent";
import PageHeading from "../common/PageHeading";
import { withLoading } from "../common/services";

function TopImageContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    withLoading(
      () =>
        fetchTopImages(dispatch).catch((error) => {
          console.error(error);
          Notification.error("読み込みに失敗しました。");
        }),
      dispatch
    );
  }, []);

  return (
    <PageContent>
      <PageHeading>トップ画像</PageHeading>
      <hr />
      <TopImageGrid />
    </PageContent>
  );
}

export default TopImageContent;
