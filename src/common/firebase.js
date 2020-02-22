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
    firebase.functions().useFunctionsEmulator(API_BASE_URL)
  }
  return firebase
}

export const onAuthStateChanged = (onSignedIn, onSignInFailed, onSignedOut) => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      onSignedIn(user)
    } else {
      onSignedOut()
      signIn(onSignedIn, onSignInFailed)
    }
  })
}

export const signIn = async (onSignedIn, onSignInFailed) => {
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
  globals = null
}) => {
  dispatch(fetchStart({ config: { name, data } }))
  try {
    let callable
    if (
      (globals ? globals.env.ENVIRONMENT : Globals.env.ENVIRONMENT) !==
      "production"
    ) {
      callable = firebase.functions().httpsCallable(name)
    } else {
      callable = firebase
        .app()
        .functions(
          globals ? globals.env.FIREBASE_REGION : Globals.env.FIREBASE_REGION
        )
        .httpsCallable(name)
    }
    const result = await callable(data)
    dispatch(fetchSucceeded({ config: { name, data } }))
    return result
  } catch (error) {
    dispatch(fetchFailed({ config: { name, data } }))
    throw error
  }
}

/**
 * ファイルをアップロードする
 */
export const upload = async (file, name) => {
  const storageRef = firebase.storage().ref()
  const imageRef = storageRef.child(name)
  return await imageRef.put(file)
}
