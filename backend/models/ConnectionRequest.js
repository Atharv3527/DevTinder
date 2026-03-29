import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: "{VALUE} is incorrect status type",
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize querying speed
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

export const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);
