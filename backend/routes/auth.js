import express from "express";
import admin from "../config/firebaseAdmin.js";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";
import { getCache, setCache, deleteCache } from "../config/redis.js";
import { cacheKeys } from "../utils/cacheKeys.js";
import { startTimer } from "../utils/timing.js";

export const authRouter = express.Router();

// POST /api/auth/sync — upsert developer record after Firebase login
authRouter.post("/sync", userAuth, async (req, res) => {
  const timer = startTimer("auth.sync", { uid: req.user?.uid });
  try {
    const { uid } = req.user;
    let { email } = req.user;
    const { full_name, profile_image_url } = req.body;

    // Debug: Log incoming data
    if (profile_image_url) {
      console.log(
        `📸 Sync received profile photo for ${uid}: ${profile_image_url.substring(0, 50)}...`,
      );
    }

    // ID token sometimes omits email; Admin SDK always has it for Google sign-in.
    if (!email && admin.apps?.length) {
      try {
        const record = await admin.auth().getUser(uid);
        email = record.email || email;
        timer.mark("firebase.getUser");
      } catch (e) {
        console.warn("auth/sync: getUser fallback failed:", e?.message);
      }
    }

    if (!email) {
      return res.status(400).json({
        error: "No email on Firebase user; cannot sync developers row",
      });
    }

    const safeName =
      (full_name && String(full_name).trim()) || email.split("@")[0];

    const { data, error } = await supabase
      .from("developers")
      .upsert(
        {
          firebase_uid: uid,
          email,
          full_name: safeName,
          ...(profile_image_url && { profile_image_url }),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "firebase_uid" },
      )
      .select()
      .single();

    timer.mark("supabase.upsert");

    if (error) throw error;

    const profileComplete = !!(data.bio && data.github_url);

    if (data.profile_image_url) {
      console.log(
        `✅ Sync - Saved photo for ${uid}: ${data.profile_image_url.substring(0, 50)}...`,
      );
    } else {
      console.log(`⚠️ Sync - No photo saved for ${uid}`);
    }

    await deleteCache(cacheKeys.authMe(uid));

    timer.end({ ok: true });

    res.json({ success: true, developer: data, profileComplete });
  } catch (err) {
    console.error("Auth sync error:", err);
    timer.end({ ok: false, error: err.message });
    const code = err?.code || err?.details;
    res.status(500).json({
      error: err.message || "Sync failed",
      code: err?.code,
      details: err?.details,
      hint: err?.hint,
    });
  }
});

// GET /api/auth/me
authRouter.get("/me", userAuth, async (req, res) => {
  const timer = startTimer("auth.me", { uid: req.user?.uid });
  try {
    const { uid } = req.user;
    const key = cacheKeys.authMe(uid);

    const cached = await getCache(key);
    if (cached) {
      res.set("X-Cache", "HIT");
      const parsed = JSON.parse(cached);
      if (parsed.developer?.profile_image_url) {
        console.log(`📸 Auth/me (cached) - Has photo for ${uid}`);
      } else {
        console.log(`❌ Auth/me (cached) - photo missing for ${uid}!`);
      }
      timer.end({ cache: "hit" });
      return res.json(parsed);
    }

    const { data, error } = await supabase
      .from("developers")
      .select("*")
      .eq("firebase_uid", uid)
      .single();

    timer.mark("supabase.select");

    if (error && error.code !== "PGRST116") throw error;

    const payload = { developer: data || null };
    await setCache(key, payload, 60);
    res.set("X-Cache", "MISS");

    if (data?.profile_image_url) {
      console.log(
        `📸 Auth/me - Database has photo for ${uid}: ${data.profile_image_url.substring(0, 50)}...`,
      );
    } else {
      console.log(`❌ Auth/me - No photo in database for ${uid}`);
    }

    timer.end({ cache: "miss" });

    res.json(payload);
  } catch (err) {
    timer.end({ ok: false, error: err.message });
    res.status(500).json({ error: err.message });
  }
});
