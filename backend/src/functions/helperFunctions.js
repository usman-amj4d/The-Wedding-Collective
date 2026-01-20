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
export const uploadImageOnCloudinary = async (file, folder) => {
  const dataUri = getDataURI(file);
  const filenameWithoutExtension = path
    .parse(file.originalname)
    .name.replace(" ", "-");
  const uniqueFilename = `${Date.now()}-${filenameWithoutExtension}`;

  const uploadedImage = await cloudinary.uploader.upload(dataUri.content, {
    folder: `the_wedding_collective/${folder}`,
    resource_type: "image",
    public_id: uniqueFilename,
  });

  return uploadedImage;
};

export const deleteImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;

  // Split at `/upload/`
  const parts = imageUrl.split("/upload/");

  if (parts.length !== 2) {
    throw new Error("Invalid Cloudinary URL");
  }

  // Remove version (v1234567890/)
  const pathWithVersion = parts[1];
  const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, "");

  // Remove file extension
  const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    type: "upload",
  });
};
