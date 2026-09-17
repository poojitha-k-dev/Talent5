'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, User, Lock, Mail, AtSign } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSwitchMode,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.data.token, data.data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins for Pair Programming & Testing
  const quickLogin = async (demoEmail: string, demoPass: string) => {
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
      if (!res.ok) throw new Error(data.message);
      login(data.data.token, data.data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Welcome Back to Talent5' : 'Create Your Talent5 Account'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {mode === 'register' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-midnight-800 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Username / Handle</label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="aarav_beats"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-midnight-800 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              placeholder="you@talent5.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-midnight-800 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-midnight-800 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" size="md" className="w-full" isLoading={loading}>
          {mode === 'login' ? 'Sign In to Talent5' : 'Create Free Account'}
        </Button>

        <div className="flex items-center justify-center pt-2 text-xs text-gray-400">
          {mode === 'login' ? (
            <p>
              New to Talent5?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('register')}
                className="text-amber-400 font-semibold hover:underline"
              >
                Sign up now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="text-amber-400 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        {/* Instant Seed Account Switcher — Creator & Listener only */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">
            Quick Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('creator@talent5.com', 'Talent5Creator2026!')}
              className="flex items-center justify-center gap-1.5 p-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-xl text-teal-300 text-xs font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creator</span>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('listener@talent5.com', 'Talent5Listener2026!')}
              className="flex items-center justify-center gap-1.5 p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-medium transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Listener</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
