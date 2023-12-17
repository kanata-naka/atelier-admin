import { ReactNode } from "react";
import { SerializedStyles } from "@emotion/utils";
import { User } from "@firebase/auth";
import { FieldValues, FieldArrayPathValue, FieldArrayPath, FieldPathByValue } from "react-hook-form";
import { Restrict, USE_CURRENT_DATE_TIME } from "@/constants";
import store from "@/store";

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export type Nullable<T> = T | null;

export type FieldArrayPathByValue<TFieldValues extends FieldValues, TValue> = {
  [Key in FieldArrayPath<TFieldValues>]: FieldArrayPathValue<TFieldValues, Key> extends TValue[] ? Key : never;
}[FieldArrayPath<TFieldValues>];

export type GridItem = Record<string, any>;

export type GridColumn<TGridItem extends GridItem> = {
  label?: ReactNode;
  width?: number;
  css?: SerializedStyles;
  render: (item: TGridItem, index: number) => ReactNode;
};

export type GridItemIdField<TGridItem extends GridItem> = FieldPathByValue<TGridItem, string | number>;

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
  description: Nullable<string>;
  order: number;
  createdAt: number;
  updatedAt: number;
};

export type ImageState = {
  name: string;
  url: string;
};

export type TopImagesFormValues = {
  items: TopImageFieldValues[];
};

export type TopImageFieldValues = {
  id: string;
  image: ImageFieldValues;
  thumbnailImage: ImageFieldValues;
  description: Nullable<string>;
  createdAt?: number;
  updatedAt?: number;
  originalId: Nullable<string>;
  removed: boolean;
};

export type ImageFieldValues = {
  name: Nullable<string>;
  url: Nullable<string>;
  file: Nullable<File>;
  beforeUrl: Nullable<string>;
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
  tags: string[];
  images: ImageState[];
  description: Nullable<string>;
  restrict: Restrict;
  createdAt: number;
  updatedAt: number;
};

export type Restrict = (typeof Restrict)[keyof typeof Restrict];

export type PaginationState = {
  page: number;
  perPage: number;
  total: number;
};

export type GalleryFormValues = {
  id: Nullable<string>;
  title: string;
  tags: TagFieldValues[];
  images: ImageFieldValues[];
  description: Nullable<string>;
  restrict: Restrict;
  createdAt: number | typeof USE_CURRENT_DATE_TIME;
  updatedAt?: number;
};

export type TagFieldValues = {
  name: string;
};

export type DragObject = {
  id: string;
  index: number;
};

export type RadioFieldOption = {
  label: string;
  value: string | number;
};

export type WorksState = {
  items: WorkState[];
  pagination: PaginationState;
  selectedItemIds: string[];
  editingItemId?: string;
  isFormDirty: boolean;
};

export type WorkState = {
  id: string;
  title: string;
  publishedDate: number;
  images: ImageState[];
  description: Nullable<string>;
  restrict: Restrict;
  createdAt: number;
  updatedAt: number;
};

export type WorkFormValues = {
  id: Nullable<string>;
  title: string;
  publishedDate: number | typeof USE_CURRENT_DATE_TIME;
  images: ImageFieldValues[];
  description: Nullable<string>;
  restrict: Restrict;
  createdAt?: number;
  updatedAt?: number;
};
