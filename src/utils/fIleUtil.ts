export function getExtension(filename: string) {
  return filename.slice(filename.lastIndexOf(".") + 1);
}

export function validateFile(file: File, acceptableExtentions: string[] = [], maxSize: number) {
  if (acceptableExtentions.length && !acceptableExtentions.find((extention) => file.name.endsWith(extention))) {
    return `ファイルの形式が不正です。 ${acceptableExtentions.join(", ")} 形式のファイルのみアップロードできます。`;
  }
  if (file.size > maxSize) {
    return `ファイルサイズが ${maxSize / (1024 * 1024)} MBを超えています。`;
  }
}
