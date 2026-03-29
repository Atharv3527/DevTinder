import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

export const feedRouter = express.Router();

feedRouter.get("/", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    // Get IDs of already-connected users (both directions)
    const { data: sent } = await supabase
      .from("connections")
      .select("receiver_id")
      .eq("sender_id", uid);

    const { data: received } = await supabase
      .from("connections")
      .select("sender_id")
      .eq("receiver_id", uid);

    const excludeIds = [
      uid,
      ...(sent || []).map((r) => r.receiver_id),
      ...(received || []).map((r) => r.sender_id),
    ];

    const { data: developers, error } = await supabase
      .from("developers")
      .select("firebase_uid, full_name, profile_image_url, bio, skills, github_url, address")
      .not("firebase_uid", "in", `(${excludeIds.join(",")})`)
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ data: developers || [], page, limit });
  } catch (err) {
    console.error("Feed error:", err);
    res.status(500).json({ message: err.message, data: [] });
  }
});

