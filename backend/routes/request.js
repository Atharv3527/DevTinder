import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";
import { deleteByPrefix } from "../config/redis.js";

export const requestRouter = express.Router();
export const connectionsRouter = express.Router();

async function invalidateUserFeed(uid) {
  if (!uid) return;
  await deleteByPrefix(`feed:${uid}:`);
}

// GET /api/connections/count?userId= — accepted connections count (sender or receiver)
// Defaults to current user when userId is omitted.
connectionsRouter.get("/count", userAuth, async (req, res) => {
  try {
    const targetUid =
      (req.query.userId && String(req.query.userId).trim()) || req.user.uid;

    const { count, error } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted")
      .or(`sender_id.eq.${targetUid},receiver_id.eq.${targetUid}`);

    if (error) throw error;

    res.json({ totalConnections: count ?? 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/request/send/:toUserId — send connection request
requestRouter.post("/send/:toUserId", userAuth, async (req, res) => {
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
        `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`,
      )
      .single();

    if (existing) {
      return res
        .status(409)
        .json({ error: "Connection already exists", status: existing.status });
    }

    const { data: connData, error } = await supabase
      .from("connections")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("notifications").insert({
      user_id: receiverId,
      actor_id: senderId,
      type: "connection_request",
      connection_id: connData.id,
    });

    await Promise.all([
      invalidateUserFeed(senderId),
      invalidateUserFeed(receiverId),
    ]);

    res.json({ message: "Connection request sent", data: connData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/request/accept/:connectionId — accept a connection
requestRouter.post("/accept/:connectionId", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { connectionId } = req.params;

    const { data: connData, error } = await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", connectionId)
      .eq("receiver_id", uid) // only receiver can accept
      .select()
      .single();

    if (error) throw error;
    if (!connData)
      return res.status(404).json({ error: "Connection not found" });

    await supabase.from("notifications").insert({
      user_id: connData.sender_id,
      actor_id: uid,
      type: "accepted",
      connection_id: connectionId,
    });

    // Mark the original connection_request notification as read for the receiver
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", uid)
      .eq("connection_id", connectionId)
      .eq("type", "connection_request");

    await Promise.all([
      invalidateUserFeed(uid),
      invalidateUserFeed(connData.sender_id),
    ]);

    res.json({ message: "Connection accepted", data: connData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/request/reject/:connectionId — reject an incoming pending request
requestRouter.post("/reject/:connectionId", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { connectionId } = req.params;

    const { data: connData, error } = await supabase
      .from("connections")
      .update({ status: "rejected" })
      .eq("id", connectionId)
      .eq("receiver_id", uid) // only receiver can reject
      .select()
      .single();

    if (error) throw error;
    if (!connData)
      return res.status(404).json({ error: "Connection not found" });

    await supabase.from("notifications").insert({
      user_id: connData.sender_id,
      actor_id: uid,
      type: "rejected",
      connection_id: connectionId,
    });

    // Mark the original connection_request notification as read for the receiver
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", uid)
      .eq("connection_id", connectionId)
      .eq("type", "connection_request");

    await Promise.all([
      invalidateUserFeed(uid),
      invalidateUserFeed(connData.sender_id),
    ]);

    res.json({ message: "Connection rejected", data: connData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connections — get all accepted connections for current user
connectionsRouter.get("/", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    // Connections where I am sender
    const { data: asSender } = await supabase
      .from("connections")
      .select(
        "id, receiver_id, status, created_at, developers!connections_receiver_id_fkey(firebase_uid, full_name, profile_image_url, bio, github_url)",
      )
      .eq("sender_id", uid)
      .eq("status", "accepted");

    // Connections where I am receiver
    const { data: asReceiver } = await supabase
      .from("connections")
      .select(
        "id, sender_id, status, created_at, developers!connections_sender_id_fkey(firebase_uid, full_name, profile_image_url, bio, github_url)",
      )
      .eq("receiver_id", uid)
      .eq("status", "accepted");

    const connections = [
      ...(asSender || []).map((c) => ({
        connectionId: c.id,
        partner: c.developers,
        connectedAt: c.created_at,
      })),
      ...(asReceiver || []).map((c) => ({
        connectionId: c.id,
        partner: c.developers,
        connectedAt: c.created_at,
      })),
    ];

    res.json({ connections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connections/pending — incoming pending requests
connectionsRouter.get("/pending", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    const { data, error } = await supabase
      .from("connections")
      .select(
        "id, sender_id, created_at, developers!connections_sender_id_fkey(firebase_uid, full_name, profile_image_url, bio)",
      )
      .eq("receiver_id", uid)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ requests: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/connections/respond — respond to a connection request
connectionsRouter.post("/respond", userAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const connectionId =
      req.body?.connection_id ??
      req.body?.connectionId ??
      req.body?.connectionID;
    const { action } = req.body;

    if (!connectionId || String(connectionId).trim() === "") {
      return res.status(400).json({ error: "connection_id is required" });
    }

    if (!["accepted", "rejected"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const { data: connData, error } = await supabase
      .from("connections")
      .update({ status: action })
      .eq("id", String(connectionId).trim())
      .eq("receiver_id", uid) // only receiver can respond
      .select()
      .single();

    if (error) throw error;
    if (!connData)
      return res
        .status(404)
        .json({ error: "Connection not found or unauthorized" });

    // Ensure the sender gets a notification
    const { error: notifErr } = await supabase.from("notifications").insert({
      user_id: connData.sender_id,
      actor_id: uid,
      type: action,
      connection_id: String(connectionId).trim(),
    });
    if (notifErr) throw notifErr;

    // Mark the original connection_request notification as read for the receiver
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", uid)
      .eq("connection_id", String(connectionId).trim())
      .eq("type", "connection_request");

    await Promise.all([
      invalidateUserFeed(uid),
      invalidateUserFeed(connData.sender_id),
    ]);

    // Optional welcome message — must not fail the whole accept if chat insert fails
    if (action === "accepted") {
      const { error: chatErr } = await supabase.from("chats").insert({
        sender_id: uid,
        receiver_id: connData.sender_id,
        message: "Connection accepted! 👋 Let's build something great.",
      });
      if (chatErr)
        console.error(
          "connections/respond: chat insert failed:",
          chatErr.message,
        );
    }

    res.json({ message: `Connection ${action}`, data: connData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
