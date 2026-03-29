import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, UserCheck, UserX, Clock, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'accepted',
    name: 'Sarah Chen',
    role: 'Full Stack Developer',
    avatar: 'SC',
    avatarColor: 'from-emerald-500 to-teal-600',
    message: 'accepted your connection request',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'rejected',
    name: 'Marcus Rodriguez',
    role: 'UI/UX Designer',
    avatar: 'MR',
    avatarColor: 'from-orange-500 to-rose-600',
    message: 'declined your connection request',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'request',
    name: 'Alex Jenkins',
    role: 'Frontend Engineer',
    avatar: 'AJ',
    avatarColor: 'from-blue-500 to-indigo-600',
    message: 'sent you a connection request',
    time: '3 hours ago',
    read: false,
  },
  {
    id: 4,
    type: 'accepted',
    name: 'Emma Watson',
    role: 'DevOps Engineer',
    avatar: 'EW',
    avatarColor: 'from-cyan-500 to-blue-600',
    message: 'accepted your connection request',
    time: '1 day ago',
    read: true,
  },
  {
    id: 5,
    type: 'request',
    name: 'David Kim',
    role: 'Backend Architect',
    avatar: 'DK',
    avatarColor: 'from-zinc-500 to-zinc-700',
    message: 'sent you a connection request',
    time: '2 days ago',
    read: true,
  },
  {
    id: 6,
    type: 'rejected',
    name: 'Priya Patel',
    role: 'ML Engineer',
    avatar: 'PP',
    avatarColor: 'from-violet-500 to-purple-700',
    message: 'declined your connection request',
    time: '3 days ago',
    read: true,
  },
];

const TYPE_META = {
  accepted: {
    icon: UserCheck,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    badge: 'Accepted',
    badgeCls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  },
  rejected: {
    icon: UserX,
    iconColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    badge: 'Declined',
    badgeCls: 'bg-red-500/15 text-red-400 border border-red-500/20',
  },
  request: {
    icon: Bell,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    badge: 'New Request',
    badgeCls: 'bg-primary/15 text-primary border border-primary/20',
  },
};

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const acceptRequest = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, type: 'accepted', message: 'is now connected with you', read: true } : n
      )
    );
  };

  const rejectRequest = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'request', label: 'Requests' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Declined' },
  ];

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
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-primary/40">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
            <p className="text-zinc-500 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-primary hover:bg-primary/10 border border-primary/20 transition-all"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </motion.button>
        )}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-1"
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
              filter === f.key
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                : 'bg-surface/60 text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {f.label}
            {f.key !== 'all' && (
              <span className="ml-1.5 text-[11px] opacity-60">
                ({notifications.filter((n) => n.type === f.key).length})
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Notification List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 bg-zinc-800/60 rounded-full flex items-center justify-center border border-white/10 mb-4">
                <Bell className="w-7 h-7 text-zinc-600" />
              </div>
              <p className="text-zinc-400 font-medium">No notifications here</p>
              <p className="text-zinc-600 text-sm mt-1">Check back later</p>
            </motion.div>
          ) : (
            filtered.map((n, idx) => {
              const meta = TYPE_META[n.type];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.04, duration: 0.35 }}
                  onClick={() => markRead(n.id)}
                  className={`relative group flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    n.read
                      ? 'bg-surface/30 border-white/5 hover:bg-surface/50'
                      : 'bg-surface/60 border-white/10 hover:bg-surface/80 shadow-lg shadow-black/20'
                  }`}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <span className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full shadow-sm shadow-primary/50" />
                  )}

                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${n.avatarColor} flex items-center justify-center font-black text-white text-sm shrink-0 shadow-md`}>
                    {n.avatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{n.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${meta.badgeCls}`}>
                        {meta.badge}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-0.5">
                      <span className="text-zinc-500">{n.role}</span> · {n.message}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      <span className="text-zinc-600 text-xs">{n.time}</span>
                    </div>

                    {/* Action buttons for incoming requests */}
                    {n.type === 'request' && (
                      <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => acceptRequest(n.id)}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold hover:bg-emerald-500/25 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => rejectRequest(n.id)}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-semibold hover:bg-red-500/20 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.bgColor} ${meta.borderColor} border`}>
                    <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                  </div>

                  {/* Dismiss button (hover) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="absolute top-3 right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/10 text-zinc-600 hover:text-zinc-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
