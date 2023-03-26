import { css } from "@emotion/react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { Nullable } from "@/types";

export function renderMarkdown(source: Nullable<string>) {
  if (!source) {
    return <span />;
  }
  return (
    <ReactMarkdown
      className="markdown-body"
      rehypePlugins={[rehypeRaw]}
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
