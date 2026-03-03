import mongoose from "mongoose";
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      index: true,
    },
    // ? What booking this belongs to
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    // ? Type of transaction
    type: {
      type: String,
      enum: [
        "payment", // customer payment
        "refund", // refund to customer
        "platform_fee", // 2.5%
        "vendor_payout", // transfer to vendor
        "adjustment", // manual corrections
      ],
      required: true,
      index: true,
    },
    // ? Amount (always store positive value)
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "GBP",
    },
    // ? Who initiated it
    initiatedBy: {
      type: String,
      enum: ["user", "vendor", "platform", "system"],
      required: true,
    },
    // ? Who receives the money (if applicable)
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
    },
    // ? External payment processor reference
    provider: {
      type: String,
      enum: ["stripe", "paypal", "manual"],
    },
    providerReference: {
      type: String, // paymentIntentId, refundId, transferId etc.
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "authorized", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed, // ? raw Stripe response, etc.
    },
  },
  { timestamps: true },
);

// ? Auto-generate transactionId
transactionSchema.pre("save", function (next) {
  if (!this.transactionId) {
    this.transactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// ? Indexes
transactionSchema.index({ booking: 1, type: 1 });
transactionSchema.index({ vendor: 1, type: 1 });
transactionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Transaction", transactionSchema);
