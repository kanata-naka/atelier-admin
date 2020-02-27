/**
 * グローバル変数
 */
export const Globals = {}

/**
 * ページネーションを初期化する
 */
export const initializePagination = (items, perPage) => {
  return {
    offset: 0,
    perPage: perPage,
    size: items.length
  }
}
