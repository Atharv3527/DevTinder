import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

const badgeVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

export default function Profile() {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6 pb-12"
    >
      {/* Header Card */}
      <motion.div variants={sectionVariants} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm relative">
        <div className="h-48 bg-gradient-to-r from-accent to-primary opacity-80 backdrop-blur-3xl relative overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Share Profile"
          className="absolute top-4 right-4 bg-background/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-background/80 transition-colors border border-white/10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368l5.662 3.397m-5.662-3.397a3 3 0 005.662 3.397m-5.662-3.397l5.662-3.397m0 0a3 3 0 105.662 3.397m-5.662-3.397a3 3 0 015.662 3.397" />
          </svg>
        </motion.button>
        <div className="px-6 pb-6 relative">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            className="w-32 h-32 bg-zinc-800 rounded-full border-4 border-surface -mt-16 relative flex items-center justify-center text-5xl shadow-lg border-primary/20"
          >
            👋
          </motion.div>
          <div className="mt-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Jane Developer</h1>
              <p className="text-lg text-text-secondary mt-1">Full Stack React Engineer @ TechCorp</p>
              <p className="text-sm text-text-secondary flex items-center gap-1 mt-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                San Francisco, CA
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 md:flex-none bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-full font-medium transition-colors shadow-md shadow-primary/20 text-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </motion.button>
              <a href="https://github.com/jane-developer" target="_blank" rel="noopener noreferrer">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title="GitHub Profile" className="bg-background border border-border hover:bg-surface text-text-primary p-2.5 rounded-full font-medium transition-colors shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </motion.button>
              </a>
            </div>
          </div>
          <motion.div variants={sectionVariants} className="mt-8 flex gap-8 border-t border-border pt-6">
            <motion.div whileHover={{ y: -2 }} className="cursor-default">
              <span className="block font-bold text-xl text-text-primary">1.2k</span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Connections</span>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="cursor-default">
              <span className="block font-bold text-xl text-text-primary">45</span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Repositories</span>
            </motion.div>
             <motion.div whileHover={{ y: -2 }} className="cursor-default">
              <span className="block font-bold text-xl text-text-primary">87</span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Endorsements</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          <motion.div variants={sectionVariants} className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-text-primary mb-4">About</h2>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
              Passionate full-stack developer with 5+ years of experience building scalable web applications. 
              I love working with React, Node.js, and Tailwind CSS. Always exploring new technologies and 
              enjoying the process of continuous learning.
              
              Currently focused on building accessible and highly performant user interfaces, and scaling microservices architecture on the backend.
            </p>
          </motion.div>
          
          {/* Experience */}
          <motion.div variants={sectionVariants} className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-text-primary mb-6">Experience</h2>
            <div className="space-y-6">
              <motion.div whileHover={{ x: 5 }} className="flex gap-4 cursor-default">
                 <div className="w-12 h-12 bg-background border border-border rounded-lg flex items-center justify-center font-bold text-xl text-primary flex-shrink-0 shadow-inner">
                  T
                </div>
                 <div>
                    <h3 className="font-semibold text-text-primary">Senior Frontend Engineer</h3>
                    <p className="text-sm text-text-primary">TechCorp</p>
                    <p className="text-xs text-text-secondary mt-1">Jan 2022 - Present • 4 yrs 3 mos</p>
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed">Lead the frontend architecture migration to Next.js. Improved performance metrics by 40% and established a comprehensive design system used across 5 products.</p>
                 </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Skills */}
          <motion.div variants={sectionVariants} className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-text-primary mb-4">Top Skills</h2>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="flex flex-wrap gap-2"
            >
              {['React', 'TypeScript', 'Node.js', 'Tailwind', 'Next.js', 'GraphQL', 'AWS', 'Postgres'].map(skill => (
                 <motion.span variants={badgeVariants} whileHover={{ scale: 1.1 }} key={skill} className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-text-primary hover:border-primary hover:text-primary transition-colors cursor-default">
                   {skill}
                 </motion.span>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Education */}
          <motion.div variants={sectionVariants} className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-text-primary mb-4">Education</h2>
            <motion.div whileHover={{ x: 5 }} className="flex gap-4 cursor-default">
                 <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center font-bold text-lg text-primary flex-shrink-0 shadow-inner">
                  U
                </div>
                 <div>
                    <h3 className="font-semibold text-text-primary text-sm">University of Technology</h3>
                    <p className="text-xs text-text-secondary mt-1">B.S. Computer Science</p>
                    <p className="text-xs text-text-secondary mt-1">2014 - 2018</p>
                 </div>
              </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
