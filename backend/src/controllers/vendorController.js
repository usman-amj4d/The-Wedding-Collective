import Vendor from "../models/Vendor/Vendor.js";
import { errorHandler } from "../utils/errorHandler.js";
import { successHandler } from "../utils/successHandler.js";

// INFO: get vendor details
export const getVendorDetails = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const { vendorId } = req.params;
    const vendor = await Vendor.findOne({ vendorId: vendorId });
    return successHandler(
      "Vendor details fetched successfully",
      vendor,
      200,
      res
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: create vendor details
export const createVendorDetails = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const vendorData = req.body;
    const vendor = new Vendor(vendorData);
    await vendor.save();
    return successHandler(
      "Vendor details created successfully",
      vendor,
      201,
      res
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: update vendor details
export const updateVendorDetails = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const updatedData = req.body;
    const { vendorId } = req.params;
    const vendor = await Vendor.findByIdAndUpdate(vendorId, updatedData, {
      new: true,
      runValidators: true,
    });
    return successHandler(
      "Vendor details updated successfully",
      vendor,
      200,
      res
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
