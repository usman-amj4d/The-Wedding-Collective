import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// ? .env path
dotenv.config({ path: "./src/config/.env" });

// ? cloudinary configurations:

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
