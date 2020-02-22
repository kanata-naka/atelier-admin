import firebase from "firebase/app"
import "firebase/auth"
import "firebase/functions"
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
  FIREBASE_PROJECT_ID
}) => {
  if (firebase.apps.length) {
    return
  }
  firebase.initializeApp({
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID
  })
  console.log("うおお")
  if (ENVIRONMENT !== "production") {
    console.log("devやぞ")
    // ローカル環境の場合
    firebase.functions().useFunctionsEmulator(API_BASE_URL)
  }
  return firebase
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
    if ((globals ? globals.env.ENVIRONMENT : Globals.env.ENVIRONMENT) !== "production") {
      console.log("devやぞ２")
      // ローカル環境の場合
      callable = firebase.functions().httpsCallable(name)
    } else {
      console.log(
        "region: ",
        globals ? globals.env.FIREBASE_REGION : Globals.env.FIREBASE_REGION
      )
      callable = firebase
        .app()
        .functions(globals ? globals.env.FIREBASE_REGION : Globals.env.FIREBASE_REGION)
        .httpsCallable(name)
    }
    console.log("callable: ", callable)
    const result = await callable(data)
    dispatch(fetchSucceeded({ config: { name, data } }))
    return result
  } catch (error) {
    dispatch(fetchFailed({ config: { name, data } }))
    throw error
  }
}
