import { Nullable } from "@/types";
import { GetListResponse } from "@/types/api";

export type TopImageGetListResponse = GetListResponse<TopImageGetResponse>;

export type TopImageGetResponse = {
  id: string;
  image: TopImageGetResponse.Image;
  thumbnailImage: TopImageGetResponse.Image;
  description: Nullable<string>;
  order: number;
  createdAt: number;
  updatedAt: number;
};

export namespace TopImageGetResponse {
  export type Image = {
    name: string;
    url: string;
  };
}

export type TopImageCreateRequest = {
  id: string;
  image: {
    name: string;
  };
  thumbnailImage: {
    name: string;
  };
  description: Nullable<string>;
  order: number;
};

export type TopImageUpdateRequest = TopImageCreateRequest;
