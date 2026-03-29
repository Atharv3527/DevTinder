import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Github, MapPin, Briefcase, GraduationCap, Code2,
  Edit3, ExternalLink, Loader2, Star, Share2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
};

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export default function Profile() {
  const { user, dbUser, getToken } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${API}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.profile);
        setSkills(res.data.skills || []);
        setExperience(res.data.experience || []);
        setEducation(res.data.education || []);

        // Fetch GitHub repos if github_url is set
        if (res.data.profile?.github_url) {
          const username = res.data.profile.github_url.split('/').pop();
          try {
            const repoRes = await axios.get(
              `https://api.github.com/users/${username}/repos?sort=stars&per_page=6`
            );
            setRepos(repoRes.data);
          } catch {
            // silently fail GitHub fetch
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // No profile yet — prompt user to set up
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
          <Edit3 className="w-9 h-9 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Profile Not Set Up</h2>
          <p className="text-text-secondary mt-2 text-sm">Complete your profile to appear in the developer feed.</p>
        </div>
        <Link to="/profile-setup">
          <motion.span
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 cursor-pointer"
          >
            Set Up Profile
          </motion.span>
        </Link>
      </div>
    );
  }

  const displayName = dbUser?.full_name || user?.displayName || 'Developer';
  const avatarUrl = profile.profile_photo || user?.photoURL;
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto pb-16 space-y-5"
    >
      {/* Header Card */}
      <motion.div variants={sectionVariants} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-44 relative overflow-hidden">
          {profile.background_image ? (
            <img src={profile.background_image} alt="banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-accent to-primary opacity-70" />
          )}
          {/* Share button */}
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 bg-background/50 backdrop-blur-md p-2 rounded-full text-white border border-white/10 hover:bg-background/80 transition-colors"
            onClick={() => { navigator.clipboard.writeText(window.location.href); }}
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="px-6 pb-6 relative">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
            className="w-28 h-28 rounded-full -mt-14 border-4 border-surface shadow-lg overflow-hidden bg-zinc-800 flex items-center justify-center text-3xl font-bold text-primary"
          >
            {avatarUrl
              ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              : initials
            }
          </motion.div>

          <div className="mt-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{displayName}</h1>
              {profile.address && (
                <p className="text-sm text-text-secondary flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {profile.address}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Link to="/profile-setup">
                <motion.span
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary px-5 py-2 rounded-2xl font-semibold text-sm hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </motion.span>
              </Link>
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer">
                  <motion.span
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center w-9 h-9 bg-background border border-border rounded-2xl hover:border-primary/40 transition-colors cursor-pointer"
                  >
                    <Github className="w-4 h-4 text-text-secondary" />
                  </motion.span>
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-5 border-t border-border flex gap-8">
            <div className="cursor-default">
              <span className="block font-bold text-lg text-text-primary">{profile.total_connections || 0}</span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Connections</span>
            </div>
            <div className="cursor-default">
              <span className="block font-bold text-lg text-text-primary">{repos.length}</span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Repositories</span>
            </div>
            <div className="cursor-default">
              <span className="block font-bold text-lg text-text-primary">{skills.length}</span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Skills</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="md:col-span-2 space-y-5">

          {/* About */}
          {profile.about && (
            <motion.div variants={sectionVariants} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-3">About</h2>
              <p className="text-text-secondary text-sm leading-relaxed">{profile.about}</p>
            </motion.div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <motion.div variants={sectionVariants} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Experience
              </h2>
              <div className="space-y-5">
                {experience.map((exp, i) => (
                  <motion.div key={i} whileHover={{ x: 4 }} className="flex gap-4 cursor-default">
                    <div className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center font-bold text-primary flex-shrink-0 text-sm shadow-inner">
                      {exp.company?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm">{exp.role}</h3>
                      <p className="text-xs text-text-secondary">{exp.company}</p>
                      <p className="text-xs text-text-secondary/70 mt-0.5">{exp.duration}</p>
                      {exp.description && (
                        <p className="text-xs text-text-secondary mt-2 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* GitHub Repos */}
          {repos.length > 0 && (
            <motion.div variants={sectionVariants} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Github className="w-4 h-4 text-primary" /> Repositories
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {repos.map((repo) => (
                  <motion.a
                    key={repo.id}
                    href={repo.html_url} target="_blank" rel="noreferrer"
                    whileHover={{ scale: 1.01, x: 3 }}
                    className="flex items-center justify-between bg-background border border-border rounded-xl px-4 py-3 hover:border-primary/40 transition-all group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Code2 className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
                      <span className="text-sm font-medium text-text-primary truncate">{repo.name}</span>
                      {repo.language && (
                        <span className="hidden sm:block text-xs text-text-secondary/60 bg-background border border-border px-2 py-0.5 rounded-full">{repo.language}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <Star className="w-3 h-3" />{repo.stargazers_count}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-text-secondary group-hover:text-primary transition-colors" />
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Skills */}
          {skills.length > 0 && (
            <motion.div variants={sectionVariants} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" /> Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {skills.map((s, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: 1.08 }}
                      className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs font-medium text-text-primary hover:border-primary/50 hover:text-primary transition-colors cursor-default"
                    >
                      {s.skill_name}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <motion.div variants={sectionVariants} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" /> Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <motion.div key={i} whileHover={{ x: 4 }} className="flex gap-3 cursor-default">
                    <div className="w-9 h-9 bg-background border border-border rounded-xl flex items-center justify-center font-bold text-primary flex-shrink-0 text-sm shadow-inner">
                      {edu.college_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{edu.college_name}</h3>
                      <p className="text-xs text-text-secondary">{edu.degree}</p>
                      <p className="text-xs text-text-secondary/70 mt-0.5 flex items-center gap-2">
                        {edu.graduation_year}
                        {edu.grade && <span>· {edu.grade}</span>}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
