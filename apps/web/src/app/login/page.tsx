'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Music,
  Lock,
  Mail,
  User,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
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
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const body =
        mode === 'login'
          ? { email, password }
          : { email, password, fullName, username, phone: phone || undefined };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error?.message || 'Authentication failed');
      }

      login(data.data.token, data.data.user);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to authenticate demo user');
      }

      login(data.data.token, data.data.user);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 flex flex-col justify-between relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background glow ambiance */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-teal-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Music Platform</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-midnight-950 font-bold font-display text-xs">
            T5
          </div>
          <span className="font-bold text-sm text-white font-display">TALENT5</span>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="max-w-md w-full mx-auto my-8 relative z-10">
        <div className="p-8 rounded-3xl bg-midnight-900/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-black font-display text-white tracking-tight">
              {mode === 'login' ? 'Welcome Back to Talent5' : 'Join India’s Music Movement'}
            </h1>
            <p className="text-xs text-gray-400">
              {mode === 'login'
                ? 'Sign in to access your library, creator studio, or admin cockpit.'
                : 'Create an account to save playlists, vote in tournaments, and earn rewards.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-midnight-950 p-1 rounded-2xl border border-white/5 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                mode === 'login'
                  ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                mode === 'register'
                  ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-gray-300 font-medium block mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kabir Sen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-midnight-950 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 font-medium block mb-1">Desi Username</label>
                  <div className="relative">
                    <span className="text-amber-400 font-bold absolute left-3.5 top-1/2 -translate-y-1/2">@</span>
                    <input
                      type="text"
                      required
                      placeholder="kabirsen"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-midnight-950 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-gray-300 font-medium block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@talent5.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-midnight-950 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 font-medium block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-midnight-950 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full justify-center bg-amber-500 hover:bg-amber-400 text-midnight-950 font-black text-xs py-3 rounded-xl shadow-saffronGlow mt-2"
            >
              {loading ? (
                'Processing...'
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Quick Demo Logins Bar */}
          <div className="pt-4 border-t border-white/5 space-y-2.5">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
              Quick 1-Click Exploration Credentials:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@talent5.com', 'Talent5Admin2026!')}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[10px] text-rose-300 font-bold flex flex-col items-center justify-center text-center transition-all"
              >
                <Shield className="w-3.5 h-3.5 mb-0.5 text-rose-400" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('creator@talent5.com', 'Talent5Creator2026!')}
                className="p-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-[10px] text-teal-300 font-bold flex flex-col items-center justify-center text-center transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 mb-0.5 text-teal-400" />
                <span>Creator</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('listener@talent5.com', 'Talent5Listener2026!')}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-[10px] text-amber-300 font-bold flex flex-col items-center justify-center text-center transition-all"
              >
                <Music className="w-3.5 h-3.5 mb-0.5 text-amber-400" />
                <span>Listener</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-gray-400 z-10">
        © 2026 Talent5 Music Platform • Real Voices. Original Stories. Desi Talent.
      </div>
    </div>
  );
}
