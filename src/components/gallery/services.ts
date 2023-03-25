import { callFunction, uploadFileToStorage } from "@/api/firebase";
import { USE_CURRENT_DATE_TIME } from "@/constants";
import { Dispatch, ArtState, GalleryFormState } from "@/types";
import { ArtCreateRequest, ArtGetListResponse, ArtGetResponse, ArtUpdateRequest } from "@/types/api/arts";
import { getNowUnixTimestamp } from "@/utils/dateUtil";
import { getExtension } from "@/utils/fIleUtil";
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
    tags: item.tags.map((tag) => ({
      name: tag,
    })),
    images: item.images.map((image) => ({
      ...image,
      beforeUrl: image.url,
      removed: false,
    })),
  };
}

export async function createOrUpdateArt(item: GalleryFormState) {
  const id = item.id || crypto.randomUUID();
  const uploadImageFiles: [string, File][] = [];

  const images = item.images
    .filter((image) => !image.removed)
    .map<ArtCreateRequest.Image>((image) => {
      let name = image.name!;
      if (image.file) {
        name = `arts/${id}/images/${crypto.randomUUID()}.${getExtension(image.file.name)}`;
        uploadImageFiles.push([name, image.file]);
      }
      return {
        name,
      };
    });

  if (!item.id) {
    const data: ArtCreateRequest = {
      id,
      title: item.title,
      tags: item.tags.map((tag) => tag.name),
      images,
      description: item.description,
      restrict: item.restrict,
      createdAt: item.createdAt === USE_CURRENT_DATE_TIME ? getNowUnixTimestamp() : item.createdAt,
    };

    await callFunction("arts-create", data);
  } else {
    const data: ArtUpdateRequest = {
      id,
      title: item.title,
      tags: item.tags.map((tag) => tag.name),
      images,
      description: item.description,
      restrict: item.restrict,
      createdAt: item.createdAt === USE_CURRENT_DATE_TIME ? getNowUnixTimestamp() : item.createdAt,
    };

    await callFunction("arts-update", data);
  }

  await Promise.all(uploadImageFiles.map((value) => uploadFileToStorage(value[1], value[0])));

  return id;
}

export async function deleteArts(selectedItemIds: string[]) {
  await Promise.allSettled(selectedItemIds.map((itemId) => callFunction("arts-deleteById", { id: itemId })));
}
