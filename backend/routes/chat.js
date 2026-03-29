import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

export const chatRouter = express.Router();

// GET /api/chat/:partnerId — get message history between current user and partner
chatRouter.get("/chat/:partnerId", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { partnerId } = req.params;

    // Verify they are connected
    const { data: connection } = await supabase
      .from("connections")
      .select("id, status")
      .or(
        `and(sender_id.eq.${uid},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${uid})`
      )
      .eq("status", "accepted")
      .single();

    if (!connection) {
      return res.status(403).json({ error: "You are not connected with this user" });
    }

    const { data: messages, error } = await supabase
      .from("chats")
      .select("id, sender_id, receiver_id, message, created_at")
      .or(
        `and(sender_id.eq.${uid},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${uid})`
      )
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) throw error;

    res.json({ messages: messages || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/:partnerId — send a message
chatRouter.post("/chat/:partnerId", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { partnerId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Verify connection
    const { data: connection } = await supabase
      .from("connections")
      .select("id")
      .or(
        `and(sender_id.eq.${uid},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${uid})`
      )
      .eq("status", "accepted")
      .single();

    if (!connection) {
      return res.status(403).json({ error: "You are not connected with this user" });
    }

    const { data, error } = await supabase
      .from("chats")
      .insert({ sender_id: uid, receiver_id: partnerId, message: message.trim() })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Message sent", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
