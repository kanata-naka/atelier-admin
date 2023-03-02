import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import authReducer from "@/components/auth/reducer";
import commonReducer from "@/components/common/reducer";
import topImagesReducer from "@/components/topImages/reducer";

export default configureStore({
  reducer: { auth: authReducer, common: commonReducer, topImages: topImagesReducer },
  middleware: [logger],
});
