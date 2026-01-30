import express from "express";
import * as vendorController from "../controllers/vendorController.js";
import { isAuthenticated, isVendor } from "../middleware/auth.js";
const router = express.Router();

// ? GET
router
  .route("/details")
  .get(isAuthenticated, isVendor, vendorController.getVendorDetails);

// ? POST
router
  .route("/details")
  .post(isAuthenticated, isVendor, vendorController.addVendorDetails);

// ? PUT
router
  .route("/details")
  .put(isAuthenticated, isVendor, vendorController.updateVendorDetails);

export default router;
