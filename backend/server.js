import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import { feedRouter } from "./routes/feed.js";
import { requestRouter } from "./routes/request.js";
import { jobsRouter } from "./routes/jobs.js";

app.use("/api", feedRouter);
app.use("/api", requestRouter);
app.use("/api", jobsRouter);

// Basic route
app.get("/", (req, res) => {
  res.send("DevTinder API is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
