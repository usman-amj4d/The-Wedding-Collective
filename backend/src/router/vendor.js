import express from "express";
import * as vendorController from "../controllers/vendorController.js";
import { isAuthenticated, isVendor } from "../middleware/auth.js";
import {
  multerErrorHandler,
  uploadImage,
  uploadMedia,
} from "../middleware/multer.js";
const router = express.Router();

// ? GET
router
  .route("/details")
  .get(isAuthenticated, isVendor, vendorController.getVendorDetails);

// ? POST
// INFO: add vendor details
router
  .route("/details")
  .post(isAuthenticated, isVendor, vendorController.addVendorDetails);

// INFO: update vendor logo/coverPhoto
router
  .route("/update/:photoType")
  .put(
    isAuthenticated,
    isVendor,
    uploadImage,
    multerErrorHandler,
    vendorController.updateLogoOrCoverPhoto,
  );

// ? PUT
router
  .route("/details")
  .put(isAuthenticated, isVendor, vendorController.updateVendorDetails);

// INFO: upload vendor media (photos/videos)
router.put(
  "/upload/:type",
  isAuthenticated,
  isVendor,
  uploadMedia,
  vendorController.uploadVendorMedia,
);

export default router;
