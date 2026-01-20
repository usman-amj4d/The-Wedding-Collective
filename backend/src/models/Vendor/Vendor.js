import mongoose from "mongoose";
import { Schema } from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".././src/config/config.env" });

const vendorSchema = new Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true },
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
    category: { type: [String], required: true }, // e.g., photographer, caterer
    website: { type: String },
    socialMediaLinks: { type: [String] },
    bio: { type: String },
    logo: { type: String },
    coverPhoto: { type: String },
    totalReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    packages: [
      {
        packageId: { type: mongoose.Schema.Types.ObjectId, auto: true },
        packageName: { type: String, required: true },
        price: { type: Number, required: true },
        features: { type: [String], required: true },
        description: { type: String },
        coverPhoto: { type: String, default: "" },
      },
    ],
    photos: { type: [String], default: [] },
    videos: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
