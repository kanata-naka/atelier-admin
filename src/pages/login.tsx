import React from "react";
import { css } from "@emotion/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import { signInWithPopup } from "@/api/firebase";
import { signInFailed, signingIn } from "@/components/auth/reducer";
import SigningInEffect from "@/components/auth/SigningInEffect";
import { useDispatch, useSelector } from "@/hooks";

export default function Page() {
  const router = useRouter();
  const { status } = useSelector((state) => ({
    status: state.auth.status,
  }));
  const dispatch = useDispatch();

  if (status === "signing_in") {
    return <SigningInEffect />;
  }

  const handleSignInButtonClick = () => {
    dispatch(signingIn());
    signInWithPopup()
      .then((user) => {
        if (user) {
          // ダッシュボードにリダイレクトする
          router.push("/");
        }
      })
      .catch((error) => {
        console.error(error);
        dispatch(signInFailed());
      });
  };

  return (
    <>
      <Head>
        <title>ログイン - カナタノアトリエ</title>
      </Head>
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
          background-color: lavender;
        `}
      >
        <form
          css={css`
            display: flex;
            align-items: center;
            flex-direction: column;
            width: 320px;
            margin: 0 auto 24px;
            padding: 24px;
            background-color: white;
            border-radius: 8px;
          `}
        >
          <Image
            src="/images/atelier-logo.svg"
            width={256}
            height={35}
            alt="カナタノアトリエ"
            css={css`
              display: block;
              margin: 12px 0 48px 0;
            `}
          />
          <Button variant="primary" type="button" onClick={handleSignInButtonClick}>
            ログイン
          </Button>
        </form>
      </div>
    </>
  );
}
