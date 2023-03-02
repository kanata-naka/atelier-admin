import { State } from "@/types";

export function getLastOrder(state: State) {
  if (!state.topImages.items.length) {
    return -1;
  }
  return Math.max(...state.topImages.items.map((item) => item.order));
}
