import React, { useRef, useEffect } from "react"
import Router from "next/router"
import NotificationSystem from "react-notification-system"

Router.events.on("routeChangeStart", () => (Component.routing = true))
Router.events.on("routeChangeComplete", () => {
  Component.routing = false
  processQueue()
})
Router.events.on("routeChangeError", () => {
  Component.routing = false
  processQueue()
})

const Component = () => {
  const notificationSystemRef = useRef(null)

  useEffect(() => {
    Component.notificationSystem = notificationSystemRef.current
    processQueue()
  }, [])

  return <NotificationSystem ref={notificationSystemRef} />
}

Component.queue = []

/**
 * キューを処理する
 */
const processQueue = () => {
  if (Component.queue) {
    Component.queue.forEach(notification => {
      Component.notificationSystem.addNotification(notification)
    })
    Component.queue = []
  }
}

const Notification = {
  Component,
  add: notification => {
    if (!Component.routing && Component.notificationSystem) {
      Component.notificationSystem.addNotification(notification)
    } else {
      Component.queue.push(notification)
    }
  },
  success: message => {
    Notification.add({ message, level: "success" })
  },
  info: message => {
    Notification.add({ message, level: "info" })
  },
  warning: message => {
    Notification.add({ message, level: "warning" })
  },
  error: message => {
    Notification.add({ message, level: "error" })
  }
}

export default Notification
