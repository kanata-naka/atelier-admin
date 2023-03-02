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
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"
          integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf"
          crossOrigin="anonymous"
        />
      </Head>
      <body
        css={css`
          font-family: "Cantarell", "M PLUS Rounded 1c", sans-serif;
          --bs-body-font-size: 0.8rem;
          --bs-body-line-height: 1.2;
        `}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
