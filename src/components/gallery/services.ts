import { callFunction, uploadFile } from "@/api/firebase";
import { USE_CURRENT_DATE_TIME } from "@/constants";
import { Dispatch, GalleryFormValues } from "@/types";
import { ArtCreateRequest, ArtGetListResponse, ArtUpdateRequest } from "@/types/api/arts";
import { getNowUnixTimestamp } from "@/utils/dateUtil";
import { getExtension } from "@/utils/fIleUtil";
import { fetchItems } from "./reducer";

export async function fetchArts(dispatch: Dispatch) {
  return callFunction<object, ArtGetListResponse>("arts-get", {}).then((response) => {
    dispatch(fetchItems(response.data.result));
  });
}

export async function createOrUpdateArt(item: GalleryFormValues) {
  const id = item.id || crypto.randomUUID();
  const uploadImageFiles: [string, File][] = [];

  const images = item.images
    .filter((image) => !image.removed)
    .map<ArtCreateRequest.Image>((image) => {
      if (image.file) {
        const name = `arts/${id}/images/${crypto.randomUUID()}.${getExtension(image.file.name)}`;
        uploadImageFiles.push([name, image.file]);
        return { name };
      }
      if (!image.name) {
        console.error(item);
        throw Error("Existing item but image name field is empty.");
      }
      return {
        name: image.name,
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

  await Promise.all(uploadImageFiles.map((value) => uploadFile(value[1], value[0])));

  return id;
}

export async function deleteArts(selectedItemIds: string[]) {
  await Promise.allSettled(selectedItemIds.map((itemId) => callFunction("arts-deleteById", { id: itemId })));
}
