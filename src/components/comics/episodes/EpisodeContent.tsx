import { useEffect } from "react";
import Notification from "@/components/common/Notification";
import PageContent from "@/components/common/PageContent";
import PageHeading from "@/components/common/PageHeading";
import { withLoading } from "@/components/common/services";
import { useDispatch } from "@/hooks";
import EpisodeForm from "./EpisodeForm";
import EpisodeGrid from "./EpisodeGrid";
import { fetchEpisodes } from "./services";

function EpisodeContent({ comicId }: { comicId: string }) {
  const dispatch = useDispatch();

  useEffect(() => {
    withLoading(
      () =>
        fetchEpisodes(dispatch, comicId).catch((error) => {
          console.error(error);
          Notification.error("読み込みに失敗しました。");
        }),
      dispatch
    );
  }, []);

  return (
    <PageContent>
      <PageHeading>COMICS &gt; エピソード</PageHeading>
      <hr />
      <EpisodeForm />
      <hr />
      <EpisodeGrid />
    </PageContent>
  );
}

export default EpisodeContent;
