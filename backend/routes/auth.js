import express from "express";
import admin from "../config/firebaseAdmin.js";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

export const authRouter = express.Router();

// POST /api/auth/sync — upsert developer record after Firebase login
authRouter.post("/sync", userAuth, async (req, res) => {
  try {
    const { uid } = req.user;
    let { email } = req.user;
    const { full_name, profile_image_url } = req.body;

    // ID token sometimes omits email; Admin SDK always has it for Google sign-in.
    if (!email && admin.apps?.length) {
      try {
        const record = await admin.auth().getUser(uid);
        email = record.email || email;
      } catch (e) {
        console.warn("auth/sync: getUser fallback failed:", e?.message);
      }
    }

    if (!email) {
      return res.status(400).json({ error: "No email on Firebase user; cannot sync developers row" });
    }

    const safeName = (full_name && String(full_name).trim()) || email.split("@")[0];

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
        { onConflict: "firebase_uid" }
      )
      .select()
      .single();

    if (error) throw error;

    const profileComplete = !!(data.bio && data.github_url);

    res.json({ success: true, developer: data, profileComplete });
  } catch (err) {
    console.error("Auth sync error:", err);
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
  try {
    const { uid } = req.user;

    const { data, error } = await supabase
      .from("developers")
      .select("*")
      .eq("firebase_uid", uid)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    res.json({ developer: data || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
