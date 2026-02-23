import mongoose from "mongoose";
import { PACKAGES_MEDIA_LIMITS } from "../../functions/helperFunctions.js";

const vendorPackageSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    addOns: {
      type: [
        {
          name: String,
          price: Number,
        },
      ],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: true,
    },
    coverPhoto: {
      type: String,
      required: true,
    },
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
    weddingTypes: {
      type: [String],
      enum: ["south-asian", "asian", "arab", "english", "turkish"],
      default: [],
    },
  },
  { timestamps: true },
);

// ? Indexes
vendorPackageSchema.index({ category: 1 });
vendorPackageSchema.index({ weddingTypes: 1 });
vendorPackageSchema.index({ vendor: 1, packageName: 1 }, { unique: true });

function photosLimit(val) {
  return val.length <= PACKAGES_MEDIA_LIMITS.photos;
}

function videosLimit(val) {
  return val.length <= PACKAGES_MEDIA_LIMITS.videos;
}

const VendorPackage = mongoose.model("VendorPackage", vendorPackageSchema);

export default VendorPackage;
