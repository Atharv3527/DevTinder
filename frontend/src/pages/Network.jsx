import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle, Users } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://devtinder-1-euv2.onrender.com';

export default function Network() {
  const { getToken, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${API}/api/connections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setConnections(res.data.connections || []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setConnections([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated, getToken]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-text-secondary mb-4">Sign in to see your network.</p>
        <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
          <Users className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Your Network</h1>
          <p className="text-sm text-text-secondary">
            {connections.length === 0
              ? 'No connections yet — discover developers in the feed.'
              : `${connections.length} ${connections.length === 1 ? 'connection' : 'connections'}`}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {connections.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
            When you accept connection requests, people appear here.
          </div>
        ) : (
          connections.map(({ connectionId, partner }) => (
            <motion.div
              key={connectionId}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors"
            >
              <Link to={`/profile/${partner?.firebase_uid}`} className="flex items-center gap-3 min-w-0 flex-1 group">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-border overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold text-primary">
                  {partner?.profile_image_url ? (
                    <img src={partner.profile_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (partner?.full_name || '?').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                    {partner?.full_name || 'Developer'}
                  </p>
                  {partner?.bio && (
                    <p className="text-xs text-text-secondary truncate">{partner.bio}</p>
                  )}
                </div>
              </Link>
              <Link
                to="/chat"
                state={{ partnerId: partner?.firebase_uid }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/25 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors flex-shrink-0"
              >
                <MessageCircle className="w-4 h-4" /> Chat
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
