'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [citations, setCitations] = useState<any[]>([]);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [queryType, setQueryType] = useState<string>('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Mock user data - will be replaced with real auth
  const currentUser = {
    name: 'Cole Mains',
    email: 'cole.mains@expedient.com',
    role: 'AI CTRL Engineer',
    department: 'AI CTRL',
    avatar: 'CM',
    permissions: {
      canAccessTickets: true,
      canAccessAlerts: true,
      canAccessElastic: true,
      canAccessOpenWebUI: true,
      canAccessSalesData: false,
      authorizedClients: ['all'], // or specific client IDs
    }
  };

  // All 8 example queries
  const allExampleQueries = [
    'Show me all active AI CTRL tickets and alerts as of now, grouped by severity',
    'Are there any authentication or connectivity issues affecting multiple AI CTRL clients in the last 48 hours?',
    'Show me all AI CTRL Elastic instances with disk usage above 75% and predict when they will hit capacity',
    'What is the current status for Alpha Manufacturing?',
    'Show me all network issues and connectivity alerts affecting our clients',
    'What security alert patterns are we seeing across all clients?',
    'Which infrastructure resources are approaching capacity limits?',
    'Run a cross-client correlation analysis - are multiple clients experiencing similar issues?',
  ];

  const [displayedQueries, setDisplayedQueries] = useState<string[]>([]);

  const ROTATION_CONFIG = {
    enableRandomSubset: true,
    subsetSize: 4,
    enableTimer: true,
    timerInterval: 15000,
    enableRefresh: true,
  };

  const getRandomQueries = (count: number) => {
    const shuffled = [...allExampleQueries].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    if (ROTATION_CONFIG.enableRandomSubset || ROTATION_CONFIG.enableRefresh) {
      setDisplayedQueries(getRandomQueries(ROTATION_CONFIG.subsetSize));
    } else {
      setDisplayedQueries(allExampleQueries.slice(0, ROTATION_CONFIG.subsetSize));
    }
  }, []);

  useEffect(() => {
    if (!ROTATION_CONFIG.enableTimer) return;
    const interval = setInterval(() => {
      setDisplayedQueries(getRandomQueries(ROTATION_CONFIG.subsetSize));
    }, ROTATION_CONFIG.timerInterval);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');
    setCitations([]);
    setResponseTime(null);
    setQueryType('');

    const startTime = performance.now();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          userContext: {
            userId: currentUser.email,
            role: currentUser.role,
            department: currentUser.department,
            permissions: currentUser.permissions,
          }
        }),
      });

      const endTime = performance.now();
      const timeElapsed = Math.round(endTime - startTime);

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setResponse(data.response);
        setCitations(data.citations || []);
        setResponseTime(timeElapsed);
        setQueryType(data.queryType || '');
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to AI agent. Make sure the Mastra service is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  const handleCitationClick = (citation: any, index: number) => {
    // Navigate to the citation source
    if (citation.url) {
      window.open(citation.url, '_blank', 'noopener,noreferrer');
    } else if (citation.source === 'smc') {
      // Open SMC ticket
      window.open(`https://smc.expedient.com/ticket/${citation.id}`, '_blank');
    } else if (citation.source === 'elastic') {
      // Open Elastic dashboard
      window.open(`https://elastic.expedient.com/app/discover#/${citation.id}`, '_blank');
    } else if (citation.source === 'confluence') {
      // Open Confluence page
      window.open(`https://expedient.atlassian.net/wiki${citation.path}`, '_blank');
    } else {
      // Fallback - show citation details
      alert(`Citation ${index + 1}: ${citation.title}\nSource: ${citation.source || 'Unknown'}`);
    }
  };

  // Enhanced response formatting for executive presentation
  const formatResponse = (text: string) => {
    const lines = text.split('\n');
    const sections: any[] = [];
    let currentSection: any = null;

    lines.forEach((line, idx) => {
      // Critical/High severity sections get special card treatment
      if (line.match(/^===.*CRITICAL.*===/i)) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          type: 'critical',
          title: line.replace(/===/g, '').trim(),
          content: [],
        };
      } else if (line.match(/^===.*HIGH.*===/i)) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          type: 'high',
          title: line.replace(/===/g, '').trim(),
          content: [],
        };
      } else if (line.match(/^===/)) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          type: 'section',
          title: line.replace(/===/g, '').trim(),
          content: [],
        };
      } else if (line.match(/^---/)) {
        if (currentSection) {
          currentSection.content.push({
            type: 'subheading',
            text: line.replace(/---/g, '').trim(),
          });
        }
      } else if (line.match(/^[•\-\*]/)) {
        if (currentSection) {
          currentSection.content.push({
            type: 'bullet',
            text: line.trim(),
          });
        }
      } else if (line.match(/^(ACTION|WARNING|CRITICAL|RECOMMENDED)/i)) {
        if (currentSection) {
          currentSection.content.push({
            type: 'action',
            text: line.trim(),
          });
        }
      } else if (line.trim()) {
        if (currentSection) {
          currentSection.content.push({
            type: 'text',
            text: line.trim(),
          });
        } else {
          // Content before first section
          sections.push({
            type: 'text',
            content: [{ type: 'text', text: line.trim() }],
          });
        }
      }
    });

    if (currentSection) sections.push(currentSection);

    return sections.map((section, sIdx) => {
      if (section.type === 'critical') {
        return (
          <div key={sIdx} className="bg-[#F20505] bg-opacity-5 border-l-4 border-[#F20505] rounded-lg p-6 mb-6 shadow-md">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-[#F20505] text-white text-xs font-bold px-3 py-1 rounded-full">
                CRITICAL
              </span>
              <h3 className="text-xl font-bold text-[#F20505]">{section.title}</h3>
            </div>
            <div className="space-y-2">
              {section.content.map((item: any, iIdx: number) => renderContentItem(item, iIdx))}
            </div>
          </div>
        );
      } else if (section.type === 'high') {
        return (
          <div key={sIdx} className="bg-[#F48C06] bg-opacity-5 border-l-4 border-[#F48C06] rounded-lg p-6 mb-6 shadow-md">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-[#F48C06] text-white text-xs font-bold px-3 py-1 rounded-full">
                HIGH
              </span>
              <h3 className="text-xl font-bold text-[#F48C06]">{section.title}</h3>
            </div>
            <div className="space-y-2">
              {section.content.map((item: any, iIdx: number) => renderContentItem(item, iIdx))}
            </div>
          </div>
        );
      } else if (section.type === 'section') {
        return (
          <div key={sIdx} className="bg-[#F0F0F0] rounded-lg p-6 mb-6 border border-[#D2D2D2]">
            <h3 className="text-xl font-bold text-[#000000] mb-4 border-b-2 border-[#F20505] pb-2">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.content.map((item: any, iIdx: number) => renderContentItem(item, iIdx))}
            </div>
          </div>
        );
      } else {
        return (
          <div key={sIdx} className="mb-4">
            {section.content.map((item: any, iIdx: number) => renderContentItem(item, iIdx))}
          </div>
        );
      }
    });
  };

  const renderContentItem = (item: any, idx: number) => {
    switch (item.type) {
      case 'subheading':
        return (
          <h4 key={idx} className="text-lg font-bold text-[#323232] mt-4 mb-2">
            {item.text}
          </h4>
        );
      case 'bullet':
        return (
          <p key={idx} className="text-base text-[#323232] ml-4 mb-2 flex items-start">
            <span className="text-[#F20505] mr-2 font-bold">•</span>
            <span>{item.text.replace(/^[•\-\*]\s*/, '')}</span>
          </p>
        );
      case 'action':
        return (
          <div key={idx} className="bg-[#F20505] bg-opacity-10 border border-[#F20505] rounded px-4 py-2 mt-3 mb-2">
            <p className="text-base font-bold text-[#F20505]">{item.text}</p>
          </div>
        );
      case 'text':
        return (
          <p key={idx} className="text-base text-[#323232] mb-2 leading-relaxed">
            {item.text}
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F0F0]">
      {/* Header with User Menu */}
      <header className="bg-[#000000] border-b-4 border-[#F20505]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#FFFFFF]">
              AI CTRL Operations Assistant
            </h1>
            <p className="text-base text-[#D2D2D2] mt-2">
              Multi-Discipline AI Operations Intelligence Platform
            </p>
          </div>

          {/* User Menu */}
          <div className="relative user-menu-container">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 bg-[#323232] hover:bg-[#646464] rounded-lg px-4 py-2 transition-colors"
            >
              <div className="w-10 h-10 bg-[#F20505] rounded-full flex items-center justify-center text-white font-bold">
                {currentUser.avatar}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-[#FFFFFF]">{currentUser.name}</p>
                <p className="text-xs text-[#D2D2D2]">{currentUser.role}</p>
              </div>
              <svg
                className={`w-4 h-4 text-[#D2D2D2] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] rounded-lg shadow-xl border-2 border-[#D2D2D2] overflow-hidden z-50">
                {/* User Info */}
                <div className="bg-[#F0F0F0] px-4 py-3 border-b border-[#D2D2D2]">
                  <p className="text-sm font-bold text-[#000000]">{currentUser.name}</p>
                  <p className="text-xs text-[#646464]">{currentUser.email}</p>
                  <div className="mt-2">
                    <span className="inline-block bg-[#F20505] text-white text-xs font-bold px-2 py-1 rounded">
                      {currentUser.department}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-[#323232] hover:bg-[#F0F0F0] transition-colors flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Account Settings</span>
                  </button>

                  <button className="w-full text-left px-4 py-2 text-sm text-[#323232] hover:bg-[#F0F0F0] transition-colors flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Preferences</span>
                  </button>

                  <button className="w-full text-left px-4 py-2 text-sm text-[#323232] hover:bg-[#F0F0F0] transition-colors flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Documentation</span>
                  </button>

                  <button className="w-full text-left px-4 py-2 text-sm text-[#323232] hover:bg-[#F0F0F0] transition-colors flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Permissions & Access</span>
                  </button>

                  <div className="border-t border-[#D2D2D2] my-2"></div>

                  <button className="w-full text-left px-4 py-2 text-sm text-[#F20505] hover:bg-[#F20F0F0] transition-colors flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Query Form */}
        <div className="bg-[#FFFFFF] rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="query" className="block text-lg font-bold text-[#000000] mb-3">
                Ask a Question
              </label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#D2D2D2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F20505] focus:border-[#F20505] text-base text-[#323232]"
                rows={4}
                placeholder="e.g., Show me all active AI CTRL tickets and alerts grouped by severity"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full bg-[#F20505] hover:bg-[#D30567] text-[#FFFFFF] font-bold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
            >
              {loading ? 'Processing...' : 'Submit Query'}
            </button>
          </form>

          {/* Example Queries */}
          <div className="mt-8">
            <p className="text-sm font-bold text-[#323232] mb-3">
              Example Queries
              {ROTATION_CONFIG.enableTimer && (
                <span className="text-xs text-[#646464] ml-2 font-normal">
                  (rotating every {ROTATION_CONFIG.timerInterval / 1000}s)
                </span>
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  className="text-left px-4 py-3 bg-[#F0F0F0] hover:bg-[#D2D2D2] border border-[#D2D2D2] rounded-lg text-sm text-[#323232] hover:text-[#F20505] transition-all hover:border-[#F20505]"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-[#F20505] bg-opacity-10 border-2 border-[#F20505] rounded-lg p-6 mb-8">
            <p className="text-[#F20505] font-bold text-lg">Error</p>
            <p className="text-[#323232] mt-2">{error}</p>
          </div>
        )}

        {/* Response Display - Executive Grade */}
        {response && (
          <div className="space-y-6">
            {/* Metrics Bar */}
            <div className="bg-[#FFFFFF] rounded-lg shadow-lg p-6 border-l-4 border-[#F20505]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-[#646464] uppercase tracking-wide mb-1">Response Time</p>
                  <p className="text-2xl font-bold text-[#F20505]">
                    {responseTime !== null ? `${responseTime}ms` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#646464] uppercase tracking-wide mb-1">Query Type</p>
                  <p className="text-2xl font-bold text-[#323232]">
                    {queryType || 'General'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#646464] uppercase tracking-wide mb-1">Sources Referenced</p>
                  <p className="text-2xl font-bold text-[#2EB2B2]">
                    {citations.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Analysis Result */}
            <div className="bg-[#FFFFFF] rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#000000] mb-6 border-b-4 border-[#F20505] pb-3">
                Analysis Result
              </h2>
              <div className="space-y-4">
                {formatResponse(response)}
              </div>
            </div>

            {/* Citations - Clickable */}
            {citations.length > 0 && (
              <div className="bg-[#FFFFFF] rounded-lg shadow-lg p-8">
                <h3 className="text-lg font-bold text-[#000000] mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#F20505]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Citations & Sources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {citations.map((citation, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCitationClick(citation, idx)}
                      className="flex items-start space-x-3 p-4 bg-[#F0F0F0] hover:bg-[#D2D2D2] rounded-lg border-2 border-[#D2D2D2] hover:border-[#F20505] transition-all text-left group"
                    >
                      <span className="inline-block bg-[#F20505] text-[#FFFFFF] text-xs font-bold px-3 py-1 rounded min-w-[2rem] text-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#323232] group-hover:text-[#F20505] transition-colors">
                          {citation.title}
                        </p>
                        {citation.source && (
                          <p className="text-xs text-[#646464] mt-1">
                            Source: {citation.source}
                          </p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-[#F20505] group-hover:underline">
                          <span>Click to view</span>
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}