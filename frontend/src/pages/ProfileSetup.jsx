import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Github, MapPin, User, Code, Briefcase, GraduationCap,
  Plus, X, ChevronRight, ChevronLeft, Check, Loader2, ExternalLink, Star
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STEPS = [
  { id: 0, label: 'Media', icon: Upload },
  { id: 1, label: 'Basic Info', icon: MapPin },
  { id: 2, label: 'About', icon: User },
  { id: 3, label: 'Skills', icon: Code },
  { id: 4, label: 'Experience', icon: Briefcase },
  { id: 5, label: 'Education', icon: GraduationCap },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.2 } }),
};

function ImageUpload({ label, value, onChange, bucket }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const upload = async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPG/PNG files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be less than 5MB.');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      onChange(urlData.publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-text-primary mb-2">{label}</p>
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); upload(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        animate={{ borderColor: isDragging ? '#6366f1' : '#ffffff20', scale: isDragging ? 1.02 : 1 }}
        className="relative border-2 border-dashed rounded-2xl p-6 cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[140px] bg-background/50 hover:border-primary/50 transition-colors overflow-hidden"
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => upload(e.target.files[0])} />
        {uploading ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        ) : value ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center gap-2"
            >
              <img src={value} alt="preview" className="w-20 h-20 rounded-xl object-cover ring-2 ring-primary/40 shadow-lg" />
              <p className="text-xs text-green-400 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Uploaded</p>
            </motion.div>
          </AnimatePresence>
        ) : (
          <>
            <Upload className="w-8 h-8 text-text-secondary" />
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">Drag & drop or click to upload</p>
              <p className="text-xs text-text-secondary mt-1">JPG or PNG, max 5MB</p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function SkillInput({ skills, onChange }) {
  const [input, setInput] = useState('');
  const add = () => {
    const s = input.trim();
    if (s && !skills.includes(s)) onChange([...skills, s]);
    setInput('');
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
          className="flex-1 bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-text-primary outline-none text-sm transition-all"
          placeholder="e.g. React, TypeScript"
        />
        <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={add} className="px-4 bg-primary/10 border border-primary/30 text-primary rounded-2xl text-sm font-semibold hover:bg-primary/20 transition-colors">
          Add
        </motion.button>
      </div>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {skills.map((s) => (
            <motion.span
              key={s}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-xl text-sm font-medium"
            >
              {s}
              <button type="button" onClick={() => onChange(skills.filter((x) => x !== s))} className="hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExperienceForm({ items, onChange }) {
  const blank = { role: '', company: '', duration: '', description: '' };
  const update = (i, field, val) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {items.map((item, i) => (
          <motion.div
            key={i}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-background/60 border border-border rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">Experience {i + 1}</p>
              {items.length > 1 && (
                <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-text-secondary hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={item.role} onChange={(e) => update(i, 'role', e.target.value)} placeholder="Role / Title" className="input-field" />
              <input value={item.company} onChange={(e) => update(i, 'company', e.target.value)} placeholder="Company" className="input-field" />
              <input value={item.duration} onChange={(e) => update(i, 'duration', e.target.value)} placeholder="Duration (e.g. 2022–2024)" className="input-field col-span-2" />
            </div>
            <textarea value={item.description} onChange={(e) => update(i, 'description', e.target.value)} placeholder="Brief description..." rows={2} className="input-field w-full resize-none" />
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.button type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => onChange([...items, { ...blank }])}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-2xl py-3 text-text-secondary hover:border-primary/50 hover:text-primary transition-all text-sm font-medium">
        <Plus className="w-4 h-4" /> Add Experience
      </motion.button>
    </div>
  );
}

function EducationForm({ items, onChange }) {
  const blank = { degree: '', college_name: '', graduation_year: '', grade: '' };
  const update = (i, field, val) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {items.map((item, i) => (
          <motion.div
            key={i}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-background/60 border border-border rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">Education {i + 1}</p>
              {items.length > 1 && (
                <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-text-secondary hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={item.degree} onChange={(e) => update(i, 'degree', e.target.value)} placeholder="Degree" className="input-field" />
              <input value={item.college_name} onChange={(e) => update(i, 'college_name', e.target.value)} placeholder="College / University" className="input-field" />
              <input value={item.graduation_year} onChange={(e) => update(i, 'graduation_year', e.target.value)} placeholder="Graduation Year" className="input-field" type="number" />
              <input value={item.grade} onChange={(e) => update(i, 'grade', e.target.value)} placeholder="Grade / CGPA" className="input-field" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.button type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => onChange([...items, { ...blank }])}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-2xl py-3 text-text-secondary hover:border-primary/50 hover:text-primary transition-all text-sm font-medium">
        <Plus className="w-4 h-4" /> Add Education
      </motion.button>
    </div>
  );
}

export default function ProfileSetup() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Form state
  const [profilePhoto, setProfilePhoto] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [address, setAddress] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([{ role: '', company: '', duration: '', description: '' }]);
  const [education, setEducation] = useState([{ degree: '', college_name: '', graduation_year: '', grade: '' }]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const wordCount = about.trim().split(/\s+/).filter(Boolean).length;

  const fetchGithubRepos = async () => {
    if (!githubUrl) return;
    const username = githubUrl.split('/').pop().replace('@', '');
    setGithubLoading(true);
    try {
      const res = await axios.get(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`);
      setGithubRepos(res.data);
      showToast('GitHub repos loaded!');
    } catch {
      showToast('Could not fetch GitHub repos.');
    } finally {
      setGithubLoading(false);
    }
  };

  const goNext = () => {
    // Validation per step
    if (step === 1 && !githubUrl) { showToast('GitHub URL is required'); return; }
    if (step === 2 && wordCount < 50) { showToast(`About needs at least 50 words (${wordCount}/50)`); return; }
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) { setDirection(-1); setStep((s) => s - 1); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      await axios.post(
        `${API}/api/profile`,
        {
          profile: { profile_photo: profilePhoto, background_image: backgroundImage, address, about, github_url: githubUrl },
          skills,
          experience: experience.filter((e) => e.role && e.company),
          education: education.filter((e) => e.degree && e.college_name),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Profile saved successfully! 🎉');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      showToast('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const stepContent = [
    // Step 0: Media
    <div className="space-y-6">
      <ImageUpload label="Profile Photo" value={profilePhoto} onChange={setProfilePhoto} bucket="profile-images" />
      <ImageUpload label="Background / Banner Image" value={backgroundImage} onChange={setBackgroundImage} bucket="background-images" />
    </div>,

    // Step 1: Basic Info + GitHub
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-text-primary mb-1.5 block">Address</label>
        <div className="relative">
          <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-text-secondary" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="City, Country" className="input-field w-full pl-11" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-text-primary mb-1.5 block">GitHub URL *</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Github className="absolute left-4 top-3.5 w-4 h-4 text-text-secondary" />
            <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" className="input-field w-full pl-11" />
          </div>
          <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={fetchGithubRepos} disabled={githubLoading}
            className="px-4 bg-primary/10 border border-primary/30 text-primary rounded-2xl text-sm font-semibold hover:bg-primary/20 transition-colors flex items-center gap-2">
            {githubLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
            Fetch
          </motion.button>
        </div>
      </div>

      {githubRepos.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-sm font-medium text-text-primary">Top Repositories</p>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
            {githubRepos.map((repo, i) => (
              <motion.a
                key={repo.id}
                href={repo.html_url} target="_blank" rel="noreferrer"
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between bg-background border border-border rounded-xl px-4 py-2.5 hover:border-primary/40 transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Github className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium text-text-primary truncate">{repo.name}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs text-text-secondary"><Star className="w-3 h-3" />{repo.stargazers_count}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-text-secondary group-hover:text-primary transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </div>,

    // Step 2: About
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-text-primary">About You *</label>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${wordCount >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          {wordCount}/50 words
        </span>
      </div>
      <textarea
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        rows={8}
        placeholder="Tell the community about yourself — your passion for tech, what you're building, what you're looking to collaborate on..."
        className="input-field w-full resize-none text-sm leading-relaxed"
      />
      <p className="text-xs text-text-secondary">Minimum 50 words required. Be authentic — developers value real stories.</p>
    </div>,

    // Step 3: Skills
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">Add all your technical skills. Press Enter or comma to add.</p>
      <SkillInput skills={skills} onChange={setSkills} />
    </div>,

    // Step 4: Experience
    <ExperienceForm items={experience} onChange={setExperience} />,

    // Step 5: Education
    <EducationForm items={education} onChange={setEducation} />,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Set Up Your Profile</h1>
          <p className="text-text-secondary mt-2 text-sm">Let's make you stand out to the developer community</p>
        </motion.div>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0" />
          <motion.div
            className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-accent to-primary z-0"
            animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
          {STEPS.map((s) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1 z-10">
                <motion.div
                  animate={{
                    backgroundColor: done ? '#6366f1' : active ? '#6366f1' : '#1e1e2e',
                    borderColor: done || active ? '#6366f1' : '#ffffff15',
                    scale: active ? 1.15 : 1,
                  }}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                >
                  {done ? <Check className="w-4 h-4 text-white" /> : <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-text-secondary'}`} />}
                </motion.div>
                <p className={`text-xs font-medium ${active ? 'text-primary' : 'text-text-secondary'}`}>{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Step Content Card */}
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-2xl overflow-hidden relative min-h-[320px]">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
                {React.createElement(STEPS[step].icon, { className: 'w-5 h-5 text-primary' })}
                {STEPS[step].label}
              </h2>
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <motion.button
            whileHover={{ scale: step > 0 ? 1.02 : 1 }}
            whileTap={{ scale: step > 0 ? 0.97 : 1 }}
            onClick={goBack}
            disabled={step === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border text-text-secondary hover:text-text-primary hover:border-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </motion.button>

          {step < STEPS.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-accent to-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-accent to-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-sm disabled:opacity-80"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </motion.button>
          )}
        </div>

        {/* Skip link */}
        <p className="text-center text-xs text-text-secondary mt-4">
          <button onClick={() => navigate('/feed')} className="hover:text-primary transition-colors underline underline-offset-2">
            Skip for now
          </button>
        </p>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-2xl px-6 py-3 shadow-2xl text-sm font-medium text-text-primary z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
