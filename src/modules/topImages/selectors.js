import { createSelector } from "reselect"

/**
 * 最後の表示順を取得する
 */
export const getLastOrder = createSelector([state => state.items], items => {
  const orders = items.map(item => item.order)
  return Math.max(...orders)
})
