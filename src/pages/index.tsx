import { css } from "@emotion/react";
import Head from "next/head";
import AuthProvider from "@/components/auth/AuthProvider";
import Sidebar from "@/components/common/Sidebar";

function Page() {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div>
        <Sidebar id={"home"} />
        <div
          css={css`
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            margin-left: 240px;
            padding: 12px;
          `}
        ></div>
      </div>
    </AuthProvider>
  );
}

export default Page;
