import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

export const profileRouter = express.Router();

// GET /api/profile — get current user's full profile
profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const { uid } = req.user;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    const { data: skills } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", uid);

    const { data: experience } = await supabase
      .from("experience")
      .select("*")
      .eq("user_id", uid);

    const { data: education } = await supabase
      .from("education")
      .select("*")
      .eq("user_id", uid);

    res.json({
      profile: profile || null,
      skills: skills || [],
      experience: experience || [],
      education: education || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profile — create or update profile
profileRouter.post("/profile", userAuth, async (req, res) => {
  try {
    const { uid } = req.user;
    const { profile, skills, experience, education } = req.body;

    // Upsert profile
    const { data: savedProfile, error: profileError } = await supabase
      .from("profiles")
      .upsert({ user_id: uid, ...profile }, { onConflict: "user_id" })
      .select()
      .single();

    if (profileError) throw profileError;

    // Replace skills
    if (skills !== undefined) {
      await supabase.from("skills").delete().eq("user_id", uid);
      if (skills.length > 0) {
        await supabase.from("skills").insert(
          skills.map((s) => ({ user_id: uid, skill_name: s }))
        );
      }
    }

    // Replace experience
    if (experience !== undefined) {
      await supabase.from("experience").delete().eq("user_id", uid);
      if (experience.length > 0) {
        await supabase.from("experience").insert(
          experience.map((e) => ({ user_id: uid, ...e }))
        );
      }
    }

    // Replace education
    if (education !== undefined) {
      await supabase.from("education").delete().eq("user_id", uid);
      if (education.length > 0) {
        await supabase.from("education").insert(
          education.map((e) => ({ user_id: uid, ...e }))
        );
      }
    }

    res.json({ success: true, profile: savedProfile });
  } catch (err) {
    console.error("Profile save error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profile/:userId — get any user's public profile
profileRouter.get("/profile/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("firebase_uid", userId)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const { data: skills } = await supabase
      .from("skills")
      .select("skill_name")
      .eq("user_id", userId);

    const { data: experience } = await supabase
      .from("experience")
      .select("*")
      .eq("user_id", userId);

    const { data: education } = await supabase
      .from("education")
      .select("*")
      .eq("user_id", userId);

    res.json({ user, profile, skills, experience, education });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
