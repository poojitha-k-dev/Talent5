'use client';

import React, { useEffect, useState } from 'react';
import {
  Coins,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  CreditCard,
  Building,
  RefreshCw,
  AlertCircle,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PayoutItem {
  id: string;
  creatorId: string;
  amountINR: number;
  paymentMethod: 'UPI' | 'BANK_TRANSFER';
  accountRefTokenized: string;
  status: string;
  transactionRef?: string;
  notes?: string;
  createdAt: string;
  creatorStageName: string;
  creatorCity: string;
  userEmail: string;
  userName: string;
  availableBalanceINR: number;
  pendingBalanceINR: number;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPayout, setSelectedPayout] = useState<PayoutItem | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [settlementNotes, setSettlementNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('talent5_token') || localStorage.getItem('token')) : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/v1/admin/payouts', window.location.origin);
      if (statusFilter !== 'ALL') url.searchParams.set('status', statusFilter);

      const res = await fetch(url.toString(), { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        setPayouts(json.data);
      }
    } catch (err) {
      console.error('Error fetching payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const PAGE_SIZE = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(payouts.length / PAGE_SIZE));
  const paginatedPayouts = payouts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
  };

  const totalLiability = payouts
    .filter((p) => p.status === 'REQUESTED' || p.status === 'UNDER_REVIEW')
    .reduce((sum, p) => sum + parseFloat(p.amountINR as any), 0);

  const handleSettleAction = async (action: 'APPROVE_AND_PAY' | 'REJECT' | 'UNDER_REVIEW') => {
    if (!selectedPayout) return;

    if (action === 'APPROVE_AND_PAY' && !transactionRef.trim()) {
      setToast({ type: 'error', text: 'Please enter bank UTR or UPI transaction reference.' });
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      const res = await fetch(`/api/v1/admin/payouts/${selectedPayout.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action,
          transactionRef: transactionRef.trim(),
          notes: settlementNotes.trim() || undefined,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setToast({ type: 'success', text: json.message });
        setSelectedPayout(null);
        setTransactionRef('');
        setSettlementNotes('');
        fetchPayouts();
      } else {
        setToast({ type: 'error', text: json.error?.message || 'Settlement failed' });
      }
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono uppercase tracking-wider mb-1">
            <Coins className="w-4 h-4" />
            Finance & Creator Settlement Desk
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Creator Earnings & Payout Disbursements
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Reconcile validated engagement credits, verify tokenized UPI/NEFT destination accounts, and disburse creator rewards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-right">
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Pending Payout Liability
            </div>
            <div className="text-xl font-bold font-display text-white mt-0.5">
              ₹{totalLiability.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="text-xs underline hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-midnight-950 p-1 rounded-xl border border-white/5 w-fit text-xs">
        {['ALL', 'REQUESTED', 'UNDER_REVIEW', 'PAID', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === st
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {st === 'ALL' ? 'All Requests' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className="rounded-2xl bg-midnight-900/60 border border-white/5 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-midnight-950/80 border-b border-white/5 text-[11px] uppercase tracking-wider text-gray-400 font-medium">
              <tr>
                <th className="py-3 px-4">Creator / User</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Destination Account</th>
                <th className="py-3 px-4">Status & Ref</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading payout requests...
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No payout requests found.
                  </td>
                </tr>
              ) : (
                paginatedPayouts.map((pay) => (
                  <tr key={pay.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{pay.creatorStageName}</div>
                      <div className="text-[11px] text-gray-400">
                        {pay.userName} • {pay.userEmail}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-display font-extrabold text-white text-sm">
                        ₹{parseFloat(pay.amountINR as any).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Avail: ₹{parseFloat(pay.availableBalanceINR as any || 0).toFixed(2)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-gray-300">
                        {pay.paymentMethod === 'UPI' ? (
                          <CreditCard className="w-3.5 h-3.5 text-teal-400" />
                        ) : (
                          <Building className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span>{pay.paymentMethod}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-gray-300">
                      {pay.accountRefTokenized}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          pay.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : pay.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : pay.status === 'UNDER_REVIEW'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {pay.status}
                      </span>
                      {pay.transactionRef && (
                        <div className="text-[10px] font-mono text-gray-400 mt-1 truncate max-w-xs">
                          UTR: {pay.transactionRef}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {pay.status !== 'PAID' && pay.status !== 'REJECTED' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedPayout(pay);
                            setTransactionRef(`UPI/TALENT5/${Date.now()}`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-xs"
                        >
                          Settle Payout
                        </Button>
                      ) : (
                        <span className="text-gray-500 text-[11px]">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 15 Rows Pagination Footer */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="font-medium">
              Showing{' '}
              <strong className="text-white">
                {payouts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-white">
                {Math.min(currentPage * PAGE_SIZE, payouts.length)}
              </strong>{' '}
              of{' '}
              <strong className="text-white">{payouts.length}</strong> payout requests
            </span>
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/10">
              <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-rose-400 font-mono font-semibold text-[11px]">
                15 rows per page
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

      {/* Settlement Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Settle Creator Reward Payout</h3>
                <p className="text-xs text-gray-400">Recipient: {selectedPayout.creatorStageName}</p>
              </div>
              <button onClick={() => setSelectedPayout(null)} className="text-gray-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-midnight-950 border border-white/5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Payout Amount:</span>
                <span className="text-emerald-400 font-bold font-display text-sm">
                  ₹{parseFloat(selectedPayout.amountINR as any).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Channel:</span>
                <span className="text-white font-medium">{selectedPayout.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Destination Account:</span>
                <span className="text-amber-400 font-mono">{selectedPayout.accountRefTokenized}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 font-medium block mb-1">
                  Bank / UPI Transaction Reference (UTR / TxID): *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPI/2026/894123498"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full rounded-xl bg-midnight-950 border border-white/10 p-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">
                  Settlement Notes / Memo:
                </label>
                <textarea
                  rows={2}
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  placeholder="e.g. Disbursed via ICICI corporate banking portal"
                  className="w-full rounded-xl bg-midnight-950 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <Button variant="ghost" size="sm" onClick={() => setSelectedPayout(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleSettleAction('REJECT')}
                disabled={submitting}
                className="bg-rose-700 hover:bg-rose-600 text-xs"
              >
                Reject Payout
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSettleAction('APPROVE_AND_PAY')}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-xs"
              >
                Confirm & Mark Disbursed
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
