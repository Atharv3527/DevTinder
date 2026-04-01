import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API =
  import.meta.env.VITE_API_URL || "https://devtinder-1-euv2.onrender.com";
const PREFETCH_KEY = "devtinder:prefetch:v1";
const PROTECTED_PREFIXES = [
  "/feed",
  "/community",
  "/chat",
  "/jobs",
  "/profile",
  "/profile-setup",
  "/notifications",
  "/network",
];

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function InitialDataPrefetch() {
  const { isAuthenticated, user, getToken } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;
    if (!isProtectedPath(location.pathname)) return;

    const marker = `${PREFETCH_KEY}:${user.uid}`;
    if (sessionStorage.getItem(marker) === "done") return;

    const run = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };
        await Promise.allSettled([
          axios.get(`${API}/api/auth/me`, { headers }),
          axios.get(`${API}/api/feed?page=1&limit=10`, { headers }),
          axios.get(`${API}/api/connections`, { headers }),
          axios.get(`${API}/api/notifications`, { headers }),
        ]);

        sessionStorage.setItem(marker, "done");
      } catch (err) {
        console.warn("Initial prefetch failed:", err?.message);
      }
    };

    const idleId =
      typeof window !== "undefined" && window.requestIdleCallback
        ? window.requestIdleCallback(run, { timeout: 1200 })
        : setTimeout(run, 250);

    return () => {
      if (typeof idleId === "number") clearTimeout(idleId);
      else if (typeof window !== "undefined" && window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [isAuthenticated, user?.uid, location.pathname, getToken]);

  return null;
}
