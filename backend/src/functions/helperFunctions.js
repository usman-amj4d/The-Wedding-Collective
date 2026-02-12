import path from "path";
import cloudinary from "../config/cloudinary.js";
import shortId from "short-unique-id";
import { getDataURI } from "../utils/dataUri.js";
import { successHandler } from "../utils/successHandler.js";

// ? generate referral code
export const uniqueCode = async (length) => {
  try {
    const { randomUUID } = new shortId({ length: length });

    const code = randomUUID();

    return code;
  } catch (error) {
    console.error(error.message);
  }
};

// ? generate referral code
export const generateReferralCodes = async (req, res) => {
  // #swagger.tags = ['development']
  try {
    const { length } = req.query;

    const { randomUUID } = new shortId({ length: length });

    const code = randomUUID();

    return successHandler({ referralCode: code }, 200, res);
  } catch (error) {
    console.log(error);
  }
};

// ? upload image function
export const uploadMediaOnCloudinary = async (
  file,
  folder,
  fileType = "image",
) => {
  const dataUri = getDataURI(file);

  const slugify = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .replace(/-+/g, "-");

  const filenameWithoutExtension = slugify(path.parse(file.originalname).name);

  const uniqueFilename = `${Date.now()}-${filenameWithoutExtension}`;

  const uploadedImage = await cloudinary.uploader.upload(dataUri.content, {
    folder: `the_wedding_collective/${folder}`,
    resource_type: fileType,
    public_id: uniqueFilename,
  });

  return uploadedImage;
};

// utils/cloudinary/deleteMedia.js
export const deleteMediaFromCloudinary = async (
  mediaUrl,
  resourceType = "image",
) => {
  if (!mediaUrl) return;

  const parts = mediaUrl.split("/upload/");
  if (parts.length !== 2) {
    throw new Error("Invalid Cloudinary URL");
  }

  const pathWithVersion = parts[1];

  // Remove version (v1234567890/)
  const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, "");

  // Remove extension
  const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType, // image | video
    type: "upload",
  });
};

// utils/cloudinary/deleteMultipleMedia.js
export const deleteMultipleMediaFromCloudinary = async (
  mediaUrls = [],
  resourceType = "image",
) => {
  if (!Array.isArray(mediaUrls) || !mediaUrls.length) return;

  const publicIds = mediaUrls
    .map((url) => {
      const parts = url.split("/upload/");
      if (parts.length !== 2) return null;

      const pathWithoutVersion = parts[1].replace(/^v\d+\//, "");
      return pathWithoutVersion.replace(/\.[^/.]+$/, "");
    })
    .filter(Boolean);

  if (!publicIds.length) return;

  await cloudinary.api.delete_resources(publicIds, {
    resource_type: resourceType, // image | video
    type: "upload",
  });
};
