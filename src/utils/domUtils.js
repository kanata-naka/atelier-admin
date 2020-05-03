/**
 * 要素の大きさを外枠に合わせて調整する
 * @param containerElement 外枠のHTMLElement
 * @param innerElement 内側のHTMLElement
 */
export const adjustElementWidth = (containerElement, innerElement) => {
  const containerWidth = containerElement.clientWidth
  const containerHeight = containerElement.clientHeight
  const magnificationX = containerWidth / innerElement.width
  const magnificationY = containerHeight / innerElement.height
  if (magnificationX < magnificationY) {
    innerElement.style.width = containerWidth + "px"
    innerElement.style.height = "auto"
  } else {
    innerElement.style.width = "auto"
    innerElement.style.height = containerHeight + "px"
  }
}
