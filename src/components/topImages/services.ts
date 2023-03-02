import { callFunction } from "@/api/firebase";
import { Dispatch, TopImageState } from "@/types";
import {
  TopImageCreateRequest,
  TopImageGetListResponse,
  TopImageGetResponse,
  TopImageUpdateRequest,
} from "@/types/api/topImages";
import { sortBy } from "@/utils/arrayUtil";
import { getExtension } from "@/utils/fIleUtil";
import { fetchItems } from "./reducer";

export async function fetchTopImages(dispatch: Dispatch) {
  return callFunction<never, TopImageGetListResponse>("topImages-get").then((response) => {
    const items = response.data.result.map((item) => convertTopImageGetResponseToState(item));
    sortBy(items, "order", "asc");
    dispatch(fetchItems(items));
  });
}

function convertTopImageGetResponseToState(item: TopImageGetResponse): TopImageState {
  return {
    ...item,
    image: {
      ...item.image,
      beforeUrl: item.image.url,
    },
    thumbnailImage: {
      ...item.thumbnailImage,
      beforeUrl: item.thumbnailImage.url,
    },
    // IDを退避する
    // ※React Hook FormのField Arrayにてidプロパティが自動的に生成されたIDに上書きされるため
    originalId: item.id,
    removed: false,
  };
}

export async function bulkUpdateTopImages(items: TopImageState[], initialItems: TopImageState[], dispatch: Dispatch) {
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
        initialItems.find(
          (initialItem) =>
            initialItem.id === item.originalId &&
            initialItem.description === item.description &&
            initialItem.order === item.order
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
        ? `topImages/${item.originalId}/image/${crypto.randomUUID}.${getExtension(item.image.file.name)}`
        : item.image.name;
      thumbnailImageName = item.thumbnailImage.file
        ? `topImages/${item.originalId}/thumbnailImage/${crypto.randomUUID}.${getExtension(
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

      imageName = `topImages/${item.id}/image/${crypto.randomUUID}.${getExtension(item.image.file.name)}`;
      thumbnailImageName = `topImages/${item.id}/thumbnailImage/${crypto.randomUUID}.${getExtension(
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

  // TODO
  return { createItems, updateItems, removeItemIds, uploadImageFiles };
}
