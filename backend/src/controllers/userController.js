import User from "../models/User/User.js";
import { errorHandler } from "../utils/errorHandler.js";
import { successHandler } from "../utils/successHandler.js";

// INFO: get user details
export const getUserDetails = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const user = await User.findById(req.user.id).select("-password");
    return successHandler("User details fetched successfully", user, 200, res);
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: update user details
export const updateUserDetails = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const updatedData = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updatedData, {
      new: true,
      runValidators: true,
    }).select("-password");
    return successHandler("User details updated successfully", user, 200, res);
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
