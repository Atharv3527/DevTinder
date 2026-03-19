import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Home() {
  const titleText = "Welcome to DevTinder";
  const words = titleText.split(" ");

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center w-full"
      >
        <motion.div variants={itemVariants} className="space-y-4 flex flex-col items-center w-full max-w-4xl mx-auto px-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2 shadow-sm backdrop-blur-sm cursor-default"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Now in Beta
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-tight py-2">
            {words.map((word, idx) => (
              <motion.span
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="inline-block mr-[0.3em] last:mr-0"
              >
                {word === "DevTinder" ? (
                  <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    {word}
                  </span>
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto pt-4 leading-relaxed"
          >
            Connect with developers, share ideas, and build your professional network in a modern way.
          </motion.p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-10">
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-lg shadow-primary/30 hover:shadow-primary/50 relative overflow-hidden group"
          >
            <span className="relative z-10 w-full flex items-center justify-center gap-2">
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-surface/50 backdrop-blur-md hover:bg-surface text-text-primary border border-border px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-sm relative group overflow-hidden"
          >
            <span className="relative z-10">Learn More</span>
            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
