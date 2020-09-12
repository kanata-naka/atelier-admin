import React from "react";
import { Provider } from "react-redux";
import { initializeStore } from "../store";

export default (Component, reducers) => {
  const WithRedux = ({ initialState, ...props }) => {
    const store = initializeStore(reducers, initialState);
    return (
      <Provider store={store}>
        <Component {...props} />
      </Provider>
    );
  };
  WithRedux.getInitialProps = async ctx => {
    const store = initializeStore(reducers);
    // ページを初期化する
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({
        ...ctx,
        store
      });
    }
    return {
      initialState: store.getState(),
      pageProps
    };
  };
  return WithRedux;
};
