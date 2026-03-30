import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

export const chatRouter = express.Router();

// ─── GET /api/chat/:partnerId ─────────────────────────────────────────────
// Fetch conversation history (last 100 messages, oldest first)
chatRouter.get("/:partnerId", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { partnerId } = req.params;

    if (!partnerId || partnerId === uid) {
      return res.status(400).json({ error: "Invalid partner ID" });
    }

    // Verify they are connected (accepted)
    const { data: connection } = await supabase
      .from("connections")
      .select("id, status")
      .or(
        `and(sender_id.eq.${uid},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${uid})`
      )
      .eq("status", "accepted")
      .maybeSingle();

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
    console.error("chat GET error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/chat/:partnerId ────────────────────────────────────────────
// Send a message
chatRouter.post("/:partnerId", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { partnerId } = req.params;
    const { message } = req.body;

    if (!partnerId || partnerId === uid) {
      return res.status(400).json({ error: "Invalid partner ID" });
    }

    const trimmed = (message || "").trim();
    if (!trimmed) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }
    if (trimmed.length > 2000) {
      return res.status(400).json({ error: "Message too long (max 2000 characters)" });
    }

    // Verify connection
    const { data: connection } = await supabase
      .from("connections")
      .select("id")
      .or(
        `and(sender_id.eq.${uid},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${uid})`
      )
      .eq("status", "accepted")
      .maybeSingle();

    if (!connection) {
      return res.status(403).json({ error: "You are not connected with this user" });
    }

    const { data, error } = await supabase
      .from("chats")
      .insert({ sender_id: uid, receiver_id: partnerId, message: trimmed })
      .select("id, sender_id, receiver_id, message, created_at")
      .single();

    if (error) throw error;

    res.json({ message: "Message sent", data });
  } catch (err) {
    console.error("chat POST error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/chat ────────────────────────────────────────────────────────
// Get last-message previews for all connections (sidebar)
chatRouter.get("/", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    // Get all accepted connections
    const { data: connections, error: connErr } = await supabase
      .from("connections")
      .select("id, sender_id, receiver_id")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .eq("status", "accepted");

    if (connErr) throw connErr;
    if (!connections || connections.length === 0) {
      return res.json({ previews: [] });
    }

    // Build partner UID list
    const partnerIds = connections.map((c) =>
      c.sender_id === uid ? c.receiver_id : c.sender_id
    );

    // For each partner, get the latest message
    const previews = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const { data } = await supabase
          .from("chats")
          .select("id, sender_id, receiver_id, message, created_at")
          .or(
            `and(sender_id.eq.${uid},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${uid})`
          )
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return { partnerId, lastMessage: data || null };
      })
    );

    res.json({ previews });
  } catch (err) {
    console.error("chat previews error:", err);
    res.status(500).json({ error: err.message });
  }
});
