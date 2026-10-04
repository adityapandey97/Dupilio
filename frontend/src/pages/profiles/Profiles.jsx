import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  UserCheck,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [supported, setSupported] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('leetcode');
  const [usernameInput, setUsernameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const [userProfiles, platformList] = await Promise.all([
        api.getPlatforms(),
        api.getSupportedPlatforms()
      ]);
      setProfiles(userProfiles || []);
      setSupported(platformList || []);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(`Connecting and verifying @${usernameInput} on ${selectedPlatform}...`);
    try {
      await api.connectPlatform(selectedPlatform, usernameInput.trim());
      await loadProfiles();
      setStatusMessage(`✅ ${selectedPlatform.toUpperCase()} profile connected successfully!`);
      setUsernameInput('');
      setConnectModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to connect platform';
      setStatusMessage(`❌ ${msg}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const handleSyncSingle = async (platform) => {
    setSyncingPlatform(platform);
    try {
      const res = await api.syncPlatform(platform);
      await loadProfiles();
      setStatusMessage(`✅ ${platform.toUpperCase()} synchronized with live platform data.`);
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Sync failed';
      setStatusMessage(`⚠️ ${platform.toUpperCase()}: ${msg}`);
    } finally {
      setSyncingPlatform(null);
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const handleDisconnect = async (platform) => {
    if (!window.confirm(`Are you sure you want to disconnect your ${platform.toUpperCase()} profile?`)) {
      return;
    }
    try {
      await api.disconnectPlatform(platform);
      await loadProfiles();
      setStatusMessage(`Disconnected ${platform}.`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (e) {
      alert(`Failed to disconnect: ${e.message}`);
    }
  };

  const connectedPlatformIds = new Set(profiles.map(p => p.platform));
  const availableToConnect = supported.filter(s => !connectedPlatformIds.has(s.id));

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCheck size={28} className="text-indigo-600" />
            My Profiles & Connected Accounts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregate coding ratings, solved challenges, and git contributions into your normalized developer DNA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setConnectModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus size={16} />
            Connect Platform
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          {statusMessage}
        </div>
      )}

      {/* Security & API compliance notice */}
      <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3">
        <Shield size={18} className="text-indigo-600 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-800 dark:text-slate-200">Zero-Credential Architecture:</strong> Dupilio NEVER asks for or stores your platform passwords. All telemetry is aggregated strictly using permitted public APIs and verified usernames in full compliance with external terms.
        </div>
      </div>

      {/* Connected Profiles List */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Active Connected Platforms ({profiles.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading connected profiles...</div>
        ) : profiles.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-slate-300 dark:border-slate-800">
            <Layers size={40} className="mx-auto text-slate-400 mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No platforms connected yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Connect your LeetCode, Codeforces, GitHub, or CodeChef profiles to start calculating your Dupilio Developer Score.
            </p>
            <Button onClick={() => setConnectModalOpen(true)} className="text-xs bg-indigo-600 text-white">
              Connect Your First Profile
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map(p => (
              <Card key={p.platform} className="p-5 border-slate-200/80 dark:border-slate-800/80 hover:shadow-md transition-shadow text-left">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      {p.platform}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSyncSingle(p.platform)}
                      disabled={syncingPlatform === p.platform}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Sync Now"
                    >
                      <RefreshCw size={14} className={syncingPlatform === p.platform ? 'animate-spin text-indigo-600' : ''} />
                    </button>
                    <button
                      onClick={() => handleDisconnect(p.platform)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Disconnect Platform"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 mb-3">
                  <span className="text-[11px] text-slate-400 block font-medium">Handle / Username</span>
                  <a
                    href={p.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    @{p.username}
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-2 text-left mb-3">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                    <span className="text-[10px] text-slate-400 block">{p.platform === 'github' ? 'Repos' : 'Solved'}</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{p.solved}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                    <span className="text-[10px] text-slate-400 block">{p.platform === 'github' ? 'Stars' : 'Rating'}</span>
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{p.rating || 'N/A'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                    <span className="text-[10px] text-slate-400 block">{p.platform === 'github' ? 'Followers' : 'Contests'}</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{p.contests || p.rawStats?.followers || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    Last synced: {p.lastSyncedAt ? new Date(p.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Available Supported Platforms to Connect */}
      {availableToConnect.length > 0 && (
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
            More Supported Platforms Available to Connect ({availableToConnect.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {availableToConnect.map(plat => (
              <button
                key={plat.id}
                onClick={() => {
                  setSelectedPlatform(plat.id);
                  setConnectModalOpen(true);
                }}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-500 hover:shadow-xs transition-all text-center group cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block group-hover:text-indigo-600">
                  {plat.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 inline-block uppercase">
                  + Connect
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Connect Platform Modal */}
      {connectModalOpen && (
        <Modal
          isOpen={connectModalOpen}
          onClose={() => setConnectModalOpen(false)}
          title="Connect Developer Account"
        >
          <form onSubmit={handleConnect} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Select Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {supported.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Your Public Username / Handle
              </label>
              <Input
                placeholder={`e.g. aditya_${selectedPlatform}`}
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Do not enter passwords or private keys. Dupilio only fetches public metrics.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setConnectModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="text-xs bg-indigo-600 text-white">
                {isSubmitting ? 'Verifying...' : 'Save & Synchronize'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default Profiles;
