'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft,
  LogIn,
  KeyRound,
  Terminal,
  Activity,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function AdminLoginGateInternal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleAuthenticate = async (authEmail?: string, authPass?: string) => {
    const targetEmail = (authEmail || email).trim();
    const targetPass = authPass || password;

    if (!targetEmail || !targetPass) {
      setError('Please provide administrator email and security token');
      return;
    }

    setError(null);
    setLoading(true);
    setStatusMessage('Verifying credentials & cryptographic signature...');

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

      setStatusMessage('Security clearance verified. Decrypting Command Center session...');
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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#06070B] text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Background Cybernetic Grid & Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #F43F5E 1px, transparent 1px),
              linear-gradient(to bottom, #F43F5E 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient radial glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px]" />

        {/* Vignette mask */}
        <div className="absolute inset-0 bg-radial-vignette opacity-80" />
      </div>

      {/* Main Terminal Card */}
      <div className="relative z-10 w-full max-w-xl">
        {/* Top Operational Telemetry Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-midnight-900/70 border border-white/5 backdrop-blur-md text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-gray-300 font-medium">Node: ap-south-1 (Mumbai)</span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-rose-400/80" />
              <span>AES-256 / SHA-256</span>
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:flex items-center gap-1 text-emerald-400/90">
              <Activity className="w-3 h-3" />
              <span>RBAC ENFORCED</span>
            </span>
          </div>
        </div>

        <div className="relative rounded-3xl bg-[#0B0D14]/90 border border-rose-500/20 shadow-[0_20px_70px_rgba(0,0,0,0.8),0_0_40px_rgba(244,63,94,0.12)] backdrop-blur-2xl p-6 sm:p-10 overflow-hidden">
          {/* Subtle Top Crimson Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-900/30 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
                <Shield className="w-8 h-8" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-bold text-black items-center justify-center">
                  !
                </span>
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[10px] font-mono uppercase tracking-widest mb-2">
              <Terminal className="w-3 h-3" />
              <span>Restricted Security Zone • Clearance Level 4+</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
              Talent<span className="text-rose-500">5</span> Command Center
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-md">
              Authorized administrative access for platform auditing, rights governance, anti-fraud enforcement, and financial operations.
            </p>
          </div>

          {/* Error / Status Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-300">Authentication Failure</p>
                <p className="leading-relaxed opacity-90">{error}</p>
              </div>
            </div>
          )}

          {statusMessage && !error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <p className="font-mono text-[11px]">{statusMessage}</p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAuthenticate();
            }}
            className="space-y-4"
          >
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
                Administrator Identifier (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@talent5.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                  Cryptographic Passphrase
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-[0_4px_20px_rgba(244,63,94,0.35)] border border-rose-400/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Command Session...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authorize & Enter Command Center</span>
                </>
              )}
            </button>
          </form>


          {/* Navigation Links */}
          <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Music Platform</span>
            </Link>

            <Link
              href="/login"
              className="hover:text-amber-400 transition-colors font-medium"
            >
              Go to Standard User / Creator Login →
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
          <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginGateInternal />
    </React.Suspense>
  );
}
