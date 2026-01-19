import path from "path";
import { cloudinary } from "../config/cloudinary.js";
import shortId from "shortid";
import { getDataURI } from "./dataUri.js";
import { successHandler } from "./responseHandler.js";

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
    folder: `my_wedding_collective/${folder}`,
    resource_type: "image",
    public_id: uniqueFilename,
  });

  return uploadedImage;
};

// ? delete the image from cloudinary
export const deleteImageFromCloudinary = async (imageUrl) => {
  const urlParts = imageUrl.split("/");
  const uploadIndex = urlParts.indexOf("upload");
  const path = urlParts.slice(uploadIndex + 2).join("/");
  const publicId = path.replace(/\.\w+$/, "");

  await cloudinary.api.delete_resources([publicId], {
    type: "upload",
    resource_type: "image",
  });
};
