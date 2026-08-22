import Anthropic from '@anthropic-ai/sdk';
import { AuthContext } from '@ai-ctrl/contracts';
import { SMCTicketAdapter } from '@ai-ctrl/tool-smc';
import { AlertAdapter } from '@ai-ctrl/tool-alerts';

export class AICTRLAgent {
  private anthropic: Anthropic;
  private ticketAdapter: SMCTicketAdapter;
  private alertAdapter: AlertAdapter;

  constructor() {
    // Use mock key if ANTHROPIC_API_KEY not set
    const apiKey = process.env.ANTHROPIC_API_KEY || 'mock-api-key-for-testing';
    
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
    
    this.ticketAdapter = new SMCTicketAdapter();
    this.alertAdapter = new AlertAdapter();
  }

  async processQuery(query: string, authContext: AuthContext) {
    console.log('🤖 Processing query:', query);
    console.log('👤 User:', authContext.email, '| Role:', authContext.role);

    try {
      // Fetch data based on user's authorization
      const ticketsResult = await this.ticketAdapter.getTickets(authContext);
      const alertsResult = await this.alertAdapter.getAlerts(authContext);

      if (!ticketsResult.success) {
        return {
          success: false,
          error: `Failed to fetch tickets: ${ticketsResult.error}`,
        };
      }

      if (!alertsResult.success) {
        return {
          success: false,
          error: `Failed to fetch alerts: ${alertsResult.error}`,
        };
      }

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(authContext);

      // Build data context
      const dataContext = this.buildDataContext(
        ticketsResult.data || [],
        alertsResult.data || []
      );

      // Check if we're in mock mode (no real API key)
      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'mock-api-key-for-testing') {
        // Real API call
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: `${dataContext}\n\n===== USER QUERY =====\n${query}`
            }
          ],
        });

        const responseText = response.content[0].type === 'text' 
          ? response.content[0].text 
          : 'No text response';

        return {
          success: true,
          response: responseText,
          usage: {
            input_tokens: response.usage.input_tokens,
            output_tokens: response.usage.output_tokens,
          },
          citations: [...(ticketsResult.citations || []), ...(alertsResult.citations || [])],
        };
      } else {
        // Mock response when no API key
        return this.generateMockResponse(query, ticketsResult.data || [], alertsResult.data || []);
      }

    } catch (error) {
      console.error('❌ Agent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during query processing',
      };
    }
  }

  private buildSystemPrompt(authContext: AuthContext): string {
    return `You are an AI CTRL Support Engineer assistant for Expedient.

IDENTITY & MISSION:
- You assist support engineers in analyzing tickets, alerts, and operational data
- You have READ-ONLY access to operational data
- You CANNOT modify tickets, restart services, or execute commands

USER CONTEXT:
- Name: ${authContext.email}
- Role: ${authContext.role}
- Discipline: ${authContext.discipline}
- Authorized Clients: ${authContext.authorizedClients.join(', ')}
- Data Classification Max: ${authContext.dataClassificationMaximum}

YOUR CAPABILITIES:
✓ Parse and correlate tickets and alerts
✓ Identify patterns across multiple clients
✓ Provide troubleshooting recommendations
✓ Cite ticket IDs, alert IDs, and documentation
✓ Detect systemic issues

YOUR CONSTRAINTS:
✗ You CANNOT modify tickets or alerts
✗ You CANNOT restart services or execute commands
✗ You CANNOT access clients outside the authorized list
✗ You CANNOT make configuration changes
✗ You MUST cite sources (ticket IDs, alert IDs) for all claims

RESPONSE FORMAT:
1. Lead with the answer (brief summary)
2. Provide supporting details with citations
3. Recommend next steps (read-only validation steps only)
4. State explicitly when you're uncertain

When unsure, say so explicitly. Do not guess or hallucinate data.`;
  }

  private buildDataContext(tickets: any[], alerts: any[]): string {
    return `
===== ACTIVE TICKETS (${tickets.length}) =====
${tickets.length > 0 ? JSON.stringify(tickets, null, 2) : 'No tickets found for authorized clients'}

===== ACTIVE ALERTS (${alerts.length}) =====
${alerts.length > 0 ? JSON.stringify(alerts, null, 2) : 'No alerts found for authorized clients'}

===== INSTRUCTIONS =====
Analyze the above data in response to the user's query.
Always cite ticket IDs (e.g., INC0012345) and alert IDs (e.g., alert-001) when referencing specific issues.`;
  }

  private generateMockResponse(query: string, tickets: any[], alerts: any[]) {
    const criticalTickets = tickets.filter(t => t.priority === 'critical');
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');

    let response = `🤖 MOCK RESPONSE (No AI API key configured)\n\n`;
    response += `Query: "${query}"\n\n`;
    response += `===== ANALYSIS =====\n`;
    response += `I found ${tickets.length} tickets and ${alerts.length} alerts for your authorized clients.\n\n`;

    if (criticalTickets.length > 0) {
      response += `⚠️ CRITICAL TICKETS (${criticalTickets.length}):\n`;
      criticalTickets.forEach(t => {
        response += `  • ${t.id} - [${t.client}] ${t.title}\n`;
      });
      response += `\n`;
    }

    if (criticalAlerts.length > 0) {
      response += `🚨 CRITICAL ALERTS (${criticalAlerts.length}):\n`;
      criticalAlerts.forEach(a => {
        response += `  • ${a.alertId} - [${a.client}] ${a.title}\n`;
      });
      response += `\n`;
    }

    response += `===== RECOMMENDATIONS =====\n`;
    response += `1. Review critical items immediately\n`;
    response += `2. Check for correlations between tickets and alerts\n`;
    response += `3. Verify client SSO configurations if auth issues present\n\n`;

    response += `💡 To enable real AI analysis, set ANTHROPIC_API_KEY in your .env file\n`;

    return {
      success: true,
      response: response,
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
      citations: ['Mock Data'],
      mock: true,
    };
  }
}