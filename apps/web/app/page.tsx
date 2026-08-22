'use client';

import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const exampleQueries = [
    "Show me all active AI CTRL tickets and alerts as of now, grouped by severity",
    "Are there any authentication or connectivity issues affecting multiple clients?",
    "Show me all clients with Elastic disk usage above 75%",
    "What's the current status for Alpha Manufacturing?",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const res = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.response || 'No response generated');
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError('Failed to connect to AI agent. Make sure the Mastra service is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (exampleQuery: string) => {
    setQuery(exampleQuery);
    setResponse('');
    setError('');
  };

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🤖 AI CTRL Operations Assistant</h1>
        <p style={styles.subtitle}>READ-ONLY Mock Environment • Phase 1 MVP</p>
      </header>

      <div style={styles.content}>
        <div style={styles.examplesSection}>
          <h3 style={styles.examplesTitle}>💡 Example Queries:</h3>
          <div style={styles.examplesList}>
            {exampleQueries.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example)}
                style={styles.exampleButton}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about tickets, alerts, client status, or operational data..."
            style={styles.textarea}
            rows={4}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              ...styles.submitButton,
              ...(loading || !query.trim() ? styles.submitButtonDisabled : {}),
            }}
          >
            {loading ? '🔄 Processing...' : '🚀 Submit Query'}
          </button>
        </form>

        {error && (
          <div style={styles.errorBox}>
            <h3 style={styles.errorTitle}>❌ Error</h3>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {response && (
          <div style={styles.responseBox}>
            <h3 style={styles.responseTitle}>✅ Response</h3>
            <pre style={styles.responseText}>{response}</pre>
          </div>
        )}

        <footer style={styles.footer}>
          <p>🔒 Read-only access • 🎭 Mock data • 📊 No production systems connected</p>
        </footer>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '2rem',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    margin: 0,
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  examplesSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  examplesTitle: {
    fontSize: '1.2rem',
    marginTop: 0,
    marginBottom: '1rem',
    color: '#1a1a1a',
  },
  examplesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  exampleButton: {
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.2s',
  },
  form: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  textarea: {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '2px solid #ddd',
    fontFamily: 'monospace',
    resize: 'vertical' as const,
    marginBottom: '1rem',
  },
  submitButton: {
    width: '100%',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    border: '2px solid #fc8181',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  errorTitle: {
    color: '#c53030',
    marginTop: 0,
    marginBottom: '0.5rem',
  },
  errorText: {
    color: '#742a2a',
    margin: 0,
  },
  responseBox: {
    backgroundColor: 'white',
    border: '2px solid #48bb78',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  responseTitle: {
    color: '#2f855a',
    marginTop: 0,
    marginBottom: '1rem',
  },
  responseText: {
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'monospace',
    fontSize: '0.95rem',
    margin: 0,
    color: '#1a1a1a',
    lineHeight: '1.6',
  },
  footer: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.9rem',
    marginTop: '3rem',
  },
};