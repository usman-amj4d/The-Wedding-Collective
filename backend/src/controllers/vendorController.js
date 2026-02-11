import Vendor from "../models/Vendor/Vendor.js";
import { errorHandler } from "../utils/errorHandler.js";
import { successHandler } from "../utils/successHandler.js";
import {
  uploadMediaOnCloudinary,
  deleteMediaFromCloudinary,
  deleteMultipleMediaFromCloudinary,
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
      await deleteMediaFromCloudinary(vendor[photoType]);
    }

    // Upload new image
    const uploadedFile = await uploadMediaOnCloudinary(
      file,
      `vendors/${photoType}`,
    );

    vendor[photoType] = uploadedFile.secure_url;
    await vendor.save();

    return successHandler(
      `${photoType} updated successfully`,
      { [photoType]: vendor[photoType] },
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
    const { type } = params; // photos | videos
    const files = req.files || [];

    if (!["photos", "videos"].includes(type)) {
      return errorHandler("Invalid upload type", 400, req, res);
    }

    if (!files.length) {
      return errorHandler("No files provided", 400, req, res);
    }

    const vendor = await Vendor.findOne({ vendorId: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
    }

    // 💡 Media limits
    const LIMITS = {
      photos: 20,
      videos: 5,
    };

    const existingCount =
      type === "photos" ? vendor.photos.length : vendor.videos.length;

    const incomingCount = files.length;

    const remaining = LIMITS[type] - existingCount;

    if (existingCount + incomingCount > LIMITS[type]) {
      return errorHandler(
        `You can upload a maximum of ${LIMITS[type]} ${type}. ` +
          `You already have ${existingCount}. You can upload only ${remaining} more ${type}.`,
        400,
        req,
        res,
      );
    }

    // Upload to Cloudinary
    const uploadedUrls = await Promise.all(
      files.map((file) =>
        uploadMediaOnCloudinary(
          file,
          `vendors/${type}`,
          type === "photos" ? "image" : "video",
        ).then((res) => res.secure_url),
      ),
    );

    if (type === "photos") {
      vendor.photos = [...new Set([...vendor.photos, ...uploadedUrls])];
    } else {
      vendor.videos = [...new Set([...vendor.videos, ...uploadedUrls])];
    }

    await vendor.save();

    return successHandler(
      `${type} uploaded successfully`,
      { [type]: vendor[type] },
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: delete vendor photos or videos
export const deleteVendorMedia = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const { user, params, body } = req;
    const { type } = params; // photos | videos
    const { urls } = body;

    // Validate type
    if (!["photos", "videos"].includes(type)) {
      return errorHandler("Invalid media type", 400, req, res);
    }

    // Validate urls
    if (!Array.isArray(urls) || urls.length === 0) {
      return errorHandler("Please provide media URLs to delete", 400, req, res);
    }

    const vendor = await Vendor.findOne({ vendorId: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
    }

    const mediaField = type === "photos" ? "photos" : "videos";
    const existingMedia = vendor[mediaField];

    // Check if provided URLs exist
    const notFound = urls.filter((url) => !existingMedia.includes(url));
    if (notFound.length) {
      return errorHandler(
        `Some ${type} do not exist or do not belong to this vendor`,
        400,
        req,
        res,
      );
    }

    await deleteMultipleMediaFromCloudinary(
      urls,
      type === "photos" ? "image" : "video",
    );

    // Remove from DB
    vendor[mediaField] = existingMedia.filter((url) => !urls.includes(url));

    await vendor.save();

    return successHandler(
      `${urls.length} ${type}${urls.length > 1 ? "s" : ""} deleted successfully`,
      vendor,
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
