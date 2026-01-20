import Booking from "../models/Booking/Booking.js";
import { errorHandler } from "../utils/errorHandler.js";
import { successHandler } from "../utils/successHandler.js";

// INFO: get booking details
export const getBookingDetails = async (req, res) => {
  // #swagger.tags = ['booking']
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ bookingId });
    return successHandler(
      "Booking details fetched successfully",
      booking,
      200,
      res
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: create booking
export const createBooking = async (req, res) => {
  // #swagger.tags = ['booking']
  try {
    const bookingData = req.body;
    const booking = new Booking(bookingData);
    await booking.save();
    return successHandler(
      "Booking details created successfully",
      booking,
      201,
      res
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: update booking
export const updateBooking = async (req, res) => {
  // #swagger.tags = ['booking']
  try {
    const updatedData = req.body;
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(bookingId, updatedData, {
      new: true,
      runValidators: true,
    });
    return successHandler(
      "Booking details updated successfully",
      booking,
      200,
      res
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: cancel booking
export const cancelBooking = async (req, res) => {
  // #swagger.tags = ['booking']
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { isCancelled: true },
      {
        new: true,
        runValidators: true,
      }
    );
    return successHandler(
      "Booking details updated successfully",
      booking,
      200,
      res
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
