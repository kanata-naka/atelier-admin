/**
 * ファイル名から拡張子を取得する
 * @param filename ファイル名
 */
export const getExtension = filename => {
  var position = filename.lastIndexOf(".");
  if (position === -1) return "";
  return filename.slice(position + 1);
};

export const validateFile = (file, acceptableExtentions = [], maxSize) => {
  if (
    acceptableExtentions.length &&
    !acceptableExtentions.find(extention => file.name.endsWith(extention))
  ) {
    return `ファイルの形式が不正です。 ${acceptableExtentions.join(
      ", "
    )} 形式のファイルのみアップロードできます。`;
  }
  if (file.size > maxSize) {
    return `ファイルサイズが ${maxSize / (1024 * 1024)} MBを超えています。`;
  }
};
