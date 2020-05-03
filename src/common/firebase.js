import firebase from "firebase/app"
import "firebase/auth"
import "firebase/functions"
import "firebase/storage"
import { fetchStart, fetchSucceeded, fetchFailed } from "./actions"
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

/**
 * 認証状態を監視する
 */
export const onAuthStateChanged = (onSignedIn, onSignInFailed, onSignedOut) => {
  // TODO
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      onSignedIn(user)
    } else {
      onSignedOut()
      signIn(onSignedIn, onSignInFailed)
    }
  })
}

/**
 * ログインを行う
 */
export const signIn = async (onSignedIn, onSignInFailed) => {
  // TODO
  const provider = new firebase.auth.GoogleAuthProvider()
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(result => {
      onSignedIn(result)
    })
    .catch(error => {
      console.error(error)
      onSignInFailed()
    })
}

/**
 * Firebase functionsの関数を実行する
 */
export const callFunction = async ({
  dispatch,
  name,
  data,
  globals: { env }
}) => {
  dispatch(fetchStart({ name }))
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
    const result = await callable(data)
    dispatch(fetchSucceeded({ name }))
    return result
  } catch (error) {
    dispatch(fetchFailed({ name }))
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
