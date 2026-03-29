import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSkeleton } from '../components/SkeletonLoader';

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { staggerChildren: 0.05 },
  },
};

const userVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

const messageVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } },
};

export default function Chat() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-border"><ChatSkeleton /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[calc(100vh-8rem)] bg-surface border border-border rounded-xl overflow-hidden shadow-sm"
    >
      {/* Sidebar */}
      <motion.div variants={sidebarVariants} initial="hidden" animate="visible" className="w-64 md:w-80 border-r border-border bg-background/30 hidden sm:flex flex-col">
        <div className="p-4 border-b border-border">
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-text-primary transition-colors"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {[1, 2, 3, 4, 5].map((chat) => (
            <motion.div 
              variants={userVariants}
              whileHover={{ scale: 1.02, x: 4 }}
              key={chat} 
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${chat === 1 ? 'bg-primary/10 border border-primary/20' : 'border border-transparent hover:bg-surface/50'}`}
            >
              <div className={`w-10 h-10 bg-zinc-800 rounded-full relative flex-shrink-0 ${chat === 1 ? 'border-2 border-primary' : ''}`}>
                <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-surface rounded-full ${chat <= 2 ? 'bg-green-500' : 'bg-zinc-500'}`}></span>
              </div>
              <div className="overflow-hidden">
                <h4 className="font-medium text-text-primary truncate text-sm">Alex Developer {chat}</h4>
                <p className="text-xs text-text-secondary truncate">Sure, I can help with that bug.</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-surface overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-full border-2 border-primary relative flex-shrink-0">
               <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></span>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Alex Developer 1</h3>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
          <button className="text-text-secondary hover:text-text-primary p-2">
             •••
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <AnimatePresence>
            <motion.div variants={messageVariants} initial="hidden" animate="visible" className="flex gap-3">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex-shrink-0 mt-1"></div>
              <div className="bg-background border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm">
                <p className="text-text-primary text-sm">Hey! Did you check out the new Vite update?</p>
                <span className="text-[10px] text-text-secondary mt-1 block">10:42 AM</span>
              </div>
            </motion.div>
            <motion.div variants={messageVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="flex gap-3 flex-row-reverse">
              <div className="bg-primary hover:bg-primary-hover text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] shadow-sm shadow-primary/10 transition-colors">
                <p className="text-sm">Yes! The start times are insanely fast now. We should migrate our main project.</p>
                <span className="text-[10px] text-zinc-300 mt-1 block text-right">10:45 AM</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-border bg-surface z-10">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="w-full bg-background border border-border rounded-full pl-5 pr-12 py-3 focus:outline-none focus:border-primary text-text-primary text-sm transition-colors shadow-sm"
            />
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-full hover:bg-primary-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
