import Head from "next/head";
import AuthProvider from "@/components/auth/AuthProvider";
import ComicContent from "@/components/comics/ComicContent";
import Sidebar from "@/components/common/Sidebar";

function Page() {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>COMICS - カナタノアトリエ</title>
      </Head>
      <div>
        <Sidebar id={"comics"} />
        <ComicContent />
      </div>
    </AuthProvider>
  );
}

export default Page;
