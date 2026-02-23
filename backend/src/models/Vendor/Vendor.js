import mongoose from "mongoose";
import { Schema } from "mongoose";
import { VENDOR_MEDIA_LIMITS } from "../../functions/helperFunctions.js";

const vendorSchema = new Schema(
  {
    user: {
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
    categories: { type: [String], required: true, index: true },
    website: { type: String, default: "" },
    socialMediaLinks: { type: [String], default: [] },
    bio: { type: String, default: "" },
    logo: { type: String, required: true },
    coverPhoto: { type: String, default: "" },
    totalReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    photos: {
      type: [String],
      default: [],
      validate: [photosLimit, "{PATH} exceeds limit"],
    },
    videos: {
      type: [String],
      default: [],
      validate: [videosLimit, "{PATH} exceeds limit"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

vendorSchema.index({ categories: 1, basedIn: 1 });

function photosLimit(val) {
  return val.length <= VENDOR_MEDIA_LIMITS.photos;
}

function videosLimit(val) {
  return val.length <= VENDOR_MEDIA_LIMITS.videos;
}

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
