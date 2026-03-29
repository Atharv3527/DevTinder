import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Code2, Loader2, Sparkles, MapPin, Github } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SPRING = { type: 'spring', stiffness: 400, damping: 30 };

const MOCK_CARDS = [
  {
    user_id: '1',
    users: { full_name: 'Alex Jenkins' },
    about: 'Obsessed with animations and React. Building beautiful interfaces with Three.js and Framer Motion.',
    profile_photo: 'https://i.pravatar.cc/150?u=alex',
    address: 'San Francisco, CA',
    github_url: 'https://github.com/alexjenkins',
    skills: [{ skill_name: 'React' }, { skill_name: 'Three.js' }, { skill_name: 'TypeScript' }],
  },
  {
    user_id: '2',
    users: { full_name: 'Sarah Chen' },
    about: 'TypeScript enthusiast building highly scalable microservices. Currently exploring distributed systems.',
    profile_photo: 'https://i.pravatar.cc/150?u=sarah',
    address: 'New York, NY',
    github_url: 'https://github.com/sarahchen',
    skills: [{ skill_name: 'Go' }, { skill_name: 'Kubernetes' }, { skill_name: 'PostgreSQL' }],
  },
  {
    user_id: '3',
    users: { full_name: 'Marcus Rodriguez' },
    about: 'Designing intuitive interfaces that engineers love to build. Clean typography and whitespace enthusiast.',
    profile_photo: 'https://i.pravatar.cc/150?u=marcus',
    address: 'Austin, TX',
    github_url: 'https://github.com/marcusr',
    skills: [{ skill_name: 'Figma' }, { skill_name: 'React' }, { skill_name: 'CSS' }],
  },
  {
    user_id: '4',
    users: { full_name: 'Priya Sharma' },
    about: 'Backend engineer specializing in high-throughput data systems. Kafka, Redis, and clean API design.',
    profile_photo: 'https://i.pravatar.cc/150?u=priya',
    address: 'Bangalore, India',
    github_url: 'https://github.com/priya',
    skills: [{ skill_name: 'Java' }, { skill_name: 'Kafka' }, { skill_name: 'Spring Boot' }],
  },
  {
    user_id: '5',
    users: { full_name: 'David Kim' },
    about: 'Performance optimization is my superpower. Rust zealot and systems programmer.',
    profile_photo: 'https://i.pravatar.cc/150?u=david',
    address: 'Seattle, WA',
    github_url: 'https://github.com/davidkim',
    skills: [{ skill_name: 'Rust' }, { skill_name: 'C++' }, { skill_name: 'WASM' }],
  },
];

export default function Feed() {
  const { isAuthenticated, getToken } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        if (isAuthenticated) {
          const token = await getToken();
          const res = await axios.get(`${API}/api/feed`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data.data || [];
          setCards(data.length > 0 ? data : MOCK_CARDS);
        } else {
          setCards(MOCK_CARDS);
        }
      } catch {
        setCards(MOCK_CARDS);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [isAuthenticated]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleAction = async (userId, type) => {
    setCards((prev) => prev.map((c) => c.user_id === userId ? { ...c, action: type } : c));
    showToast(type === 'accept' ? 'Connection sent 🚀' : 'Profile skipped');
    setTimeout(() => setCards((prev) => prev.filter((c) => c.user_id !== userId)), 420);

    if (isAuthenticated) {
      try {
        const token = await getToken();
        const ep = type === 'accept' ? 'request/send' : 'request/reject';
        await axios.post(`${API}/api/${ep}/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Action failed:', err);
      }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col items-center overflow-hidden">

      {/* Header */}
      <div className="w-full max-w-2xl px-4 pt-10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          Discover <Sparkles className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-text-secondary mt-1 text-sm">Connect with incredible developers around the globe.</p>
      </div>

      {/* Cards */}
      <div className="w-full max-w-2xl px-4 pb-24 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-text-secondary text-sm font-medium">Curating your feed...</p>
          </div>
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
              <p className="text-text-secondary mt-2 text-sm">Check back later for more developers.</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {cards.map((card) => (
              <DeveloperCard key={card.user_id} card={card} onAction={handleAction} />
            ))}
          </AnimatePresence>
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

function DeveloperCard({ card, onAction }) {
  const name = card.users?.full_name || 'Developer';
  const photo = card.profile_photo;
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

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
      {/* Avatar */}
      <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-border bg-zinc-800 flex items-center justify-center font-bold text-primary text-xl shadow-inner">
        {photo
          ? <img src={photo} alt={name} className="w-full h-full object-cover" loading="lazy" />
          : initials
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h2 className="text-lg font-bold text-text-primary truncate">{name}</h2>
        {card.address && (
          <p className="text-xs text-text-secondary flex items-center justify-center sm:justify-start gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-primary" /> {card.address}
          </p>
        )}
        {card.about && (
          <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">{card.about}</p>
        )}
        {card.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
            {card.skills.slice(0, 4).map((s, i) => (
              <span key={i} className="text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full font-medium">
                {s.skill_name}
              </span>
            ))}
          </div>
        )}
        {card.github_url && (
          <a
            href={card.github_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary mt-2 transition-colors"
          >
            <Github className="w-3 h-3" /> {card.github_url.split('/').pop()}
          </a>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex sm:flex-col gap-3 shrink-0 sm:self-center mt-2 sm:mt-0">
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
          onClick={() => onAction(card.user_id, 'reject')}
          disabled={!!card.action}
          className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-text-secondary hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-40"
          aria-label="Skip"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
          onClick={() => onAction(card.user_id, 'accept')}
          disabled={!!card.action}
          className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 shadow-sm"
          aria-label="Connect"
        >
          <Check className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
}
