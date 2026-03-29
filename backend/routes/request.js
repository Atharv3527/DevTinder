import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

const requestRouter = express.Router();

// POST /api/request/send/:toUserId — send connection request
requestRouter.post("/request/send/:toUserId", userAuth, async (req, res) => {
  try {
    const senderId = req.user.uid;
    const receiverId = req.params.toUserId;

    if (senderId === receiverId) {
      return res.status(400).json({ error: "Cannot connect with yourself" });
    }

    // Check if already exists (either direction)
    const { data: existing } = await supabase
      .from("connections")
      .select("id, status")
      .or(
        `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
      )
      .single();

    if (existing) {
      return res.status(409).json({ error: "Connection already exists", status: existing.status });
    }

    const { data, error } = await supabase
      .from("connections")
      .insert({ sender_id: senderId, receiver_id: receiverId, status: "pending" })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Connection request sent", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/request/accept/:connectionId — accept a connection
requestRouter.post("/request/accept/:connectionId", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { connectionId } = req.params;

    const { data, error } = await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", connectionId)
      .eq("receiver_id", uid) // only receiver can accept
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Connection not found" });

    res.json({ message: "Connection accepted", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/request/reject/:connectionId — reject an incoming pending request
requestRouter.post("/request/reject/:connectionId", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { connectionId } = req.params;

    const { data, error } = await supabase
      .from("connections")
      .update({ status: "rejected" })
      .eq("id", connectionId)
      .eq("receiver_id", uid) // only receiver can reject
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Connection not found" });

    res.json({ message: "Connection rejected", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connections — get all accepted connections for current user
requestRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    // Connections where I am sender
    const { data: asSender } = await supabase
      .from("connections")
      .select("id, receiver_id, status, created_at, developers!connections_receiver_id_fkey(firebase_uid, full_name, profile_image_url, bio, github_url)")
      .eq("sender_id", uid)
      .eq("status", "accepted");

    // Connections where I am receiver
    const { data: asReceiver } = await supabase
      .from("connections")
      .select("id, sender_id, status, created_at, developers!connections_sender_id_fkey(firebase_uid, full_name, profile_image_url, bio, github_url)")
      .eq("receiver_id", uid)
      .eq("status", "accepted");

    const connections = [
      ...(asSender || []).map((c) => ({ connectionId: c.id, partner: c.developers, connectedAt: c.created_at })),
      ...(asReceiver || []).map((c) => ({ connectionId: c.id, partner: c.developers, connectedAt: c.created_at })),
    ];

    res.json({ connections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connections/pending — incoming pending requests
requestRouter.get("/connections/pending", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    const { data, error } = await supabase
      .from("connections")
      .select("id, sender_id, created_at, developers!connections_sender_id_fkey(firebase_uid, full_name, profile_image_url, bio)")
      .eq("receiver_id", uid)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ requests: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { requestRouter };
