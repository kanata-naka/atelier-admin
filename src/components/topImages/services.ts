import { callFunction } from "@/api/firebase";
import { Dispatch, TopImageFieldValues, TopImageState } from "@/types";
import { TopImageCreateRequest, TopImageGetListResponse, TopImageUpdateRequest } from "@/types/api/topImages";
import { sortBy } from "@/utils/arrayUtil";
import { getExtension } from "@/utils/fIleUtil";
import { fetchItems } from "./reducer";

export async function fetchTopImages(dispatch: Dispatch) {
  return callFunction<never, TopImageGetListResponse>("topImages-get").then((response) => {
    const items = response.data.result;
    sortBy(items, "order", "asc");
    dispatch(fetchItems(items));
  });
}

export async function bulkUpdateTopImages(
  items: TopImageFieldValues[],
  beforeItems: TopImageState[],
  dispatch: Dispatch
) {
  const createItems: TopImageCreateRequest[] = [];
  const updateItems: TopImageUpdateRequest[] = [];
  const removeItemIds: string[] = [];
  const uploadImageFiles: [string, File][] = [];

  items.forEach((item, index) => {
    let imageName: string, thumbnailImageName: string;

    if (item.originalId) {
      if (item.removed) {
        removeItemIds.push(item.originalId);
        return;
      }
      if (
        !item.image.file &&
        !item.thumbnailImage.file &&
        beforeItems.find(
          (beforeItem) =>
            beforeItem.id === item.originalId &&
            beforeItem.description === item.description &&
            beforeItem.order === item.order
        )
      ) {
        // 変更がない
        return;
      }
      if (!item.image.name || !item.thumbnailImage.name) {
        console.error(item);
        throw Error("Existing item but image name field is empty.");
      }

      imageName = item.image.file
        ? `topImages/${item.originalId}/image/${crypto.randomUUID()}.${getExtension(item.image.file.name)}`
        : item.image.name;
      thumbnailImageName = item.thumbnailImage.file
        ? `topImages/${item.originalId}/thumbnailImage/${crypto.randomUUID()}.${getExtension(
            item.thumbnailImage.file.name
          )}`
        : item.thumbnailImage.name;

      updateItems.push({
        id: item.originalId,
        image: {
          name: imageName,
        },
        thumbnailImage: {
          name: thumbnailImageName,
        },
        description: item.description,
        // 表示順を設定し直す
        order: index,
      });
    } else {
      if (item.removed) {
        return;
      }
      if (!item.image.file || !item.thumbnailImage.file) {
        console.error(item);
        throw Error("New item but image file field is empty.");
      }

      imageName = `topImages/${item.id}/image/${crypto.randomUUID()}.${getExtension(item.image.file.name)}`;
      thumbnailImageName = `topImages/${item.id}/thumbnailImage/${crypto.randomUUID()}.${getExtension(
        item.thumbnailImage.file.name
      )}`;

      createItems.push({
        id: item.id,
        image: {
          name: imageName,
        },
        thumbnailImage: {
          name: thumbnailImageName,
        },
        description: item.description,
        // 表示順を設定し直す
        order: index,
      });
    }
    if (item.image.file) {
      uploadImageFiles.push([imageName, item.image.file]);
    }
    if (item.thumbnailImage.file) {
      uploadImageFiles.push([thumbnailImageName, item.thumbnailImage.file]);
    }
  });

  console.log(createItems, updateItems, removeItemIds, uploadImageFiles);
}
