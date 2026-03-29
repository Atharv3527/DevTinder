import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, Code, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: ''
  });
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = currentSkill.trim();
      if (skill && !skills.includes(skill)) {
        setSkills([...skills, skill]);
      }
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (skills.length === 0) {
      setError('Please add at least one skill');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Simulate API call authentication
    setTimeout(() => {
      setIsLoading(false);
      // Mock signup success
      signup({ ...formData, skills });
      navigate('/profile');
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-xl bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 260, damping: 20 }}
            className="w-14 h-14 bg-gradient-to-tr from-accent to-primary rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20 mb-4 relative group"
          >
            <Flame className="w-7 h-7 text-white relative z-10" fill="currentColor" />
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-text-primary"
          >
            Create an Account
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-text-secondary mt-2 text-sm"
          >
            Join DevTinder and start networking
          </motion.p>
        </div>

        <motion.form 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          onSubmit={handleSignup} 
          className="space-y-5"
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl p-3 text-sm flex items-center gap-2 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid for Name and Email to save space */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary ml-1">Full Name *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl pl-12 pr-4 py-3 text-text-primary transition-all shadow-sm outline-none font-medium"
                  placeholder="Jane Developer"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary ml-1">Email *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl pl-12 pr-4 py-3 text-text-primary transition-all shadow-sm outline-none font-medium"
                  placeholder="jane@example.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary ml-1">Password *</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl pl-12 pr-4 py-3 text-text-primary transition-all shadow-sm outline-none font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary ml-1 flex items-center justify-between">
              Skills *
              <span className="text-xs font-normal text-text-secondary">Press Enter or Comma to add</span>
            </label>
            <div className="bg-background border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary text-text-primary rounded-2xl p-2 transition-all shadow-sm min-h-[50px] flex gap-2 flex-wrap items-center">
              <div className="pl-2 text-text-secondary flex items-center">
                <Code className="w-5 h-5" />
              </div>
              <AnimatePresence>
                {skills.map(skill => (
                  <motion.div
                    key={skill}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-xl text-sm font-medium"
                  >
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-primary-hover p-0.5 rounded-full hover:bg-primary/10 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyDown={handleAddSkill}
                onBlur={handleAddSkill}
                className="flex-1 bg-transparent outline-none min-w-[120px] px-2 py-1 text-sm font-medium"
                placeholder={skills.length === 0 ? "e.g. React, Node.js" : ""}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary ml-1">Bio (Optional)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl px-4 py-3 text-text-primary transition-all shadow-sm outline-none resize-none font-medium"
              placeholder="Tell us a little about yourself and your developer journey..."
            />
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent to-primary text-white rounded-2xl py-3.5 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-80"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
            </motion.button>
          </div>
        </motion.form>

        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-center text-sm text-text-secondary mt-6"
        >
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline hover:text-primary-hover transition-colors">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
