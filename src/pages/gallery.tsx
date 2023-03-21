import Head from "next/head";
import AuthProvider from "@/components/auth/AuthProvider";
import Sidebar from "@/components/common/Sidebar";
import GalleryContent from "@/components/gallery/GalleryContent";

function Page() {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>GALLERY - カナタノアトリエ</title>
      </Head>
      <div>
        <Sidebar id={"gallery"} />
        <GalleryContent />
      </div>
    </AuthProvider>
  );
}

export default Page;
