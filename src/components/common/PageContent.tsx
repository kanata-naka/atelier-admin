import { ReactNode } from "react";
import { css } from "@emotion/react";
import { useSelector } from "@/hooks";
import LoadingEffect from "./LoadingEffect";

function PageContent({ children }: { children: ReactNode }) {
  const isLoading = useSelector((state) => state.common.isLoading);

  return (
    <>
      <div
        css={css`
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          margin-left: 240px;
          padding: 12px;
          overflow: ${isLoading ? "hidden" : "auto"};
        `}
      >
        {children}
        {isLoading && <LoadingEffect />}
      </div>
    </>
  );
}

export default PageContent;
