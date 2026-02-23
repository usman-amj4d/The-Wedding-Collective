import Vendor from "../models/Vendor/Vendor.js";
import { errorHandler } from "../utils/errorHandler.js";
import { successHandler } from "../utils/successHandler.js";
import {
  uploadMediaOnCloudinary,
  deleteMediaFromCloudinary,
  deleteMultipleMediaFromCloudinary,
  VENDOR_MEDIA_LIMITS,
  PACKAGES_MEDIA_LIMITS,
} from "../functions/helperFunctions.js";
import VendorPackage from "../models/Vendor/VendorPackage.js";

// ? Vendor details APIS
// INFO: get vendor details
export const getVendorDetails = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const { user } = req;

    const vendor = await Vendor.findOne({ user: user._id });

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
    const { body, user, file } = req;

    // ? Check if vendor details already exist for this user
    const existingVendor = await Vendor.findOne({ user: user._id });
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

    // ? Logo is required for creating vendor details, so if file is not present return error
    if (!file) {
      return errorHandler("Logo image is required", 400, req, res);
    }

    // ? Upload logo to Cloudinary
    const uploadedLogo = await uploadMediaOnCloudinary(
      file,
      `vendors/${user._id}/logo`,
      "image",
    );

    // ? Create vendor document
    const vendor = await Vendor.create({
      user: user._id,
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
      logo: uploadedLogo.secure_url,
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
    const vendor = await Vendor.findOne({ user: user._id });
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
      { user: user._id },
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

// ? vendor media (logo/cover photo, photos/videos) APIS
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

    // ? Fetch vendor
    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
    }

    // ? Delete existing image if present
    if (vendor[photoType]) {
      await deleteMediaFromCloudinary(vendor[photoType]);
    }

    // ? Upload new image
    const uploadedFile = await uploadMediaOnCloudinary(
      file,
      `vendors/${user._id}/${photoType}`,
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

    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
    }

    const existingCount =
      type === "photos" ? vendor.photos.length : vendor.videos.length;

    const incomingCount = files.length;

    const remaining = VENDOR_MEDIA_LIMITS[type] - existingCount;

    if (existingCount + incomingCount > VENDOR_MEDIA_LIMITS[type]) {
      return errorHandler(
        `You can upload a maximum of ${VENDOR_MEDIA_LIMITS[type]} ${type}. ` +
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
          `vendors/${user._id}/${type}`,
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

    const vendor = await Vendor.findOne({ user: user._id });
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
      { [mediaField]: vendor[mediaField] },
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// ? Packages APIS
// INFO: get vendor packages
export const getVendorPackages = async (req, res) => {
  // #swagger.tags = ['vendor', 'packages']
  try {
    const { user } = req;

    const vendor = await Vendor.findOne({ vendor: user._id });

    if (!vendor) {
      return errorHandler("Vendor not found", 404, req, res);
    }

    const VendorPackage = await VendorPackage.findOne({ vendor: vendor._id });

    if (!VendorPackage) {
      return errorHandler("Vendor packages not found", 404, req, res);
    }

    return successHandler(
      "Vendor packages fetched successfully",
      { packages: VendorPackage },
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: Add vendor package
export const addVendorPackage = async (req, res) => {
  // #swagger.tags = ['vendor', 'packages']
  try {
    const { user, body } = req;
    const { packageName, description, price, features, category, addOns } =
      body;
    const file = req.file;

    if (
      !packageName ||
      !description ||
      price === undefined ||
      !features ||
      !file
    ) {
      return errorHandler(
        "Please provide package name, description, price, features, and cover photo",
        400,
        req,
        res,
      );
    }

    // ? Find vendor
    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
    }

    const existingPackage = await VendorPackage.findOne({
      vendor: vendor._id,
      packageName,
    });

    if (existingPackage) {
      return errorHandler("Package name already exists", 400, req, res);
    }

    // ? Upload cover image
    const uploadedFile = await uploadMediaOnCloudinary(
      file,
      `vendors/${user._id}/packages`,
      "image",
    );

    // ? Create package document
    const newPackage = await VendorPackage.create({
      vendor: vendor._id,
      packageName: packageName.trim(),
      description: description.trim(),
      price,
      category,
      addOns: addOns || [],
      features,
      coverPhoto: uploadedFile.secure_url,
    });

    return successHandler(
      "Package added successfully",
      { package: newPackage },
      201,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: upload package media (photos/videos)
export const uploadVendorPackageMedia = async (req, res) => {
  // #swagger.tags = ['vendor', 'packages']
  try {
    const { user, params, files } = req;
    const { packageId, type } = params;

    if (!["photos", "videos"].includes(type)) {
      return errorHandler("Invalid upload type", 400, req, res);
    }

    if (!files || !files.length) {
      return errorHandler("No files provided", 400, req, res);
    }

    // ? Find vendor
    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor not found", 404, req, res);
    }

    // ? Find package (must belong to this vendor)
    const vendorPackage = await VendorPackage.findOne({
      _id: packageId,
      vendor: vendor._id,
    });

    if (!vendorPackage) {
      return errorHandler("Package not found", 404, req, res);
    }

    // ? Calculate existing count, incoming count, and remaining slots
    const existingCount = vendorPackage[type].length;
    const incomingCount = files.length;
    const remaining = PACKAGES_MEDIA_LIMITS[type] - existingCount;

    if (incomingCount > remaining) {
      return errorHandler(
        `You can upload a maximum of ${PACKAGES_MEDIA_LIMITS[type]} ${type}. You already have ${existingCount}. You can upload only ${remaining} more.`,
        400,
        req,
        res,
      );
    }

    // ? Upload to Cloudinary
    const uploadedUrls = await Promise.all(
      files.map((file) =>
        uploadMediaOnCloudinary(
          file,
          `vendors/${vendor._id}/packages/${packageId}/${type}`,
          type === "photos" ? "image" : "video",
        ).then((result) => result.secure_url),
      ),
    );

    // ? Append and save updated package document
    vendorPackage[type] = [...vendorPackage[type], ...uploadedUrls];
    await vendorPackage.save();

    return successHandler(
      `${type} uploaded successfully`,
      { [type]: vendorPackage[type] },
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: Update package
export const updateVendorPackage = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const { user, params, body } = req;
    const { packageId } = params;
    const { packageName, description, price, features } = body;
    const file = req.file;

    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
    }

    const pkg = vendor.packages.id(packageId);
    if (!pkg) {
      return errorHandler("Package not found", 404, req, res);
    }

    if (packageName !== undefined) pkg.packageName = packageName;
    if (description !== undefined) pkg.description = description;
    if (price !== undefined) pkg.price = price;
    if (features !== undefined) pkg.features = features;

    // Update cover photo if a new file is uploaded
    if (file) {
      // Delete old cover photo from Cloudinary
      await deleteMediaFromCloudinary(pkg.coverPhoto);

      // Upload new cover photo
      const uploadedFile = await uploadMediaOnCloudinary(
        file,
        `vendors/${user._id}/packages/${packageName}`,
      );
      pkg.coverPhoto = uploadedFile.secure_url;
    }

    await vendor.save();

    return successHandler(
      "Package updated successfully",
      { packages: vendor.packages },
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: Delete package
export const deleteVendorPackage = async (req, res) => {
  // #swagger.tags = ['vendor']
  try {
    const { user, params } = req;
    const { packageId } = params;

    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
    }
    const pkg = vendor.packages.id(packageId);
    if (!pkg) {
      return errorHandler("Package not found", 404, req, res);
    }

    // Delete cover photo from Cloudinary
    await deleteMediaFromCloudinary(pkg.coverPhoto);
    pkg.remove();
    await vendor.save();

    return successHandler(
      "Package deleted successfully",
      { packages: vendor.packages },
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
