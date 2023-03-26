import { Dispatch } from "@/types";
import { loadStart, loadEnd } from "./reducer";

export function withLoading(fetch: () => Promise<void>, dispatch: Dispatch) {
  dispatch(loadStart());
  return fetch().finally(() => dispatch(loadEnd()));
}
