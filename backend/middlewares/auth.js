import admin from "../config/firebaseAdmin.js";

export const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    
    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user payload
    req.user = { 
      uid: decodedToken.uid, 
      email: decodedToken.email 
    };
    
    next();
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};
