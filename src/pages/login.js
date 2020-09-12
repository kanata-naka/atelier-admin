import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button } from "react-bootstrap";
import Head from "next/head";
import { useRouter } from "next/router";
import { signInFailed } from "../common/actions";
import { signInWithRedirect, getRedirectResult } from "../common/firebase";
import LoadingEffect from "../common/components/LoadingEffect";
import withRedux from "../common/hocs/withRedux";

const Component = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    getRedirectResult()
      .then(({ user }) => {
        if (user) {
          // ダッシュボードにリダイレクトする
          router.push("/");
        } else {
          setLoading(false);
        }
      })
      .catch(error => {
        console.error(error);
        dispatch(signInFailed());
      });
  }, []);

  if (loading) {
    return <LoadingEffect />;
  }

  return (
    <div>
      <Head>
        <title>{"ログイン - カナタノアトリエ (admin)"}</title>
      </Head>
      <div className="login-page">
        <div className="login-form">
          <img className="site-logo" src="/images/atelier-logo.svg" />
          <Button
            variant="primary"
            type="button"
            className="logout-button"
            onClick={signInWithRedirect}>
            {"ログイン"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default withRedux(Component, {});
