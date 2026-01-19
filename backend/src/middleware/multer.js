import multer from "multer";
import { errorHandler } from "../utils/errorHandler.js";
import path from "path";

// ? multer's configuration
const storage = multer.memoryStorage();

// ? Check video type
export const checkVideoType = (req, file, cb) => {
  const allowedExt = /mp4|mkv|3gp|flv|mov|avi/;
  const extName = allowedExt.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimeType = file.mimetype.startsWith("video/");

  if (!extName || !mimeType) {
    return cb(
      new Error("Only MP4, MKV, 3GP, FLV, MOV or AVI video formats are allowed")
    );
  }

  cb(null, true);
};

// ? Check image type
export const checkImageType = (req, file, cb) => {
  const allowedExt = /jpg|jpeg|png|webp|svg/;
  const extName = allowedExt.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimeType = file.mimetype.startsWith("image/");

  if (!extName || !mimeType) {
    return cb(
      new Error("Only PNG, JPG, JPEG, WEBP or SVG image formats are allowed")
    );
  }

  cb(null, true);
};

export const uploadSingleImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("image");

export const checkFileSize = function (err, req, res, next) {
  if (err.code === "LIMIT_FILE_SIZE") {
    return errorHandler("File size exceeds the limit of 10MB", 422, req, res);
  }

  next();
};

export const checkImageSize = function (err, req, res, next) {
  if (err.code === "LIMIT_FILE_SIZE") {
    return errorHandler("File size exceeds the limit of 5MB", 422, req, res);
  }

  next();
};

export const uploadSingleFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: videoFilter,
}).single("file");

export const uploadMultipleFiles = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: videoFilter,
}).array("files", 5);

// ? Multer error handler
export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(422).json({
        success: false,
        message: "File size exceeds allowed limit",
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
