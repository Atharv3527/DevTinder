import "dotenv/config";
import express from "express";
import cors from "cors";
import { supabase } from "./config/supabase.js";

// Initialize Firebase Admin (must happen before any route imports)
import "./config/firebaseAdmin.js";

const app = express();
const PORT = process.env.PORT || 5000;

/** Allow local dev + configured prod URL + any Vercel deployment (*.vercel.app). */
function isAllowedCorsOrigin(origin) {
  if (!origin) return true;
  if (origin === "http://localhost:5173") return true;
  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;
  if (/^https:\/\/[a-z0-9.-]+\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9.-]+\.web\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9.-]+\.firebaseapp\.com$/i.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedCorsOrigin(origin));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import { feedRouter } from "./routes/feed.js";
import { requestRouter, connectionsRouter } from "./routes/request.js";
import { jobsRouter } from "./routes/jobs.js";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { chatRouter } from "./routes/chat.js";
import { notificationsRouter } from "./routes/notifications.js";

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/feed", feedRouter);
app.use("/api/request", requestRouter);
app.use("/api/connections", connectionsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/notifications", notificationsRouter);

app.get("/", (req, res) => {
  res.json({ message: "DevTinder API is running 🔥", version: "2.0" });
});

// Quick check: DB reachable + which Supabase project URL is configured (ref only).
app.get("/api/health", async (_req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || null;

  try {
    const { error } = await supabase.from("developers").select("firebase_uid").limit(1);
    if (error) throw error;
    res.json({
      ok: true,
      supabaseProjectRef: projectRef,
      message: "Supabase connection OK (developers table readable)",
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      supabaseProjectRef: projectRef,
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
