import { NextPageContext } from "next";
import Head from "next/head";
import AuthProvider from "@/components/auth/AuthProvider";
import EpisodeContent from "@/components/comics/episodes/EpisodeContent";
import Sidebar from "@/components/common/Sidebar";

function Page({ comicId }: { comicId: string }) {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>COMICS - カナタノアトリエ</title>
      </Head>
      <div>
        <Sidebar id={"comics"} />
        <EpisodeContent comicId={comicId} />
      </div>
    </AuthProvider>
  );
}

Page.getInitialProps = async function ({ query }: NextPageContext) {
  return { comicId: String(query.id) };
};

export default Page;
