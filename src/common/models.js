/**
 * グローバル変数
 */
export const Globals = {}

export const createPagination = (perPage, total) => {
  return { offset: 0, perPage, total }
}
