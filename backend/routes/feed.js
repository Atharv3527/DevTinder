import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";
import { getCache, setCache } from "../config/redis.js";
import { cacheKeys } from "../utils/cacheKeys.js";
import { startTimer } from "../utils/timing.js";

export const feedRouter = express.Router();

feedRouter.get("/", userAuth, async (req, res) => {
  const timer = startTimer("feed.list", { uid: req.user?.uid });
  try {
    const uid = req.user.uid;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;
    const key = cacheKeys.feed(uid, page, limit);

    const cached = await getCache(key);
    if (cached) {
      res.set("X-Cache", "HIT");
      timer.end({ cache: "hit", page, limit });
      return res.json(JSON.parse(cached));
    }

    // Get IDs of already-connected users (both directions)
    const { data: sent } = await supabase
      .from("connections")
      .select("receiver_id")
      .eq("sender_id", uid);

    const { data: received } = await supabase
      .from("connections")
      .select("sender_id")
      .eq("receiver_id", uid);

    timer.mark("connections.lookup", {
      sentCount: sent?.length || 0,
      receivedCount: received?.length || 0,
    });

    const excludeIds = [
      uid,
      ...(sent || []).map((r) => r.receiver_id),
      ...(received || []).map((r) => r.sender_id),
    ];

    const { data: developers, error } = await supabase
      .from("developers")
      .select(
        "firebase_uid, full_name, profile_image_url, bio, skills, github_url, address",
      )
      .not("firebase_uid", "in", `(${excludeIds.join(",")})`)
      .range(offset, offset + limit - 1);

    timer.mark("developers.query", { count: developers?.length || 0 });

    if (error) throw error;

    const payload = { data: developers || [], page, limit };
    await setCache(key, payload, 45);
    res.set("X-Cache", "MISS");
    timer.end({ cache: "miss", page, limit });

    res.json(payload);
  } catch (err) {
    console.error("Feed error:", err);
    timer.end({ ok: false, error: err.message });
    res.status(500).json({ message: err.message, data: [] });
  }
});
