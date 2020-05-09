import firebase from "firebase/app"
import "firebase/auth"
import "firebase/functions"
import "firebase/storage"
import { Globals } from "./models"

/**
 * Firebaseを初期化する
 */
export const initializeFirebase = ({
  ENVIRONMENT,
  API_BASE_URL,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET
}) => {
  if (firebase.apps.length) {
    return
  }
  firebase.initializeApp({
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET
  })
  if (ENVIRONMENT !== "production") {
    // ローカル環境の場合
    firebase.functions().useFunctionsEmulator(API_BASE_URL)
  }
  return firebase
}

export const onAuthStateChanged = (onSignedIn, onSignInFailed, onSignedOut) => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      signIn(user, onSignedIn, onSignInFailed)
    } else {
      onSignedOut()
      // ログインページにリダイレクトする
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithRedirect(provider)
    }
  })
}

export const signInWithRedirect = (onSignedIn, onSignInFailed) => {
  firebase
    .auth()
    .getRedirectResult()
    .then(({ user }) => {
      if (user) {
        signIn(user, onSignedIn, onSignInFailed)
      }
    })
    .catch(error => {
      console.error(error)
      onSignInFailed()
    })
}

const signIn = (user, onSignedIn, onSignInFailed) => {
  user.getIdTokenResult(true).then(idTokenResult => {
    if (idTokenResult.claims.admin) {
      onSignedIn(user)
    } else {
      onSignInFailed()
    }
  })
}

export const signOut = async onSignedOut => {
  firebase
    .auth()
    .signOut()
    .then(result => {
      onSignedOut(result)
    })
    .catch(error => {
      console.error(error)
    })
}

/**
 * Firebase functionsの関数を実行する
 */
export const callFunction = async ({
  name,
  data,
  globals: { env }
}) => {
  try {
    let callable
    if ((env ? env.ENVIRONMENT : Globals.env.ENVIRONMENT) !== "production") {
      // ローカル環境の場合
      callable = firebase.functions().httpsCallable(name)
    } else {
      callable = firebase
        .app()
        .functions(env ? env.FIREBASE_REGION : Globals.env.FIREBASE_REGION)
        .httpsCallable(name)
    }
    return await callable({ ...data })
  } catch (error) {
    throw error
  }
}

/**
 * ストレージにファイルを保存する
 */
export const saveFile = async (file, name) => {
  const storageRef = firebase.storage().ref()
  const imageRef = storageRef.child(name)
  return await imageRef.put(file)
}

/**
 * ストレージからファイルを削除する
 */
export const deleteFile = async name => {
  const storageRef = firebase.storage().ref()
  const imageRef = storageRef.child(name)
  await imageRef.delete()
}
