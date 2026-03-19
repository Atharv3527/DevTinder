import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { X, Heart, Code2 } from 'lucide-react';

const MOCK_PROFILES = [
  { id: 1, name: "Alex Jenkins", role: "Frontend Engineer", bio: "Obsessed with animations and React. Let's build something beautiful together. I specialize in highly interactive WebGL experiences.", skills: ["React", "Framer Motion", "Tailwind"], color: "from-blue-600 to-indigo-800" },
  { id: 2, name: "Sarah Chen", role: "Full Stack Developer", bio: "Typescript enthusiast. Building highly scalable microservices. Currently exploring serverless architectures and distributed systems.", skills: ["Node.js", "TypeScript", "PostgreSQL"], color: "from-emerald-600 to-teal-800" },
  { id: 3, name: "Marcus Rodriguez", role: "UI/UX Designer", bio: "Designing intuitive interfaces that engineers love to build. Clean typography and whitespace are my best friends.", skills: ["Figma", "CSS", "Design Systems"], color: "from-orange-600 to-rose-800" },
  { id: 4, name: "Emma Watson", role: "DevOps Engineer", bio: "Automating pipelines and managing multi-cloud k8s clusters. Zero downtime is the only acceptable metric.", skills: ["AWS", "Kubernetes", "Docker"], color: "from-cyan-600 to-blue-800" },
  { id: 5, name: "David Kim", role: "Backend Architect", bio: "Performance optimization is my superpower. Rust zealot rewriting legacy Python monoliths for fun.", skills: ["Rust", "Go", "Redis"], color: "from-zinc-700 to-zinc-900" },
];

export default function Feed() {
  const [cards, setCards] = useState(MOCK_PROFILES);

  // Leave active card at index 0
  const activeCard = cards[0];

  const removeCard = (id) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDragEnd = (event, info, cardId) => {
    // Premium swipe physics thresholds (distance OR high velocity)
    const swipeThreshold = 150;
    const velocityThreshold = 800;
    
    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      // Connect / Swipe Right
      removeCard(cardId);
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      // Reject / Swipe Left
      removeCard(cardId);
    }
  };

  const handleAction = (direction) => {
    if (!activeCard) return;
    removeCard(activeCard.id);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] overflow-hidden w-full max-w-7xl mx-auto px-4">
      <div className="relative z-10 w-full max-w-[360px] aspect-[11/16] flex items-center justify-center mt-4">
        <AnimatePresence>
          {cards.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-5 bg-surface/40 backdrop-blur-2xl rounded-[2rem] border border-white/10"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                <Code2 className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">You're all caught up!</h3>
                <p className="text-base text-zinc-400 mt-2 max-w-[250px]">Check back later for more developers in your area.</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCards(MOCK_PROFILES)}
                className="mt-6 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-base font-semibold text-white hover:bg-white/10 transition-colors shadow-sm"
              >
                Reload Profiles
              </motion.button>
            </motion.div>
          )}

          {cards.map((card, index) => {
            const isTop = index === 0;
            return (
              <SwipeCard 
                key={card.id} 
                card={card} 
                isTop={isTop} 
                index={index} 
                handleDragEnd={handleDragEnd} 
              />
            );
          }).reverse()}
        </AnimatePresence>
      </div>

      {cards.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative z-10 flex items-center justify-center gap-8 mt-12 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.15, boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)' }}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleAction('left')}
            className="w-16 h-16 bg-surface/80 backdrop-blur-md border-[2px] border-red-500/20 rounded-full flex items-center justify-center text-red-500 shadow-xl transition-all hover:border-red-500/50 hover:bg-red-500/10"
          >
            <X className="w-8 h-8" strokeWidth={3} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15, boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)' }}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleAction('right')}
            className="w-16 h-16 bg-surface/80 backdrop-blur-md border-[2px] border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 shadow-xl transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10"
          >
            <Heart className="w-8 h-8" strokeWidth={3} fill="currentColor" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

const SwipeCard = ({ card, isTop, index, handleDragEnd }) => {
  const x = useMotionValue(0);
  // Smoother, slightly wider rotation mapping like realistic Tinder cards
  const rotate = useTransform(x, [-300, 300], [-20, 20]);
  
  return (
    <motion.div
      style={isTop ? { x, rotate } : {}}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      // True 1:1 dragging for a premium feel
      dragElastic={isTop ? 1 : 0}
      onDragEnd={(e, info) => handleDragEnd(e, info, card.id)}
      initial={{ scale: 0.9, y: 40, opacity: 0 }}
      animate={{ 
        scale: isTop ? 1 : 1 - index * 0.06, 
        y: isTop ? 0 : index * 24, 
        opacity: isTop ? 1 : 1 - index * 0.25,
        zIndex: 10 - index,
        boxShadow: isTop 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
      exit={{ 
        x: x.get() > 0 ? 400 : -400, 
        opacity: 0, 
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
      }}
      // Crisper, premium spring physics
      transition={isTop ? { type: "spring", stiffness: 450, damping: 28 } : { type: "spring", stiffness: 300, damping: 30 }}
      className={`absolute inset-0 w-full h-full bg-[#1c1c1e] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col ${isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
    >
      {/* Profile Image / Gradient Placeholder */}
      <div className={`h-[45%] w-full bg-gradient-to-br ${card.color} relative overflow-hidden flex items-center justify-center`}>
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Subtle top inner shadow for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent opacity-50"></div>
        <span className="text-white/80 font-black text-8xl select-none tracking-tighter shadow-sm drop-shadow-2xl">
          {card.name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>

      {/* Profile Details (Better Spacing & Visual Hierarchy) */}
      <div className="h-[55%] w-full p-6 sm:p-7 flex flex-col bg-surface/90 backdrop-blur-2xl relative z-10 select-none">
        
        <div className="flex flex-col mb-1">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{card.name}</h2>
          <p className="text-primary font-semibold text-[15px] mt-1 pr-2">{card.role}</p>
        </div>

        <p className="text-zinc-400 text-sm mt-3 line-clamp-3 leading-relaxed font-medium flex-grow">
          {card.bio}
        </p>

        <div className="mt-auto pt-4 border-t border-white/5">
          <p className="text-[11px] text-zinc-500 font-bold mb-3 uppercase tracking-widest">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {card.skills.map(skill => (
              <span key={skill} className="px-3.5 py-1.5 bg-white/5 border border-white/5 text-zinc-300 rounded-full text-[13px] font-semibold tracking-wide">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Premium Swipe Feedback Stamps */}
      {isTop && (
        <>
          {/* LIKE STAMP */}
          <motion.div 
            style={{ opacity: useTransform(x, [20, 100], [0, 1]) }}
            className="absolute top-10 left-8 border-[4px] border-emerald-500 rounded-xl px-5 py-1 -rotate-[15deg] z-50 pointer-events-none bg-emerald-500/10 backdrop-blur-sm"
          >
            <span className="text-emerald-500 font-black text-3xl uppercase tracking-widest drop-shadow-md pb-1 block">LIKE</span>
          </motion.div>
          {/* NOPE STAMP */}
          <motion.div 
            style={{ opacity: useTransform(x, [-100, -20], [1, 0]) }}
            className="absolute top-10 right-8 border-[4px] border-red-500 rounded-xl px-5 py-1 rotate-[15deg] z-50 pointer-events-none bg-red-500/10 backdrop-blur-sm"
          >
            <span className="text-red-500 font-black text-3xl uppercase tracking-widest drop-shadow-md pb-1 block">NOPE</span>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};


