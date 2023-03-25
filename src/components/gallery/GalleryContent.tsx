import { useEffect } from "react";
import Notification from "@/components/common/Notification";
import { useDispatch } from "@/hooks";
import GalleryForm from "./GalleryForm";
import GalleryGrid from "./GalleryGrid";
import { fetchArts } from "./services";
import PageContent from "../common/PageContent";
import PageHeading from "../common/PageHeading";
import { withLoading } from "../common/services";

function GalleryContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    withLoading(
      () =>
        fetchArts(dispatch).catch((error) => {
          console.error(error);
          Notification.error("読み込みに失敗しました。");
        }),
      dispatch
    );
  }, []);

  return (
    <PageContent>
      <PageHeading>GALLERY</PageHeading>
      <hr />
      <GalleryForm />
      <hr />
      <GalleryGrid />
    </PageContent>
  );
}

export default GalleryContent;
