import React, {
  useState, useEffect, useRef, useCallback, useMemo, memo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Send, Loader2, MessageCircle, Users, ArrowLeft,
  ChevronDown, Search, Wifi, WifiOff, Smile,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

const API = import.meta.env.VITE_API_URL || 'https://devtinder-1-euv2.onrender.com';

/* ─── Animation Variants ────────────────────────────────────────────────── */
const msgVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 14 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 460, damping: 28 },
  },
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { type: 'spring', stiffness: 340, damping: 26, delay: i * 0.045 },
  }),
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function sameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';
}

/* ─── Skeleton Loader ────────────────────────────────────────────────────── */
function SidebarSkeleton() {
  return (
    <div className="space-y-2 p-2 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-border/40 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-border/40 rounded-full w-3/4" />
            <div className="h-2.5 bg-border/30 rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {[false, true, false, true, true, false].map((own, i) => (
        <div key={i} className={`flex gap-2 ${own ? 'flex-row-reverse' : 'flex-row'}`}>
          {!own && <div className="w-7 h-7 rounded-full bg-border/40 flex-shrink-0 mt-1" />}
          <div
            className={`h-8 rounded-2xl bg-border/40 ${own ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
            style={{ width: `${100 + (i % 3) * 60}px` }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Typing Indicator ───────────────────────────────────────────────────── */
const TypingIndicator = memo(function TypingIndicator({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className="flex items-end gap-2"
    >
      <div className="w-7 h-7 rounded-full border border-border bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
        {getInitials(name)}
      </div>
      <div className="bg-background border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 bg-text-secondary rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  );
});

/* ─── Connection Card ────────────────────────────────────────────────────── */
const ConnectionCard = memo(function ConnectionCard({
  conn, isActive, onClick, index, lastMsg, unread,
}) {
  const dev = conn.partner;
  const name = dev?.full_name || 'Developer';
  const photo = dev?.profile_image_url;
  const initials = getInitials(name);
  const preview = lastMsg?.message?.slice(0, 38) || dev?.bio?.slice(0, 38) || 'Say hello! 👋';

  return (
    <motion.div
      custom={index}
      variants={sidebarItemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.015, x: 3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all relative ${
        isActive
          ? 'bg-primary/12 border border-primary/25 shadow-sm'
          : 'border border-transparent hover:bg-surface/60 hover:border-border'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-zinc-800 flex items-center justify-center font-bold text-primary text-sm">
          {photo
            ? <img src={photo} alt={name} className="w-full h-full object-cover" loading="lazy" />
            : initials}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
      </div>
      <div className="overflow-hidden flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h4 className={`font-semibold truncate text-sm ${isActive ? 'text-primary' : 'text-text-primary'}`}>
            {name}
          </h4>
          {lastMsg && (
            <span className="text-[10px] text-text-secondary flex-shrink-0">
              {formatTime(lastMsg.created_at)}
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary truncate mt-0.5">
          {preview}
          {preview.length >= 38 ? '…' : ''}
        </p>
      </div>
      {unread > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-3 top-3 min-w-[18px] h-[18px] bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1"
        >
          {unread > 9 ? '9+' : unread}
        </motion.span>
      )}
    </motion.div>
  );
});

/* ─── Date Divider ────────────────────────────────────────────────────────── */
function DateDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest px-2 py-1 bg-background border border-border rounded-full">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

/* ─── Single Message Bubble ──────────────────────────────────────────────── */
const MessageBubble = memo(function MessageBubble({
  msg, isOwn, partnerInitials, partnerPhoto, showAvatar, showTime,
}) {
  const time = formatTime(msg.created_at);

  return (
    <motion.div
      layout
      variants={msgVariants}
      initial="hidden"
      animate="visible"
      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end`}
    >
      {/* Avatar placeholder to keep spacing consistent */}
      <div className="w-7 flex-shrink-0">
        {!isOwn && showAvatar && (
          <div className="w-7 h-7 rounded-full border border-border bg-zinc-800 overflow-hidden flex items-center justify-center font-bold text-primary text-[10px]">
            {partnerPhoto
              ? <img src={partnerPhoto} alt="" className="w-full h-full object-cover" />
              : partnerInitials}
          </div>
        )}
      </div>

      <div className={`max-w-[72%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-opacity ${
            isOwn
              ? 'bg-gradient-to-br from-indigo-500 to-primary text-white rounded-tr-sm shadow-lg shadow-primary/25'
              : 'bg-surface border border-border text-text-primary rounded-tl-sm shadow-sm'
          } ${msg.optimistic ? 'opacity-60' : 'opacity-100'}`}
          style={{ wordBreak: 'break-word' }}
        >
          {msg.message}
        </div>
        {showTime && (
          <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] text-text-secondary">{time}</span>
            {isOwn && !msg.optimistic && (
              <span className="text-[10px] text-primary/60">✓✓</span>
            )}
            {isOwn && msg.optimistic && (
              <span className="text-[10px] text-text-secondary/50">⏳</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

/* ─── Main Chat Component ─────────────────────────────────────────────────── */
export default function Chat() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [activeConn, setActiveConn] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [lastMessages, setLastMessages] = useState({}); // partnerId → last msg
  const [unreadCounts, setUnreadCounts] = useState({});

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const realtimeChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingChannelRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Online status ── */
  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  /* ── Fetch Connections ── */
  const fetchConnections = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/api/connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnections(res.data.connections || []);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  /* ── Fetch Messages ── */
  const fetchMessages = useCallback(async (partnerId) => {
    setMsgLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/api/chat/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const msgs = res.data.messages || [];
      setMessages(msgs);
      // Update last message preview for sidebar
      if (msgs.length > 0) {
        setLastMessages((prev) => ({ ...prev, [partnerId]: msgs[msgs.length - 1] }));
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setMsgLoading(false);
    }
  }, [getToken]);

  /* ── Supabase Realtime Subscription ── */
  useEffect(() => {
    if (!activeConn || !user?.uid) return;
    const partnerId = activeConn.partner.firebase_uid;

    fetchMessages(partnerId);

    // Clear unread for this partner
    setUnreadCounts((prev) => ({ ...prev, [partnerId]: 0 }));

    // Cleanup previous channel
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    // Subscribe to new messages in this conversation
    const channelName = `chat:${[user.uid, partnerId].sort().join(':')}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          // Filter: only messages relevant to this conversation
          filter: `receiver_id=eq.${user.uid}`,
        },
        (payload) => {
          const newMsg = payload.new;
          // Only add if it's from our current partner
          if (newMsg.sender_id !== partnerId) {
            // It's from someone else — increment unread
            setUnreadCounts((prev) => ({
              ...prev,
              [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1,
            }));
            setLastMessages((prev) => ({ ...prev, [newMsg.sender_id]: newMsg }));
            return;
          }
          setMessages((prev) => {
            // Deduplicate
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setLastMessages((prev) => ({ ...prev, [partnerId]: newMsg }));
          setPartnerTyping(false);
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    // Typing indicator via Supabase Broadcast
    if (typingChannelRef.current) {
      supabase.removeChannel(typingChannelRef.current);
    }
    const typingChannel = supabase
      .channel(`typing:${channelName}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.sender !== partnerId) return;
        setPartnerTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 3000);
      })
      .subscribe();

    typingChannelRef.current = typingChannel;

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [activeConn, user?.uid]);

  /* ── Broadcast typing ── */
  const broadcastTyping = useCallback(() => {
    if (!typingChannelRef.current || !activeConn) return;
    const partnerId = activeConn.partner.firebase_uid;
    const channelName = `typing:chat:${[user.uid, partnerId].sort().join(':')}`;
    supabase.channel(channelName).send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender: user.uid },
    });
  }, [activeConn, user?.uid]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Only auto-scroll if already near the bottom
    if (distFromBottom < 180) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, partnerTyping]);

  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setShowScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 140);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollDown(false);
  };

  /* ── Send Message ── */
  const handleSend = async () => {
    if (!input.trim() || sending || !activeConn) return;
    const msg = input.trim();
    setInput('');
    setSending(true);
    inputRef.current?.focus();

    const optimistic = {
      id: `opt-${Date.now()}`,
      sender_id: user.uid,
      receiver_id: activeConn.partner.firebase_uid,
      message: msg,
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setLastMessages((prev) => ({ ...prev, [activeConn.partner.firebase_uid]: optimistic }));

    try {
      const token = await getToken();
      const res = await axios.post(
        `${API}/api/chat/${activeConn.partner.firebase_uid}`,
        { message: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const saved = res.data.data;
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...saved, optimistic: false } : m))
      );
      setLastMessages((prev) => ({ ...prev, [activeConn.partner.firebase_uid]: saved }));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  /* ── Input change with typing broadcast ── */
  const handleInputChange = (e) => {
    setInput(e.target.value);
    broadcastTyping();
  };

  /* ── Message grouping ── */
  const groupedMessages = useMemo(() => {
    const groups = [];
    messages.forEach((msg, i) => {
      const prev = messages[i - 1];
      const next = messages[i + 1];
      const showDivider = !prev || !sameDay(prev.created_at, msg.created_at);
      const isOwn = msg.sender_id === user?.uid;
      const prevSame = prev && prev.sender_id === msg.sender_id && sameDay(prev.created_at, msg.created_at);
      const nextSame = next && next.sender_id === msg.sender_id && sameDay(next.created_at, msg.created_at);
      // Show avatar only for the last consecutive message from the partner
      const showAvatar = !isOwn && !nextSame;
      // Show time only for the last in a group
      const showTime = !nextSame;
      groups.push({ msg, showDivider, showAvatar, showTime, isOwn });
    });
    return groups;
  }, [messages, user?.uid]);

  /* ── Derived ── */
  const partnerName = activeConn?.partner?.full_name || 'Developer';
  const partnerPhoto = activeConn?.partner?.profile_image_url;
  const partnerInitials = getInitials(partnerName);

  const filteredConnections = useMemo(() =>
    connections.filter((conn) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        conn.partner?.full_name?.toLowerCase().includes(q) ||
        conn.partner?.bio?.toLowerCase().includes(q)
      );
    }), [connections, search]);

  /* ── Select conversation ── */
  const selectConn = (conn) => {
    setActiveConn(conn);
    setMessages([]);
    setPartnerTyping(false);
    const partnerId = conn.partner.firebase_uid;
    setUnreadCounts((prev) => ({ ...prev, [partnerId]: 0 }));
  };

  /* ──────────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[calc(100vh-4.5rem)] bg-surface border border-border rounded-2xl overflow-hidden shadow-lg relative"
    >
      {/* ── Connection not found banner ── */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-50 bg-red-500/90 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2"
          >
            <WifiOff className="w-3.5 h-3.5" />
            No internet — messages may not send
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════ SIDEBAR ════════════ */}
      <div className="w-64 md:w-72 border-r border-border bg-background/40 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-text-primary flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-primary" />
              Messages
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
                title={isOnline ? 'Online' : 'Offline'}
              />
              {connections.length > 0 && (
                <motion.span
                  key={connections.length}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="text-xs bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold"
                >
                  {connections.length}
                </motion.span>
              )}
            </div>
          </div>

          {connections.length > 0 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search connections…"
                className="w-full bg-background border border-border rounded-full pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary/60 transition-colors text-text-primary placeholder:text-text-secondary"
              />
            </div>
          )}
        </div>

        {/* Connection List */}
        <div
          className="flex-1 overflow-y-auto p-2 space-y-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99 102 241 / 0.2) transparent' }}
        >
          {loading ? (
            <SidebarSkeleton />
          ) : connections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 text-center mt-6"
            >
              <div className="w-14 h-14 bg-primary/5 border border-border rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-text-secondary opacity-50" />
              </div>
              <p className="text-xs text-text-secondary mb-1 font-medium">No connections yet</p>
              <p className="text-[11px] text-text-secondary/60 mb-3">
                Connect with developers to start chatting
              </p>
              <button
                onClick={() => navigate('/feed')}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Discover developers →
              </button>
            </motion.div>
          ) : filteredConnections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 py-8 text-center"
            >
              <p className="text-xs text-text-secondary">No results for "{search}"</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredConnections.map((conn, i) => {
                const pId = conn.partner.firebase_uid;
                return (
                  <ConnectionCard
                    key={conn.connectionId}
                    conn={conn}
                    index={i}
                    isActive={activeConn?.connectionId === conn.connectionId}
                    onClick={() => selectConn(conn)}
                    lastMsg={lastMessages[pId] || null}
                    unread={unreadCounts[pId] || 0}
                  />
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {connections.length > 0 && !loading && (
          <div className="px-4 py-2.5 border-t border-border flex-shrink-0">
            <p className="text-[11px] text-text-secondary text-center">
              {connections.length} {connections.length === 1 ? 'connection' : 'connections'} •{' '}
              <span className="text-green-500 font-medium">Live</span>
            </p>
          </div>
        )}
      </div>

      {/* ════════════ CHAT AREA ════════════ */}
      {!activeConn ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-8 bg-gradient-to-br from-background to-surface/30">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10"
          >
            <MessageCircle className="w-9 h-9 text-primary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <h3 className="text-xl font-bold text-text-primary">Your Messages</h3>
            <p className="text-text-secondary text-sm mt-2 max-w-xs leading-relaxed">
              Select a connection from the sidebar to start a real-time conversation
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-secondary">
              <Wifi className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500 font-medium">Real-time</span>
              <span className="text-text-secondary/50">·</span>
              <span>End-to-end encrypted</span>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ── Chat Header ── */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3 flex-shrink-0 bg-background/50 backdrop-blur-sm">
            <button
              onClick={() => setActiveConn(null)}
              className="md:hidden text-text-secondary hover:text-text-primary mr-1 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-zinc-800 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                {partnerPhoto
                  ? <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
                  : partnerInitials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
            </div>

            <div className="flex-1 min-w-0">
              <button
                onClick={() => navigate(`/profile/${activeConn.partner.firebase_uid}`)}
                className="font-semibold text-text-primary text-sm hover:text-primary transition-colors truncate block"
              >
                {partnerName}
              </button>
              <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                {partnerTyping ? 'typing…' : 'Online'}
              </p>
            </div>

            {/* Real-time badge */}
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-500 px-2.5 py-1 rounded-full text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </div>
          </div>

          {/* ── Messages ── */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 overflow-y-auto p-4 space-y-1"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99 102 241 / 0.15) transparent' }}
          >
            {msgLoading ? (
              <MessageSkeleton />
            ) : messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full gap-4 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary/15 to-accent/15 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Smile className="w-7 h-7 text-primary/60" />
                </div>
                <div>
                  <p className="text-text-primary font-semibold text-base">
                    Start the conversation!
                  </p>
                  <p className="text-text-secondary text-sm mt-1">
                    Say hello to {partnerName} 👋
                  </p>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {groupedMessages.map(({ msg, showDivider, showAvatar, showTime, isOwn }, i) => (
                  <React.Fragment key={msg.id}>
                    {showDivider && (
                      <DateDivider label={formatDateLabel(msg.created_at)} />
                    )}
                    <MessageBubble
                      msg={msg}
                      isOwn={isOwn}
                      partnerInitials={partnerInitials}
                      partnerPhoto={partnerPhoto}
                      showAvatar={showAvatar}
                      showTime={showTime}
                    />
                  </React.Fragment>
                ))}

                {/* Typing indicator */}
                {partnerTyping && (
                  <TypingIndicator key="typing-indicator" name={partnerName} />
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom FAB */}
          <AnimatePresence>
            {showScrollDown && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 10 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                onClick={scrollToBottom}
                className="absolute bottom-24 right-6 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-indigo-600 transition-colors z-20"
                aria-label="Scroll to bottom"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* ── Input ── */}
          <div className="p-4 border-t border-border flex-shrink-0 bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message ${partnerName}…`}
                maxLength={2000}
                className="flex-1 bg-background border border-border rounded-full pl-5 pr-4 py-3 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 text-text-primary text-sm transition-all shadow-sm placeholder:text-text-secondary/60"
              />
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-primary text-white rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-primary/30 transition-all shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                {sending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />}
              </motion.button>
            </div>

            {/* Character count */}
            {input.length > 1600 && (
              <p className="text-right text-[10px] text-text-secondary mt-1 pr-14">
                <span className={input.length > 1900 ? 'text-red-400' : ''}>
                  {input.length}
                </span>/2000
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
