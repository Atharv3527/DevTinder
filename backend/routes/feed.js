import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { ConnectionRequest } from "../models/ConnectionRequest.js";
import { User } from "../models/User.js";

const feedRouter = express.Router();

feedRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // Find all connection requests (sent OR received)
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select("firstName lastName photoUrl headline about skills")
      .skip(skip)
      .limit(limit);

    // If no real users yet, return some hardcoded premium mock users for the UI preview
    if (users.length === 0) {
      return res.json({
        data: [
          {
            _id: "60d5ecb8b392d700153ef111",
            firstName: "Alex",
            lastName: "Jenkins",
            headline: "Frontend Engineer | React",
            about: "Obsessed with animations and React. Let's build something beautiful together. I specialize in highly interactive WebGL experiences.",
            photoUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
          },
          {
            _id: "60d5ecb8b392d700153ef222",
            firstName: "Sarah",
            lastName: "Chen",
            headline: "Full Stack Developer | Typescript",
            about: "Building highly scalable microservices. Currently exploring serverless architectures and distributed systems.",
            photoUrl: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
          },
             {
            _id: "60d5ecb8b392d700153ef333",
            firstName: "Marcus",
            lastName: "Rodriguez",
            headline: "UI/UX Designer | Figma",
            about: "Designing intuitive interfaces that engineers love to build. Clean typography and whitespace are my best friends.",
            photoUrl: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
          },
        ]
      });
    }

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export { feedRouter };
