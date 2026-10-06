'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Sliders,
  History,
  AlertTriangle,
  RefreshCw,
  X,
  CheckCircle2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CreatorWallet {
  id: string;
  creator_id: string;
  available_balance_inr: string | number;
  pending_balance_inr: string | number;
  approved_balance_inr: string | number;
  paid_balance_inr: string | number;
  total_earned_inr: string | number;
  stageName: string;
  category: string;
  creatorName: string;
  creatorEmail: string;
  txCount: string | number;
}

interface WalletTx {
  id: string;
  type: string;
  amount_inr: string | number;
  status: string;
  notes: string;
  created_at: string;
}

interface RewardRules {
  reward_per_valid_like_inr: string | number;
  minimum_payout_inr: string | number;
  maximum_monthly_reward_inr: string | number;
  bonus_rate: string | number;
}

export default function AdminWalletsPage() {
  const { user, token: authToken, isLoading: authLoading } = useAuth();
  const token = authToken || (typeof window !== 'undefined' ? (localStorage.getItem('talent5_token') || localStorage.getItem('token')) : null);

  const [wallets, setWallets] = useState<CreatorWallet[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [rewardRules, setRewardRules] = useState<RewardRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(wallets.length / PAGE_SIZE));
  const paginatedWallets = wallets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
  };

  // Modals
  const [selectedWallet, setSelectedWallet] = useState<CreatorWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const [adjustingWallet, setAdjustingWallet] = useState<CreatorWallet | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    type: 'BONUS',
    amountInr: 100,
    notes: '',
  });
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Policy rules editing
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [rulesForm, setRulesForm] = useState({
    rewardPerValidLikeInr: 0.1,
    minimumPayoutInr: 500,
    maximumMonthlyRewardInr: 100000,
    bonusRate: 0.05,
  });

  const fetchWallets = async () => {
    const t = token;
    if (!t) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/wallets?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.success) {
        setWallets(data.data.wallets);
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error('Failed to load wallets', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardRules = async () => {
    const t = token;
    if (!t) return;
    try {
      const res = await fetch('/api/v1/admin/reward-rules', {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRewardRules(data.data);
        setRulesForm({
          rewardPerValidLikeInr: parseFloat(data.data.reward_per_valid_like_inr),
          minimumPayoutInr: parseFloat(data.data.minimum_payout_inr),
          maximumMonthlyRewardInr: parseFloat(data.data.maximum_monthly_reward_inr),
          bonusRate: parseFloat(data.data.bonus_rate),
        });
      }
    } catch (err) {
      console.error('Failed to load reward rules', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWallets();
      fetchRewardRules();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [token, authLoading]);

  const viewTransactions = async (wallet: CreatorWallet) => {
    setSelectedWallet(wallet);
    setIsTxModalOpen(true);
    try {
      const res = await fetch(`/api/v1/admin/wallets/${wallet.id}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingWallet) return;
    setIsAdjusting(true);
    try {
      const res = await fetch(`/api/v1/admin/wallets/${adjustingWallet.id}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adjustForm),
      });
      const data = await res.json();
      if (data.success) {
        alert('Wallet balance adjusted successfully!');
        setAdjustingWallet(null);
        setAdjustForm({ type: 'BONUS', amountInr: 100, notes: '' });
        fetchWallets();
      } else {
        alert(data.message || 'Failed to adjust wallet');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting adjustment');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/reward-rules', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rulesForm),
      });
      const data = await res.json();
      if (data.success) {
        alert('Reward economy policy updated successfully!');
        setIsEditingRules(false);
        fetchRewardRules();
      }
    } catch (err) {
      console.error('Failed to update reward rules', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-midnight-900/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Creator Wallets & Dynamic Economy Controls
            </h1>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Live creator balance ledgers, discretionary manual credits/penalties, and platform-wide reward rate policy management.
          </p>
        </div>

        <button
          onClick={() => setIsEditingRules(!isEditingRules)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>{isEditingRules ? 'Close Policy Editor' : 'Tune Reward Rules'}</span>
        </button>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5">
            <span className="text-[11px] font-mono text-gray-400 uppercase">Creator Wallets</span>
            <div className="text-xl font-bold font-display text-white">{stats.totalWallets}</div>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5">
            <span className="text-[11px] font-mono text-emerald-400 uppercase">Available Balances</span>
            <div className="text-xl font-bold font-display text-emerald-300">
              ₹{Number(stats.totalAvailableBalance).toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5">
            <span className="text-[11px] font-mono text-amber-400 uppercase">Pending In Review</span>
            <div className="text-xl font-bold font-display text-amber-300">
              ₹{Number(stats.totalPendingBalance).toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5">
            <span className="text-[11px] font-mono text-indigo-400 uppercase">Platform Gross Earned</span>
            <div className="text-xl font-bold font-display text-indigo-300">
              ₹{Number(stats.totalPlatformGross).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Reward Policy Tuner */}
      {isEditingRules && (
        <form onSubmit={handleSaveRules} className="p-6 rounded-2xl bg-midnight-900/90 border border-amber-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="font-display font-bold text-white text-sm">Dynamic Creator Reward Policy Engine</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">Live Changes Applied Globally</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-mono">Reward Per Valid Like (INR)</label>
              <input
                type="number"
                step="0.01"
                value={rulesForm.rewardPerValidLikeInr}
                onChange={(e) => setRulesForm({ ...rulesForm, rewardPerValidLikeInr: parseFloat(e.target.value) || 0 })}
                className="w-full mt-1 px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-mono">Minimum Payout Threshold (INR)</label>
              <input
                type="number"
                value={rulesForm.minimumPayoutInr}
                onChange={(e) => setRulesForm({ ...rulesForm, minimumPayoutInr: parseFloat(e.target.value) || 0 })}
                className="w-full mt-1 px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-mono">Max Monthly Reward Cap (INR)</label>
              <input
                type="number"
                value={rulesForm.maximumMonthlyRewardInr}
                onChange={(e) => setRulesForm({ ...rulesForm, maximumMonthlyRewardInr: parseFloat(e.target.value) || 0 })}
                className="w-full mt-1 px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-mono">Bonus Multiplier Rate</label>
              <input
                type="number"
                step="0.01"
                value={rulesForm.bonusRate}
                onChange={(e) => setRulesForm({ ...rulesForm, bonusRate: parseFloat(e.target.value) || 0 })}
                className="w-full mt-1 px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsEditingRules(false)}
              className="px-4 py-1.5 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl text-xs shadow-lg shadow-amber-500/20"
            >
              Save Policy Updates
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="p-3 bg-midnight-900/40 rounded-xl border border-white/5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search creator by stage name, email or full name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWallets()}
            className="w-full pl-9 pr-3 py-1.5 bg-midnight-950 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
        <button
          onClick={fetchWallets}
          className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold border border-white/10"
        >
          Search
        </button>
      </div>

      {/* Wallets Table */}
      <div className="bg-midnight-900/40 rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 text-xs font-mono">
            Loading creator wallets...
          </div>
        ) : (
          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-midnight-950/50">
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Balance</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">Total Earned</th>
                  <th className="py-3 px-4 text-right">Ledger Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                {paginatedWallets.map((wallet) => (
                  <tr key={wallet.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{wallet.stageName}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{wallet.creatorEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">{wallet.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      ₹{Number(wallet.available_balance_inr).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-400">
                      ₹{Number(wallet.pending_balance_inr).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-300">
                      ₹{Number(wallet.total_earned_inr).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewTransactions(wallet)}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-[11px] font-mono border border-white/5"
                        >
                          History ({wallet.txCount})
                        </button>
                        <button
                          onClick={() => setAdjustingWallet(wallet)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-[11px] font-mono border border-amber-500/30"
                        >
                          Adjust Balance
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 15 Rows Pagination Footer */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="font-medium">
              Showing{' '}
              <strong className="text-white">
                {wallets.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-white">
                {Math.min(currentPage * PAGE_SIZE, wallets.length)}
              </strong>{' '}
              of{' '}
              <strong className="text-white">{wallets.length}</strong> creator wallets
            </span>
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/10">
              <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-rose-400 font-mono font-semibold text-[11px]">
                10 records per page
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all"
              title="First page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 font-mono text-xs">
                        ...
                      </span>
                    );
                  }
                  const p = item as number;
                  const isActive = p === currentPage;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      className={`w-7 h-7 rounded-lg font-bold font-mono text-xs transition-all ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 border border-rose-500'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
            </div>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all"
              title="Last page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {adjustingWallet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-950 border border-amber-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-white text-base">
                Manual Wallet Adjustment
              </h3>
              <button onClick={() => setAdjustingWallet(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400 font-mono">
              Adjusting ledger for: <span className="text-white font-semibold">{adjustingWallet.stageName}</span> (Current: ₹{Number(adjustingWallet.available_balance_inr).toLocaleString()})
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-mono">Adjustment Type</label>
                <select
                  value={adjustForm.type}
                  onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="BONUS">Promotional Bonus Credit (+)</option>
                  <option value="ADJUSTMENT">Standard Balance Adjustment (+)</option>
                  <option value="FRAUD_DEDUCTION">Fraud Clawback / Penalty Debit (-)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Amount (INR)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={adjustForm.amountInr}
                  onChange={(e) => setAdjustForm({ ...adjustForm, amountInr: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Explanatory Audit Note *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Mandatory reason for ledger override (e.g. Competition prize bonus, Fraud review clearance)..."
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAdjustingWallet(null)}
                  className="px-4 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  {isAdjusting ? 'Updating Ledger...' : 'Apply Ledger Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {isTxModalOpen && selectedWallet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-950 border border-white/10 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-white text-base">
                  Ledger Transactions: {selectedWallet.stageName}
                </h3>
                <span className="text-[11px] text-gray-400 font-mono">
                  Wallet ID: {selectedWallet.id}
                </span>
              </div>
              <button onClick={() => setIsTxModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs font-mono">
                  No recorded ledger transactions yet.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/5 border border-white/10">
                          {tx.type}
                        </span>
                        <span className="text-gray-300">{tx.notes}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {new Date(tx.created_at).toLocaleString()} • Status: {tx.status}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-white">
                      ₹{Number(tx.amount_inr).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
