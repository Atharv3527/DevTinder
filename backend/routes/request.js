import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { ConnectionRequest } from "../models/ConnectionRequest.js";
import { User } from "../models/User.js";

const requestRouter = express.Router();

requestRouter.post("/request/send/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;

    // Optional: check if user exists in actual db
    // const toUser = await User.findById(toUserId);

    // Creates the connection record
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status: "interested", // or 'accepted' based on devtinder logic
    });

    // In a full implementation, save to DB:
    // await connectionRequest.save();

    res.json({
      message: "Connection Request Sent Successfully!",
      data: connectionRequest,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

requestRouter.post("/request/reject/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status: "ignored", 
    });

    // await connectionRequest.save();

    res.json({
      message: "Connection Request Ignored",
      data: connectionRequest,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

export { requestRouter };
