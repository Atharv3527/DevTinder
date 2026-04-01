import express from "express";
import admin from "../config/firebaseAdmin.js";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";
import multer from "multer";
import { deleteCache, deleteByPrefix } from "../config/redis.js";
import { cacheKeys } from "../utils/cacheKeys.js";

export const profileRouter = express.Router();

// In-memory storage for multer (no disk writes on Render)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, or WebP images are allowed."));
    }
  },
});

// POST /api/profile/upload-image — proxy upload through backend (bypasses Supabase RLS)
profileRouter.post(
  "/upload-image",
  userAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "No file provided." });

      const bucket = req.body.bucket || "profile-images";
      const allowedBuckets = ["profile-images", "background-images"];
      if (!allowedBuckets.includes(bucket)) {
        return res.status(400).json({ error: "Invalid bucket." });
      }

      const ext = req.file.originalname.split(".").pop() || "jpg";
      const path = `${req.user.uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
          metadata: { owner: req.user.uid },
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      // Clear cache so profile updates are reflected immediately
      await deleteCache(cacheKeys.authMe(req.user.uid));
      await deleteByPrefix("feed:");

      res.json({ success: true, url: urlData.publicUrl });
    } catch (err) {
      console.error("Image upload error:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

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

async function resolveDeveloperEmail(uid, tokenEmail) {
  let email = tokenEmail || null;
  if (!email && admin.apps?.length) {
    try {
      const record = await admin.auth().getUser(uid);
      email = record.email || null;
    } catch (e) {
      console.warn("resolveDeveloperEmail getUser failed:", e?.message);
    }
  }
  return email;
}

// POST /api/profile — save profile (upsert; supports partial fields)
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

    const { data: existing } = await supabase
      .from("developers")
      .select("email")
      .eq("firebase_uid", uid)
      .maybeSingle();

    const tokenEmail = await resolveDeveloperEmail(uid, req.user.email);
    const email = existing?.email || tokenEmail;
    if (!email) {
      return res.status(400).json({
        error:
          "No email on Firebase user; cannot create or update profile row.",
      });
    }

    const updatePayload = {
      firebase_uid: uid,
      email,
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (bio !== undefined) updatePayload.bio = bio;
    if (github_url !== undefined) updatePayload.github_url = github_url;
    if (address !== undefined) updatePayload.address = address;
    if (profile_image_url !== undefined)
      updatePayload.profile_image_url = profile_image_url;
    if (background_image_url !== undefined)
      updatePayload.background_image_url = background_image_url;
    if (skills !== undefined) updatePayload.skills = skills;
    if (experience !== undefined) updatePayload.experience = experience;
    if (education !== undefined) updatePayload.education = education;

    const { data, error } = await supabase
      .from("developers")
      .upsert(updatePayload, { onConflict: "firebase_uid" })
      .select()
      .single();

    if (error) throw error;

    await deleteCache(cacheKeys.authMe(uid));
    // Profile edits affect how this user appears in feed cards across users.
    await deleteByPrefix("feed:");

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
      .select(
        "firebase_uid, full_name, email, profile_image_url, background_image_url, bio, skills, experience, education, github_url, address, created_at",
      )
      .eq("firebase_uid", uid)
      .single();

    if (error) {
      if (error.code === "PGRST116")
        return res.status(404).json({ error: "Developer not found" });
      throw error;
    }

    res.json({ developer: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
