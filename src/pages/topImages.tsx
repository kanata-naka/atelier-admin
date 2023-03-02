import Head from "next/head";
import AuthProvider from "@/components/auth/AuthProvider";
import Sidebar from "@/components/common/Sidebar";
import TopImageContent from "@/components/topImages/TopImageContent";

function Page() {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>トップ画像 - カナタノアトリエ</title>
      </Head>
      <div>
        <Sidebar id={"topImages"} />
        <TopImageContent />
      </div>
    </AuthProvider>
  );
}

export default Page;
