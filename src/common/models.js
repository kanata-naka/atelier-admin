/**
 * グローバル変数
 */
export const Globals = {}

export const NOT_SIGNED_IN = Symbol("NOT_SIGNED_IN")
export const SIGNED_IN = Symbol("SIGNED_IN")
export const SIGN_IN_FAILED = Symbol("SIGN_IN_FAILED")

export const createPagination = (perPage, total) => {
  return { offset: 0, perPage, total }
}
