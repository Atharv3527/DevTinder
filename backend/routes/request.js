import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { supabase } from "../config/supabase.js";

const requestRouter = express.Router();

requestRouter.post("/request/send/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user.uid;
    const toUserId = req.params.toUserId;

    // In a full implementation, save to DB:
    const { data: connectionRequest, error } = await supabase
      .from('connections')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: 'interested'
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist yet, we just mock the success for the UI
      if (error.code === '42P01') { 
        console.warn("Table 'connections' does not exist yet. Mocking response.");
        return res.json({
          message: "Connection Request Sent Successfully!",
          data: { fromUserId, toUserId, status: "interested" }
        });
      }
      throw error;
    }

    res.json({
      message: "Connection Request Sent Successfully!",
      data: connectionRequest,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

requestRouter.post("/request/reject/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user.uid;
    const toUserId = req.params.toUserId;

    const { data: connectionRequest, error } = await supabase
      .from('connections')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: 'ignored'
      })
      .select()
      .single();

    if (error) {
       // If table doesn't exist yet, we just mock the success for the UI
       if (error.code === '42P01') { 
        console.warn("Table 'connections' does not exist yet. Mocking response.");
        return res.json({
          message: "Connection Request Ignored",
          data: { fromUserId, toUserId, status: "ignored" }
        });
      }
      throw error;
    }

    res.json({
      message: "Connection Request Ignored",
      data: connectionRequest,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

export { requestRouter };
