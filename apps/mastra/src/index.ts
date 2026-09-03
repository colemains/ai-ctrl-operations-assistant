import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AICTRLAgent } from './agents/ai-ctrl-agent.js';
import type { AuthContext, Ticket } from '@ai-ctrl/contracts';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Initialize Agent
const agent = new AICTRLAgent();

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here';

  res.json({
    status: 'healthy',
    service: 'ai-ctrl-mastra',
    timestamp: new Date().toISOString(),
    mode: useMockData ? 'MOCK' : 'LIVE',
    ai: hasAnthropicKey ? 'ANTHROPIC' : 'MOCK',
    version: '1.0.0'
  });
});

// ==================== AI QUERY ====================
app.post('/api/query', async (req, res) => {
  try {
    const { query, authContext } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const userAuthContext: AuthContext = authContext || {
      userId: 'demo-user',
      discipline: 'SMC',
      authorizedClients: []
    };

    const result = await agent.processQuery(query, userAuthContext);

    res.json({

      ...result
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// ==================== TICKETS ====================
app.get('/api/tickets', async (req, res) => {
  try {
    const { status, priority, assignee, client, search } = req.query;

    const authContext: AuthContext = {
      organizationId: "expedient",
      userId: req.headers['x-user-id'] as string || 'demo-user',
      discipline: 'SMC',
      authorizedClients: []
    };

    const ticketsResult = await agent.ticketAdapter.getTickets(authContext);
    let tickets = ticketsResult.data || [];

    // Apply filters
    if (status) {
      tickets = tickets.filter((t: Ticket) => t.status === status);
    }
    if (priority) {
      tickets = tickets.filter((t: Ticket) => t.priority === priority);
    }
    if (assignee) {
      tickets = tickets.filter((t: Ticket) => t.assignedTo === assignee);
    }
    if (client) {
      tickets = tickets.filter((t: Ticket) => t.client === client);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      tickets = tickets.filter((t: Ticket) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower) ||
        t.id.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: tickets,
      count: tickets.length
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tickets'
    });
  }
});

app.get('/api/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    const authContext: AuthContext = {
    organizationId: "expedient",
      userId: req.headers['x-user-id'] as string || 'demo-user',
      discipline: 'SMC',
      authorizedClients: []
    };

    const ticketResult = await agent.ticketAdapter.getTicketById(ticketId, authContext);

    if (!ticketResult.success || !ticketResult.data) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: ticketResult.data
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch ticket'
    });
  }
});

app.patch('/api/tickets/:ticketId/status', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const authContext: AuthContext = {
    organizationId: "expedient",
      userId: req.headers['x-user-id'] as string || 'demo-user',
      discipline: 'SMC',
      authorizedClients: []
    };

    // For demo purposes, we'll just return success
    // In production, this would update the actual ticket system
    const ticketResult = await agent.ticketAdapter.getTicketById(ticketId, authContext);

    if (!ticketResult.success || !ticketResult.data) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Simulate update
    const updatedTicket = { ...ticketResult.data, status };

    res.json({
      success: true,
      data: updatedTicket,
      message: `Ticket ${ticketId} status updated to ${status}`
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update ticket status'
    });
  }
});

app.patch('/api/tickets/:ticketId/assignee', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { assignee } = req.body;

    if (!assignee) {
      return res.status(400).json({
        success: false,
        error: 'Assignee is required'
      });
    }

    const authContext: AuthContext = {
    organizationId: "expedient",
      userId: req.headers['x-user-id'] as string || 'demo-user',
      discipline: 'SMC',
      authorizedClients: []
    };

    const ticketResult = await agent.ticketAdapter.getTicketById(ticketId, authContext);

    if (!ticketResult.success || !ticketResult.data) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    const updatedTicket = { ...ticketResult.data, assignedTo: assignee };

    res.json({
      success: true,
      data: updatedTicket,
      message: `Ticket ${ticketId} assigned to ${assignee}`
    });
  } catch (error) {
    console.error('Update ticket assignee error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update assignee'
    });
  }
});

app.post('/api/tickets/:ticketId/notes', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { note, author } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        error: 'Note content is required'
      });
    }

    res.json({
      success: true,
      data: {
        id: `NOTE-${Date.now()}`,
        ticketId,
        content: note,
        author: author || 'demo-user',
        timestamp: new Date().toISOString()
      },
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add note'
    });
  }
});

app.get('/api/tickets/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    const authContext: AuthContext = {
      organizationId: "expedient",
      userId: req.headers['x-user-id'] as string || 'demo-user',
      discipline: 'SMC',
      authorizedClients: []
    };

    const allTicketsResult = await agent.ticketAdapter.getTickets(authContext);
    const allTickets = allTicketsResult.data || [];
    const searchLower = query.toLowerCase();

    const results = allTickets.filter((t: Ticket) =>
      t.title.toLowerCase().includes(searchLower) ||
      t.description?.toLowerCase().includes(searchLower) ||
      t.id.toLowerCase().includes(searchLower) ||
      t.client.toLowerCase().includes(searchLower)
    );

    res.json({
      success: true,
      data: results,
      count: results.length,
      query
    });
  } catch (error) {
    console.error('Search tickets error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search tickets'
    });
  }
});

// ==================== ACTIVITY LOG ====================
app.get('/api/activity', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Mock activity data for demo
    const activities = [
      {
        id: 'ACT-001',
        timestamp: new Date().toISOString(),
        userId: 'cole.mains',
        userName: 'Cole Mains',
        action: 'status_update',
        resource: 'ticket',
        resourceId: 'INC0012345',
        details: 'Changed status from Open to In Progress',
        metadata: { from: 'Open', to: 'In Progress' }
      },
      {
        id: 'ACT-002',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        userId: 'cole.mains',
        userName: 'Cole Mains',
        action: 'note_generated',
        resource: 'ticket',
        resourceId: 'INC0012345',
        details: 'Generated internal note for ticket',
        metadata: { noteType: 'internal' }
      },
      {
        id: 'ACT-003',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        userId: 'system',
        userName: 'AI CTRL System',
        action: 'workflow_executed',
        resource: 'workflow',
        resourceId: 'WF-RESTART-001',
        details: 'Executed automated restart workflow',
        metadata: { status: 'completed' }
      }
    ];

    const start = parseInt(offset as string);
    const end = start + parseInt(limit as string);
    const paginatedActivities = activities.slice(start, end);

    res.json({
      success: true,
      data: paginatedActivities,
      total: activities.length,
      limit: parseInt(limit as string),
      offset: start
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch activity'
    });
  }
});

app.get('/api/activity/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    res.json({
      success: true,
      data: [],
      message: `Activity for user ${userId}`
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user activity'
    });
  }
});

app.get('/api/activity/:resource/:resourceId', async (req, res) => {
  try {
    const { resource, resourceId } = req.params;

    res.json({
      success: true,
      data: [],
      message: `Activity for ${resource} ${resourceId}`
    });
  } catch (error) {
    console.error('Get resource activity error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch resource activity'
    });
  }
});

// ==================== NOTE GENERATION ====================
app.post('/api/notes/generate', async (req, res) => {
  try {
    const { noteType, context, userName, authContext } = req.body;

    if (!noteType || !context) {
      return res.status(400).json({
        success: false,
        error: 'Note type and context are required'
      });
    }

    if (noteType !== 'internal' && noteType !== 'public') {
      return res.status(400).json({
        success: false,
        error: 'Note type must be "internal" or "public"'
      });
    }

    const userAuthContext: AuthContext = authContext || {
      userId: 'demo-user',
      discipline: 'SMC',
      authorizedClients: []
    };

    const result = await agent.noteGenerator.execute({
      noteType,
      context,
      userName: userName || 'Demo User'
    }, userAuthContext);

    if (result.success) {
      res.json({
        success: true,
        note: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate note'
      });
    }
  } catch (error) {
    console.error('Note generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate note'
    });
  }
});

// ==================== WORKFLOW EXECUTION ====================
app.post('/api/workflows/:workflowId/execute', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { parameters, authContext } = req.body;

    const userAuthContext: AuthContext = authContext || {
      userId: 'demo-user',
      discipline: 'SMC',
      authorizedClients: []
    };

    const result = await agent.executeWorkflow(
      workflowId,
      parameters || {},
      userAuthContext
    );

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Workflow execution failed'
    });
  }
});

// ==================== ANALYTICS/METRICS ====================
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const authContext: AuthContext = {
      organizationId: "expedient",
      userId: req.headers['x-user-id'] as string || 'demo-user',
      discipline: 'SMC',
      authorizedClients: []
    };

    const ticketsResult = await agent.ticketAdapter.getTickets(authContext);
    const alertsResult = await agent.alertAdapter.getAlerts(authContext);
    const tickets = ticketsResult.data || [];
    const alerts = alertsResult.data || [];

    // Calculate metrics
    const openTickets = tickets.filter((t: Ticket) => t.status === 'Open').length;
    const inProgressTickets = tickets.filter((t: Ticket) => t.status === 'In Progress').length;
    const criticalTickets = tickets.filter((t: Ticket) => t.priority === 'Critical').length;
    const highTickets = tickets.filter((t: Ticket) => t.priority === 'High').length;

    const criticalAlerts = alerts.filter((a: any) => a.severity === 'Critical').length;
    const warningAlerts = alerts.filter((a: any) => a.severity === 'Warning').length;

    // Group by client
    const ticketsByClient: Record<string, number> = {};
    tickets.forEach((t: Ticket) => {
      ticketsByClient[t.client] = (ticketsByClient[t.client] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        tickets: {
          total: tickets.length,
          open: openTickets,
          inProgress: inProgressTickets,
          critical: criticalTickets,
          high: highTickets
        },
        alerts: {
          total: alerts.length,
          critical: criticalAlerts,
          warning: warningAlerts
        },
        byClient: ticketsByClient,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log('\n🚀 AI CTRL Mastra Agent Started');
  console.log(`Port: ${port}`);
  console.log(`Mode: ${process.env.USE_MOCK_DATA === 'true' ? 'MOCK DATA' : 'LIVE DATA'}`);
  console.log(`Auth: ${process.env.AUTH_ENABLED === 'true' ? 'ENABLED' : 'DISABLED (Dev Mode)'}`);
  console.log(`AI Model: ${process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here' ? 'Anthropic Claude' : 'Mock Response'}`);
  console.log(`\nEndpoints:`);
  console.log(`  Health:    http://localhost:${port}/health`);
  console.log(`  Query:     http://localhost:${port}/api/query`);
  console.log(`  Tickets:   http://localhost:${port}/api/tickets`);
  console.log(`  Notes:     http://localhost:${port}/api/notes/generate`);
  console.log(`  Analytics: http://localhost:${port}/api/analytics/summary`);
  console.log(`  Workflows: http://localhost:${port}/api/workflows/:id/execute`);
  console.log('');
});
