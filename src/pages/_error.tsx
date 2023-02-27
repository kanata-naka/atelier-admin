import React from "react";
import { css } from "@emotion/react";
import { NextPageContext } from "next";

function Page({ statusCode }: { statusCode: number | null }) {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100vh;
      `}
    >
      <h1>{statusCode}</h1>
    </div>
  );
}

Page.getInitialProps = async function ({ res, err }: NextPageContext) {
  const statusCode = res ? res.statusCode : err ? err.statusCode : null;
  return { statusCode };
};

export default Page;
