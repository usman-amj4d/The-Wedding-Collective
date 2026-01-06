import express from "express";
import * as bookingsController from "../controllers/bookingsController.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

// ? GET
router
  .route("/:booking_id")
  .get(isAuthenticated, bookingsController.getBookingDetails);

// ? POST
router.route("/create").post(isAuthenticated, bookingsController.createBooking);

// ? PUT
router
  .route("/:booking_id")
  .put(isAuthenticated, bookingsController.updateBooking);

// ? PUT
router
  .route("/:booking_id/cancel")
  .put(isAuthenticated, bookingsController.cancelBooking);

export default router;
