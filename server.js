const config = require("config")
const next = require("next")
const express = require("express")

const dev = process.env.NODE_ENV !== "production"
const app = next({dev})
const server = express()
server.use(function (req, res, next) {
  console.log('Current path: ' + req.path)
  // 環境設定
  req.env = {
    ENVIRONMENT: process.env.NODE_ENV,
    API_BASE_URL: config.get("api.baseUrl"),
    FIREBASE_API_KEY: config.get("firebase.apiKey"),
    FIREBASE_AUTH_DOMAIN: config.get("firebase.authDomain"),
    FIREBASE_PROJECT_ID: config.get("firebase.projectId"),
    FIREBASE_STORAGE_BUCKET: config.get("firebase.storageBucket"),
    FIREBASE_REGION: config.get("firebase.region")
  }
  next()
})

server.get('*', (req, res) => {
  return app.getRequestHandler()(req, res)
})

app.prepare().then(() => {
  const port = dev ? 3000 : 80
  server.listen(port, error => {
    if (error) {
      throw error
    }
    console.log(`> Ready on http://localhost:${port}`)
  })
})
