import { ReactNode } from "react";
import { SerializedStyles } from "@emotion/utils";
import { User } from "@firebase/auth";
import { FieldValues, Path, FieldPathValue } from "react-hook-form";
import store from "@/store";

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export type SpecifiedTypeField<Item extends FieldValues, T> = {
  [P in Path<Item>]: T extends FieldPathValue<Item, P> ? P : never;
}[Path<Item>];

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
};
