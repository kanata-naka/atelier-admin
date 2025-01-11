import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import authReducer from "@/components/auth/reducer";
import episodesReducer from "@/components/comics/episodes/reducer";
import comicsReducer from "@/components/comics/reducer";
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
    comics: comicsReducer,
    episodes: episodesReducer,
  },
  middleware: [logger],
});
