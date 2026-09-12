'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Coins,
  ShieldCheck,
  Save,
  RefreshCw,
  Sliders,
  CheckCircle2,
  HardDrive,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [ruleId, setRuleId] = useState(1);
  const [rewardPerLike, setRewardPerLike] = useState('0.10');
  const [minPayout, setMinPayout] = useState('500.00');
  const [maxMonthly, setMaxMonthly] = useState('100000.00');
  const [bonusRate, setBonusRate] = useState('0.05');

  const [tagline, setTagline] = useState('Real Voices. Original Stories. Desi Talent.');
  const [maxUploadMb, setMaxUploadMb] = useState('200');
  const [fraudThreshold, setFraudThreshold] = useState('75');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/settings');
      const json = await res.json();
      if (json.success) {
        const { rewardRule, systemSettings } = json.data;
        if (rewardRule) {
          setRuleId(rewardRule.id);
          setRewardPerLike(rewardRule.rewardPerValidLikeINR.toString());
          setMinPayout(rewardRule.minimumPayoutINR.toString());
          setMaxMonthly(rewardRule.maximumMonthlyRewardINR.toString());
          setBonusRate(rewardRule.bonusRate.toString());
        }
        if (systemSettings) {
          if (systemSettings.platform_tagline) {
            setTagline(systemSettings.platform_tagline.value?.replace(/"/g, '') || '');
          }
          if (systemSettings.max_upload_size_mb) {
            setMaxUploadMb(systemSettings.max_upload_size_mb.value?.replace(/"/g, '') || '200');
          }
          if (systemSettings.anti_fraud_threshold) {
            setFraudThreshold(systemSettings.anti_fraud_threshold.value?.replace(/"/g, '') || '75');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardRule: {
            id: ruleId,
            rewardPerValidLikeINR: parseFloat(rewardPerLike),
            minimumPayoutINR: parseFloat(minPayout),
            maximumMonthlyRewardINR: parseFloat(maxMonthly),
            bonusRate: parseFloat(bonusRate),
          },
          systemSettings: {
            platform_tagline: tagline,
            max_upload_size_mb: maxUploadMb,
            anti_fraud_threshold: fraudThreshold,
          },
        }),
      });
      const json = await res.json();

      if (json.success) {
        setToast({ type: 'success', text: 'Platform configuration updated and saved to audit ledger.' });
      } else {
        setToast({ type: 'error', text: json.error?.message || 'Save failed' });
      }
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            Platform Orchestration
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            System Settings & Creator Economics Rules
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure dynamic engagement payouts, fraud score thresholds, and global media upload limits.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSettings}
          disabled={loading}
          className="text-gray-300 hover:text-white text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Reload
        </Button>
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

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Creator Reward Parameters */}
        <div className="p-6 rounded-2xl bg-midnight-900/70 border border-amber-500/20 backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Coins className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">Creator Reward Economics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="text-gray-300 font-medium block mb-1.5">
                Reward Rate per Valid Like (INR ₹):
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={rewardPerLike}
                onChange={(e) => setRewardPerLike(e.target.value)}
                className="w-full rounded-xl bg-midnight-950 border border-white/10 p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Default is ₹0.10 per validated engagement</p>
            </div>

            <div>
              <label className="text-gray-300 font-medium block mb-1.5">
                Minimum Withdrawal Threshold (INR ₹):
              </label>
              <input
                type="number"
                step="1"
                required
                value={minPayout}
                onChange={(e) => setMinPayout(e.target.value)}
                className="w-full rounded-xl bg-midnight-950 border border-white/10 p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Minimum wallet balance required to request UPI payout</p>
            </div>

            <div>
              <label className="text-gray-300 font-medium block mb-1.5">
                Monthly Creator Cap (INR ₹):
              </label>
              <input
                type="number"
                step="1000"
                required
                value={maxMonthly}
                onChange={(e) => setMaxMonthly(e.target.value)}
                className="w-full rounded-xl bg-midnight-950 border border-white/10 p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Maximum engagement rewards credited per creator/month</p>
            </div>

            <div>
              <label className="text-gray-300 font-medium block mb-1.5">
                Tournament Top Creator Bonus Multiplier (%):
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={bonusRate}
                onChange={(e) => setBonusRate(e.target.value)}
                className="w-full rounded-xl bg-midnight-950 border border-white/10 p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">e.g. 0.05 = 5% additional reward multiplier</p>
            </div>
          </div>
        </div>

        {/* Media & System Controls */}
        <div className="p-6 rounded-2xl bg-midnight-900/70 border border-rose-500/20 backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2.5 text-rose-400">
            <Sliders className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">Platform Safeguards & Limits</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="text-gray-300 font-medium block mb-1.5">
                Anti-Fraud Sensitivity Score (0-100):
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={fraudThreshold}
                onChange={(e) => setFraudThreshold(e.target.value)}
                className="w-full rounded-xl bg-midnight-950 border border-white/10 p-3 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Scores above this trigger automatic like voiding & admin alert</p>
            </div>

            <div>
              <label className="text-gray-300 font-medium block mb-1.5">
                Maximum Media Upload Size (MB):
              </label>
              <input
                type="number"
                required
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(e.target.value)}
                className="w-full rounded-xl bg-midnight-950 border border-white/10 p-3 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Audio master files and 4K music video uploads cap</p>
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-300 font-medium block mb-1.5">
                Platform Hero Tagline:
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl bg-midnight-950 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            className="bg-rose-600 hover:bg-rose-500 border-rose-500 text-sm px-6"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Persisting Changes...' : 'Save Configuration & Update Audit Trail'}
          </Button>
        </div>
      </form>
    </div>
  );
}
