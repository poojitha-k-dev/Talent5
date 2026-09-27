'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Mail,
} from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validate the token on mount
  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenError('No verification token provided in this link.');
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch(`/api/v1/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setTokenValid(true);
          setTargetEmail(data.email || '');
        } else {
          setTokenError(data.message || 'This reset link is invalid or has expired.');
        }
      } catch (err: any) {
        setTokenError('Could not verify reset link. Please check your internet connection.');
      } finally {
        setVerifying(false);
      }
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setSubmitError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please re-enter both carefully.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setResetSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isLongEnough = newPassword.length >= 6;

  return (
    <div className="min-h-screen bg-[#070a12] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-amber-500/15 via-saffron-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-rose-500/5 blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="px-6 py-6 flex items-center justify-between relative z-10 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-midnight-950 text-base shadow-saffronGlow transition-transform group-hover:scale-105">
            T5
          </div>
          <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-white via-gray-200 to-amber-300 bg-clip-text text-transparent">
            TALENT5
          </span>
        </Link>

        <Link
          href="/login"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-[#0f1626]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/80">
            
            {/* 1. Loading Verification State */}
            {verifying && (
              <div className="py-12 text-center space-y-4">
                <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <h2 className="text-base font-bold text-white">Verifying your link...</h2>
                <p className="text-xs text-gray-400">Authenticating secure reset token</p>
              </div>
            )}

            {/* 2. Token Error State */}
            {!verifying && tokenError && (
              <div className="py-6 text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Reset Link Invalid or Expired</h2>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {tokenError}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-midnight-950 font-bold text-xs shadow-saffronGlow transition-all"
                  >
                    <span>Request New Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* 3. Reset Success State */}
            {!verifying && resetSuccess && (
              <div className="py-6 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Password Updated!</h2>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    Your password has been successfully reset. You can now sign in to Talent5 with your new password.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-midnight-950 font-bold text-xs shadow-saffronGlow transition-all"
                  >
                    <span>Sign In to Talent5</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* 4. Active Password Reset Form */}
            {!verifying && tokenValid && !resetSuccess && (
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Reset Your Password</h1>
                    <p className="text-xs text-gray-400">
                      Enter and confirm your new password
                    </p>
                  </div>
                </div>

                {/* Email Verification Pill */}
                {targetEmail && (
                  <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="text-xs">
                      <span className="text-gray-400">Account: </span>
                      <strong className="text-white font-mono">{targetEmail}</strong>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {submitError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Password Field 1 */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all bg-white/[0.04] border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Field 2 */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Re-enter New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Re-type your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all bg-white/[0.04] border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Real-time Match Validation */}
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {isLongEnough ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-600 flex items-center justify-center text-[9px] text-gray-500">•</div>
                      )}
                      <span className={isLongEnough ? 'text-emerald-300' : 'text-gray-500'}>
                        At least 6 characters
                      </span>
                    </div>

                    {confirmPassword.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {passwordsMatch ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span className={passwordsMatch ? 'text-emerald-300' : 'text-rose-400'}>
                          {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={submitting || !passwordsMatch || !isLongEnough}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-midnight-950 font-bold text-xs shadow-saffronGlow transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Reset Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-[11px] text-gray-500 border-t border-white/5 relative z-10">
        © 2026 Talent5. Real Voices. Original Stories. Desi Talent.
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a12] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
