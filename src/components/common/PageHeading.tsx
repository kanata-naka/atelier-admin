import React, { ReactNode } from "react";
import { css } from "@emotion/react";

export default function PageHeading({ children }: { children: ReactNode }) {
  return (
    <h1
      css={css`
        padding: 18px 0;
        color: #2222aa;
        font-size: 2em;
      `}
    >
      {children}
    </h1>
  );
}
