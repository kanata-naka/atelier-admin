const withSass = require("@zeit/next-sass")
const config = require("config")

module.exports = {
  ...withSass(),
  serverRuntimeConfig: {
    ENVIRONMENT: process.env.NODE_ENV,
    API_BASE_URL: config.get("api.baseUrl"),
    FIREBASE_API_KEY: config.get("firebase.apiKey"),
    FIREBASE_AUTH_DOMAIN: config.get("firebase.authDomain"),
    FIREBASE_PROJECT_ID: config.get("firebase.projectId"),
    FIREBASE_STORAGE_BUCKET: config.get("firebase.storageBucket"),
    FIREBASE_REGION: config.get("firebase.region")
  }
}
