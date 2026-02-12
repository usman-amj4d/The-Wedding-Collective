import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
  packageName: {
    type: String,
    required: true,
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
    required: true,
  },
  coverPhoto: {
    type: String,
    required: true,
  },
});

export default PackageSchema;
