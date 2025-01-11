import { callFunction, uploadFile } from "@/api/firebase";
import { USE_CURRENT_DATE_TIME } from "@/constants";
import { Dispatch, ComicFormValues } from "@/types";
import { DeleteByIdRequest } from "@/types/api";
import { ComicCreateRequest, ComicGetListRequest, ComicGetListResponse, ComicUpdateRequest } from "@/types/api/comics";
import { getNowUnixTimestamp } from "@/utils/dateUtil";
import { getExtension } from "@/utils/fIleUtil";
import { fetchItems } from "./reducer";

export async function fetchComics(dispatch: Dispatch) {
  return callFunction<ComicGetListRequest, ComicGetListResponse>("comics-get", {}).then((response) => {
    dispatch(fetchItems(response.data.result));
  });
}

export async function createOrUpdateComic(item: ComicFormValues) {
  const id = item.id || crypto.randomUUID();
  const uploadImageFiles: [string, File][] = [];

  let image = null;
  if (item.image && !item.image.removed) {
    if (item.image.file) {
      const imageName = `comics/${id}/image/${crypto.randomUUID()}.${getExtension(item.image.file.name)}`;
      uploadImageFiles.push([imageName, item.image.file]);
      image = {
        name: imageName,
      };
    } else {
      if (!item.image.name) {
        console.error(item);
        throw Error("Existing item but image name field is empty.");
      }
      image = {
        name: item.image.name,
      };
    }
  }

  const data = {
    id,
    title: item.title,
    image,
    description: item.description,
    type: item.type,
    completed: item.completed,
    restrict: item.restrict,
    createdAt: item.createdAt === USE_CURRENT_DATE_TIME ? getNowUnixTimestamp() : item.createdAt,
  };

  if (!item.id) {
    await callFunction<ComicCreateRequest>("comics-create", data);
  } else {
    await callFunction<ComicUpdateRequest>("comics-update", data);
  }

  await Promise.all(uploadImageFiles.map((value) => uploadFile(value[1], value[0])));

  return id;
}

export async function deleteComics(selectedItemIds: string[]) {
  await Promise.allSettled(
    selectedItemIds.map((itemId) => callFunction<DeleteByIdRequest>("comics-deleteById", { id: itemId }))
  );
}
