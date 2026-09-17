'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Music2,
  LogIn,
  Shield,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  X,
  Radio,
  Headphones,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function WaveMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <rect x="2" y="9" width="3" height="6" rx="1.5" fill="currentColor" opacity="0.85" />
      <rect x="7" y="5" width="3" height="14" rx="1.5" fill="currentColor" />
      <rect x="12" y="2" width="3" height="20" rx="1.5" fill="currentColor" />
      <rect x="17" y="6" width="3" height="12" rx="1.5" fill="currentColor" />
      <rect x="22" y="10" width="3" height="4" rx="1.5" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

// Live Equalizer Visualizer Bars
function EqualizerVisualizer() {
  return (
    <div className="flex items-end gap-1 h-5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
      <span className="w-1 bg-amber-400 rounded-full animate-[wavePulse_1.1s_ease-in-out_infinite]" />
      <span className="w-1 bg-amber-500 rounded-full animate-[wavePulse_1.4s_ease-in-out_infinite_0.2s]" />
      <span className="w-1 bg-orange-400 rounded-full animate-[wavePulse_0.9s_ease-in-out_infinite_0.4s]" />
      <span className="w-1 bg-rose-400 rounded-full animate-[wavePulse_1.3s_ease-in-out_infinite_0.1s]" />
    </div>
  );
}

interface DemoProfile {
  id: string;
  role: 'LISTENER' | 'CREATOR' | 'ADMIN';
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  email: string;
  pass: string;
  description: string;
}

const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 'listener',
    role: 'LISTENER',
    title: 'Listener (User)',
    badge: 'Listener',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: Headphones,
    email: 'listener@talent5.com',
    pass: 'Talent5Listener2026!',
    description: 'Explore Desi tracks, like songs, build playlists & follow artists.',
  },
  {
    id: 'creator',
    role: 'CREATOR',
    title: 'Desi Creator',
    badge: 'Creator Studio',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    icon: Sparkles,
    email: 'creator@talent5.com',
    pass: 'Talent5Creator2026!',
    description: 'Upload tracks, manage rights, track valid likes & earn rewards.',
  },
  {
    id: 'admin',
    role: 'ADMIN',
    title: 'Commander',
    badge: 'Command Center',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: Shield,
    email: 'admin@talent5.com',
    pass: 'Talent5Admin2026!',
    description: 'Manage creator auditions, rights catalog, payouts & fraud cockpit.',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/home';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-400' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-400' };
  }, [password]);

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setUsername('');
    setSelectedDemo(null);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const body =
        mode === 'login'
          ? { email, password }
          : { email, password, fullName, username };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.data.token, data.data.user);

      // Smart redirect: if admin logs in, suggest admin portal if intended
      const userRoles = data.data.user?.roles || [];
      const isAdminRole = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');

      if (isAdminRole && redirectPath === '/home' && selectedDemo === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (profile: DemoProfile, autoSubmit: boolean = false) => {
    setSelectedDemo(profile.id);
    setEmail(profile.email);
    setPassword(profile.pass);
    setError(null);

    if (autoSubmit) {
      setLoading(true);
      fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, password: profile.pass }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) throw new Error(data.message);
          login(data.data.token, data.data.user);
          if (profile.role === 'ADMIN') {
            router.push('/admin');
          } else {
            router.push(redirectPath);
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  const inpStyles: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-x-hidden relative"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #150E28 0%, #080611 60%, #040308 100%)',
      }}
    >
      {/* ─── AMBIENT BACKGROUND GLOWS & GRAPHICS ─── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Warm Golden Glow on Top Right */}
        <div
          className="absolute top-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full blur-[140px] opacity-25"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, #F97316 100%)' }}
        />

        {/* Deep Mystical Violet on Left */}
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-20"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, #4338CA 100%)' }}
        />

        {/* Peacock Teal Subtle Hue */}
        <div
          className="absolute top-[40%] left-[25%] w-[380px] h-[380px] rounded-full blur-[120px] opacity-10"
          style={{ background: '#14B8A6' }}
        />

        {/* Floating Sargam Notes (Desi Musical Motifs) */}
        {[
          { text: 'सा', x: '5%', y: '15%', delay: '0s' },
          { text: 'रे', x: '8%', y: '50%', delay: '1s' },
          { text: 'ग', x: '4%', y: '80%', delay: '2s' },
          { text: 'म', x: '92%', y: '20%', delay: '1.5s' },
          { text: 'प', x: '88%', y: '55%', delay: '0.5s' },
          { text: 'ध', x: '91%', y: '82%', delay: '2.5s' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="absolute font-serif font-black text-4xl sm:text-5xl select-none opacity-[0.04] text-amber-400"
            style={{
              left: item.x,
              top: item.y,
              animation: 'pulseSubtle 6s ease-in-out infinite',
              animationDelay: item.delay,
            }}
          >
            {item.text}
          </div>
        ))}

        {/* Floating musical symbols */}
        <div className="absolute left-[15%] top-[25%] text-5xl select-none opacity-[0.04] text-amber-500 font-serif">
          ♪
        </div>
        <div className="absolute right-[18%] bottom-[20%] text-6xl select-none opacity-[0.04] text-orange-500 font-serif">
          ♫
        </div>
      </div>

      {/* ─── MAIN AUTH CONTAINER ─── */}
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Upper Brand Badge */}
        <div className="flex items-center justify-between px-2 mb-3">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <span className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-amber-400">
              <WaveMark size={14} />
            </span>
            <span className="font-semibold tracking-wide">Talent5 Desi Music</span>
          </Link>

          <EqualizerVisualizer />
        </div>

        {/* Card Box */}
        <div
          className="w-full rounded-3xl p-6 sm:p-8 backdrop-blur-2xl transition-all"
          style={{
            background: 'rgba(15, 12, 26, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow:
              '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 35px rgba(245, 158, 11, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Card Top Title & Icon */}
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-black shadow-[0_8px_25px_rgba(245,158,11,0.35)]"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
              }}
            >
              <WaveMark size={28} />
            </div>

            <h1 className="text-2xl font-display font-black tracking-tight text-white">
              {mode === 'login' ? 'Welcome Back' : 'Join Talent5'}
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
              {mode === 'login'
                ? 'Sign in to stream original Desi compositions, support creators & vote.'
                : 'Create your account to unlock high-fidelity Indian music and community rewards.'}
            </p>
          </div>

          {/* Sliding Tab Switcher */}
          <div
            className="relative flex p-1 rounded-xl mb-6"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 ease-out shadow-[0_2px_10px_rgba(245,158,11,0.4)]"
              style={{
                width: 'calc(50% - 4px)',
                left: mode === 'login' ? '4px' : 'calc(50%)',
              }}
            />
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="relative flex-1 py-2 text-xs font-bold rounded-lg transition-colors z-10"
              style={{ color: mode === 'login' ? '#090510' : 'rgba(255, 255, 255, 0.5)' }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className="relative flex-1 py-2 text-xs font-bold rounded-lg transition-colors z-10"
              style={{ color: mode === 'register' ? '#090510' : 'rgba(255, 255, 255, 0.5)' }}
            >
              Create Account
            </button>
          </div>

          {/* 1-Click Demo Profile Switcher (Only in Login Mode) */}
          {mode === 'login' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Quick Demo Accounts
                </span>
                <span className="text-[10px] text-gray-500">Click to autofill or 1-tap login</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {DEMO_PROFILES.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedDemo === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectDemo(p, false)}
                      className={`relative flex flex-col items-center text-center p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
                          p.role === 'ADMIN'
                            ? 'bg-rose-500/20 text-rose-300'
                            : p.role === 'CREATOR'
                            ? 'bg-teal-500/20 text-teal-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-white leading-none mb-1">
                        {p.title.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {p.role === 'ADMIN' ? 'Control' : p.role === 'CREATOR' ? 'Studio' : 'Music'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Login Button for Selected Demo */}
              {selectedDemo && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="overflow-hidden mr-2">
                    <p className="font-semibold text-amber-300 text-[11px] truncate">
                      {DEMO_PROFILES.find((p) => p.id === selectedDemo)?.title}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate font-mono">{email}</p>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      const prof = DEMO_PROFILES.find((p) => p.id === selectedDemo);
                      if (prof) handleSelectDemo(prof, true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] flex items-center gap-1 transition-all flex-shrink-0 shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                  >
                    <LogIn className="w-3 h-3" />
                    Instant Log In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {/* Register-Only Fields */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arun Chillara"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (!username && e.target.value) {
                          setUsername(
                            e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, '')
                              .replace(/[^a-z0-9]/g, '')
                          );
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all"
                      style={inpStyles}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Username
                    </label>
                    {username && (
                      <span className="text-[10px] font-mono text-amber-400">
                        talent5.com/@{username}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="arunbeats"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))
                      }
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all font-mono"
                      style={inpStyles}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="you@talent5.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedDemo(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all"
                  style={inpStyles}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'login' ? (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-amber-400/90 hover:text-amber-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-500">Min. 6 characters</span>
                )}
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all font-mono"
                  style={inpStyles}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter in Register Mode */}
              {mode === 'register' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">Password strength:</span>
                    <span className="font-semibold text-gray-300">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Remember Me & Terms Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-600 bg-white/5 text-amber-500 focus:ring-amber-400/40"
                />
                <span className="text-[11px] text-gray-400">Keep me signed in</span>
              </label>

              {mode === 'register' && (
                <span className="text-[10px] text-gray-500">
                  By joining you accept our Terms
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs tracking-wide text-black bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-[0_4px_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{mode === 'login' ? 'Sign In to Talent5' : 'Create My Free Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Switch Mode Footer */}
          <p className="text-center text-xs mt-5 text-gray-400">
            {mode === 'login' ? (
              <>
                New to Talent5?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                >
                  Create free account →
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                >
                  Sign in here →
                </button>
              </>
            )}
          </p>
        </div>

        {/* ─── DIRECT ADMIN COMMAND CENTER ENTRY BRIDGE ─── */}
        <div className="mt-4 p-3 rounded-2xl bg-midnight-950/80 border border-rose-500/20 backdrop-blur-md flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-500/10 text-rose-400">
              <Shield className="w-3.5 h-3.5" />
            </span>
            <span>Platform Administrator?</span>
          </div>
          <Link
            href="/admin/login"
            className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Command Center Gateway</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1"
          >
            ← Return to Talent5 Landing
          </Link>
        </div>
      </div>

      {/* ─── FORGOT PASSWORD ASSISTANCE MODAL ─── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-[#0F0C1B] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-display font-bold text-base text-white">
                  Talent5 Credentials Recovery
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
              <p>
                In the development & staging environment, default credentials are pre-seeded for all roles:
              </p>

              <div className="p-3 rounded-xl bg-black/50 border border-white/5 font-mono space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Listener:</span>
                  <span className="text-amber-300">listener@talent5.com / Talent5Listener2026!</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Creator:</span>
                  <span className="text-teal-300">creator@talent5.com / Talent5Creator2026!</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Admin:</span>
                  <span className="text-rose-300">admin@talent5.com / Talent5Admin2026!</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400">
                For custom accounts, credentials can be reset by a platform administrator inside the Command Center, or by re-registering with your chosen email address.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  handleSelectDemo(DEMO_PROFILES[0], false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
              >
                Prefill Listener Account
              </button>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#06040F]">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
