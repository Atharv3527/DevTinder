import React, { useEffect, useState, memo } from 'react';

// --- SVG Logo Components for MNCs ---
const logoComponents = {
  google: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    color: '#4285F4',
    label: 'Google',
  },
  meta: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
        <path d="M2.048 12C2.048 6.48 6.48 2.048 12 2.048S21.952 6.48 21.952 12 17.52 21.952 12 21.952 2.048 17.52 2.048 12z" fill="#0082FB"/>
        <path d="M7.5 14.25c0 .828.672 1.5 1.5 1.5s1.5-.672 1.5-1.5V9.75c0-.414-.336-.75-.75-.75h-1.5c-.414 0-.75.336-.75.75v4.5zM13.5 14.25c0 .828.672 1.5 1.5 1.5s1.5-.672 1.5-1.5V9.75c0-.414-.336-.75-.75-.75h-1.5c-.414 0-.75.336-.75.75v4.5z" fill="white"/>
        <path d="M9 12h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: '#0082FB',
    label: 'Meta',
  },
  amazon: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.248-.1.33-.1.19 0 .285.1.285.3 0 .088-.06.208-.18.36-.12.148-.305.295-.555.44-1.81 1.155-3.797 1.932-5.963 2.328a28.152 28.152 0 01-5.14.48c-3.644 0-6.874-.8-9.69-2.4-.44-.248-.66-.504-.66-.764 0-.14.05-.25.15-.32zM6.3 15.888c0-.616.16-1.24.48-1.87.32-.628.8-1.176 1.44-1.642a14.7 14.7 0 012.25-1.19 30.9 30.9 0 012.71-.883c.26-.064.454-.133.58-.21V9.46c0-.57-.048-1.004-.143-1.3-.096-.297-.29-.49-.582-.58-.29-.092-.67-.138-1.14-.138-.628 0-1.19.14-1.685.418-.494.28-.766.63-.814 1.055l-.038.28c-.05.33-.2.575-.452.737-.25.16-.563.24-.938.24-.35 0-.633-.104-.848-.31-.214-.204-.32-.46-.32-.768 0-.616.235-1.16.706-1.63.47-.47 1.064-.825 1.783-1.066.72-.24 1.468-.36 2.247-.36 1.19 0 2.13.248 2.82.745.692.498 1.037 1.215 1.037 2.153v4.286c0 .426.14.724.42.895.28.17.597.256.95.256.1 0 .2-.006.3-.02v.802c-.46.132-.87.198-1.23.198-.548 0-.988-.148-1.32-.444-.332-.295-.516-.674-.55-1.137a6.03 6.03 0 01-1.614 1.244 4.204 4.204 0 01-2.076.534c-.697 0-1.28-.2-1.747-.6-.466-.4-.7-.927-.7-1.58zM8.46 15.5c0 .38.126.685.38.916.252.23.592.346 1.018.346.46 0 .87-.13 1.235-.39s.64-.598.83-1.013c.188-.414.28-.853.28-1.32v-.97c-.35.142-.74.28-1.17.417a11.6 11.6 0 00-1.152.44 2.73 2.73 0 00-.87.66c-.24.278-.36.6-.36.97v-.056h-.19zM16.1 7.76c.254-.296.566-.5.937-.614a3.8 3.8 0 011.18-.173c.38 0 .736.075 1.066.225a2.3 2.3 0 01.826.633c.23.27.366.578.41.923l.025.19c.03.26-.047.49-.23.688a.81.81 0 01-.62.298c-.283 0-.514-.09-.69-.27-.177-.18-.278-.413-.303-.7-.032-.4-.196-.714-.494-.94a1.56 1.56 0 00-.97-.338c-.37 0-.68.1-.927.3-.25.2-.374.46-.374.78 0 .265.076.48.23.648.153.167.37.312.65.434l1.03.43c.64.264 1.13.576 1.468.935.34.36.51.82.51 1.38 0 .42-.098.8-.294 1.136a2.36 2.36 0 01-.826.816c-.354.21-.77.33-1.248.36v.56c0 .22-.065.395-.196.526a.693.693 0 01-.514.196.678.678 0 01-.506-.196.693.693 0 01-.197-.527v-.57a3.8 3.8 0 01-1.23-.35 2.527 2.527 0 01-.887-.684 2.42 2.42 0 01-.484-1.04l-.04-.226c-.04-.27.04-.508.24-.714a.87.87 0 01.64-.31c.28 0 .514.09.703.27.188.18.3.43.334.75.06.44.237.78.534 1.02.297.24.677.36 1.14.36.406 0 .737-.1 1-.302.263-.2.394-.467.394-.8 0-.29-.09-.52-.27-.697-.18-.175-.472-.342-.876-.5l-.97-.393c-.624-.254-1.1-.567-1.43-.94-.33-.37-.493-.828-.493-1.37 0-.666.254-1.21.76-1.63z" fill="#FF9900"/>
      </svg>
    ),
    color: '#FF9900',
    label: 'Amazon',
  },
  apple: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="#999"/>
      </svg>
    ),
    color: '#999999',
    label: 'Apple',
  },
  netflix: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.622 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z" fill="#E50914"/>
      </svg>
    ),
    color: '#E50914',
    label: 'Netflix',
  },
  microsoft: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623" fill="#F25022"/>
        <path d="M12.623 0H24v11.372H12.623z" fill="#7FBA00"/>
        <path d="M0 12.623h11.377V24H0z" fill="#00A4EF"/>
        <path d="M12.623 12.623H24V24H12.623z" fill="#FFB900"/>
      </svg>
    ),
    color: '#F25022',
    label: 'Microsoft',
  },
  ibm: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M0 6.084h3.857v1.08H0zm0 1.862h3.857v1.08H0zm4.62 0h1.08v2.942H4.62zm1.843-1.862h3.857v1.08H6.463zm1.08 1.862h1.08v2.942H7.543zm0 0" fill="#1F70C1"/>
        <path d="M6.463 9.869h3.857v1.08H6.463zM0 9.869h3.857v1.08H0zM0 16.237h3.857v1.08H0zm0-1.862h3.857v1.08H0zm4.62 0h1.08v2.942H4.62zm1.843 1.862h3.857v1.08H6.463zm0-1.862h3.857v1.08H6.463zm1.08 0h1.08v2.942H7.543zM6.463 18.1h3.857v1.08H6.463zM0 18.1h3.857v1.08H0zM12.927 6.084h3.857v1.08h-3.857zm0 3.785h3.857v1.08h-3.857zm0 4.506h3.857v1.08h-3.857zm0 3.785h3.857v1.08h-3.857zm4.62-9.313h1.08v4.004h-1.08zm0 5.69h1.08v4.004h-1.08zm1.843-7.668h3.857v1.08h-3.857zm0 1.862h1.08v2.942h-1.08zm0 5.546h1.08v2.942h-1.08zm0-16.084h3.857v1.08h-3.857zm2.777 1.862h1.08v1.08h-1.08zm0 14.397h3.857v1.08h-3.857z" fill="#1F70C1"/>
      </svg>
    ),
    color: '#1F70C1',
    label: 'IBM',
  },
  oracle: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M16.412 4.412H7.588C3.396 4.412 0 7.808 0 12s3.396 7.588 7.588 7.588h8.824C20.604 19.588 24 16.192 24 12s-3.396-7.588-7.588-7.588zm-.353 11.647H7.941a4.059 4.059 0 010-8.118h8.118a4.059 4.059 0 010 8.118z" fill="#F80000"/>
      </svg>
    ),
    color: '#F80000',
    label: 'Oracle',
  },
  accenture: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M13.214 0L8.5 13.938l-2.786-7.91H2l4.786 13.034L9.5 24h7.5L24 0h-10.786z" fill="#A100FF"/>
      </svg>
    ),
    color: '#A100FF',
    label: 'Accenture',
  },
  cisco: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M11.927 5.31a.705.705 0 01.705.704v3.523a.705.705 0 01-1.41 0V6.014a.705.705 0 01.705-.704zM6.615 7.38a.705.705 0 01.706.705v1.762a.705.705 0 01-1.41 0V8.085a.705.705 0 01.704-.705zm10.77 0a.705.705 0 01.704.705v1.762a.705.705 0 01-1.41 0V8.085a.705.705 0 01.706-.705zM1.303 9.451a.705.705 0 01.705.705v1.762a.705.705 0 01-1.41 0v-1.762a.705.705 0 01.705-.705zm21.394 0a.705.705 0 01.705.705v1.762a.705.705 0 01-1.41 0v-1.762a.705.705 0 01.705-.705zm-16.082.352a.705.705 0 01.705.705v1.41a.705.705 0 01-1.41 0v-1.41a.705.705 0 01.705-.705zm10.77 0a.705.705 0 01.706.705v1.41a.705.705 0 01-1.41 0v-1.41a.705.705 0 01.704-.705zm-5.385-.352a.705.705 0 01.705.705v1.762a.705.705 0 01-1.41 0V10.156a.705.705 0 01.705-.705zM1.303 14.549a.705.705 0 01.705.705v1.762a.705.705 0 01-1.41 0v-1.762a.705.705 0 01.705-.705zm21.394 0a.705.705 0 01.705.705v1.762a.705.705 0 01-1.41 0v-1.762a.705.705 0 01.705-.705z" fill="#049FD9"/>
      </svg>
    ),
    color: '#049FD9',
    label: 'Cisco',
  },
  wipro: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <circle cx="12" cy="12" r="10" fill="#341C6E"/>
        <path d="M7 9l2 6 3-4 3 4 2-6" stroke="#FFD700" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#341C6E',
    label: 'Wipro',
  },
  hcl: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect width="24" height="24" rx="4" fill="#EE3124"/>
        <text x="2" y="17" fontSize="9" fontWeight="bold" fill="white" fontFamily="Arial">HCL</text>
      </svg>
    ),
    color: '#EE3124',
    label: 'HCL Tech',
  },
  capgemini: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect width="24" height="24" rx="4" fill="#0070CE"/>
        <circle cx="12" cy="12" r="6" fill="none" stroke="white" strokeWidth="2"/>
        <path d="M9 12 a3 3 0 1 1 6 0" stroke="white" strokeWidth="2" fill="none"/>
      </svg>
    ),
    color: '#0070CE',
    label: 'Capgemini',
  },
};

// --- Skills Configuration ---
const companiesConfig = [
  // Inner Orbit (FAANG core)
  { id: 'google',    orbitRadius: 110, size: 44, speed: 0.4,  iconType: 'google',    phaseShift: 0,                         glowColor: 'cyan',   label: 'Google' },
  { id: 'meta',      orbitRadius: 110, size: 42, speed: 0.4,  iconType: 'meta',      phaseShift: (2 * Math.PI) / 5,         glowColor: 'cyan',   label: 'Meta' },
  { id: 'amazon',    orbitRadius: 110, size: 42, speed: 0.4,  iconType: 'amazon',    phaseShift: (4 * Math.PI) / 5,         glowColor: 'cyan',   label: 'Amazon' },
  { id: 'apple',     orbitRadius: 110, size: 40, speed: 0.4,  iconType: 'apple',     phaseShift: (6 * Math.PI) / 5,         glowColor: 'cyan',   label: 'Apple' },
  { id: 'netflix',   orbitRadius: 110, size: 42, speed: 0.4,  iconType: 'netflix',   phaseShift: (8 * Math.PI) / 5,         glowColor: 'cyan',   label: 'Netflix' },
  // Outer Orbit (MNC tier)
  { id: 'microsoft', orbitRadius: 195, size: 46, speed: -0.25, iconType: 'microsoft', phaseShift: 0,                         glowColor: 'purple', label: 'Microsoft' },
  { id: 'ibm',       orbitRadius: 195, size: 42, speed: -0.25, iconType: 'ibm',       phaseShift: (2 * Math.PI) / 8,         glowColor: 'purple', label: 'IBM' },
  { id: 'oracle',    orbitRadius: 195, size: 42, speed: -0.25, iconType: 'oracle',    phaseShift: (4 * Math.PI) / 8,         glowColor: 'purple', label: 'Oracle' },
  { id: 'accenture', orbitRadius: 195, size: 42, speed: -0.25, iconType: 'accenture', phaseShift: (6 * Math.PI) / 8,         glowColor: 'purple', label: 'Accenture' },
  { id: 'cisco',     orbitRadius: 195, size: 40, speed: -0.25, iconType: 'cisco',     phaseShift: (8 * Math.PI) / 8,         glowColor: 'purple', label: 'Cisco' },
  { id: 'wipro',     orbitRadius: 195, size: 40, speed: -0.25, iconType: 'wipro',     phaseShift: (10 * Math.PI) / 8,        glowColor: 'purple', label: 'Wipro' },
  { id: 'hcl',       orbitRadius: 195, size: 40, speed: -0.25, iconType: 'hcl',       phaseShift: (12 * Math.PI) / 8,        glowColor: 'purple', label: 'HCL Tech' },
  { id: 'capgemini', orbitRadius: 195, size: 40, speed: -0.25, iconType: 'capgemini', phaseShift: (14 * Math.PI) / 8,        glowColor: 'purple', label: 'Capgemini' },
];

// --- Memoized Icon Component ---
const CompanyIcon = memo(({ type }) => {
  const entry = logoComponents[type];
  if (!entry) return null;
  const IconComponent = entry.component;
  return <IconComponent />;
});
CompanyIcon.displayName = 'CompanyIcon';

// --- Memoized Orbiting Company Component ---
const OrbitingCompany = memo(({ config, angle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { orbitRadius, size, iconType, label } = config;

  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;
  const iconColor = logoComponents[iconType]?.color;

  return (
    <div
      className="absolute top-1/2 left-1/2 transition-all duration-300 ease-out"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        zIndex: isHovered ? 20 : 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full h-full p-2 bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg"
        style={{
          boxShadow: isHovered
            ? `0 0 28px ${iconColor}50, 0 0 60px ${iconColor}20`
            : `0 0 8px ${iconColor}20`,
          transform: isHovered ? 'scale(1.3)' : 'scale(1)',
          border: isHovered ? `1px solid ${iconColor}60` : '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <CompanyIcon type={iconType} />
        {isHovered && (
          <div
            className="absolute whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-white pointer-events-none"
            style={{
              bottom: '-2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(10,10,20,0.95)',
              border: `1px solid ${iconColor}40`,
              boxShadow: `0 4px 16px ${iconColor}30`,
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
});
OrbitingCompany.displayName = 'OrbitingCompany';

// --- Glowing Orbit Path Component ---
const GlowingOrbitPath = memo(({ radius, glowColor = 'cyan', animationDelay = 0 }) => {
  const glowColors = {
    cyan: {
      primary: 'rgba(6, 182, 212, 0.35)',
      secondary: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.25)',
    },
    purple: {
      primary: 'rgba(147, 51, 234, 0.35)',
      secondary: 'rgba(147, 51, 234, 0.12)',
      border: 'rgba(147, 51, 234, 0.25)',
    },
  };

  const colors = glowColors[glowColor] || glowColors.cyan;

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, transparent 30%, ${colors.secondary} 70%, ${colors.primary} 100%)`,
          boxShadow: `0 0 50px ${colors.primary}, inset 0 0 50px ${colors.secondary}`,
          animation: 'pulse 4s ease-in-out infinite',
          animationDelay: `${animationDelay}s`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid ${colors.border}`,
          boxShadow: `inset 0 0 18px ${colors.secondary}`,
        }}
      />
    </div>
  );
});
GlowingOrbitPath.displayName = 'GlowingOrbitPath';

// --- Main Export ---
export default function OrbitingCompanies() {
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      setTime((prev) => prev + deltaTime);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const orbitPaths = [
    { radius: 110, glowColor: 'cyan',   delay: 0 },
    { radius: 195, glowColor: 'purple', delay: 1.5 },
  ];

  return (
    <div className="w-full flex justify-center overflow-hidden -my-8 md:my-0 pb-16 md:pb-0">
      <div
        className="relative flex items-center justify-center scale-[0.65] sm:scale-[0.80] md:scale-100 transition-transform duration-500 origin-center"
        style={{ width: '440px', height: '440px', flexShrink: 0 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(147,51,234,0.08) 0%, rgba(6,182,212,0.05) 50%, transparent 75%)',
          }}
        />
      </div>

      {/* Central code icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center z-10 relative shadow-2xl"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-purple-500/15 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="url(#codeGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#9333EA" />
              </linearGradient>
            </defs>
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
      </div>

      {/* Orbit paths */}
      {orbitPaths.map((op) => (
        <GlowingOrbitPath key={op.radius} radius={op.radius} glowColor={op.glowColor} animationDelay={op.delay} />
      ))}

      {/* Orbiting company icons */}
      {companiesConfig.map((config) => {
        const angle = time * config.speed + (config.phaseShift || 0);
        return <OrbitingCompany key={config.id} config={config} angle={angle} />;
      })}
      </div>
    </div>
  );
}
