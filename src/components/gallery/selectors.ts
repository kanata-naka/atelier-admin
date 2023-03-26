import { ArtState, GalleryFormValues } from "@/types";

export function convertArtStateToFormValues(item: ArtState): GalleryFormValues {
  return {
    id: item.id,
    title: item.title,
    tags: item.tags.map((tag) => ({
      name: tag,
    })),
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
