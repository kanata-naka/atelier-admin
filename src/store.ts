import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import authReducer from "@/components/auth/reducer";

export default configureStore({
  reducer: { auth: authReducer },
  middleware: [logger],
});
