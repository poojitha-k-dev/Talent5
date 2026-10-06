'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Shield,
  KeyRound,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  roles: string[];
}

interface RoleDefinition {
  id: number;
  name: string;
  description: string;
}

export default function AdminTeamPage() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  // Assign Role Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: '',
    roleName: 'MODERATOR',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/team', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStaff(data.data.staff);
        setAvailableRoles(data.data.availableRoles);
      }
    } catch (err) {
      console.error('Failed to load team', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTeam();
  }, [token]);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.userId || !assignForm.roleName) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/team/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assignForm),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Role ${assignForm.roleName} granted successfully!`);
        setIsAssignModalOpen(false);
        setAssignForm({ userId: '', roleName: 'MODERATOR' });
        fetchTeam();
      } else {
        alert(data.message || 'Failed to grant role');
      }
    } catch (err: any) {
      alert(err.message || 'Error granting role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeRole = async (userId: string, roleName: string, email: string) => {
    if (
      !window.confirm(
        `Revoke clearance "${roleName}" from staff member (${email})?`
      )
    ) {
      return;
    }
    try {
      const res = await fetch('/api/v1/admin/team/revoke-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, roleName }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTeam();
      } else {
        alert(data.message || 'Failed to revoke role');
      }
    } catch (err: any) {
      alert(err.message || 'Error revoking role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-midnight-900/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <UserCog className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Staff RBAC & Team Delegation Matrix
            </h1>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Role-Based Access Control matrix. Delegate specialized responsibilities (Moderation, Finance, Content) with strict boundary security.
          </p>
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold rounded-xl text-xs shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Grant Elevated Clearance</span>
        </button>
      </div>

      {/* Role Breakdown Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-midnight-900/40 border border-rose-500/20 space-y-1">
          <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">SUPER_ADMIN</span>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Full root sovereign control. System configuration, DB backups, staff role delegation.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-midnight-900/40 border border-amber-500/20 space-y-1">
          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">MODERATOR</span>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Content review, audition judging, DMCA & community report takedown clearance.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-midnight-900/40 border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">FINANCE</span>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Payout request settlements, creator wallet balance ledger overrides & fraud audits.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-midnight-900/40 border border-teal-500/20 space-y-1">
          <span className="text-[10px] font-mono text-teal-400 uppercase font-bold">CONTENT_MANAGER</span>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Song catalog metadata, lyrics synchronization studio & editorial playlist curation.
          </p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-midnight-900/40 rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 text-xs font-mono">
            Loading active staff matrix...
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {staff.map((member) => (
              <div
                key={member.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.01]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">{member.fullName}</span>
                    <span className="text-[11px] text-gray-500 font-mono">({member.email})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {member.roles.map((r) => (
                      <span
                        key={r}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          r === 'SUPER_ADMIN'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : r === 'ADMIN'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : r === 'FINANCE'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                        }`}
                      >
                        <Shield className="w-2.5 h-2.5" />
                        <span>{r}</span>
                        {member.roles.length > 1 && (
                          <button
                            onClick={() => handleRevokeRole(member.id, r, member.email)}
                            className="ml-1 text-gray-400 hover:text-white"
                            title="Revoke this role"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 font-mono">
                  Member since {new Date(member.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grant Clearance Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-950 border border-rose-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-white text-base">Grant Staff Clearance</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignRole} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-mono">User UUID *</label>
                <input
                  type="text"
                  required
                  placeholder="Paste User ID (from Users & Signups dashboard)..."
                  value={assignForm.userId}
                  onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value.trim() })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Role Clearance</label>
                <select
                  value={assignForm.roleName}
                  onChange={(e) => setAssignForm({ ...assignForm, roleName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MODERATOR">MODERATOR</option>
                  <option value="FINANCE">FINANCE</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs shadow-lg shadow-rose-500/20"
                >
                  {isSubmitting ? 'Granting...' : 'Grant Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
