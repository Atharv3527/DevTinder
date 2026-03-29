import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// A mock dev auth middleware since actual auth might not be fully functional yet. 
// It will try to find a user or create a generic one.
export const userAuth = async (req, res, next) => {
  try {
    const { devtinder_token } = req.cookies;

    if (!devtinder_token) {
      // For development: auto-login a mock user if no token is found so the feed UI works seamlessly
      let mockUser = await User.findOne({ emailId: "dev@devtinder.com" });
      if (!mockUser) {
        mockUser = await User.create({
          firstName: "Demo",
          lastName: "User",
          emailId: "dev@devtinder.com",
          password: "password123",
          headline: "Software Engineer | testing",
          about: "Building cool stuff.",
          skills: ["React", "Node.js"]
        });
      }
      req.user = mockUser;
      return next();
    }

    const decodedObj = jwt.verify(devtinder_token, process.env.JWT_SECRET || "DEV_SECRET");
    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
};
