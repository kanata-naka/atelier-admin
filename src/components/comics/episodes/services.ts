import { callFunction, uploadFile } from "@/api/firebase";
import { USE_CURRENT_DATE_TIME } from "@/constants";
import { Dispatch, EpisodeFormValues, EpisodeState } from "@/types";
import { DeleteByIdRequest, GetByIdRequest } from "@/types/api";
import {
  EpisodeCreateRequest,
  EpisodeUpdateRequest,
  ComicGetResponse,
  ComicGetByEpisodeIdRequest,
  PageDeleteRequest,
  PageCreateRequest,
  PageUpdateRequest,
} from "@/types/api/comics";
import { getNowUnixTimestamp } from "@/utils/dateUtil";
import { getExtension } from "@/utils/fIleUtil";
import { edit, fetchItems } from "./reducer";

export async function fetchEpisodes(dispatch: Dispatch, comicId: string) {
  return callFunction<GetByIdRequest, ComicGetResponse>("comics-getById", { id: comicId }).then((response) => {
    dispatch(fetchItems(response.data));
  });
}

export async function fetchEpisode(dispatch: Dispatch, comicId: string, id: string) {
  return callFunction<ComicGetByEpisodeIdRequest, ComicGetResponse>("comics-getByEpisodeId", {
    id: comicId,
    episodeId: id,
  }).then((response) => {
    dispatch(edit({ id, episode: response.data.episodes.find((_episode) => _episode.id === id) }));
  });
}

export async function createOrUpdateEpisode(
  comicId: string,
  item: EpisodeFormValues,
  lastNo: number,
  beforeItem?: EpisodeState
) {
  const id = item.id || crypto.randomUUID();
  const uploadImageFiles: [string, File][] = [];

  let image = null;
  if (item.image && !item.image.removed) {
    if (item.image.file) {
      const imageName = `comics/${comicId}/episodes/${id}/image/${crypto.randomUUID()}.${getExtension(
        item.image.file.name
      )}`;
      uploadImageFiles.push([imageName, item.image.file]);
      image = {
        name: imageName,
      };
    } else {
      if (item.image.name) {
        image = {
          name: item.image.name,
        };
      }
    }
  }

  const data = {
    comicId,
    id,
    no: !item.id ? lastNo + 1 : item.no,
    title: item.title,
    image,
    description: item.description,
    restrict: item.restrict,
    createdAt: item.createdAt === USE_CURRENT_DATE_TIME ? getNowUnixTimestamp() : item.createdAt,
  };

  if (!item.id) {
    await callFunction<EpisodeCreateRequest>("comics-createEpisode", data);
  } else {
    await callFunction<EpisodeUpdateRequest>("comics-updateEpisode", data);
  }

  await Promise.allSettled(
    item.pages.map(async (page, index) => {
      const pageId = page.originalId || crypto.randomUUID();
      let imageName: string;

      if (item.id && page.originalId) {
        if (page.removed) {
          await callFunction<PageDeleteRequest>("comics-deletePage", {
            comicId,
            episodeId: id,
            id: pageId,
          });
          return;
        }
        if (!page.file && beforeItem!.pages.find((_page) => _page.id === pageId && _page.no === index)) {
          // 変更がない
          return;
        }
        if (!page.name) {
          console.error(page);
          throw Error("Existing item but image name field is empty.");
        }

        imageName = page.file
          ? `comics/${comicId}/episodes/${id}/pages/${pageId}/image/${crypto.randomUUID()}.${getExtension(
              page.file.name
            )}`
          : page.name;

        console.debug(`[page] update pageId=${pageId}, no=${index}`);
        await callFunction<PageUpdateRequest>("comics-updatePage", {
          comicId,
          episodeId: id,
          id: pageId,
          no: index,
          image: {
            name: imageName,
          },
        });
      } else {
        if (page.removed) {
          return;
        }
        if (!page.file) {
          console.error(item);
          throw Error("New item but image file field is empty.");
        }

        imageName = `comics/${comicId}/episodes/${id}/pages/${pageId}/image/${crypto.randomUUID()}.${getExtension(
          page.file.name
        )}`;

        await callFunction<PageCreateRequest>("comics-createPage", {
          comicId,
          episodeId: id,
          id: pageId,
          no: index,
          image: {
            name: imageName,
          },
        });
      }

      if (page.file) {
        uploadImageFiles.push([imageName, page.file]);
      }
    })
  );

  await Promise.all(uploadImageFiles.map((value) => uploadFile(value[1], value[0])));

  return id;
}

export async function deleteEpisodes(selectedItemIds: string[]) {
  await Promise.allSettled(
    selectedItemIds.map((itemId) => callFunction<DeleteByIdRequest>("comics-deleteEpisodeById", { id: itemId }))
  );
}
