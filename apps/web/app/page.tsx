'use client';

import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [citations, setCitations] = useState<string[]>([]);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [queryType, setQueryType] = useState<string>('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const exampleQueries = [
    'Show me all active AI CTRL tickets and alerts as of now, grouped by severity',
    'Are there any authentication or connectivity issues affecting multiple AI CTRL clients in the last 48 hours?',
    'Show me all AI CTRL Elastic instances with disk usage above 75% and predict when they will hit capacity',
    'What is the current status for Alpha Manufacturing?',
  ];

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
      const res = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);
      setResponseTime(timeMs);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.success) {
        setResponse(data.response);
        setCitations(data.citations || []);
        setQueryType(data.queryType || '');
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Query error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to AI agent');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  // Format response text for better readability
  const formatResponse = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers (all caps lines with ===)
      if (line.includes('=====')) {
        return (
          <div key={idx} className="text-expedient-red font-extrabold text-base mt-6 mb-3 first:mt-0">
            {line.replace(/=/g, '').trim()}
          </div>
        );
      }

      // Subheaders (lines ending with :)
      if (line.trim().endsWith(':') && line.trim().length < 60) {
        return (
          <div key={idx} className="text-expedient-white font-bold text-sm mt-4 mb-2">
            {line.trim()}
          </div>
        );
      }

      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="text-expedient-smoke font-normal text-sm ml-4 my-1.5 leading-relaxed">
            <span className="text-expedient-red mr-2">•</span>
            {line.replace(/^[•\-]\s*/, '')}
          </div>
        );
      }

      // Critical indicators
      if (line.includes('🚨') || line.includes('⚠️') || line.includes('CRITICAL') || line.includes('WARNING')) {
        return (
          <div key={idx} className="text-expedient-red font-bold text-sm my-2 leading-relaxed">
            {line}
          </div>
        );
      }

      // Success indicators
      if (line.includes('✅') || line.includes('✓')) {
        return (
          <div key={idx} className="text-expedient-white font-normal text-sm my-1.5 leading-relaxed">
            {line}
          </div>
        );
      }

      // Empty lines
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }

      // Regular text
      return (
        <div key={idx} className="text-expedient-smoke font-normal text-sm my-1 leading-relaxed">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-expedient-black">
      {/* Header - Expedient Brand */}
      <header className="border-b border-expedient-charcoal bg-expedient-black">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-expedient-white tracking-tight">
                AI CTRL Operations Assistant
              </h1>
              <p className="text-sm text-expedient-steel mt-1.5 font-normal">
                Multi-discipline support intelligence platform • Read-only access • Evidence-backed analysis
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-expedient-smoke bg-expedient-charcoal px-4 py-2 rounded border border-expedient-steel">
                <span className="w-2 h-2 bg-expedient-red rounded-full animate-pulse"></span>
                <span className="font-normal">Development Mode</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Query Input Section */}
        <div className="bg-expedient-charcoal/30 backdrop-blur-sm rounded border border-expedient-charcoal overflow-hidden">
          <div className="bg-expedient-black/50 px-6 py-4 border-b border-expedient-charcoal">
            <h2 className="text-base font-extrabold text-expedient-white">Query Interface</h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <label htmlFor="query" className="block text-sm font-bold text-expedient-smoke mb-3">
                Enter Your Query
              </label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Example: Show me all active AI CTRL tickets and alerts, grouped by severity..."
                rows={5}
                disabled={loading}
                className="w-full px-4 py-3.5 bg-expedient-black border border-expedient-steel rounded text-expedient-white placeholder-expedient-steel focus:outline-none focus:ring-2 focus:ring-expedient-red focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-normal text-[15px] leading-relaxed"
              />

              <div className="flex items-center justify-between mt-5">
                <p className="text-xs text-expedient-steel font-normal">
                  Lead with what you need. Be specific. The system has read-only access to tickets, alerts, and operational data.
                </p>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-6 py-3 bg-expedient-red hover:bg-[#C20404] disabled:bg-expedient-charcoal disabled:cursor-not-allowed text-expedient-white font-extrabold rounded transition-all duration-200 flex items-center gap-2.5 text-sm tracking-wide disabled:text-expedient-steel shadow-lg hover:shadow-expedient-red/50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      ANALYZING
                    </>
                  ) : (
                    'ANALYZE'
                  )}
                </button>
              </div>
            </form>

            {/* Example Queries */}
            <div className="mt-8 pt-8 border-t border-expedient-charcoal">
              <p className="text-sm font-bold text-expedient-smoke mb-4">Example Queries</p>
              <div className="space-y-3">
                {exampleQueries.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(example)}
                    disabled={loading}
                    className="w-full text-left px-5 py-4 bg-expedient-black/50 hover:bg-expedient-charcoal/50 border border-expedient-charcoal hover:border-expedient-red rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-expedient-red font-extrabold text-xs mt-0.5 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <p className="text-expedient-smoke group-hover:text-expedient-white font-normal text-sm leading-relaxed">
                        {example}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Response Section */}
        {(response || error) && (
          <div className="mt-8 bg-expedient-charcoal/30 backdrop-blur-sm rounded border border-expedient-charcoal overflow-hidden">
            {/* Response Header */}
            <div className="bg-expedient-black/50 px-6 py-4 border-b border-expedient-charcoal">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-base font-extrabold text-expedient-white">
                    {error ? 'Error Response' : 'Analysis Result'}
                  </h2>
                  {queryType && (
                    <span className="px-3 py-1 bg-expedient-red/20 text-expedient-red text-xs font-bold rounded border border-expedient-red/30">
                      {queryType.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                {responseTime !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-expedient-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-expedient-white font-extrabold">{responseTime}</span>
                    <span className="text-expedient-steel font-normal">ms</span>
                  </div>
                )}
              </div>
            </div>

            {/* Response Content */}
            <div className="p-8">
              {error ? (
                <div className="bg-expedient-red/10 border border-expedient-red/50 rounded p-5">
                  <p className="text-expedient-red font-normal text-sm leading-relaxed">{error}</p>
                </div>
              ) : (
                <>
                  <div className="bg-expedient-black/30 rounded-lg p-8 border border-expedient-charcoal">
                    <div className="space-y-1">
                      {formatResponse(response)}
                    </div>
                  </div>

                  {/* Evidence & Citations */}
                  {citations.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-expedient-charcoal">
                      <h3 className="text-sm font-extrabold text-expedient-white mb-4">Evidence & Citations</h3>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {citations.map((citation, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-expedient-black/50 border border-expedient-red/50 rounded text-xs font-bold text-expedient-red hover:border-expedient-red hover:bg-expedient-red/10 transition-colors"
                            >
                              {citation}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-expedient-steel font-normal mt-4">
                          Data retrieved from: SMC Ticketing System, Alert Monitor, Elastic Cluster Metrics
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-10 text-center space-y-3">
          <p className="text-sm text-expedient-steel font-normal">
            Read-only access • All queries audited • No production modifications permitted
          </p>
          <div className="inline-flex items-center gap-2 bg-expedient-charcoal/30 px-4 py-2 rounded border border-expedient-charcoal">
            <span className="w-2 h-2 bg-expedient-red rounded-full animate-pulse"></span>
            <span className="text-xs text-expedient-steel font-normal">Local Development Environment • Mock Data</span>
          </div>
        </div>
      </main>
    </div>
  );
}