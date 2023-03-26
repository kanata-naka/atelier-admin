import { callFunction, uploadFile } from "@/api/firebase";
import { USE_CURRENT_DATE_TIME } from "@/constants";
import { Dispatch, WorkFormValues } from "@/types";
import { DeleteByIdRequest } from "@/types/api";
import { WorkCreateRequest, WorkGetListRequest, WorkGetListResponse, WorkUpdateRequest } from "@/types/api/works";
import { getNowUnixTimestamp } from "@/utils/dateUtil";
import { getExtension } from "@/utils/fIleUtil";
import { fetchItems } from "./reducer";

export async function fetchWorks(dispatch: Dispatch) {
  return callFunction<WorkGetListRequest, WorkGetListResponse>("works-get", {}).then((response) => {
    dispatch(fetchItems(response.data.result));
  });
}

export async function createOrUpdateWork(item: WorkFormValues) {
  const id = item.id || crypto.randomUUID();
  const uploadImageFiles: [string, File][] = [];

  const images = item.images
    .filter((image) => !image.removed)
    .map<WorkCreateRequest.Image>((image) => {
      if (image.file) {
        const imageName = `works/${id}/images/${crypto.randomUUID()}.${getExtension(image.file.name)}`;
        uploadImageFiles.push([imageName, image.file]);
        return { name: imageName };
      }
      if (!image.name) {
        console.error(item);
        throw Error("Existing item but image name field is empty.");
      }
      return {
        name: image.name,
      };
    });

  const data = {
    id,
    title: item.title,
    publishedDate: item.publishedDate === USE_CURRENT_DATE_TIME ? getNowUnixTimestamp() : item.publishedDate,
    images,
    description: item.description,
    restrict: item.restrict,
  };

  if (!item.id) {
    await callFunction<WorkCreateRequest>("works-create", data);
  } else {
    await callFunction<WorkUpdateRequest>("works-update", data);
  }

  await Promise.all(uploadImageFiles.map((value) => uploadFile(value[1], value[0])));

  return id;
}

export async function deleteWorks(selectedItemIds: string[]) {
  await Promise.allSettled(
    selectedItemIds.map((itemId) => callFunction<DeleteByIdRequest>("works-deleteById", { id: itemId }))
  );
}
