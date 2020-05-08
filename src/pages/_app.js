import App from "next/app"
import Head from "next/head"
import getConfig from "next/config"
import { initializeFirebase } from "../common/firebase"
import { Globals } from "../common/models"
import Notification from "../common/components/Notification"
import "../styles/style.scss"

export default class extends App {
  static async getInitialProps({ Component, ctx }) {
    const isServer = !!ctx.req
    // グローバル変数を初期化する
    let globals
    if (isServer) {
      globals = {
        env: getConfig().serverRuntimeConfig
      }
    } else {
      globals = Object.assign({}, Globals)
    }
    initializeFirebase(globals.env)
    // ページを初期化する
    let pageProps = {}
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({
        ...ctx,
        globals
      })
    }
    return {
      globals,
      pageProps
    }
  }

  constructor(props) {
    super(props)
    const { globals } = props
    // グローバル変数をマージする
    Object.assign(Globals, globals)
    initializeFirebase(Globals.env)
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <div>
        <Head>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <link
            rel="stylesheet"
            href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
            integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
            crossOrigin="anonymous"
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/react-datepicker/2.15.0/react-datepicker.min.css"
            integrity="sha256-XkzLSJ4RlCseZJn744vYhvposTXK0sUAXVmbpsLd/Fs="
            crossOrigin="anonymous"
          />
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css"
            rel="stylesheet"
            crossOrigin="anonymous"
          />
          <link
            rel="stylesheet"
            href="https://use.fontawesome.com/releases/v5.13.0/css/all.css"
            integrity="sha384-Bfad6CLCknfcloXFOyFnlgtENryhrpZCe29RTifKEixXQZ38WheV+i/6YWSzkz3V"
            crossOrigin="anonymous"
          />
        </Head>
        <div className="page-wrapper">
          <Component {...pageProps} />
        </div>
        <Notification.Component />
      </div>
    )
  }
}
