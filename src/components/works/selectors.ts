import { WorkState, WorkFormValues } from "@/types";

export function convertWorkStateToFormValues(item: WorkState): WorkFormValues {
  return {
    id: item.id,
    title: item.title,
    publishedDate: item.publishedDate,
    images: item.images.map((image) => ({
      name: image.name,
      url: image.url,
      file: null,
      beforeUrl: image.url,
      removed: false,
    })),
    description: item.description,
    restrict: item.restrict,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
