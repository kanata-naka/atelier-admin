import { css } from "@emotion/react";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cantarell&family=M+PLUS+Rounded+1c&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body
        css={css`
          font-family: "Cantarell", "M PLUS Rounded 1c", sans-serif;
          line-height: 1.2em;
        `}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
