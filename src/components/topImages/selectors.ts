import { State, TopImageFieldValues, TopImageState } from "@/types";

export function getLastOrder(state: State) {
  if (!state.topImages.items.length) {
    return -1;
  }
  return Math.max(...state.topImages.items.map((item) => item.order));
}

export function convertTopImageStateToFieldValues(item: TopImageState): TopImageFieldValues {
  return {
    id: item.id,
    image: {
      name: item.image.name,
      url: item.image.url,
      file: null,
      beforeUrl: item.image.url,
    },
    thumbnailImage: {
      name: item.thumbnailImage.name,
      url: item.thumbnailImage.url,
      file: null,
      beforeUrl: item.thumbnailImage.url,
    },
    description: item.description,
    order: item.order,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    // IDを退避する
    // ※React Hook FormのField Arrayにてidプロパティが自動的に生成されたIDに上書きされるため
    originalId: item.id,
    removed: false,
  };
}
