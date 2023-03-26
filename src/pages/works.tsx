import Head from "next/head";
import AuthProvider from "@/components/auth/AuthProvider";
import Sidebar from "@/components/common/Sidebar";
import WorkContent from "@/components/works/WorkContent";

function Page() {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>WORKS - カナタノアトリエ</title>
      </Head>
      <div>
        <Sidebar id={"works"} />
        <WorkContent />
      </div>
    </AuthProvider>
  );
}

export default Page;
