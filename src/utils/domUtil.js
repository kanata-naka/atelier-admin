import * as marked from "marked";

/**
 * 要素の大きさを外枠に合わせて調整する
 * @param containerElement 外枠のHTMLElement
 * @param innerElement 内側のHTMLElement
 */
export const adjustElementWidth = (containerElement, innerElement, fit) => {
  const containerWidth = containerElement.clientWidth;
  const containerHeight = containerElement.clientHeight;
  switch (fit) {
    case "inside":
      if (
        containerWidth / innerElement.width <
        containerHeight / innerElement.height
      ) {
        innerElement.style.width = containerWidth + "px";
        innerElement.style.height = "auto";
      } else {
        innerElement.style.width = "auto";
        innerElement.style.height = containerHeight + "px";
      }
      break;
    case "cover":
      if (
        innerElement.width / containerWidth <
        innerElement.height / containerHeight
      ) {
        innerElement.style.width = containerWidth + "px";
        innerElement.style.height = "auto";
      } else {
        innerElement.style.width = "auto";
        innerElement.style.height = containerHeight + "px";
      }
      break;
  }
};

export const renderMarkdown = src => {
  if (!src) {
    return <span />;
  }
  return (
    <span
      className="markdown-body"
      dangerouslySetInnerHTML={{
        __html: marked(src, { breaks: true })
      }}></span>
  );
};
