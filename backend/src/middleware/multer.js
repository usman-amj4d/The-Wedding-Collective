import multer from "multer";
import { errorHandler } from "../utils/errorHandler.js";
import path from "path";

// ? multer's configuration
const storage = multer.memoryStorage();

// ? File size limits
const FILE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  video: 50 * 1024 * 1024, // 50MB
};

// ? Check video type
export const validateVideoFormat = (req, file, cb) => {
  const allowedExt = /mp4|mkv|3gp|flv|mov|avi/;
  const extName = allowedExt.test(
    path.extname(file.originalname).toLowerCase(),
  );

  const mimeType = file.mimetype.startsWith("video/");

  if (!extName || !mimeType) {
    return cb(
      new Error(
        "Only MP4, MKV, 3GP, FLV, MOV or AVI video formats are allowed",
      ),
    );
  }

  cb(null, true);
};

// ? Check image type
export const validateImageFormat = (req, file, cb) => {
  const allowedExt = /jpg|jpeg|png|webp/;
  const extName = allowedExt.test(
    path.extname(file.originalname).toLowerCase(),
  );

  const mimeType = file.mimetype.startsWith("image/");

  if (!extName || !mimeType) {
    return cb(
      new Error("Only PNG, JPG, JPEG or WEBP image formats are allowed"),
    );
  }

  cb(null, true);
};

export const uploadImage = multer({
  storage,
  limits: FILE_LIMITS.image,
  fileFilter: validateImageFormat,
}).single("image");

export const uploadImages = multer({
  storage,
  limits: FILE_LIMITS.image,
  fileFilter: validateImageFormat,
}).array("images", 10);

// export const checkFileSize = function (err, req, res, next) {
//   if (err.code === "LIMIT_FILE_SIZE") {
//     return errorHandler("File size exceeds the limit of 10MB", 422, req, res);
//   }

//   next();
// };

// export const checkImageSize = function (err, req, res, next) {
//   if (err.code === "LIMIT_FILE_SIZE") {
//     return errorHandler("File size exceeds the limit of 5MB", 422, req, res);
//   }

//   next();
// };

export const uploadVideo = multer({
  storage,
  limits: FILE_LIMITS.video,
  fileFilter: validateVideoFormat,
}).single("video");

export const uploadVideos = multer({
  storage,
  limits: FILE_LIMITS.video,
  fileFilter: validateVideoFormat,
}).array("videos", 5);

// ? Multer error handler
export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      let limitMessage = "the allowed size";

      // Single file upload
      const file = req.file || (req.files && req.files[0]);

      if (file?.mimetype?.startsWith("image/")) {
        limitMessage = "5MB";
      } else if (file?.mimetype?.startsWith("video/")) {
        limitMessage = "50MB";
      }

      return res.status(422).json({
        success: false,
        message: `File size exceeds the limit of ${limitMessage}`,
      });
    }
  }

  if (err) {
    return res.status(422).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

// INFO: conditional media uploader (photo | video)
export const uploadMedia = (req, res, next) => {
  const { type } = req.params;

  let uploader;
  if (type === "photo") uploader = uploadImages;
  else if (type === "video") uploader = uploadVideos;
  else return errorHandler("Invalid upload type", 400, req, res);

  uploader(req, res, (err) => {
    if (err) {
      return multerErrorHandler(err, req, res, next);
    }
    next();
  });
};
