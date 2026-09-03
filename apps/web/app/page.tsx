'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, FileText, Ticket as TicketIcon, X, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/Toast/Toast';
import TicketDashboard from '../components/TicketDashboard/TicketDashboard';
import NoteGenerator from '../components/NoteGenerator/NoteGenerator';
import type { Ticket } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: string[];
}

type NoteContext = {
  ticketId: string;
  clientName: string;
  issue: string;
  assetDetails?: string;
  resolutionSteps?: string;
  currentStatus?: string;
  impact?: string;
  rootCause?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'assistant' | 'tickets' | 'notes'>('assistant');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [noteContext, setNoteContext] = useState<Partial<NoteContext> | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useUser();
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const exampleQueries = [
    "Show me recent high-priority tickets",
    "What's the status of Alpha Manufacturing?",
    "Any critical alerts in the last 24 hours?"
  ];

  const handleExampleClick = (query: string) => {
    setInput(query);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          authContext: {
            userId: user?.id || 'anonymous',
            discipline: 'SMC',
            authorizedClients: user?.permissions.authorizedClients || []
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'No response received',
        timestamp: new Date(),
        citations: data.citations || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error querying agent:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Failed to connect to AI CTRL Agent. Please ensure the backend is running on port 8080.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      showToast('error', 'Failed to connect to backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      showToast('success', 'Logged out successfully');
    }
  };

  const handleGenerateNoteFromTicket = (ticket: Ticket) => {
    const context: Partial<NoteContext> = {
      ticketId: ticket.id,
      clientName: ticket.client,
      issue: ticket.title,
      currentStatus: ticket.status,
      impact: ticket.priority,
      assetDetails: ticket.affectedAssets?.join(', '),
    };

    setNoteContext(context);
    setActiveTab('notes');
    showToast('success', 'Ticket loaded into Note Generator');
  };

  const handleCloseNoteGenerator = () => {
    setNoteContext(undefined);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI CTRL Operations Assistant</h1>
              <p className="text-sm text-gray-400">Multi-Discipline Operations Intelligence</p>
            </div>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors border border-gray-700"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
                <p className="text-xs text-gray-400">{user?.role || 'User'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-neutral-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                <div className="p-3 border-b border-gray-700">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <div className="py-1">
                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">View Profile</span>
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-700 transition-colors w-full text-left text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800 bg-black/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'assistant'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Assistant
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'tickets'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <TicketIcon className="w-4 h-4" />
                Tickets
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'notes'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Note Generator
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* AI Assistant Tab */}
        {activeTab === 'assistant' && (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-800/30 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-400 mb-1">AI-Powered Operations Intelligence</h3>
                  <p className="text-sm text-gray-300">
                    Query tickets, alerts, and system status across all authorized clients. The AI assistant provides
                    real-time analysis and recommendations based on current operational data.
                  </p>
                </div>
              </div>
            </div>

            {/* Example Queries */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Try asking:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {exampleQueries.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExampleClick(query)}
                      className="p-4 bg-neutral-800 hover:bg-neutral-750 border border-gray-700 hover:border-red-600 rounded-lg text-left transition-all group"
                    >
                      <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-red-500 mb-2 transition-colors" />
                      <p className="text-sm text-gray-300">{query}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-4 min-h-[400px]">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-800 border border-gray-700'
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans text-sm">{message.content}</pre>
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Sources:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.citations.map((citation, citIdx) => (
                            <span
                              key={citIdx}
                              className="text-xs px-2 py-1 bg-neutral-700 rounded"
                            >
                              {citation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-neutral-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="sticky bottom-6">
              <div className="bg-neutral-800 border border-gray-700 rounded-lg p-2 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about tickets, alerts, or system status..."
                  className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-white placeholder-gray-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">SMC Ticket Management</h2>
              <p className="text-gray-400">
                View and manage tickets from your integrated SMC platform. Generate notes directly from ticket details.
              </p>
            </div>
            <TicketDashboard onGenerateNote={handleGenerateNoteFromTicket} />
          </div>
        )}

        {/* Note Generator Tab */}
        {activeTab === 'notes' && (
          <div>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">SMC Note Generator</h2>
                <p className="text-gray-400">
                  Generate professional internal and public-facing notes for your SMC tickets.
                </p>
              </div>
              {noteContext && (
                <button
                  onClick={handleCloseNoteGenerator}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-gray-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Prefill
                </button>
              )}
            </div>
            <NoteGenerator
              initialContext={noteContext}
              onClose={handleCloseNoteGenerator}
            />
          </div>
        )}
      </main>
    </div>
  );
}