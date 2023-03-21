import { callFunction } from "@/api/firebase";
import { Dispatch, ArtState } from "@/types";
import { ArtGetListResponse, ArtGetResponse } from "@/types/api/arts";
import { fetchItems } from "./reducer";

export async function fetchArts(dispatch: Dispatch) {
  return callFunction<object, ArtGetListResponse>("arts-get", {}).then((response) => {
    const items = response.data.result.map((item) => convertArtGetResponseToState(item));
    dispatch(fetchItems(items));
  });
}

function convertArtGetResponseToState(item: ArtGetResponse): ArtState {
  return {
    ...item,
    images: item.images.map((image) => ({
      ...image,
      beforeUrl: image.url,
    })),
  };
}
