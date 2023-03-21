export const FIREBASE_REGION = "asia-northeast1";

export const IMAGE_FILE_ACCEPTABLE_EXTENTIONS = [".gif", ".jpg", ".png"];

export const IMAGE_FILE_MAX_SIZE = 1024 * 1024 * 4; // 4MB

export const Restrict = {
  ALL: "0",
  LIMITED: "1",
  PRIVATE: "2",
} as const;

export const PER_PAGE = 20;
