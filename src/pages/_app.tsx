import type { AppContext, AppProps } from "next/app";
import Head from "next/head";
import { ReactNotifications } from "react-notifications-component";
import { Provider } from "react-redux";
import { initializeFirebase } from "@/api/firebase";
import store from "@/store";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-notifications-component/dist/theme.css";
import "animate.css";

function App({ Component, isServer, pageProps }: AppProps & { isServer: boolean }) {
  initializeFirebase(isServer);
  return (
    <Provider store={store}>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </Head>
      <div>
        <ReactNotifications />
        <Component {...pageProps} />
      </div>
    </Provider>
  );
}

App.getInitialProps = async function ({ Component, ctx }: AppContext) {
  let pageProps = {};
  const isServer = !!ctx.req;
  if (Component.getInitialProps) {
    initializeFirebase(isServer);
    pageProps = await Component.getInitialProps({ ...ctx });
  }
  return { isServer, pageProps };
};

export default App;
