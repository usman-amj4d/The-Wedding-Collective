import express from "express";
import * as vendorController from "../controllers/vendorController.js";
import { isAuthenticated, isVendor } from "../middleware/auth.js";
const router = express.Router();

// ? GET
router
  .route("/details/:vendorId")
  .get(isAuthenticated, isVendor, vendorController.getVendorDetails);

// ? POST
router
  .route("/details")
  .post(isAuthenticated, isVendor, vendorController.createVendorDetails);

// ? PUT
router
  .route("/details/:vendorId")
  .put(isAuthenticated, isVendor, vendorController.updateVendorDetails);

export default router;
