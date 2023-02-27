import { ReactNode, useEffect } from "react";
import { User } from "@firebase/auth";
import { useRouter } from "next/router";
import { watchAuthStateChanged } from "@/api/firebase";
import { useDispatch, useSelector } from "@/hooks";
import ErrorPage from "@/pages/_error";
import { signedIn, notSignedIn, signInFailed } from "./reducer";
import SigningInEffect from "./SigningInEffect";

function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useSelector((state) => ({
    status: state.auth.status,
  }));
  const dispatch = useDispatch();

  const handleSignedIn = (user: User) => {
    dispatch(signedIn(user));
  };

  const handleSignInFailed = () => {
    dispatch(signInFailed());
  };

  const handleNotSignedIn = () => {
    dispatch(notSignedIn());
    // ログインページにリダイレクトする
    router.push("/login");
  };

  useEffect(() => {
    try {
      watchAuthStateChanged(handleSignedIn, handleSignInFailed, handleNotSignedIn);
    } catch (error) {
      console.error(error);
    }
  }, []);

  switch (status) {
    case "signed_in":
      return <>{children}</>;
    case "sign_in_failed":
      return <ErrorPage statusCode={401} />;
    default:
      return <SigningInEffect />;
  }
}

export default AuthProvider;
