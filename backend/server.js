import "dotenv/config";
import express from "express";
import cors from "cors";

// Initialize Firebase Admin (must happen before any route imports)
import "./config/firebaseAdmin.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import { feedRouter } from "./routes/feed.js";
import { requestRouter, connectionsRouter } from "./routes/request.js";
import { jobsRouter } from "./routes/jobs.js";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { chatRouter } from "./routes/chat.js";

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/feed", feedRouter);
app.use("/api/request", requestRouter);
app.use("/api/connections", connectionsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/jobs", jobsRouter);

app.get("/", (req, res) => {
  res.json({ message: "DevTinder API is running 🔥", version: "2.0" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
