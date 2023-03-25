import { css } from "@emotion/react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

export function renderMarkdown(source?: string) {
  if (!source) {
    return <span />;
  }
  return (
    <ReactMarkdown
      className="markdown-body"
      remarkPlugins={[remarkBreaks, remarkGfm]}
      css={css`
        color: inherit !important;

        ul,
        ol {
          list-style: initial !important;
        }
      `}
    >
      {source}
    </ReactMarkdown>
  );
}
