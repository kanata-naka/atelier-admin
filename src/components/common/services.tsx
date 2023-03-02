import { Dispatch } from "@/types";
import { setLoading } from "./reducer";

export function withLoading(fetch: () => Promise<void>, dispatch: Dispatch) {
  dispatch(setLoading(true));
  return fetch().finally(() => dispatch(setLoading(false)));
}
