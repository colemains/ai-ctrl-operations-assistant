import express from 'express';
import cors from 'cors';
import { AICTRLAgent } from './agents/ai-ctrl-agent';
import { AuthContext } from '@ai-ctrl/contracts';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware - Allow Codespaces CORS
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Initialize agent
const agent = new AICTRLAgent();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-ctrl-mastra',
    timestamp: new Date().toISOString(),
    mode: process.env.USE_MOCK_DATA === 'true' ? 'MOCK' : 'PRODUCTION',
  });
});

// Main query endpoint
app.post('/api/query', async (req, res) => {
  const { query, authContext } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // Use provided authContext or create mock for development
  const userAuthContext: AuthContext = authContext || {
    userId: 'user-1',
    email: 'cole.mains@expedient.com',
    role: 'AI_CTRL',
    discipline: 'AI_CTRL',
    authorizedClients: ['Alpha Manufacturing', 'Beta Financial Services', 'Gamma Healthcare', 'Delta Logistics'],
    permissions: ['tickets:read', 'alerts:read', 'elastic:read', 'openwebui:read'],
    dataClassificationMaximum: 'confidential',
  };

  console.log('\n📨 Incoming query request:');
  console.log('   User:', userAuthContext.email);
  console.log('   Query:', query);

  try {
    const result = await agent.processQuery(query, userAuthContext);

    console.log('✅ Query processed successfully');

    res.json(result);
  } catch (error) {
    console.error('❌ Query processing failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Query processing failed'
    });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 AI CTRL Mastra Agent Started');
  console.log('================================');
  console.log(`   Port: ${PORT}`);
  console.log(`   Mode: ${process.env.USE_MOCK_DATA === 'true' ? 'MOCK DATA' : 'PRODUCTION'}`);
  console.log(`   Auth: ${process.env.AUTH_ENABLED === 'true' ? 'ENABLED' : 'DISABLED (Dev Mode)'}`);
  console.log(`   AI Model: ${process.env.ANTHROPIC_API_KEY ? 'Claude (Real)' : 'Mock Response'}`);
  console.log('');
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Query:  http://localhost:${PORT}/api/query`);
  console.log('================================');
  console.log('');
});