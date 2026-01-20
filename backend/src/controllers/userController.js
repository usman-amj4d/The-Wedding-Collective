import User from "../models/User/User.js";
import { errorHandler } from "../utils/errorHandler.js";
import { successHandler } from "../utils/successHandler.js";
import {
  uploadImageOnCloudinary,
  deleteImageFromCloudinary,
} from "../functions/helperFunctions.js";

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

// INFO: Upload user profile picture
export const updateProfilePicture = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const file = req.file ? req.file : req.body.file;

    const { user } = req;

    if (user.profilePhoto && file) {
      // ? Delete existing profile photo from Cloudinary
      await deleteImageFromCloudinary(user.profilePhoto);
    }

    if (!file)
      return errorHandler("Profile picture is required", 400, req, res);

    const uploadedFile = req.file
      ? await uploadImageOnCloudinary(req.file, "users/profile-photos")
      : null;

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          profilePhoto: uploadedFile ? uploadedFile.secure_url : file,
        },
      },
      { new: true, upsert: true }
    );

    if (!updatedUser)
      return errorHandler("Failed to update profile photo", 400, req, res);

    return successHandler(
      "Profile photo updated successfully",
      updatedUser,
      200,
      res
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
