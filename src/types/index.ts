import { ReactNode } from "react";
import { SerializedStyles } from "@emotion/utils";
import { User } from "@firebase/auth";
import { FieldValues, Path, FieldPathValue } from "react-hook-form";
import { Restrict, USE_CURRENT_DATE_TIME } from "@/constants";
import store from "@/store";

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export type SpecifiedTypeField<R extends FieldValues, T> = {
  [P in Path<R>]: T extends FieldPathValue<R, P> ? P : never;
}[Path<R>];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GridItem = Record<string, any>;

export type GridColumn<Item extends GridItem> = {
  label?: ReactNode;
  width?: number;
  css?: SerializedStyles;
  render: (item: Item, index: number) => ReactNode;
};

export type GridItemIdField<Item extends GridItem> = SpecifiedTypeField<Item, string | number>;

export type AuthState = {
  status: "not_signed_in" | "signing_in" | "signed_in" | "sign_in_failed";
  user: User | null;
};

export type GlobalNavigationLinkItem = {
  id: string;
  url?: string;
  label: ReactNode;
};

export type CommonState = {
  isLoading: boolean;
};

export type TopImagesState = {
  items: TopImageState[];
  editing: boolean;
};

export type TopImageState = {
  id: string;
  image: ImageState;
  thumbnailImage: ImageState;
  description?: string;
  order: number;
  createdAt?: number;
  updatedAt?: number;
  originalId?: string;
  removed: boolean;
};

export type ImageState = {
  name?: string;
  url?: string;
  file?: File;
  beforeUrl?: string;
  removed?: boolean;
};

export type GalleryState = {
  items: ArtState[];
  pagination: PaginationState;
  selectedItemIds: string[];
  editingItemId?: string;
  isFormDirty: boolean;
};

export type ArtState = {
  id: string;
  title: string;
  tags: TagState[];
  images: ImageState[];
  description?: string;
  restrict: Restrict;
  createdAt?: number;
  updatedAt?: number;
};

export type TagState = {
  name: string;
};

export type Restrict = (typeof Restrict)[keyof typeof Restrict];

export type GalleryFormState = {
  id?: string;
  createdAt?: number | typeof USE_CURRENT_DATE_TIME;
} & Omit<ArtState, "id" | "createdAt">;

export type PaginationState = {
  page: number;
  perPage: number;
  total: number;
};
