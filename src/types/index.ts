import { ReactNode } from "react";
import { User } from "@firebase/auth";
import store from "@/store";

// Infer the `State` and `Dispatch` types from the store itself
export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export type AuthState = {
  status: "not_signed_in" | "signing_in" | "signed_in" | "sign_in_failed";
  user: User | null;
};

export type GlobalNavigationLinkItem = {
  id: string;
  url?: string;
  label: ReactNode;
};
