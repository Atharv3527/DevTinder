import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import axios from "axios";

const AuthContext = createContext();
const API =
  import.meta.env.VITE_API_URL || "https://devtinder-1-euv2.onrender.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase user
  const [dbUser, setDbUser] = useState(null); // Supabase developers row
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  /** Bumps on every auth state change so stale sync responses cannot overwrite state (multi-account / fast switch). */
  const syncSeqRef = useRef(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const seq = ++syncSeqRef.current;

      if (!firebaseUser) {
        setUser(null);
        setDbUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      setIsAuthenticated(true);
      // Unblock route rendering immediately; profile sync can finish in background.
      setLoading(false);

      try {
        // Force a fresh ID token after account switch so backend always sees the current user.
        const token = await firebaseUser.getIdToken(true);
        const res = await axios.post(
          `${API}/api/auth/sync`,
          {
            full_name: firebaseUser.displayName,
            profile_image_url: firebaseUser.photoURL,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (seq !== syncSeqRef.current) return;
        const dev = res.data?.developer;
        if (dev?.firebase_uid !== firebaseUser.uid) return;
        setDbUser(
          dev
            ? {
                ...dev,
                profile_image_url:
                  dev.profile_image_url || firebaseUser.photoURL || null,
              }
            : null,
        );
      } catch (err) {
        const status = err.response?.status;
        const body = err.response?.data;
        console.error("Failed to sync user:", status, body || err.message);
        if (seq === syncSeqRef.current) setDbUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const getToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken();
  }, [user]);

  /** Refetch developers row after profile save/skip so Navbar and setup stay in sync. */
  const refreshDbUser = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      const res = await axios.get(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dev = res.data?.developer ?? null;
      setDbUser(
        dev
          ? {
              ...dev,
              profile_image_url: dev.profile_image_url || user.photoURL || null,
            }
          : null,
      );
    } catch (err) {
      console.error("refreshDbUser failed:", err.response?.data || err.message);
    }
  }, [user]);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setDbUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        isAuthenticated,
        loading,
        getToken,
        refreshDbUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
