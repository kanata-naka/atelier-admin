import { initializeAnalytics } from "firebase/analytics";
import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth, User, signInWithPopup as _signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator, httpsCallable, HttpsCallableResult } from "firebase/functions";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { FIREBASE_REGION } from "@/constants";

export function initializeFirebase(isServer: boolean) {
  if (getApps().length) {
    return;
  }
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_MEASUREMENT_ID,
  });

  if (!isServer) {
    initializeAnalytics(getApp());
  }

  if (process.env.NEXT_PUBLIC_ENV !== "production") {
    connectFunctionsEmulator(getFunctions(getApp(), FIREBASE_REGION), "localhost", 5000);
  }
}

export function watchAuthStateChanged(
  onSignedIn: (user: User) => void,
  onSignInFailed: () => void,
  onNotSignedIn: () => void
) {
  getAuth().onAuthStateChanged((user) => {
    if (user) {
      signIn(user, onSignedIn, onSignInFailed);
    } else {
      onNotSignedIn();
    }
  });
}

function signIn(user: User, onSignedIn: (user: User) => void, onSignInFailed: () => void) {
  user.getIdTokenResult(true).then((idTokenResult) => {
    if (idTokenResult.claims.admin) {
      onSignedIn(user);
    } else {
      onSignInFailed();
    }
  });
}

export function signInWithPopup() {
  // Googleのログインページにリダイレクトする
  return _signInWithPopup(getAuth(), new GoogleAuthProvider());
}

export async function signOut() {
  try {
    await getAuth().signOut();
  } catch (error) {
    console.error();
    throw error;
  }
}

export async function callFunction<T = Record<string, unknown>, R = Record<string, unknown>>(
  name: string,
  data?: T
): Promise<HttpsCallableResult<R>> {
  const callable = httpsCallable<T, R>(getFunctions(getApp(), FIREBASE_REGION), name);
  return await callable(data);
}

export async function uploadFile(file: Blob, name: string) {
  const storageRef = ref(getStorage(), name);
  return await uploadBytes(storageRef, file);
}
