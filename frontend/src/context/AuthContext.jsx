import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // Firebase user object
  const [dbUser, setDbUser] = useState(null);     // Supabase user record
  const [profile, setProfile] = useState(null);   // Supabase profile record
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);   // Auth state loading

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        // Sync user to Supabase and get profile status
        await syncUser(firebaseUser);
      } else {
        setUser(null);
        setDbUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncUser = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await axios.post(
        `${API}/api/auth/sync`,
        { full_name: firebaseUser.displayName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDbUser(res.data.user);
      // Profile completeness flag available via res.data.profileComplete
    } catch (err) {
      console.error('Failed to sync user to Supabase:', err);
    }
  };

  // Get Firebase ID token for making authenticated API calls
  const getToken = async () => {
    if (!user) return null;
    return await user.getIdToken();
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setDbUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      dbUser,
      profile,
      setProfile,
      isAuthenticated,
      loading,
      getToken,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
