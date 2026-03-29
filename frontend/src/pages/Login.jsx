import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Mail, Lock, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsLoading(true);
    
    // Simulate API call authentication
    setTimeout(() => {
      setIsLoading(false);
      if (email === 'test@devtinder.com' && password === 'password123') {
        login(email);
        navigate('/profile');
      } else {
        setError('Invalid credentials. Please use the test credentials.');
      }
    }, 1500);
  };

  const autofillTestCredentials = () => {
    setEmail('test@devtinder.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-gradient-to-tr from-accent to-primary rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20 mb-5 relative group"
          >
            <Flame className="w-8 h-8 text-white relative z-10" fill="currentColor" />
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-text-primary"
          >
            Welcome back
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-text-secondary mt-2 text-sm"
          >
            Sign in to your DevTinder account
          </motion.p>
        </div>

        <motion.form 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          onSubmit={handleLogin} 
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary ml-1">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl pl-12 pr-4 py-3 text-text-primary transition-all shadow-sm outline-none font-medium"
                placeholder="developer@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl pl-12 pr-4 py-3 text-text-primary transition-all shadow-sm outline-none font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          {/* Testing Credentials Guide */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-3 mt-2">
             <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
             <div className="text-xs text-text-secondary flex-1">
               <p className="font-medium text-text-primary mb-1">Testing Credentials</p>
               <p>Email: <span className="font-mono bg-background px-1 py-0.5 rounded text-primary">test@devtinder.com</span></p>
               <p>Password: <span className="font-mono bg-background px-1 py-0.5 rounded text-primary">password123</span></p>
               <button 
                  type="button" 
                  onClick={autofillTestCredentials}
                  className="mt-2 text-primary hover:underline hover:text-primary-hover font-medium transition-colors"
                >
                 Click to autofill credentials
               </button>
             </div>
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
                    Sign In
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
          className="text-center text-sm text-text-secondary mt-8"
        >
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline hover:text-primary-hover transition-colors">
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
