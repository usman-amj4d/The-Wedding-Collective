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
import {
  addAddOnSchema,
  addVendorPackageSchema,
  updateAddOnSchema,
} from "../validators/vendorPackageValidator.js";

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
    const { user, body, file } = req;

    // ? Validating body
    const validation = addVendorPackageSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message);
      return errorHandler(errors.join(", "), 400, req, res);
    }

    const { packageName, description, price, features, category, addOns } =
      body;

    // ? Validate cover photo
    if (!file) {
      return errorHandler("Cover photo is required", 400, req, res);
    }

    // ? Restrict duplicate package names for the same vendor
    const existingPackage = await VendorPackage.findOne({
      vendor: vendor._id,
      packageName: packageName.trim(),
    });

    if (existingPackage) {
      return errorHandler("Package name already exists", 400, req, res);
    }

    // ? Find vendor
    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
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
      features,
      addOns: addOns || [],
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

// INFO: Update vendor package
export const updateVendorPackage = async (req, res) => {
  // #swagger.tags = ['vendor', 'packages']
  try {
    const { user, params, body } = req;
    const { packageId } = params;
    const { packageName, description, price, features, category, addOns } =
      body;
    const file = req.file;

    // ? Find vendor
    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor details not found", 404, req, res);
    }

    // ? Find package
    const pkg = await VendorPackage.findOne({
      _id: packageId,
      vendor: vendor._id,
    });

    if (!pkg) {
      return errorHandler("Package not found", 404, req, res);
    }

    // ? Prevent duplicate package name (if updating name)
    if (packageName && packageName.trim() !== pkg.packageName) {
      const existingPackage = await VendorPackage.findOne({
        vendor: vendor._id,
        packageName: packageName.trim(),
      });

      if (existingPackage) {
        return errorHandler("Package name already exists", 400, req, res);
      }

      pkg.packageName = packageName.trim();
    }

    if (description !== undefined) pkg.description = description.trim();
    if (price !== undefined) pkg.price = price;
    if (features !== undefined) pkg.features = features;
    if (category !== undefined) pkg.category = category;

    // ? Optional addOns (fully replace if provided)
    if (addOns !== undefined) {
      pkg.addOns = addOns;
    }

    // ? Update cover photo if new file uploaded
    if (file) {
      if (pkg.coverPhoto) {
        await deleteMediaFromCloudinary(pkg.coverPhoto);
      }

      const uploadedFile = await uploadMediaOnCloudinary(
        file,
        `vendors/${user._id}/packages`,
        "image",
      );

      pkg.coverPhoto = uploadedFile.secure_url;
    }

    await pkg.save();

    return successHandler(
      "Package updated successfully",
      { package: pkg },
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

    // ? Find vendor
    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor not found", 404, req, res);
    }

    // ? Find package (must belong to this vendor)
    const pkg = await VendorPackage.findOne({
      _id: packageId,
      vendor: vendor._id,
    });

    if (!pkg) {
      return errorHandler("Package not found", 404, req, res);
    }

    // ? Delete cover photo
    if (pkg.coverPhoto) {
      await deleteMediaFromCloudinary(pkg.coverPhoto);
    }

    // ? Delete other media (if exists)
    const allMedia = [...(pkg.photos || []), ...(pkg.videos || [])];

    if (allMedia.length > 0) {
      await deleteMultipleMediaFromCloudinary(allMedia);
    }

    // ? Delete document
    await VendorPackage.deleteOne({ _id: pkg._id });

    return successHandler("Package deleted successfully", null, 200, res);
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// ? Add-on APIS
// INFO: Add add-on to package
export const addAddOn = async (req, res) => {
  try {
    const { user, params, body } = req;
    const { packageId } = params;

    // ? Validate body
    const validation = addAddOnSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message);
      return errorHandler(errors.join(", "), 400, req, res);
    }

    // ? Find vendor
    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor not found", 404, req, res);
    }

    // ? Find package owned by vendor
    const pkg = await VendorPackage.findOne({
      _id: packageId,
      vendor: vendor._id,
    });

    if (!pkg) {
      return errorHandler("Package not found", 404, req, res);
    }

    // ? Push add-on
    pkg.addOns.push(validation.data);

    await pkg.save();

    return successHandler(
      "Add-on added successfully",
      { package: pkg },
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: Update add-on
export const updateAddOn = async (req, res) => {
  try {
    const { user, params, body } = req;
    const { packageId, addOnId } = params;

    // 1️⃣ Validate body
    const validation = updateAddOnSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message);
      return errorHandler(errors.join(", "), 400, req, res);
    }

    // 2️⃣ Find vendor
    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor not found", 404, req, res);
    }

    // 3️⃣ Find package
    const pkg = await VendorPackage.findOne({
      _id: packageId,
      vendor: vendor._id,
    });

    if (!pkg) {
      return errorHandler("Package not found", 404, req, res);
    }

    // 4️⃣ Find add-on
    const addOn = pkg.addOns.id(addOnId);
    if (!addOn) {
      return errorHandler("Add-on not found", 404, req, res);
    }

    // 5️⃣ Update fields
    Object.assign(addOn, validation.data);

    await pkg.save();

    return successHandler(
      "Add-on updated successfully",
      { package: pkg },
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// INFO: Delete add-on
export const deleteAddOn = async (req, res) => {
  try {
    const { user, params } = req;
    const { packageId, addOnId } = params;

    // ? Find vendor
    const vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      return errorHandler("Vendor not found", 404, req, res);
    }

    // ? Find package
    const pkg = await VendorPackage.findOne({
      _id: packageId,
      vendor: vendor._id,
    });

    if (!pkg) {
      return errorHandler("Package not found", 404, req, res);
    }

    // ? Remove add-on
    const addOn = pkg.addOns.id(addOnId);
    if (!addOn) {
      return errorHandler("Add-on not found", 404, req, res);
    }

    addOn.deleteOne();

    await pkg.save();

    return successHandler(
      "Add-on deleted successfully",
      { package: pkg },
      200,
      res,
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
