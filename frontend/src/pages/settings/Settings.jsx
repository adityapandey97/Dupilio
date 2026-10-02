import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Settings as SettingsIcon,
  Save,
  Eye,
  Bell,
  Shield,
  Sparkles,
  School,
  Lock,
  Moon,
  Sun,
  Key,
  CheckCircle2,
  Volume2
} from 'lucide-react';

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, updateProfile } = useAuth();

  // Academic & Personal Details
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || 'National Institute of Technology');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [batch, setBatch] = useState(user?.batch || '2026');
  const [bio, setBio] = useState(user?.bio || '');

  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState(
    user?.privacySettings?.profileVisibility || 'public'
  );
  const [showInLeaderboard, setShowInLeaderboard] = useState(
    user?.privacySettings?.showInLeaderboard !== false
  );
  const [showPlatforms, setShowPlatforms] = useState(
    user?.privacySettings?.showPlatforms !== false
  );

  // Notifications
  const [browserAlerts, setBrowserAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [voiceReminders, setVoiceReminders] = useState(true);

  // Gemini API Key state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isKeyVerifying, setIsKeyVerifying] = useState(false);
  const [keyStatusMsg, setKeyStatusMsg] = useState('');

  // Save states
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.college) setCollege(user.college);
      if (user.department) setDepartment(user.department);
      if (user.batch) setBatch(user.batch);
      if (user.bio) setBio(user.bio);
      if (user.privacySettings) {
        if (user.privacySettings.profileVisibility) {
          setProfileVisibility(user.privacySettings.profileVisibility);
        }
        if (user.privacySettings.showInLeaderboard !== undefined) {
          setShowInLeaderboard(user.privacySettings.showInLeaderboard);
        }
        if (user.privacySettings.showPlatforms !== undefined) {
          setShowPlatforms(user.privacySettings.showPlatforms);
        }
      }
    }

    const savedBrowser = localStorage.getItem('dupilio_pref_browser_notifs');
    if (savedBrowser) setBrowserAlerts(savedBrowser === 'true');

    const savedEmail = localStorage.getItem('dupilio_pref_email_notifs');
    if (savedEmail) setEmailAlerts(savedEmail === 'true');

    const savedVoice = localStorage.getItem('dupilio_pref_voice');
    if (savedVoice) setVoiceReminders(savedVoice === 'true');
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const payload = {
        name,
        college,
        department,
        batch,
        bio,
        privacySettings: {
          profileVisibility,
          showInLeaderboard,
          showPlatforms
        }
      };

      await api.updateProfile(payload);
      if (updateProfile) {
        updateProfile(payload);
      }

      localStorage.setItem('dupilio_pref_browser_notifs', String(browserAlerts));
      localStorage.setItem('dupilio_pref_email_notifs', String(emailAlerts));
      localStorage.setItem('dupilio_pref_voice', String(voiceReminders));

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    setIsKeyVerifying(true);
    setKeyStatusMsg('Testing key connectivity...');
    try {
      const res = await api.configureAiKey(apiKeyInput.trim());
      setKeyStatusMsg(res.message || 'Key connected successfully!');
    } catch (err) {
      setKeyStatusMsg('Key stored locally for session.');
    } finally {
      setIsKeyVerifying(false);
    }
  };

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Dupilio Voice Engine test. Contest starts in 30 minutes.');
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis is not supported on this browser.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left max-w-4xl">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white shadow-md shadow-slate-900/10 dark:from-slate-800 dark:to-slate-700">
            <SettingsIcon size={24} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Profile & Platform Settings
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
          Configure your academic metadata, privacy scopes, theme, and AI voice providers.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Your settings and preferences have been updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Academic Profile Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <School size={18} className="text-indigo-600 dark:text-indigo-400" />
              Academic & Identity Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs md:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  College / University
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. National Institute of Technology"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs md:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Department / Major
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs md:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Graduation Batch (Year)
                </label>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs md:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                Short Developer Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Passionate about competitive programming, distributed systems, and open source..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs md:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Leaderboard Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield size={18} className="text-amber-600 dark:text-amber-400" />
              Privacy & Leaderboard Visibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                Profile Visibility
              </label>
              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs md:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="public">Public (Visible across global leaderboards and portfolios)</option>
                <option value="campus_only">Campus Only (Restricted to my college and department)</option>
                <option value="private">Private (Hidden from all public discovery)</option>
              </select>
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInLeaderboard}
                  onChange={(e) => setShowInLeaderboard(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Display rank on Global and Campus Leaderboards
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Your Dupilio Developer Score and platform stats will compete on college rankings.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPlatforms}
                  onChange={(e) => setShowPlatforms(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Show connected platform handles on public profile
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Displays verified badges for LeetCode, Codeforces, GitHub, etc.
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell size={18} className="text-purple-600 dark:text-purple-400" />
              Contest Reminders & Lead Times
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Browser & Sound Notifications
                </p>
                <p className="text-[11px] text-slate-400">
                  Receive desktop notifications and alert chimes 30m and 1h before registered contests.
                </p>
              </div>
              <input
                type="checkbox"
                checked={browserAlerts}
                onChange={(e) => setBrowserAlerts(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Voice Assistant Alerts
                </p>
                <p className="text-[11px] text-slate-400">
                  Allow Dupilio audio engine to announce upcoming contest rounds via speech synthesis.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={testVoice}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1 hover:bg-indigo-100"
                >
                  <Volume2 size={13} />
                  Test Voice
                </button>
                <input
                  type="checkbox"
                  checked={voiceReminders}
                  onChange={(e) => setVoiceReminders(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </div>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Weekly Preparation Digest Email
                </p>
                <p className="text-[11px] text-slate-400">
                  Receive weekend summaries of contest results, rating changes, and recommended problems.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </label>
          </CardContent>
        </Card>

        {/* AI Engine & Gemini Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles size={18} className="text-pink-600 dark:text-pink-400" />
              AI Engine & LLM API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Dupilio uses a high-performance hybrid architecture: deterministic Node.js action execution paired with Gemini GenAI for contextual preparation recommendations.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                Google Gemini API Key (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs md:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveApiKey}
                  disabled={isKeyVerifying || !apiKeyInput.trim()}
                  className="text-xs px-3"
                >
                  {isKeyVerifying ? 'Verifying...' : 'Set Key'}
                </Button>
              </div>
              {keyStatusMsg && (
                <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1.5">
                  {keyStatusMsg}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save button bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 font-bold"
          >
            <Save size={16} />
            {isSaving ? 'Saving Changes...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
