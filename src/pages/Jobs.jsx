import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

export default function Jobs() {
  const jobs = [
    { id: 1, role: 'Senior Frontend Engineer', company: 'TechCorp', location: 'Remote', salary: '$120k - $160k', tags: ['React', 'TypeScript', 'Tailwind'] },
    { id: 2, role: 'Full Stack Developer', company: 'StartupX', location: 'New York, NY', salary: '$100k - $140k', tags: ['Node.js', 'React', 'MongoDB'] },
    { id: 3, role: 'UI/UX Designer', company: 'DesignStudio', location: 'San Francisco, CA', salary: '$110k - $150k', tags: ['Figma', 'CSS', 'Framer'] },
    { id: 4, role: 'DevOps Engineer', company: 'CloudBase', location: 'Remote', salary: '$130k - $170k', tags: ['AWS', 'Docker', 'Kubernetes'] },
    { id: 5, role: 'Backend Developer', company: 'DataFlow', location: 'Austin, TX', salary: '$115k - $150k', tags: ['Python', 'Django', 'PostgreSQL'] },
    { id: 6, role: 'Mobile App Developer', company: 'AppWorks', location: 'Remote', salary: '$105k - $145k', tags: ['React Native', 'iOS', 'Android'] },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-6 pb-12"
    >
      <motion.div variants={cardVariants} className="flex justify-between items-center bg-surface border border-border p-5 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Recommended Jobs</h2>
          <p className="text-sm text-text-secondary mt-1">Based on your skills and preferences</p>
        </div>
        <div className="flex gap-3">
           <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-background border border-border px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors focus:outline-none flex items-center gap-2"
           >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters
           </motion.button>
           <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/20 flex items-center gap-2"
           >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Post a Job
           </motion.button>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {jobs.map((job) => (
          <motion.div 
            variants={cardVariants}
            key={job.id}
            whileHover={{ y: -8, boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.2)' }}
            className="bg-surface border border-border rounded-xl p-6 flex flex-col h-full shadow-sm transition-all cursor-pointer group hover:border-primary/50"
          >
            <div className="flex justify-between items-start mb-5">
              <div className="w-14 h-14 bg-background rounded-xl flex items-center justify-center font-bold text-2xl text-primary border border-border shadow-inner group-hover:scale-110 transition-transform">
                {job.company[0]}
              </div>
              <motion.button whileHover={{ scale: 1.2, rotate: 10 }} whileTap={{ scale: 0.9 }} className="text-zinc-600 hover:text-red-500 transition-colors bg-background p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </motion.button>
            </div>
            
            <div className="mb-5 flex-grow">
              <h3 className="font-semibold text-lg text-text-primary group-hover:text-primary transition-colors leading-tight mb-1">{job.role}</h3>
              <p className="text-sm text-text-secondary flex items-center gap-1">
                <span>{job.company}</span>
                <span className="w-1 h-1 bg-text-secondary rounded-full"></span>
                <span>{job.location}</span>
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {job.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-background text-text-primary rounded-md text-xs font-medium border border-border group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-5 border-t border-border mt-auto">
                <span className="font-semibold text-text-primary text-sm">{job.salary}</span>
                <motion.button whileHover={{ x: 5 }} className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
                  Apply Now
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
