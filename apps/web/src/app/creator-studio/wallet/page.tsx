'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@talent5/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function CreatorWalletPage() {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'BANK_TRANSFER'>('UPI');
  const [accountRef, setAccountRef] = useState<string>('');
  const [submittingPayout, setSubmittingPayout] = useState<boolean>(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const fetchWallet = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/wallet', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Wallet error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [token]);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPayoutError(null);
    setSubmittingPayout(true);

    try {
      const res = await fetch('/api/v1/wallet/payout-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          paymentMethod,
          accountRef,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Payout request failed');
      }

      alert(json.message || 'Payout requested successfully!');
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setAccountRef('');
      fetchWallet();
    } catch (err: any) {
      setPayoutError(err.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmittingPayout(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Wallet className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold font-display text-white">Creator Wallet</h2>
        <p className="text-sm text-gray-400">Please sign in to view your balances and payouts.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-amber-400">Loading Wallet Ledger...</p>
      </div>
    );
  }

  const wallet = data?.wallet || {
    availableBalanceINR: 0,
    pendingBalanceINR: 0,
    approvedBalanceINR: 0,
    paidBalanceINR: 0,
    totalEarnedINR: 0,
  };
  const transactions = data?.transactions || [];
  const payoutRequests = data?.payoutRequests || [];
  const rule = data?.rule;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        href="/creator-studio"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Creator Studio
      </Link>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Wallet className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Validated Engagement Economics
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Creator Wallet</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Transparent revenue engine paying ₹{rule?.rewardPerValidLikeINR?.toFixed(2) || '0.10'} per validated human like.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsWithdrawModalOpen(true)}
          className="gap-2 font-bold text-midnight-950"
        >
          <ArrowUpRight className="w-4 h-4" /> Withdraw Earnings
        </Button>
      </div>

      {/* Balances Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 space-y-1">
          <span className="text-xs text-gray-400">Available to Withdraw</span>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-amber-400">
            {formatINR(wallet.availableBalanceINR)}
          </p>
          <p className="text-[11px] text-gray-500">Min. payout: ₹{rule?.minimumPayoutINR || 500}</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Pending Withdrawals</span>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {formatINR(wallet.pendingBalanceINR)}
          </p>
          <p className="text-[11px] text-gray-500">Under finance verification</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Paid to Date</span>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-teal-300">
            {formatINR(wallet.paidBalanceINR)}
          </p>
          <p className="text-[11px] text-gray-500">Settled via UPI / Bank</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Lifetime Total Earned</span>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {formatINR(wallet.totalEarnedINR)}
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold">100% Creator Retained</p>
        </div>
      </div>

      {/* Payout Requests Pipeline */}
      {payoutRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-display text-white">Withdrawal History</h2>
          <div className="divide-y divide-white/5 bg-midnight-900/50 rounded-2xl p-3 border border-white/5">
            {payoutRequests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between p-3 text-xs">
                <div>
                  <p className="font-semibold text-white">
                    {formatINR(parseFloat(req.amountINR))} via {req.paymentMethod}
                  </p>
                  <p className="text-gray-400 text-[11px]">
                    To: {req.accountRef} • {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : req.status === 'REQUESTED'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Ledger Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display text-white">Reward & Transaction Ledger</h2>
        <div className="divide-y divide-white/5 bg-midnight-900/50 rounded-2xl p-2 border border-white/5">
          {transactions.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No transactions recorded yet.</p>
          ) : (
            transactions.map((tx: any) => {
              const isCredit = parseFloat(tx.amountINR) > 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isCredit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{tx.notes || tx.type}</p>
                      <p className="text-gray-500 text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString()} • {tx.type}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold font-mono text-sm ${
                        isCredit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCredit ? '+' : ''}
                      {formatINR(parseFloat(tx.amountINR))}
                    </p>
                    <span className="text-[10px] text-gray-500 uppercase">{tx.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Request Payout Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Creator Earnings"
        maxWidth="md"
      >
        <form onSubmit={handleRequestPayout} className="space-y-4">
          {payoutError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{payoutError}</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-midnight-800 border border-white/10 space-y-1">
            <span className="text-xs text-gray-400">Available Balance</span>
            <p className="text-2xl font-bold font-display text-amber-400">
              {formatINR(wallet.availableBalanceINR)}
            </p>
            <p className="text-[11px] text-gray-500">
              Minimum payout threshold: ₹{rule?.minimumPayoutINR?.toFixed(2) || '500.00'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Withdrawal Amount (INR)
            </label>
            <input
              type="number"
              required
              min={rule?.minimumPayoutINR || 500}
              max={wallet.availableBalanceINR}
              step="0.01"
              placeholder={`Min. ${rule?.minimumPayoutINR || 500}`}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-midnight-900 text-gray-400 border-white/10'
                }`}
              >
                UPI ID (Instant VPA)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-midnight-900 text-gray-400 border-white/10'
                }`}
              >
                NEFT / IMPS Bank
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              {paymentMethod === 'UPI' ? 'UPI Virtual Payment Address (VPA)' : 'Bank Account Number & IFSC'}
            </label>
            <input
              type="text"
              required
              placeholder={paymentMethod === 'UPI' ? 'e.g. yourname@okhdfcbank' : 'A/C 1234567890, IFSC HDFC0001234'}
              value={accountRef}
              onChange={(e) => setAccountRef(e.target.value)}
              className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold text-midnight-950"
            disabled={
              wallet.availableBalanceINR < (rule?.minimumPayoutINR || 500) ||
              submittingPayout
            }
            isLoading={submittingPayout}
          >
            Submit Withdrawal Request
          </Button>
        </form>
      </Modal>
    </div>
  );
}
