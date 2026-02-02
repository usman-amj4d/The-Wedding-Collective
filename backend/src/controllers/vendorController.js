import Vendor from "../models/Vendor/Vendor.js";
import { errorHandler } from "../utils/errorHandler.js";
import { successHandler } from "../utils/successHandler.js";
import {
  uploadImageOnCloudinary,
  deleteImageFromCloudinary,
} from "../functions/helperFunctions.js";

// INFO: get vendor details
export const getVendorDetails = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const { user } = req;

    const vendor = await Vendor.findOne({ vendorId: user._id });

    const responseData = {
      ...user._doc,
      vendorDetails: vendor ? vendor._doc : null,
    };

    return successHandler(
      "Vendor details fetched successfully",
      responseData,
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: add vendor details
export const addVendorDetails = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const { body, user } = req;

    const existingVendor = await Vendor.findOne({ vendorId: user._id });
    if (existingVendor) {
      return errorHandler("Vendor details already exist", 409, req, res);
    }

    const {
      vendorType,
      description,
      phone,
      address,
      coverageTime,
      coverageAreas,
      basedIn,
      deliveryTime,
      servicesOffered,
      teamSize,
      yearsOfExperience,
      categories,
      website,
      socialMediaLinks,
      bio,
    } = body;

    const vendorId = user._id;

    const vendor = await Vendor.create({
      vendorId,
      vendorType,
      description,
      phone,
      address,
      coverageTime,
      coverageAreas,
      basedIn,
      deliveryTime,
      servicesOffered,
      teamSize,
      yearsOfExperience,
      categories,
      website,
      socialMediaLinks,
      bio,
    });

    return successHandler(
      "Vendor details created successfully",
      { ...user._doc, vendorDetails: vendor },
      201,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: update vendor details
export const updateVendorDetails = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const { body, user } = req;

    // Check vendor exists
    const vendor = await Vendor.findOne({ vendorId: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
    }

    // Fields allowed to update
    const allowedFields = [
      "vendorType",
      "description",
      "phone",
      "address",
      "coverageTime",
      "coverageAreas",
      "basedIn",
      "deliveryTime",
      "servicesOffered",
      "teamSize",
      "yearsOfExperience",
      "categories",
      "website",
      "socialMediaLinks",
      "bio",
      "logo",
      "coverPhoto",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return errorHandler("No fields provided for update", 400, req, res);
    }

    const updatedVendor = await Vendor.findOneAndUpdate(
      { vendorId: user._id },
      { $set: updates },
      { new: true, runValidators: true },
    );

    return successHandler(
      "Vendor details updated successfully",
      { ...user._doc, vendorDetails: updatedVendor },
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: update vendor logo or cover photo
export const updateLogoOrCoverPhoto = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const { user, params } = req;
    const { photoType } = params; // 'logo' | 'coverPhoto'
    const file = req.file;

    if (!["logo", "coverPhoto"].includes(photoType)) {
      return errorHandler("Invalid photo type", 400, req, res);
    }

    if (!file) {
      return errorHandler(`${photoType} image is required`, 400, req, res);
    }

    // Always fetch vendor from DB
    const vendor = await Vendor.findOne({ vendorId: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
    }

    // Delete existing image if present
    if (vendor[photoType]) {
      await deleteImageFromCloudinary(vendor[photoType]);
    }

    // Upload new image
    const uploadedFile = await uploadImageOnCloudinary(
      file,
      `vendors/${photoType}`,
    );

    vendor[photoType] = uploadedFile.secure_url;
    await vendor.save();

    return successHandler(
      `${photoType} updated successfully`,
      vendor,
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: upload vendor photos or videos
export const uploadVendorMedia = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const { user, params } = req;
    const { type } = params; // photo | video
    const files = req.files || [];

    if (!["photo", "video"].includes(type)) {
      return errorHandler("Invalid upload type", 400, req, res);
    }

    if (!files.length) {
      return errorHandler("No files provided", 400, req, res);
    }

    const vendor = await Vendor.findOne({ vendorId: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
    }

    // Upload to Cloudinary
    const uploadedUrls = await Promise.all(
      files.map((file) =>
        uploadImageOnCloudinary(file, `vendors/${type}s`).then(
          (res) => res.secure_url,
        ),
      ),
    );

    if (type === "photo") {
      vendor.photos.push(...uploadedUrls);
    } else {
      vendor.videos.push(...uploadedUrls);
    }

    await vendor.save();

    return successHandler(`${type}s uploaded successfully`, vendor, 200, res);
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
