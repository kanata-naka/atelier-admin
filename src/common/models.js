/**
 * グローバル変数
 */
export const Globals = {}

export const AUTH_STATE_NOT_SIGNED_IN = Symbol("NOT_SIGNED_IN")
export const AUTH_STATE_SIGNED_IN = Symbol("SIGNED_IN")
export const AUTH_STATE_SIGN_IN_FAILED = Symbol("SIGN_IN_FAILED")
export const AUTH_STATE_SIGNED_OUT = Symbol("SIGNED_OUT")

export const createPagination = (perPage, total) => {
  return { offset: 0, perPage, total }
}
