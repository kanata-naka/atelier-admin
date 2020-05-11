/**
 * 画像ファイルをリサイズする
 */
export const resize = (imageFile, maxWidth, maxHeight) => {
  return new Promise(resolve => {
    let reader = new FileReader()
    reader.readAsDataURL(imageFile)
    reader.onload = e => {
      let img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height
        if (width > maxWidth || height > maxHeight) {
          // リサイズ後の幅と高さを計算する
          const magnificationX = maxWidth / width
          const magnificationY = maxHeight / height
          if (magnificationX < magnificationY) {
            width = maxWidth
            height = height * magnificationX
          } else {
            width = width * magnificationY
            height = maxHeight
          }
        } else {
          // リサイズが不要なら元のFileをそのまま返す
          resolve(imageFile)
          return
        }
        // canvasを使用して画像をリサイズする
        let canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        let context = canvas.getContext("2d")
        context.drawImage(img, 0, 0, width, height)
        context.canvas.toBlob(
          blob => {
            const resizedImageFile = new File([blob], imageFile.name, {
              type: imageFile.type,
              lastModified: Date.now()
            })
            resolve(resizedImageFile)
          },
          imageFile.type,
          1
        )
      }
      // imgにreaderで読み込んだ画像のDataURLをセットする
      img.src = e.target.result
    }
  })
}
