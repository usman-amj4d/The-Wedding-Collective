const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "VendorPackage",
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "GBP",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded"],
      default: "unpaid",
      index: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

bookingSchema.pre("save", function (next) {
  if (!this.bookingId) {
    this.bookingId = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

bookingSchema.index(
  { vendor: 1, eventDate: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "confirmed"] } },
  },
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ vendor: 1, status: 1 });
// future indexes for analytics
// bookingSchema.index({ eventDate: 1, status: 1 });
// bookingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
