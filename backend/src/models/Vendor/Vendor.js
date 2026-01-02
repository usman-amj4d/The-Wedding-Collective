import mongoose from "mongoose";
import { Schema } from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".././src/config/config.env" });

const vendorSchema = new Schema(
  {
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    company_name: { type: String, required: true },
    description: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    coverage_time: { type: String, required: true },
    coverage_areas: { type: [String], required: true },
    based_in: { type: String, required: true },
    delivery_time: { type: String, required: true },
    services_offered: { type: [String], required: true },
    team_size: { type: Number, required: true },
    years_of_experience: { type: Number, required: true },
    category: { type: [String], required: true }, // e.g., photographer, caterer
    website: { type: String },
    social_media_links: { type: [String] },
    bio: { type: String },
    logo: { type: String },
    cover_photo: { type: String },
    total_reviews: { type: Number, default: 0 },
    average_rating: { type: Number, default: 0 },
    packages: [
      {
        package_name: { type: String, required: true },
        price: { type: Number, required: true },
        features: { type: [String], required: true },
        description: { type: String },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
