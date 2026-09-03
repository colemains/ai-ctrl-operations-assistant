'use client';

import { useState } from 'react';
import { User, Mail, Briefcase, Shield, Calendar, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  // TODO: Replace with actual user data from auth context
  const user = {
    name: 'Cole Mains',
    email: 'cole.mains@ai-ctrl.com',
    role: 'AI CTRL Engineer',
    department: 'Service Management Center (SMC)',
    joinDate: 'January 15, 2024',
    userId: 'cole.mains',
    permissions: {
      disciplines: ['SMC', 'NOC', 'Security'],
      authorizedClients: [
        'Alpha Manufacturing',
        'Beta Tech Solutions',
        'Gamma Logistics',
        'Delta Financial Services',
      ],
      canGenerateNotes: true,
      canExecuteWorkflows: true,
      canViewAnalytics: true,
      canManageTickets: true,
    },
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
              <h1 className="text-2xl font-bold text-white">User Profile</h1>
              <p className="text-sm text-gray-400 mt-1">View and manage your account information</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-3xl mb-4">
                  CM
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-sm text-gray-400 mb-2">{user.role}</p>
                <p className="text-xs text-gray-500">{user.department}</p>

                <div className="w-full mt-6 pt-6 border-t border-neutral-700">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Joined {user.joinDate}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role & Permissions */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-red-600" />
                <h3 className="text-xl font-bold text-white">Role & Permissions</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Role</label>
                  <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-red-600" />
                      <span className="text-white font-medium">{user.role}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Authorized Disciplines</label>
                  <div className="flex gap-2">
                    {user.permissions.disciplines.map((discipline) => (
                      <span
                        key={discipline}
                        className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full"
                      >
                        {discipline}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">
                    Authorized Clients ({user.permissions.authorizedClients.length})
                  </label>
                  <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <ul className="space-y-2">
                      {user.permissions.authorizedClients.map((client) => (
                        <li key={client} className="text-sm text-gray-300 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                          {client}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Feature Access</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Generate Notes', enabled: user.permissions.canGenerateNotes },
                      { label: 'Execute Workflows', enabled: user.permissions.canExecuteWorkflows },
                      { label: 'View Analytics', enabled: user.permissions.canViewAnalytics },
                      { label: 'Manage Tickets', enabled: user.permissions.canManageTickets },
                    ].map((feature) => (
                      <div
                        key={feature.label}
                        className={`px-4 py-3 rounded-lg border ${
                          feature.enabled
                            ? 'bg-green-900/20 border-green-700 text-green-400'
                            : 'bg-neutral-900 border-neutral-700 text-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              feature.enabled ? 'bg-green-500' : 'bg-gray-600'
                            }`}
                          ></div>
                          <span className="text-sm font-medium">{feature.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 hover:border-red-600 text-white rounded-lg transition-colors text-left"
                >
                  Edit Preferences
                </button>
                <button
                  onClick={() => alert('Password change - Coming soon')}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 hover:border-red-600 text-white rounded-lg transition-colors text-left"
                >
                  Change Password
                </button>
                <button
                  onClick={() => alert('Activity log - Coming soon')}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 hover:border-red-600 text-white rounded-lg transition-colors text-left"
                >
                  View Activity Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
