import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

export const notificationsRouter = express.Router();

// GET /api/notifications — gets all notifications for logged-in user
notificationsRouter.get("/", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    const { data, error } = await supabase
      .from("notifications")
      .select("*, actor:developers!notifications_actor_id_fkey(firebase_uid, full_name, profile_image_url, bio)")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ notifications: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/mark-read — mark specific or all notifications as read
notificationsRouter.post("/mark-read", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { notificationIds } = req.body;

    let query = supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", uid)
      .eq("is_read", false);

    if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      query = query.in("id", notificationIds);
    }

    const { error } = await query;
    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifications/:id — delete a notification
notificationsRouter.delete("/:id", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", uid);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
