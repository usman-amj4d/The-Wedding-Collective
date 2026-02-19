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
// INFO: get vendor details
router
  .route("/details")
  .get(isAuthenticated, isVendor, vendorController.getVendorDetails);

// INFO: get vendor packages
router
  .route("/packages")
  .get(isAuthenticated, isVendor, vendorController.getVendorPackages);

// ? POST
// INFO: add vendor details
router
  .route("/details")
  .post(isAuthenticated, isVendor, vendorController.addVendorDetails);

// INFO: add vendor package
router
  .route("/packages")
  .post(isAuthenticated, isVendor, vendorController.addVendorPackage);

// ? PUT
// INFO: update vendor details
router
  .route("/details")
  .put(isAuthenticated, isVendor, vendorController.updateVendorDetails);

// INFO: update vendor package
router
  .route("/packages/:packageId")
  .put(isAuthenticated, isVendor, vendorController.updateVendorPackage);

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

// INFO: upload vendor media (photos/videos)
router.put(
  "/upload/:type",
  isAuthenticated,
  isVendor,
  uploadMedia,
  vendorController.uploadVendorMedia,
);

// ? DELETE
// INFO: delete vendor media (photos/videos)
router
  .route("/delete/media/:type")
  .delete(isAuthenticated, isVendor, vendorController.deleteVendorMedia);

// INFO: delete vendor package
router
  .route("/packages/:packageId")
  .delete(isAuthenticated, isVendor, vendorController.deleteVendorPackage);

export default router;
