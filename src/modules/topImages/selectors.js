import { createSelector } from "reselect";

/**
 * 最後の表示順を取得する
 */
export const getLastOrder = createSelector([state => state.items], items => {
  if (!items.length) {
    return -1;
  }
  const orders = items.map(item => item.order);
  return Math.max(...orders);
});
