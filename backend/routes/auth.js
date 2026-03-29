import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

export const authRouter = express.Router();

// POST /api/auth/sync — called after Firebase login to upsert user in Supabase
authRouter.post("/auth/sync", userAuth, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { full_name } = req.body;

    // Upsert user in Supabase users table
    const { data, error } = await supabase
      .from("users")
      .upsert(
        { firebase_uid: uid, email, full_name: full_name || email.split("@")[0] },
        { onConflict: "firebase_uid" }
      )
      .select()
      .single();

    if (error) throw error;

    // Check if profile already exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, github_url")
      .eq("user_id", uid)
      .single();

    res.json({
      success: true,
      user: data,
      profileComplete: !!(profile && profile.github_url),
    });
  } catch (err) {
    console.error("Auth sync error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — get current user info
authRouter.get("/auth/me", userAuth, async (req, res) => {
  try {
    const { uid } = req.user;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("firebase_uid", uid)
      .single();

    if (error) throw error;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", uid)
      .single();

    res.json({ user, profile: profile || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
