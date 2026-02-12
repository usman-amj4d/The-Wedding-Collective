import mongoose from "mongoose";
import { Schema } from "mongoose";
import dotenv from "dotenv";
import PackageSchema from "../schemas/package.schema.js";

dotenv.config({ path: ".././src/config/config.env" });

const vendorSchema = new Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    vendorType: {
      type: String,
      enum: ["individual", "company"],
      default: "individual",
    },
    description: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    coverageTime: { type: String, required: true },
    coverageAreas: { type: [String], required: true },
    basedIn: { type: String, required: true },
    deliveryTime: { type: String, required: true },
    servicesOffered: { type: [String], required: true },
    teamSize: { type: Number, required: true },
    yearsOfExperience: { type: Number, required: true },
    categories: { type: [String], required: true },
    website: { type: String, default: "" },
    socialMediaLinks: { type: [String], default: [] },
    bio: { type: String, default: "" },
    logo: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    totalReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    packages: {
      type: [PackageSchema],
      default: [],
    },
    photos: { type: [String], default: [] },
    videos: { type: [String], default: [] },
  },
  { timestamps: true },
);

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
