import express from "express";
import * as userController from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { multerErrorHandler, uploadImage } from "../middleware/multer.js";
const router = express.Router();

// ? GET
// Get User Details
router.route("/details").get(isAuthenticated, userController.getUserDetails);

// ? PUT
// Update Profile Photo
router
  .route("/update/profile-photo")
  .put(
    isAuthenticated,
    uploadImage,
    multerErrorHandler,
    userController.updateProfilePicture
  );

export default router;
