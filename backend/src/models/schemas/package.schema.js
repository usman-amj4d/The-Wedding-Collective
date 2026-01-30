import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
  packageName: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  features: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  coverPhoto: {
    type: String,
    default: "",
  },
});

export default PackageSchema;
