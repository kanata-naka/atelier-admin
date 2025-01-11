import { ComicState, ComicFormValues } from "@/types";

export function convertComicStateToFormValues(item: ComicState): ComicFormValues {
  return {
    id: item.id,
    title: item.title,
    image: {
      name: item.image ? item.image.name : null,
      url: item.image ? item.image.url : null,
      file: null,
      beforeUrl: item.image ? item.image.url : null,
      removed: false,
    },
    description: item.description,
    type: item.type,
    completed: item.completed,
    restrict: item.restrict,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
