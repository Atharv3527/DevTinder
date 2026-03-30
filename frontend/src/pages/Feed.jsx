import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, X, Code2, Loader2, Sparkles, MapPin, Github, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://devtinder-1-euv2.onrender.com';
const SPRING = { type: 'spring', stiffness: 400, damping: 30 };

/* ─── Skeleton Card ─────────────────────────────────────────────────────── */
function CardSkeleton({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="w-full bg-surface/70 rounded-3xl p-5 border border-border overflow-hidden relative"
    >
      {/* shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-2xl bg-border/40 flex-shrink-0" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-5 w-44 bg-border/40 rounded-xl" />
          <div className="h-3 w-28 bg-border/30 rounded-xl" />
          <div className="h-3 w-full bg-border/30 rounded-xl" />
          <div className="h-3 w-3/4 bg-border/30 rounded-xl" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-16 bg-border/30 rounded-full" />
            <div className="h-6 w-16 bg-border/30 rounded-full" />
            <div className="h-6 w-16 bg-border/30 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Feed Component ─────────────────────────────────────────────────────── */
export default function Feed() {
  const { isAuthenticated, getToken } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const pageRef = useRef(1);

  const fetchFeed = useCallback(async (pg = 1, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const headers = {};
      if (isAuthenticated) {
        const token = await getToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await axios.get(`${API}/api/feed?page=${pg}&limit=10`, { headers });
      const newCards = res.data.data || [];
      setCards(prev => pg === 1 ? newCards : [...prev, ...newCards]);
      setHasMore(newCards.length === 10);
    } catch (err) {
      console.error('Feed error:', err);
      if (pg === 1) setCards([]);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  }, [isAuthenticated, getToken]);

  // Initial load
  useEffect(() => {
    pageRef.current = 1;
    setPage(1);
    fetchFeed(1, false);
  }, [isAuthenticated]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loadingMore && !loading) {
          const next = pageRef.current + 1;
          pageRef.current = next;
          setPage(next);
          fetchFeed(next, true);
        }
      },
      { threshold: 0.5 }
    );
    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => { if (current) observer.unobserve(current); };
  }, [hasMore, loadingMore, loading, fetchFeed]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const handleAction = async (userId, type) => {
    setCards(prev => prev.map(c => c.firebase_uid === userId ? { ...c, action: type } : c));
    showToast(type === 'accept' ? 'Connection request sent 🚀' : 'Skipped');
    setTimeout(() => setCards(prev => prev.filter(c => c.firebase_uid !== userId)), 420);

    // Only "accept" calls the API (send request). "Skip" is local-only — it must NOT call
    // /api/request/reject/:id because that route expects a connection UUID, not a Firebase uid.
    if (type === 'accept' && isAuthenticated) {
      try {
        const token = await getToken();
        await axios.post(`${API}/api/request/send/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Connect failed:', err);
        const msg = err.response?.data?.error || err.message || 'Failed to send request';
        showToast(msg);
      }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col items-center overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-2xl px-4 pt-10 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-text-primary flex items-center gap-2"
        >
          Discover <Sparkles className="w-6 h-6 text-primary" />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-text-secondary mt-1 text-sm"
        >
          Connect with incredible developers around the globe.
        </motion.p>
      </div>

      {/* Cards */}
      <div className="w-full max-w-2xl px-4 pb-24 space-y-4">
        {loading && cards.length === 0 ? (
          <>
            <CardSkeleton delay={0} />
            <CardSkeleton delay={0.08} />
            <CardSkeleton delay={0.16} />
          </>
        ) : cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center gap-5 bg-surface/40 backdrop-blur-xl p-12 rounded-3xl border border-border"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <Code2 className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-text-primary">You're all caught up!</h3>
              <p className="text-text-secondary mt-2 text-sm">
                {isAuthenticated
                  ? 'No more developers to discover — check back later.'
                  : 'Sign in to see developers in your feed.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {cards.map(card => (
                <DeveloperCard
                  key={card.firebase_uid}
                  card={card}
                  onAction={handleAction}
                  onViewProfile={() => navigate(`/profile/${card.firebase_uid}`)}
                />
              ))}
            </AnimatePresence>

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={loaderRef} className="flex flex-col items-center gap-3 py-6">
                {loadingMore && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                      <Sparkles className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-xs text-text-secondary font-medium tracking-wide">
                      Loading more developers…
                    </span>
                  </motion.div>
                )}
              </div>
            )}

            {!hasMore && cards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 text-text-secondary text-sm"
              >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-surface/50">
                  <Sparkles className="w-4 h-4 text-primary" />
                  You've seen all developers — check back later
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={SPRING}
            className="fixed bottom-10 z-50 px-6 py-3 bg-surface border border-border text-text-primary font-semibold rounded-full shadow-2xl text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Developer Card ─────────────────────────────────────────────────────── */
function DeveloperCard({ card, onAction, onViewProfile }) {
  const name = card.full_name || 'Developer';
  const photo = card.profile_image_url;
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const skills = Array.isArray(card.skills) ? card.skills : [];

  const exitAnim = card.action === 'accept'
    ? { x: 200, opacity: 0, scale: 1.04 }
    : card.action === 'reject'
    ? { x: -200, opacity: 0, scale: 0.94 }
    : { opacity: 0 };

  const borderClass = card.action === 'accept'
    ? 'border-emerald-500/40'
    : card.action === 'reject'
    ? 'border-red-500/20'
    : 'border-border hover:border-primary/30';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1, y: 0,
        x: card.action === 'accept' ? 16 : card.action === 'reject' ? -16 : 0,
        scale: card.action === 'accept' ? 1.02 : card.action === 'reject' ? 0.98 : 1,
      }}
      exit={exitAnim}
      transition={SPRING}
      className={`relative w-full overflow-hidden bg-surface/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row gap-4 items-center sm:items-start border transition-colors ${borderClass}`}
    >
      {/* Accept glow */}
      {card.action === 'accept' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-emerald-500/5 rounded-3xl pointer-events-none"
        />
      )}

      {/* Avatar */}
      <motion.div
        onClick={onViewProfile}
        whileHover={{ scale: 1.05 }}
        className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-border bg-zinc-800 flex items-center justify-center font-bold text-primary text-xl shadow-inner cursor-pointer"
      >
        {photo
          ? <img src={photo} alt={name} className="w-full h-full object-cover" loading="lazy" />
          : initials
        }
      </motion.div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <button
          onClick={onViewProfile}
          className="text-lg font-bold text-text-primary hover:text-primary transition-colors truncate block w-full sm:w-auto text-center sm:text-left"
        >
          {name}
        </button>
        {card.address && (
          <p className="text-xs text-text-secondary flex items-center justify-center sm:justify-start gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-primary" /> {card.address}
          </p>
        )}
        {card.bio && (
          <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">{card.bio}</p>
        )}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
            {skills.slice(0, 4).map((s, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full font-medium"
              >
                {s}
              </motion.span>
            ))}
          </div>
        )}
        {card.github_url && (
          <a
            href={card.github_url}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary mt-2 transition-colors"
          >
            <Github className="w-3 h-3" /> {card.github_url.split('/').filter(Boolean).pop()}
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col gap-3 shrink-0 sm:self-center mt-2 sm:mt-0">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onAction(card.firebase_uid, 'reject')}
          disabled={!!card.action}
          className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-text-secondary hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-40"
          aria-label="Skip"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onAction(card.firebase_uid, 'accept')}
          disabled={!!card.action}
          className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
          aria-label="Connect"
        >
          <Check className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={onViewProfile}
          className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          aria-label="View Profile"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
