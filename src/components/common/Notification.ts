import { Store } from "react-notifications-component";

const Notification = {
  success,
  error,
};

function success(message: string) {
  Store.addNotification({
    type: "success",
    container: "top-right",
    message: message,
    animationIn: ["animate__animated animate__fadeIn"],
    animationOut: ["animate__animated animate__fadeOut"],
  });
}

function error(message: string) {
  Store.addNotification({
    type: "danger",
    container: "top-right",
    message: message,
    animationIn: ["animate__animated animate__bounceIn"],
    animationOut: ["animate__animated animate__fadeOut"],
  });
}

export default Notification;
