import { useEffect } from "react"
import { adjustElementWidth } from "../utils/domUtil"

/**
 * 要素の大きさを外枠に合わせて調整する
 */
export const useAdjustElementWidth = (containerRef, innerRef, deps) => {
  useEffect(() => {
    const containerElement = containerRef.current
    const innerElement = innerRef.current
    innerElement.onload = () => {
      adjustElementWidth(containerElement, innerElement)
    }
  }, deps)
}

/**
 * ファイルのドラッグ＆ドロップを有効にする
 */
export const useDropFile = (
  ref,
  onChange,
  acceptableExtentions = [],
  deps = []
) => {
  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }
    element.addEventListener("dragover", e => {
      e.preventDefault()
    })
    element.addEventListener("dragleave", e => {
      e.preventDefault()
    })
    element.addEventListener("drop", e => {
      e.preventDefault()
      const files = e.dataTransfer.files
      if (
        files.length &&
        (!acceptableExtentions.length ||
          acceptableExtentions.find(extention =>
            files[0].name.endsWith(extention)
          ))
      ) {
        onChange(files[0])
      }
    })
  }, deps)
}