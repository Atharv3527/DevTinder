import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Clock, Loader2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://devtinder-1-euv2.onrender.com';

function timeAgo(iso) {
  const d = iso ? new Date(iso) : new Date();
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const { isAuthenticated, getToken } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 mb-6 shadow-lg shadow-primary/10">
          <Bell className="w-9 h-9 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to see notifications</h2>
        <p className="text-zinc-400 mb-6 max-w-xs">You need to be logged in to view your connection notifications.</p>
        <Link
          to="/login"
          className="px-6 py-2.5 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await getToken();
        const res = await axios.get(`${API}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active) return;
        setNotifications(res.data.notifications || []);
      } catch (e) {
        if (!active) return;
        console.error('Notifications fetch error:', e);
        setError(e?.response?.data?.error || e.message || 'Failed to load notifications');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchNotifications();
    return () => { active = false; };
  }, [getToken]);

  // Mark unread as read after 3 seconds on page
  useEffect(() => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      const timer = setTimeout(async () => {
        try {
          const token = await getToken();
          await axios.post(`${API}/api/notifications/mark-read`, { notificationIds: unreadIds }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNotifications(prev => prev.map(n => unreadIds.includes(n.id) ? { ...n, is_read: true } : n));
        } catch (e) {
          console.error('Failed to mark read', e);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications, getToken]);

  const newCount = notifications.filter(n => !n.is_read).length;

  const setBusy = (id, isBusy) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (isBusy) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const acceptRequest = async (connectionId, notificationId) => {
    setBusy(notificationId, true);
    setError('');
    try {
      const token = await getToken();
      await axios.post(`${API}/api/request/accept/${connectionId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Mark local state as accepted
      setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, is_read: true, answered: true } : n));
    } catch (e) {
      console.error('Accept request error:', e);
      setError(e?.response?.data?.error || e.message || 'Failed to accept request');
    } finally {
      setBusy(notificationId, false);
    }
  };

  const rejectRequest = async (connectionId, notificationId) => {
    setBusy(notificationId, true);
    setError('');
    try {
      const token = await getToken();
      await axios.post(`${API}/api/request/reject/${connectionId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Mark local state as rejected
      setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, is_read: true, answered: true } : n));
    } catch (e) {
      console.error('Reject request error:', e);
      setError(e?.response?.data?.error || e.message || 'Failed to decline request');
    } finally {
      setBusy(notificationId, false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      const token = await getToken();
      await axios.delete(`${API}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  const categorized = useMemo(() => {
    const newNotifs = [];
    const oldNotifs = [];
    notifications.forEach((r) => {
      const dev = r.actor;
      const name = dev?.full_name || 'Developer';
      const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
      const item = {
        ...r,
        dev,
        name,
        initials,
        bio: dev?.bio || '',
        uid: dev?.firebase_uid,
      };
      if (!r.is_read) newNotifs.push(item);
      else oldNotifs.push(item);
    });
    return { newNotifs, oldNotifs };
  }, [notifications]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center border border-primary/25">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            {newCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-primary/40">
                {newCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
            <p className="text-zinc-500 text-sm">
              {loading ? 'Loading…' : newCount > 0 ? `${newCount} new notification${newCount === 1 ? '' : 's'}` : 'All caught up!'}
            </p>
          </div>
        </div>

        {newCount === 0 && !loading && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/community')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-primary hover:bg-primary/10 border border-primary/20 transition-all"
          >
            Go to Community
          </motion.button>
        )}
      </motion.div>

      {error && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Notification Lists */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Loading notifications…</span>
              </div>
            </motion.div>
          ) : notifications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 bg-zinc-800/60 rounded-full flex items-center justify-center border border-white/10 mb-4">
                <Users className="w-7 h-7 text-zinc-600" />
              </div>
              <p className="text-zinc-400 font-medium">You have no notifications</p>
              <p className="text-zinc-600 text-sm mt-1">Once you interact with developers, things will appear here.</p>
            </motion.div>
          ) : (
            <>
              {categorized.newNotifs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white/80 text-sm font-semibold ml-1">New</h3>
                  {categorized.newNotifs.map(c => <NotificationCard key={c.id} c={c} isBusy={busyIds.has(c.id)} acceptRequest={acceptRequest} rejectRequest={rejectRequest} deleteNotification={deleteNotification} navigate={navigate} />)}
                </div>
              )}
              {categorized.oldNotifs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white/40 text-sm font-semibold ml-1 mt-4">Earlier</h3>
                  {categorized.oldNotifs.map(c => <NotificationCard key={c.id} c={c} isBusy={busyIds.has(c.id)} acceptRequest={acceptRequest} rejectRequest={rejectRequest} deleteNotification={deleteNotification} navigate={navigate} />)}
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NotificationCard({ c, isBusy, acceptRequest, rejectRequest, deleteNotification, navigate }) {
  // Determine message string based on type
  let message = "";
  let badge = "";
  let badgeColor = "";

  if (c.type === "connection_request") {
    message = c.bio ? c.bio : 'Wants to connect with you.';
    badge = "New Request";
    badgeColor = "bg-primary/15 text-primary border-primary/20";
  } else if (c.type === "accepted") {
    message = "Has accepted your connection request.";
    badge = "Accepted";
    badgeColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  } else if (c.type === "rejected") {
    message = "Has declined your connection request.";
    badge = "Declined";
    badgeColor = "bg-red-500/15 text-red-400 border-red-500/30";
  }

  const isOldRequest = c.type === 'connection_request' && c.is_read;
  const isAnswered = c.answered === true;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
      className={`relative group flex items-start gap-4 p-4 rounded-2xl border ${c.is_read ? 'bg-surface/30 border-white/5 opacity-80' : 'bg-surface/60 border-white/10 hover:bg-surface/80'} shadow-lg shadow-black/20 transition-all duration-200`}
    >
      {!c.is_read && <span className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full shadow-sm shadow-primary/50" />}

      {/* Avatar */}
      <button
        onClick={() => c.uid && navigate(`/profile/${c.uid}`)}
        className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center font-black text-white text-sm shrink-0 shadow-md"
        disabled={!c.uid}
        title={c.uid ? 'View profile' : 'Profile unavailable'}
      >
        {c.dev?.profile_image_url ? (
          <img src={c.dev.profile_image_url} alt={c.name} className="w-full h-full object-cover" />
        ) : (
          c.initials
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => c.uid && navigate(`/profile/${c.uid}`)}
            className="font-bold text-white text-sm hover:text-primary transition-colors"
            disabled={!c.uid}
          >
            {c.name}
          </button>
          {!isAnswered && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <p className={`text-sm mt-0.5 ${c.is_read ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {isAnswered ? "Request answered." : message}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="w-3 h-3 text-zinc-600" />
          <span className="text-zinc-600 text-xs">{timeAgo(c.created_at)}</span>
        </div>

        {/* Actions for connection requests */}
        {c.type === "connection_request" && !isAnswered && !isOldRequest && (
          <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => acceptRequest(c.connection_id, c.id)}
              disabled={isBusy}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold hover:bg-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Accept
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => rejectRequest(c.connection_id, c.id)}
              disabled={isBusy}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-3.5 h-3.5" />
              Decline
            </motion.button>
          </div>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); deleteNotification(c.id); }}
        className="absolute top-3 right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/10 text-zinc-600 hover:text-zinc-300"
        title="Hide"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
