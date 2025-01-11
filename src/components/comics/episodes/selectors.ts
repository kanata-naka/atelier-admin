import { EpisodeState, EpisodeFormValues } from "@/types";

export function convertEpisodeStateToFormValues(item: EpisodeState): EpisodeFormValues {
  return {
    id: item.id,
    no: item.no,
    title: item.title,
    image: {
      name: item.image ? item.image.name : null,
      url: item.image ? item.image.url : null,
      file: null,
      beforeUrl: item.image ? item.image.url : null,
      removed: false,
    },
    description: item.description,
    pages: item.pages.map((page) => ({
      originalId: page.id,
      name: page.image.name,
      url: page.image.url,
      file: null,
      beforeUrl: page.image.url,
      removed: false,
    })),
    restrict: item.restrict,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function getLastNo(items: EpisodeState[]) {
  if (!items.length) return 0;
  return items.map((item) => item.no).reduce((a, b) => Math.max(a, b));
}
