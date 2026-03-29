import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

export const authRouter = express.Router();

// POST /api/auth/sync — upsert developer record after Firebase login
authRouter.post("/sync", userAuth, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { full_name, profile_image_url } = req.body;

    const { data, error } = await supabase
      .from("developers")
      .upsert(
        {
          firebase_uid: uid,
          email,
          full_name: full_name || email.split("@")[0],
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
    res.status(500).json({ error: err.message });
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
