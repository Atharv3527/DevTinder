import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Code2, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';

const SPRING_TRANSITION = { type: 'spring', stiffness: 400, damping: 30 };

export default function Feed() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get('/api/feed', { 
          baseURL: import.meta.env.VITE_API_URL || '',
          withCredentials: true 
        });
        setCards(res.data.data);
      } catch (err) {
        console.error('Feed fetch error, falling back to mock UI:', err);
        setCards([
          { _id: '1', firstName: 'Alex', lastName: 'Jenkins', headline: 'Frontend Engineer | React', about: 'Obsessed with animations and React. Let’s build something beautiful together.', photoUrl: 'https://i.pravatar.cc/150?u=1' },
          { _id: '2', firstName: 'Sarah', lastName: 'Chen', headline: 'Full Stack Developer', about: 'Typescript enthusiast. Building highly scalable microservices.', photoUrl: 'https://i.pravatar.cc/150?u=2' },
          { _id: '3', firstName: 'Marcus', lastName: 'Rodriguez', headline: 'UI/UX Designer', about: 'Designing intuitive interfaces that engineers love to build. Clean typography.', photoUrl: 'https://i.pravatar.cc/150?u=3' },
          { _id: '4', firstName: 'Emma', lastName: 'Watson', headline: 'DevOps Engineer', about: 'Automating pipelines and managing multi-cloud k8s clusters.', photoUrl: 'https://i.pravatar.cc/150?u=4' },
          { _id: '5', firstName: 'David', lastName: 'Kim', headline: 'Backend Architect', about: 'Performance optimization is my superpower. Rust zealot.', photoUrl: 'https://i.pravatar.cc/150?u=5' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = async (id, actionType) => {
    setCards((prev) => prev.map(c => 
      c._id === id ? { ...c, action: actionType } : c
    ));
    
    if (actionType === 'accept') showToast("Connection Sent 🚀");
    if (actionType === 'reject') showToast("Profile Skipped");

    setTimeout(() => {
      setCards((prev) => prev.filter((c) => c._id !== id));
    }, 400);

    try {
      const endpoint = actionType === 'accept' ? '/api/request/send' : '/api/request/reject';
      await axios.post(`${endpoint}/${id}`, {}, {
        baseURL: import.meta.env.VITE_API_URL || '',
        withCredentials: true 
      });
    } catch (err) {
      console.error(`Failed to ${actionType} user`, err);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col items-center bg-transparent overflow-hidden selection:bg-primary/20">
      
      {/* Premium Minimal Header */}
      <div className="w-full max-w-2xl px-4 pt-10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          Discover <Sparkles className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-zinc-400 mt-1">Connect with incredible developers around the globe.</p>
      </div>

      {/* Main Feed Container */}
      <div className="w-full max-w-2xl px-4 pb-24 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-zinc-500 font-medium mt-4">Curating your feed...</p>
          </div>
        ) : cards.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-5 bg-surface/40 backdrop-blur-xl p-12 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <Code2 className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white tracking-tight">You're all caught up!</h3>
              <p className="text-zinc-400 mt-2">Check back later for more developers.</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {cards.map((card) => (
              <DeveloperCard 
                key={card._id} 
                card={card} 
                onAction={handleAction} 
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={SPRING_TRANSITION}
            className="fixed bottom-10 z-50 px-6 py-3 bg-white text-zinc-900 font-bold rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] tracking-wide text-sm flex items-center gap-2"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

const DeveloperCard = ({ card, onAction }) => {
  const getExitAnimation = () => {
    if (card.action === 'accept') {
      return { 
        x: 150, 
        opacity: 0, 
        scale: 1.05, 
        boxShadow: "0 0 50px rgba(16, 185, 129, 0.4)" // Soft green glow
      };
    }
    if (card.action === 'reject') {
      return { 
        x: -50, 
        opacity: 0, 
        scale: 0.95 
      };
    }
    return { opacity: 0, scale: 0.9 };
  };

  const getBorderState = () => {
    if (card.action === 'accept') return 'border-emerald-500/50';
    if (card.action === 'reject') return 'border-zinc-700/50';
    return 'border-white/10 hover:border-white/20';
  };

  return (
    <motion.div
      layout 
      initial={{ opacity: 0, y: 30 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        x: card.action === 'accept' ? 20 : card.action === 'reject' ? -20 : 0,
        scale: card.action === 'accept' ? 1.02 : card.action === 'reject' ? 0.98 : 1
      }}
      exit={getExitAnimation()}
      transition={SPRING_TRANSITION}
      className={`relative w-full overflow-hidden bg-surface/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-black/20 hover:shadow-black/40 transition-all flex flex-col sm:flex-row gap-5 items-center sm:items-start border ${getBorderState()}`}
    >
      {/* Profile Image */}
      <div className="w-24 h-24 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden border border-white/10 shadow-inner">
        <img 
          src={card.photoUrl} 
          alt={card.firstName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Profile Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h2 className="text-xl font-bold text-white tracking-tight truncate">
          {card.firstName} {card.lastName}
        </h2>
        <p className="text-[15px] font-semibold text-primary mt-0.5 truncate">
          {card.headline}
        </p>
        <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
          {card.about}
        </p>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col gap-3 shrink-0 sm:self-center mt-4 sm:mt-0 w-full sm:w-auto justify-center">
        {/* Reject Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => onAction(card._id, 'reject')}
          disabled={!!card.action}
          className="flex-1 sm:flex-none w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          aria-label="Pass"
        >
          <X className="w-6 h-6" strokeWidth={2.5} />
        </motion.button>

        {/* Accept Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => onAction(card._id, 'accept')}
          disabled={!!card.action}
          className="flex-1 sm:flex-none w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors shadow-sm disabled:opacity-50"
          aria-label="Connect"
        >
          <Check className="w-6 h-6" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
};
