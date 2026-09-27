'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowLeft,
  CheckCircle2,
  Check,
  KeyRound,
  RotateCcw,
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

// Official Google "G" Icon
function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.15 0 9.99 0 12s.45 3.85 1.25 5.43l4.03-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.28 2.64 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
      />
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
  const redirectPath = searchParams.get('redirect') || '/';
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
  const [forgotStep, setForgotStep] = useState<'email' | 'verify' | 'reset' | 'success'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // Detect Google OAuth callback tokens or errors
  useEffect(() => {
    const googleAuth = searchParams.get('google_auth');
    const tokenFromUrl = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
    }

    if (googleAuth === 'success' && tokenFromUrl) {
      fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${tokenFromUrl}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.data?.user) {
            login(tokenFromUrl, data.data.user);
            router.replace(redirectPath);
          }
        })
        .catch((err) => {
          console.error('[Talent5 OAuth] Failed to fetch session:', err);
          setError('Failed to establish session after Google sign-in.');
        });
    }
  }, [searchParams, login, redirectPath, router]);

  const openForgotModal = () => {
    setForgotStep('email');
    setForgotEmail(email || '');
    setVerificationCode('');
    setResetToken(null);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPw(false);
    setShowConfirmPw(false);
    setForgotError(null);
    setForgotSuccess(null);
    setIsGoogleUser(false);
    setShowForgotModal(true);
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    setIsGoogleUser(false);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (data.isGoogleAccount) {
        setIsGoogleUser(true);
        setForgotError(null);
        return;
      }
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send verification code.');
      }
      setForgotSuccess(data.message || 'Verification code sent to your email.');
      setForgotStep('verify');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: verificationCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code.');
      }
      setResetToken(data.resetToken || null);
      setForgotStep('reset');
    } catch (err: any) {
      setForgotError(err.message || 'Verification failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setForgotError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please re-enter both carefully.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken,
          email: forgotEmail.trim(),
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update password.');
      }
      setForgotSuccess(data.message);
      setForgotStep('success');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to update password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCompleteReset = () => {
    setEmail(forgotEmail);
    setPassword(newPassword);
    setShowForgotModal(false);
  };

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
        {/* Upper Back Navigation & Brand Badge */}
        <div className="flex items-center justify-between px-1 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-amber-400 transition-all group shadow-sm backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-amber-400" />
            <span>Back to Landing Page</span>
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

          {/* ─── GOOGLE OAUTH ONE-TAP SIGN-IN BUTTON ─── */}
          <div className="mb-4">
            <a
              href={`/api/v1/auth/google?redirect=${encodeURIComponent(redirectPath)}`}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all bg-white hover:bg-gray-100 text-gray-900 border border-white/20 shadow-md hover:shadow-lg cursor-pointer group"
            >
              <GoogleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
            </a>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-3 bg-[#0f0c1a] text-[10px] uppercase tracking-wider text-gray-400 font-mono">
                or continue with email
              </span>
            </div>
          </div>

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
                    onClick={openForgotModal}
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

      {/* ─── FORGOT PASSWORD INTERACTIVE MULTI-STEP MODAL ─── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0F0C1B] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-5 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    {forgotStep === 'email' && 'Reset Password'}
                    {forgotStep === 'verify' && 'Verify Your Identity'}
                    {forgotStep === 'reset' && 'Re-enter & Reset Password'}
                    {forgotStep === 'success' && 'Password Updated!'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {forgotStep === 'email' && 'Step 1 of 3: Verification Email'}
                    {forgotStep === 'verify' && 'Step 2 of 3: Enter 6-Digit Code'}
                    {forgotStep === 'reset' && 'Step 3 of 3: Dual Password Verification'}
                    {forgotStep === 'success' && 'Ready to sign in'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* ─── STEP 1: ASK FOR EMAIL (OR SHOW GOOGLE SIGN-IN PROMPT) ─── */}
            {forgotStep === 'email' && (
              isGoogleUser ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <GoogleIcon className="w-4 h-4 flex-shrink-0" />
                    <span>Google Account Detected</span>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    This account was created with <strong className="text-white">Google Sign-In</strong> and does not have a Talent5 password. Please continue with Google to sign in.
                  </p>
                  <a
                    href={`/api/v1/auth/google?redirect=${encodeURIComponent(redirectPath)}`}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all bg-white hover:bg-gray-100 text-gray-900 shadow-md cursor-pointer"
                  >
                    <GoogleIcon className="w-4 h-4 flex-shrink-0" />
                    <span>Continue with Google</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsGoogleUser(false);
                      setForgotError(null);
                    }}
                    className="text-[11px] text-gray-400 hover:text-white underline block text-center w-full pt-1"
                  >
                    ← Try a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendVerification} className="space-y-4">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Please confirm your registered email address. We will send a secure 6-digit verification code to reverify your account.
                  </p>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all bg-white/[0.04] border border-white/10"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-midnight-950 font-bold text-xs shadow-saffronGlow transition-all flex items-center gap-1.5"
                    >
                      {forgotLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )
            )}

            {/* ─── STEP 2: ENTER CODE FROM GMAIL ─── */}
            {forgotStep === 'verify' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Mail className="w-4 h-4" />
                    <span>Check Your Email Inbox</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    We sent a 6-digit verification code to <strong className="text-white font-mono">{forgotEmail}</strong>.
                  </p>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    📌 <strong>Can&apos;t find the email?</strong> Please check your <strong>Spam / Junk</strong> folder or <strong>Updates</strong> tab. If it is in Spam, click <em>&quot;Report as not spam&quot;</em>.
                  </p>
                </div>

                {forgotSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="• • • • • •"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.5em] py-3.5 rounded-xl text-xl font-mono text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all bg-white/[0.04] border border-white/10"
                  />
                  <p className="text-[10px] text-gray-500 text-center mt-1">
                    Enter the 6 numbers from the verification email
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('email');
                      setForgotError(null);
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    ← Change email
                  </button>

                  <button
                    type="button"
                    disabled={forgotLoading}
                    onClick={handleSendVerification}
                    className="text-xs text-amber-400/90 hover:text-amber-300 underline disabled:opacity-50 cursor-pointer"
                  >
                    Resend Code
                  </button>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-midnight-950 font-bold text-xs shadow-saffronGlow transition-all"
                  >
                    {forgotLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Verify OTP →'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ─── STEP 3: RE-ENTER PASSWORD TWO TIMES (DUAL VERIFICATION) ─── */}
            {forgotStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Please enter your new password <strong className="text-amber-400 font-semibold">two times</strong> to reverify and guarantee accuracy.
                </p>

                {/* 1st Entry: New Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    1. New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all bg-white/[0.04] border border-white/10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2nd Entry: Re-enter Password to Reverify */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      2. Re-enter Password (Reverify)
                    </label>
                    {confirmPassword.length > 0 && (
                      <span
                        className={`text-[10px] font-bold flex items-center gap-1 ${
                          newPassword === confirmPassword ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {newPassword === confirmPassword ? (
                          <>
                            <Check className="w-3 h-3" /> Passwords match
                          </>
                        ) : (
                          'Passwords do not match'
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      required
                      placeholder="Re-enter same password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all bg-white/[0.04] border font-mono ${
                        confirmPassword.length > 0
                          ? newPassword === confirmPassword
                            ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'
                            : 'border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40'
                          : 'border-white/10 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('verify');
                      setForgotError(null);
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={forgotLoading || !newPassword || newPassword !== confirmPassword}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-midnight-950 font-bold text-xs shadow-saffronGlow transition-all flex items-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ─── STEP 4: SUCCESS STATE ─── */}
            {forgotStep === 'success' && (
              <div className="text-center py-4 space-y-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-bold font-display text-white">Password Updated Successfully!</h4>
                  <p className="text-xs text-gray-300 max-w-xs mx-auto">
                    Your new password has been verified and saved to your account.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCompleteReset}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-midnight-950 font-bold text-xs shadow-saffronGlow transition-all"
                  >
                    Sign In with New Password →
                  </button>
                </div>
              </div>
            )}
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
