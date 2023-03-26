import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import authReducer from "@/components/auth/reducer";
import commonReducer from "@/components/common/reducer";
import galleryReducer from "@/components/gallery/reducer";
import topImagesReducer from "@/components/topImages/reducer";
import worksReducer from "@/components/works/reducer";

export default configureStore({
  reducer: {
    auth: authReducer,
    common: commonReducer,
    topImages: topImagesReducer,
    gallery: galleryReducer,
    works: worksReducer,
  },
  middleware: [logger],
});
