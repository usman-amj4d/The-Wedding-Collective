import Booking from "../models/Booking/Booking.js";
import Vendor from "../models/Vendor/Vendor.js";
import VendorPackage from "../models/VendorPackage/VendorPackage.js";
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
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: get all bookings for a user
export const getUserBookings = async (req, res) => {
  // #swagger.tags = ['booking']
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId });

    return successHandler(
      "User bookings fetched successfully",
      bookings,
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: get all bookings for a vendor
export const getVendorBookings = async (req, res) => {
  // #swagger.tags = ['booking']
  try {
    const vendorId = req.vendor._id;
    const bookings = await Booking.find({ vendor: vendorId });

    return successHandler(
      "Vendor bookings fetched successfully",
      bookings,
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: Create booking
export const createBooking = async (req, res) => {
  // #swagger.tags = ['bookings']
  try {
    const { user, body } = req;
    const { packageId, eventDate, notes } = body;

    if (!packageId || !eventDate) {
      return errorHandler("Package and event date are required", 400, req, res);
    }

    const parsedDate = new Date(eventDate);

    if (isNaN(parsedDate.getTime())) {
      return errorHandler("Invalid event date", 400, req, res);
    }

    if (parsedDate < new Date()) {
      return errorHandler("Event date must be in the future", 400, req, res);
    }

    // ? Find package
    const pkg = await VendorPackage.findById(packageId).populate("vendor");
    if (!pkg) {
      return errorHandler("Package not found", 404, req, res);
    }

    // ? Create booking
    const booking = await Booking.create({
      user: user._id,
      vendor: pkg.vendor._id,
      package: pkg._id,
      eventDate: parsedDate,
      amount: pkg.price,
      notes: notes?.trim(),
    });

    return successHandler(
      "Booking created successfully",
      { booking },
      201,
      res,
    );
  } catch (error) {
    // Handle duplicate booking error from unique index
    if (error.code === 11000) {
      return errorHandler(
        "Vendor is already booked for this date",
        400,
        req,
        res,
      );
    }

    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: Vendor updates booking
export const updateBookingByVendor = async (req, res) => {
  // #swagger.tags = ['bookings']
  try {
    const { user, params, body } = req;
    const { bookingId } = params;
    const { status, eventDate, notes } = body;

    // ? Find vendor
    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor not found", 404, req, res);
    }

    // ? Find booking that belongs to vendor
    const booking = await Booking.findOne({
      _id: bookingId,
      vendor: vendor._id,
    });

    if (!booking) {
      return errorHandler("Booking not found", 404, req, res);
    }

    // ? Allowed status transitions
    const allowedStatuses = ["confirmed", "completed", "cancelled"];

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return errorHandler("Invalid status update", 400, req, res);
      }

      booking.status = status;
    }

    // ? Optional event date update
    if (eventDate !== undefined) {
      const parsedDate = new Date(eventDate);

      if (isNaN(parsedDate.getTime())) {
        return errorHandler("Invalid event date", 400, req, res);
      }

      if (parsedDate < new Date()) {
        return errorHandler("Event date must be in the future", 400, req, res);
      }

      booking.eventDate = parsedDate;
    }

    // ? Optional notes update
    if (notes !== undefined) {
      booking.notes = notes.trim();
    }

    await booking.save();

    return successHandler(
      "Booking updated successfully",
      { booking },
      200,
      res,
    );
  } catch (error) {
    // Handle unique index conflict (date collision)
    if (error.code === 11000) {
      return errorHandler(
        "Vendor is already booked for this date",
        400,
        req,
        res,
      );
    }

    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: cancel booking
// export const cancelBooking = async (req, res) => {
//   // #swagger.tags = ['booking']
//   try {
//     const { bookingId } = req.params;
//     const booking = await Booking.findByIdAndUpdate(
//       bookingId,
//       { isCancelled: true },
//       {
//         new: true,
//         runValidators: true,
//       },
//     );
//     return successHandler(
//       "Booking details updated successfully",
//       booking,
//       200,
//       res,
//     );
//   } catch (error) {
//     return errorHandler(error.message, 500, req, res);
//   }
// };
