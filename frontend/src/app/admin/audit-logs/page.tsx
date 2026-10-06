'use client';

import React, { useEffect, useState } from 'react';
import {
  ScrollText,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Shield,
  User,
  Globe,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AuditLogItem {
  id: string;
  actorId: string;
  action: string;
  entityName: string;
  entityId: string;
  oldState?: any;
  newState?: any;
  ipAddress?: string;
  createdAt: string;
  actorEmail?: string;
  actorName?: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [actionSearch, setActionSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('talent5_token') || localStorage.getItem('token')) : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/v1/admin/audit-logs', window.location.origin);
      if (entityFilter !== 'ALL') url.searchParams.set('entity', entityFilter);
      if (actionSearch.trim()) url.searchParams.set('action', actionSearch.trim());

      const res = await fetch(url.toString(), { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionSearch]);

  const PAGE_SIZE = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const paginatedLogs = logs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [entityFilter, actionSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
  };

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono uppercase tracking-wider mb-1">
            <ScrollText className="w-4 h-4" />
            System Integrity Ledger
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Immutable Administrative Audit Trail
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Cryptographically logged operations, privilege state shifts, financial settlements, and rights enforcement records.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          className="text-gray-300 hover:text-white text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-midnight-900/60 border border-white/5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-midnight-950 p-1 rounded-lg border border-white/5 text-xs">
            {['ALL', 'CREATOR_APPLICATION', 'CONTENT_SUBMISSION', 'RIGHTS_RECORD', 'PAYOUT_REQUEST', 'SYSTEM_SETTINGS'].map(
              (ent) => (
                <button
                  key={ent}
                  onClick={() => setEntityFilter(ent)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    entityFilter === ent
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {ent === 'ALL' ? 'All Entities' : ent.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action name..."
            value={actionSearch}
            onChange={(e) => setActionSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 font-mono"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-midnight-900/60 border border-white/5 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-midnight-950/80 border-b border-white/5 text-[11px] uppercase tracking-wider text-gray-400 font-medium">
              <tr>
                <th className="py-3 px-4">Action & Entity</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Entity UUID</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">State Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 font-sans">
                    Loading ledger events...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 font-sans">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => toggleExpand(log.id)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-white font-mono text-xs">{log.action}</div>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 font-mono inline-block mt-0.5">
                          {log.entityName}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <div className="text-gray-300 font-medium">{log.actorName || 'System'}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{log.actorEmail}</div>
                      </td>

                      <td className="py-3 px-4 text-gray-400 text-[11px] truncate max-w-[140px]">
                        {log.entityId}
                      </td>

                      <td className="py-3 px-4 text-gray-400 text-[11px]">
                        {log.ipAddress || '127.0.0.1'}
                      </td>

                      <td className="py-3 px-4 text-gray-400 text-[11px] font-sans">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(log.id);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
                        >
                          <span>{expandedLogId === log.id ? 'Hide' : 'Inspect'}</span>
                          {expandedLogId === log.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>

                    {expandedLogId === log.id && (
                      <tr className="bg-midnight-950/90 font-mono">
                        <td colSpan={6} className="p-4 border-t border-b border-rose-500/20">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                            <div>
                              <div className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1 font-sans">
                                Prior State (oldState):
                              </div>
                              <pre className="p-3 rounded-lg bg-midnight-900 border border-white/5 text-rose-300 overflow-x-auto whitespace-pre-wrap">
                                {log.oldState ? JSON.stringify(log.oldState, null, 2) : 'null (Created)'}
                              </pre>
                            </div>
                            <div>
                              <div className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1 font-sans">
                                Committed State (newState):
                              </div>
                              <pre className="p-3 rounded-lg bg-midnight-900 border border-white/5 text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                                {log.newState ? JSON.stringify(log.newState, null, 2) : 'null'}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
                {logs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-white">
                {Math.min(currentPage * PAGE_SIZE, logs.length)}
              </strong>{' '}
              of{' '}
              <strong className="text-white">{logs.length}</strong> ledger records
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
    </div>
  );
}
