import express from "express";
import * as bookingsController from "../controllers/bookingsController.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

// ? GET
router
  .route("/:bookingId")
  .get(isAuthenticated, bookingsController.getBookingDetails);

// ? POST
router.route("/create").post(isAuthenticated, bookingsController.createBooking);

// ? PUT
router
  .route("/:bookingId")
  .put(isAuthenticated, bookingsController.updateBooking);

// ? PUT
router
  .route("/:bookingId/cancel")
  .put(isAuthenticated, bookingsController.cancelBooking);

export default router;
