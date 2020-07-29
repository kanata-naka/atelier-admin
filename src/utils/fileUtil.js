/**
 * ファイル名から拡張子を取得する
 * @param filename ファイル名
 */
export const getExtension = filename => {
  var position = filename.lastIndexOf(".")
  if (position === -1) return ""
  return filename.slice(position + 1)
}
