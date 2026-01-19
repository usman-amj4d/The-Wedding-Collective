import express from "express";
import * as userController from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { multerErrorHandler, uploadSingleImage } from "../middleware/multer.js";
const router = express.Router();

// ? GET
router.route("/details").get(isAuthenticated, userController.getUserDetails);
router
  .route("/update/profile-photo")
  .put(
    isAuthenticated,
    uploadSingleImage,
    multerErrorHandler,
    userController.updateProfilePicture
  );

export default router;
