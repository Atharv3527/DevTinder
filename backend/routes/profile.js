import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

export const profileRouter = express.Router();

// GET /api/profile — own profile
profileRouter.get("/", userAuth, async (req, res) => {
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

// POST /api/profile — save profile
profileRouter.post("/", userAuth, async (req, res) => {
  try {
    const { uid } = req.user;
    const {
      full_name,
      bio,
      github_url,
      address,
      profile_image_url,
      background_image_url,
      skills,
      experience,
      education,
    } = req.body;

    const updatePayload = {
      firebase_uid: uid,
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (bio !== undefined) updatePayload.bio = bio;
    if (github_url !== undefined) updatePayload.github_url = github_url;
    if (address !== undefined) updatePayload.address = address;
    if (profile_image_url !== undefined) updatePayload.profile_image_url = profile_image_url;
    if (background_image_url !== undefined) updatePayload.background_image_url = background_image_url;
    if (skills !== undefined) updatePayload.skills = skills;
    if (experience !== undefined) updatePayload.experience = experience;
    if (education !== undefined) updatePayload.education = education;

    const { data, error } = await supabase
      .from("developers")
      .upsert(updatePayload, { onConflict: "firebase_uid" })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, developer: data });
  } catch (err) {
    console.error("Profile save error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profile/:uid — public profile
profileRouter.get("/:uid", userAuth, async (req, res) => {
  try {
    const { uid } = req.params;

    const { data, error } = await supabase
      .from("developers")
      .select("firebase_uid, full_name, email, profile_image_url, background_image_url, bio, skills, experience, education, github_url, address, created_at")
      .eq("firebase_uid", uid)
      .single();

    if (error) {
      if (error.code === "PGRST116") return res.status(404).json({ error: "Developer not found" });
      throw error;
    }

    res.json({ developer: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
