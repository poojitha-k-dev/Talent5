'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Activity,
  Cpu,
  Music,
  Coins,
  Sparkles,
  CheckCircle2,
  X,
  Server,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function WaveMark({ size = 26 }: { size?: number }) {
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

function AdminLoginGateInternal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';
  const { user, login } = useAuth();
  const isAdmin =
    Array.isArray(user?.roles) &&
    (user.roles.includes('ADMIN') ||
      user.roles.includes('SUPER_ADMIN') ||
      user.roles.includes('FINANCE') ||
      user.roles.includes('MODERATOR'));

  const [showSwitchForm, setShowSwitchForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fillDemoAdmin = () => {
    setEmail('admin@talent5.com');
    setPassword('Talent5Admin2026!');
    setError(null);
  };

  const handleAuthenticate = async (authEmail?: string, authPass?: string) => {
    const targetEmail = (authEmail || email).trim();
    const targetPass = authPass || password;

    if (!targetEmail || !targetPass) {
      setError('Please provide administrator email and security password');
      return;
    }

    setError(null);
    setLoading(true);
    setStatusMessage('Verifying credentials & RBAC clearance...');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Authorization failed. Access denied.');
      }

      const user = json.data.user;
      const isAdminUser =
        user?.roles?.includes('ADMIN') ||
        user?.roles?.includes('SUPER_ADMIN') ||
        user?.roles?.includes('FINANCE') ||
        user?.roles?.includes('MODERATOR');

      if (!isAdminUser) {
        throw new Error(
          'Access Denied: Your account does not possess administrative clearance (ADMIN, SUPER_ADMIN, FINANCE, MODERATOR).'
        );
      }

      setStatusMessage('Clearance verified. Launching Talent5 Command Center...');
      login(json.data.token, user);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-hidden bg-[#06070B] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Background Radial Glows & Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #F59E0B 1px, transparent 1px),
              linear-gradient(to bottom, #F59E0B 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] bg-rose-600/10 rounded-full blur-[170px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-500/5 rounded-full blur-[180px]" />
      </div>

      {/* 2-Column Executive Portal Container */}
      <div className="relative z-10 w-full max-w-6xl rounded-3xl bg-[#0B0D14]/85 border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Subtle Top Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-rose-500 to-teal-400" />

        {/* ─── LEFT COLUMN: EXECUTIVE INTELLIGENCE & TELEMETRY (7 COLS) ─── */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent relative">
          <div>
            {/* Top Brand Header & Operational Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/40 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                  <WaveMark size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-lg text-white tracking-tight">Talent<span className="text-amber-400">5</span></span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold tracking-wider">
                      Command Center
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono">Platform Governance & Enterprise Rights</p>
                </div>
              </div>

              {/* Node Health Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 text-[11px] font-mono text-gray-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>ap-south-1 (Mumbai)</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[11px] font-mono uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Privileged Operations Gateway</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white leading-tight">
                Enterprise Governance for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200">Desi Music & Creators</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl">
                Real-time command center for multi-lingual copyright moderation, automated royalty disbursements, bot velocity mitigation, and audition pipeline approvals.
              </p>
            </div>

            {/* 4 Live Platform Telemetry Metric Tiles */}
            <div className="grid grid-cols-2 gap-3.5 mb-8">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Catalog Integrity</span>
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-display">99.98%</div>
                <p className="text-[10px] text-gray-500 mt-1">Audio fingerprinting active</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-rose-500/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Anti-Fraud Shield</span>
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-display">&lt; 0.02%</div>
                <p className="text-[10px] text-gray-500 mt-1">Bot velocity threshold</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Protected Catalog</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-display">18,500+</div>
                <p className="text-[10px] text-gray-500 mt-1">Across 13 Indian languages</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Automated Ledger</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Coins className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-display">₹24.8L+</div>
                <p className="text-[10px] text-gray-500 mt-1">Instant creator settlements</p>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>RBAC Tier-4 Enforced • Dual-Layer Token Security</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              <span>TLS 1.3 / AES-256 GCM</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: GLASSMORPHISM LOGIN TERMINAL (5 COLS) ─── */}
        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-black/40 backdrop-blur-xl relative">
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-mono uppercase tracking-wider">
                <Shield className="w-3 h-3 text-rose-400" />
                <span>Privileged Authentication</span>
              </div>

              {/* 1-Click Quick Demo Pill */}
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono transition-all cursor-pointer"
                title="Autofill default admin credentials"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Autofill Admin</span>
              </button>
            </div>

            <h2 className="text-2xl font-display font-black text-white tracking-tight mb-1.5">
              Administrator Sign In
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Enter your privileged credentials to unlock the Talent5 Command Center.
            </p>

            {/* Active Session Detected Banner */}
            {isAdmin && !showSwitchForm ? (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 text-emerald-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Privileged Session Active</h3>
                      <p className="text-[11px] text-emerald-300 font-mono">
                        Clearance verified for {user?.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    You are currently authenticated as an administrator ({user?.roles?.join(', ')}). You can proceed straight to the Command Center.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push(redirectPath)}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
                  >
                    <span>Enter Command Center Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSwitchForm(true)}
                    className="text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
                  >
                    Sign in with a different administrator account →
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isAdmin && showSwitchForm && (
                  <button
                    type="button"
                    onClick={() => setShowSwitchForm(false)}
                    className="mb-4 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to active session ({user?.email})</span>
                  </button>
                )}

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start justify-between gap-2.5 animate-shake">
                <div className="flex items-start gap-2.5 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-300">Access Denied</p>
                    <p className="text-[11px] opacity-90 leading-relaxed">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-rose-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Status Message */}
            {statusMessage && !error && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <p className="font-mono text-[11px]">{statusMessage}</p>
              </div>
            )}

            {/* Login Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAuthenticate();
              }}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@talent5.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                    Admin Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-[0_4px_25px_rgba(244,63,94,0.35)] border border-white/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Authorize & Enter Command Center</span>
                  </>
                )}
              </button>
            </form>
            </>
          )}
          </div>

          {/* Navigation Links */}
          <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Music Platform</span>
            </Link>

            <Link
              href="/login"
              className="hover:text-amber-400 transition-colors font-medium"
            >
              Standard Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminLoginGate() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#06070B] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginGateInternal />
    </React.Suspense>
  );
}
