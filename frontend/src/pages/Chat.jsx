import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, MessageCircle, Users, ArrowLeft, ChevronDown, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://devtinder-1-euv2.onrender.com';
const POLL_MS = 3000;

const msgVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 420, damping: 26 } },
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 320, damping: 24, delay: i * 0.05 },
  }),
};

/* ─── Connection Card ────────────────────────────────────────────────────── */
function ConnectionCard({ conn, isActive, onClick, index }) {
  const dev = conn.partner;
  const name = dev?.full_name || 'Developer';
  const photo = dev?.profile_image_url;
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      custom={index}
      variants={sidebarItemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isActive
          ? 'bg-primary/10 border border-primary/25 shadow-sm'
          : 'border border-transparent hover:bg-surface/60 hover:border-border'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-zinc-800 flex items-center justify-center font-bold text-primary text-sm">
          {photo ? <img src={photo} alt={name} className="w-full h-full object-cover" loading="lazy" /> : initials}
        </div>
        {isActive && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>
      <div className="overflow-hidden flex-1">
        <h4 className={`font-medium truncate text-sm ${isActive ? 'text-primary' : 'text-text-primary'}`}>
          {name}
        </h4>
        <p className="text-xs text-text-secondary truncate">
          {dev?.bio?.slice(0, 35) || 'Developer'}…
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Chat Page ──────────────────────────────────────────────────────────── */
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
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const sidebarRef = useRef(null);
  const pollRef = useRef(null);

  const fetchConnections = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/api/connections`, { headers: { Authorization: `Bearer ${token}` } });
      setConnections(res.data.connections || []);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = useCallback(async (partnerId, silent = false) => {
    if (!silent) setMsgLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/api/chat/${partnerId}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      if (!silent) setMsgLoading(false);
    }
  }, []);

  useEffect(() => { fetchConnections(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeConn) return;
    const partnerId = activeConn.partner.firebase_uid;
    fetchMessages(partnerId);
    pollRef.current = setInterval(() => fetchMessages(partnerId, true), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [activeConn]);

  // Track scroll position in messages panel to show "scroll to bottom" button
  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distFromBottom > 120);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !activeConn) return;
    const msg = input.trim();
    setInput('');
    setSending(true);

    const optimistic = {
      id: Date.now().toString(),
      sender_id: user.uid,
      receiver_id: activeConn.partner.firebase_uid,
      message: msg,
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const token = await getToken();
      const res = await axios.post(
        `${API}/api/chat/${activeConn.partner.firebase_uid}`,
        { message: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev =>
        prev.map(m => m.id === optimistic.id ? { ...res.data.data, optimistic: false } : m)
      );
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const partnerName = activeConn?.partner?.full_name || 'Developer';
  const partnerPhoto = activeConn?.partner?.profile_image_url;
  const partnerInitials = partnerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Filter connections by search query
  const filteredConnections = connections.filter(conn => {
    if (!search.trim()) return true;
    const name = conn.partner?.full_name?.toLowerCase() || '';
    const bio = conn.partner?.bio?.toLowerCase() || '';
    const q = search.toLowerCase();
    return name.includes(q) || bio.includes(q);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[calc(100vh-8rem)] bg-surface border border-border rounded-2xl overflow-hidden shadow-sm"
    >
      {/* ── Sidebar ── */}
      <div
        ref={sidebarRef}
        className="w-64 md:w-72 border-r border-border bg-background/30 flex flex-col flex-shrink-0"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-text-primary flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-primary" />
              Messages
            </h2>
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

          {/* Search bar – only visible when there are connections */}
          {connections.length > 0 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search connections…"
                className="w-full bg-background border border-border rounded-full pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary transition-colors text-text-primary placeholder:text-text-secondary"
              />
            </div>
          )}
        </div>

        {/* Connection List – scrollable */}
        <div
          className="flex-1 overflow-y-auto p-2 space-y-1 scroll-smooth"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(var(--color-primary-rgb, 124 58 237) / 0.2) transparent' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-xs text-text-secondary">Loading connections…</span>
            </div>
          ) : connections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 text-center"
            >
              <div className="w-12 h-12 bg-primary/5 border border-border rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-text-secondary opacity-60" />
              </div>
              <p className="text-xs text-text-secondary mb-1">No connections yet.</p>
              <button
                onClick={() => navigate('/feed')}
                className="text-xs text-primary hover:underline mt-1 block mx-auto"
              >
                Discover developers →
              </button>
            </motion.div>
          ) : filteredConnections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 py-6 text-center"
            >
              <p className="text-xs text-text-secondary">No results for "{search}"</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredConnections.map((conn, i) => (
                <ConnectionCard
                  key={conn.connectionId}
                  conn={conn}
                  index={i}
                  isActive={activeConn?.connectionId === conn.connectionId}
                  onClick={() => setActiveConn(conn)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Sidebar footer count */}
        {connections.length > 0 && !loading && (
          <div className="px-4 py-2.5 border-t border-border flex-shrink-0">
            <p className="text-xs text-text-secondary text-center">
              {connections.length} {connections.length === 1 ? 'connection' : 'connections'} total
            </p>
          </div>
        )}
      </div>

      {/* ── Chat Area ── */}
      {!activeConn ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20"
          >
            <MessageCircle className="w-7 h-7 text-primary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-text-primary">Select a conversation</h3>
            <p className="text-text-secondary text-sm mt-1">
              Choose a connection from the sidebar to start chatting
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ── Chat Header ── */}
          <div className="p-4 border-b border-border flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setActiveConn(null)}
              className="md:hidden text-text-secondary hover:text-text-primary mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-zinc-800 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
              {partnerPhoto
                ? <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
                : partnerInitials
              }
            </div>
            <div className="flex-1">
              <button
                onClick={() => navigate(`/profile/${activeConn.partner.firebase_uid}`)}
                className="font-semibold text-text-primary text-sm hover:text-primary transition-colors"
              >
                {partnerName}
              </button>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                Connected
              </p>
            </div>
          </div>

          {/* ── Messages ── */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124 58 237 / 0.15) transparent' }}
          >
            {msgLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-xs text-text-secondary">Loading messages…</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-12 h-12 bg-primary/5 border border-border rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary/50" />
                </div>
                <p className="text-text-secondary text-sm">No messages yet. Say hello! 👋</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map(msg => {
                  const isOwn = msg.sender_id === user?.uid;
                  const time = new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit',
                  });
                  return (
                    <motion.div
                      key={msg.id}
                      variants={msgVariants}
                      initial="hidden"
                      animate="visible"
                      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {!isOwn && (
                        <div className="w-7 h-7 rounded-full border border-border bg-zinc-800 flex items-center justify-center font-bold text-primary text-xs flex-shrink-0 mt-1">
                          {partnerInitials}
                        </div>
                      )}
                      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                          isOwn
                            ? 'bg-primary text-white rounded-tr-sm shadow-sm shadow-primary/20'
                            : 'bg-background border border-border text-text-primary rounded-tl-sm'
                        } ${msg.optimistic ? 'opacity-70' : ''}`}>
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-text-secondary mt-1 px-1">{time}</span>
                      </div>
                    </motion.div>
                  );
                })}
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
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                onClick={scrollToBottom}
                className="absolute bottom-24 right-6 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors z-20"
                aria-label="Scroll to bottom"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* ── Input ── */}
          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="relative flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message…"
                className="flex-1 bg-background border border-border rounded-full pl-5 pr-4 py-3 focus:outline-none focus:border-primary text-text-primary text-sm transition-colors shadow-sm"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20 disabled:opacity-50 flex-shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
