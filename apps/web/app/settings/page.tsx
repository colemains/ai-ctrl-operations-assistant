'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Eye, Zap, ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  // TODO: Load from user preferences API
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      desktopNotifications: true,
      ticketUpdates: true,
      workflowCompletion: true,
      systemMaintenance: false,
    },
    display: {
      theme: 'dark',
      compactMode: false,
      showExamples: true,
      autoRefreshTickets: true,
      refreshInterval: 30,
    },
    ai: {
      defaultModel: 'claude-3-5-sonnet',
      verboseResponses: false,
      includeCitations: true,
      autoGenerateNotes: false,
    },
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (category: keyof typeof settings, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]],
      },
    }));
  };

  const handleSave = () => {
    // TODO: Save to API
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <header className="bg-black border-b border-red-600">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-sm text-gray-400 mt-1">Customize your experience</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            {saved ? (
              <>
                <span>✓</span>
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Notifications */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-red-600" />
            <h3 className="text-xl font-bold text-white">Notifications</h3>
          </div>

          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </label>
                <button
                  onClick={() => handleToggle('notifications', key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-red-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      value ? 'translate-x-6' : ''
                    }`}
                  ></span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Display */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-red-600" />
            <h3 className="text-xl font-bold text-white">Display</h3>
          </div>

          <div className="space-y-4">
            {Object.entries(settings.display).map(([key, value]) => {
              if (key === 'refreshInterval') {
                return (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">
                      Ticket Refresh Interval (seconds)
                    </label>
                    <select
                      value={String(value)}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          display: { ...prev.display, refreshInterval: Number(e.target.value) },
                        }))
                      }
                      className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    >
                      <option value={15}>15s</option>
                      <option value={30}>30s</option>
                      <option value={60}>1m</option>
                      <option value={300}>5m</option>
                    </select>
                  </div>
                );
              }

              if (key === 'theme') {
                return (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Theme</label>
                    <select
                      value={String(value)}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          display: { ...prev.display, theme: e.target.value },
                        }))
                      }
                      className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="dark">Dark (Current)</option>
                      <option value="light" disabled>Light (Coming Soon)</option>
                    </select>
                  </div>
                );
              }

              return (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </label>
                  <button
                    onClick={() => handleToggle('display', key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-red-600' : 'bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        value ? 'translate-x-6' : ''
                      }`}
                    ></span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-red-600" />
            <h3 className="text-xl font-bold text-white">AI Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Default AI Model</label>
              <select
                value={settings.ai.defaultModel}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    ai: { ...prev.ai, defaultModel: e.target.value },
                  }))
                }
                className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
              >
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="gpt-4">GPT-4 (Coming Soon)</option>
              </select>
            </div>

            {Object.entries(settings.ai)
              .filter(([key]) => key !== 'defaultModel')
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </label>
                  <button
                    onClick={() => handleToggle('ai', key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-red-600' : 'bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        value ? 'translate-x-6' : ''
                      }`}
                    ></span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
