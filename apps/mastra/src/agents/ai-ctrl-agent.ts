import Anthropic from '@anthropic-ai/sdk';
import { AuthContext } from '@ai-ctrl/contracts';
import { SMCTicketAdapter } from '@ai-ctrl/tool-smc';
import { AlertAdapter } from '@ai-ctrl/tool-alerts';

type QueryType = 'SEVERITY_GROUPED' | 'AUTH_PATTERN' | 'ELASTIC_CAPACITY' | 'CLIENT_STATUS' | 'GENERIC';

export class AICTRLAgent {
  private anthropic: Anthropic;
  private ticketAdapter: SMCTicketAdapter;
  private alertAdapter: AlertAdapter;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || 'mock-api-key-for-testing';
    this.anthropic = new Anthropic({ apiKey });
    this.ticketAdapter = new SMCTicketAdapter();
    this.alertAdapter = new AlertAdapter();
  }

  async processQuery(query: string, authContext: AuthContext) {
    console.log('🤖 Processing query:', query);
    console.log('👤 User:', authContext.email, '| Role:', authContext.role);

    try {
      const ticketsResult = await this.ticketAdapter.getTickets(authContext);
      const alertsResult = await this.alertAdapter.getAlerts(authContext);

      if (!ticketsResult.success) {
        return { success: false, error: `Failed to fetch tickets: ${ticketsResult.error}` };
      }
      if (!alertsResult.success) {
        return { success: false, error: `Failed to fetch alerts: ${alertsResult.error}` };
      }

      // Check if we're using real AI or mock mode
      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'mock-api-key-for-testing') {
        // Real AI API call
        const systemPrompt = this.buildSystemPrompt(authContext);
        const dataContext = this.buildDataContext(ticketsResult.data || [], alertsResult.data || []);

        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            { role: 'user', content: `${dataContext}\n\n===== USER QUERY =====\n${query}` }
          ],
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : 'No text response';

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
        // Mock mode with intelligent query detection
        return this.generateSmartMockResponse(query, ticketsResult.data || [], alertsResult.data || []);
      }
    } catch (error) {
      console.error('❌ Agent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during query processing',
      };
    }
  }

  private detectQueryType(query: string): QueryType {
    const q = query.toLowerCase();

    // Pattern 1: Grouped by severity
    if ((q.includes('grouped by') && q.includes('severity')) || 
        (q.includes('all active') && q.includes('tickets') && q.includes('alerts'))) {
      return 'SEVERITY_GROUPED';
    }

    // Pattern 2: Authentication/connectivity patterns
    if ((q.includes('authentication') || q.includes('connectivity')) && 
        (q.includes('multiple') || q.includes('pattern') || q.includes('affecting'))) {
      return 'AUTH_PATTERN';
    }

    // Pattern 3: Elastic capacity/disk usage
    if ((q.includes('elastic') || q.includes('disk')) && 
        (q.includes('usage') || q.includes('capacity') || q.includes('75%') || q.includes('above'))) {
      return 'ELASTIC_CAPACITY';
    }

    // Pattern 4: Client-specific status
    if (q.includes('status for') || q.includes('alpha manufacturing') || 
        q.includes('beta financial') || q.includes('gamma healthcare') || q.includes('delta logistics')) {
      return 'CLIENT_STATUS';
    }

    return 'GENERIC';
  }

  private extractClientName(query: string): string {
    const q = query.toLowerCase();
    if (q.includes('alpha manufacturing')) return 'Alpha Manufacturing';
    if (q.includes('beta financial')) return 'Beta Financial Services';
    if (q.includes('gamma healthcare')) return 'Gamma Healthcare';
    if (q.includes('delta logistics')) return 'Delta Logistics';
    return 'Unknown Client';
  }

  private generateSmartMockResponse(query: string, tickets: any[], alerts: any[]) {
    const queryType = this.detectQueryType(query);
    const timestamp = new Date().toISOString();

    console.log('🎯 Detected query type:', queryType);

    switch (queryType) {
      case 'SEVERITY_GROUPED':
        return this.generateSeverityGroupedResponse(tickets, alerts, query, timestamp);
      
      case 'AUTH_PATTERN':
        return this.generateAuthPatternResponse(tickets, alerts, query, timestamp);
      
      case 'ELASTIC_CAPACITY':
        return this.generateElasticCapacityResponse(tickets, alerts, query, timestamp);
      
      case 'CLIENT_STATUS':
        const clientName = this.extractClientName(query);
        return this.generateClientStatusResponse(clientName, tickets, alerts, query, timestamp);
      
      default:
        return this.generateGenericResponse(tickets, alerts, query, timestamp);
    }
  }

  private generateSeverityGroupedResponse(tickets: any[], alerts: any[], query: string, timestamp: string) {
    const criticalTickets = tickets.filter(t => t.priority === 'critical');
    const highTickets = tickets.filter(t => t.priority === 'high');
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');

    let response = `📊 ACTIVE AI CTRL TICKETS AND ALERTS (as of ${new Date().toLocaleString()})\n\n`;
    response += `Query: "${query}"\n\n`;
    
    response += `===== SUMMARY =====\n`;
    response += `Total Tickets: ${tickets.length} | Total Alerts: ${alerts.length}\n`;
    response += `Critical: ${criticalTickets.length} tickets, ${criticalAlerts.length} alerts\n`;
    response += `High Priority: ${highTickets.length} tickets\n\n`;

    response += `===== 🚨 CRITICAL (${criticalTickets.length} tickets, ${criticalAlerts.length} alerts) =====\n\n`;
    
    criticalTickets.forEach(ticket => {
      response += `• Ticket ${ticket.id} - [${ticket.client}]\n`;
      response += `  ${ticket.title}\n`;
      response += `  Status: ${ticket.status} | Assigned: ${ticket.assignedTo}\n`;
      
      // Find related alerts
      const relatedAlert = criticalAlerts.find(a => a.client === ticket.client);
      if (relatedAlert) {
        response += `  🔔 Alert: ${relatedAlert.alertId} - ${relatedAlert.title}\n`;
        response += `     Severity: ${relatedAlert.severity} | Duration: ${relatedAlert.duration || 'ongoing'}\n`;
      }
      response += `\n`;
    });

    if (highTickets.length > 0) {
      response += `===== ⚠️  HIGH PRIORITY (${highTickets.length}) =====\n\n`;
      highTickets.forEach(ticket => {
        response += `• Ticket ${ticket.id} - [${ticket.client}] ${ticket.title}\n`;
        response += `  Status: ${ticket.status} | Assigned: ${ticket.assignedTo}\n\n`;
      });
    }

    response += `===== 📋 RECOMMENDED ACTIONS =====\n`;
    response += `1. ${criticalTickets[0]?.title.includes('Authentication') ? 'SSO issue requires immediate escalation (affects all users)' : 'Review critical items immediately'}\n`;
    response += `2. Check for correlations between tickets and alerts\n`;
    response += `3. Verify client SSO configurations if auth issues present\n`;
    response += `4. Update SMC tickets with current investigation status\n\n`;

    response += `📌 Citations: ${tickets.map(t => t.id).join(', ')} | ${alerts.map(a => a.alertId).join(', ')}\n`;

    return {
      success: true,
      response,
      usage: { input_tokens: 0, output_tokens: 0 },
      citations: [...tickets.map(t => t.id), ...alerts.map(a => a.alertId)],
      mock: true,
      queryType: 'SEVERITY_GROUPED',
      timestamp,
    };
  }

  private generateAuthPatternResponse(tickets: any[], alerts: any[], query: string, timestamp: string) {
    const authTickets = tickets.filter(t => 
      t.title.toLowerCase().includes('authentication') || 
      t.title.toLowerCase().includes('sso')
    );

    let response = `🔍 PATTERN DETECTION: Authentication Issues\n\n`;
    response += `Query: "${query}"\n\n`;

    response += `===== PATTERN DETECTED =====\n`;
    response += `Issue Type: Authentication Failures\n`;
    response += `Affected Clients: ${authTickets.length} (${authTickets.map(t => t.client).join(', ')})\n`;
    response += `Timeframe: Last 48 hours\n`;
    response += `Common Pattern: Azure AD / Entra ID integration\n\n`;

    response += `===== TIMELINE =====\n`;
    authTickets.forEach((ticket, idx) => {
      const hoursAgo = 2 + (idx * 4);
      response += `${hoursAgo}h ago - ${ticket.client} first report (${ticket.id})\n`;
    });
    response += `\n`;

    response += `===== COMMON ERROR =====\n`;
    response += `"OIDC token validation failed"\n`;
    response += `"SSO integration broken"\n\n`;

    response += `===== ROOT CAUSE HYPOTHESIS =====\n`;
    response += `Microsoft Entra ID certificate rotation (known issue pattern from SOP-AI-AUTH-003)\n\n`;

    response += `===== RECOMMENDED ACTION =====\n`;
    response += `1. Verify certificate renewal across all Azure AD integrations\n`;
    response += `2. Check SOP - AI CTRL - Azure AD Integration Troubleshooting\n`;
    response += `3. Proactive communication to all Azure AD clients\n`;
    response += `4. Schedule bulk certificate validation for remaining clients\n\n`;

    response += `===== RELATED DOCUMENTATION =====\n`;
    response += `• SOP - AI Deploy - Service Delivery (SSO Configuration)\n`;
    response += `• Known Issue: Azure AD Certificate Rotation Impact\n`;
    response += `• Expedient KB: Azure AD Troubleshooting Guide\n\n`;

    response += `📌 Citations: ${authTickets.map(t => t.id).join(', ')}\n`;

    return {
      success: true,
      response,
      usage: { input_tokens: 0, output_tokens: 0 },
      citations: authTickets.map(t => t.id),
      mock: true,
      queryType: 'AUTH_PATTERN',
      timestamp,
    };
  }

  private generateElasticCapacityResponse(tickets: any[], alerts: any[], query: string, timestamp: string) {
    let response = `💾 ELASTIC CAPACITY ALERT\n\n`;
    response += `Query: "${query}"\n\n`;

    response += `===== 🔴 IMMEDIATE ATTENTION (>85%) =====\n\n`;
    response += `• Alpha Manufacturing - 87% used (450GB / 512GB)\n`;
    response += `  Growth Rate: 8GB/day\n`;
    response += `  Estimated Full: 7 days\n`;
    response += `  Action: ⚠️  Schedule capacity increase THIS WEEK\n`;
    response += `  Related Ticket: INC0012348\n\n`;

    response += `===== ⚠️  WARNING (75-85%) =====\n\n`;
    response += `• Delta Logistics - 81% used (810GB / 1TB)\n`;
    response += `  Growth Rate: 12GB/day\n`;
    response += `  Estimated Full: 16 days\n`;
    response += `  Action: Contact client about data retention policy\n`;
    response += `  Note: Highest document ingestion rate (SharePoint connector with 200K+ documents)\n\n`;

    response += `• Beta Financial Services - 78% used (390GB / 500GB)\n`;
    response += `  Growth Rate: 3GB/day\n`;
    response += `  Estimated Full: 36 days\n`;
    response += `  Action: Monitor, schedule review in 2 weeks\n\n`;

    response += `===== ✅ HEALTHY (<75%) =====\n`;
    response += `• Gamma Healthcare - 62% used (healthy)\n\n`;

    response += `===== TREND ANALYSIS =====\n`;
    response += `Average growth rate across all clients: 4.2GB/day\n`;
    response += `Fastest growing: Delta Logistics (12GB/day - SharePoint sync)\n`;
    response += `Most stable: Gamma Healthcare (1.5GB/day)\n\n`;

    response += `===== RECOMMENDED ACTIONS =====\n`;
    response += `1. Immediate capacity increase for Alpha Manufacturing (7 days to full)\n`;
    response += `2. Schedule capacity planning discussion with Delta Logistics\n`;
    response += `3. Review data retention policies with clients over 75%\n`;
    response += `4. Enable auto-cleanup for aged indices (recommend 90-day retention)\n`;
    response += `5. Consider archival strategy for Delta Logistics SharePoint data\n\n`;

    response += `📌 Data Source: Elastic API - Last polled ${new Date().toLocaleTimeString()}\n`;

    return {
      success: true,
      response,
      usage: { input_tokens: 0, output_tokens: 0 },
      citations: ['Elastic Cluster Metrics', 'INC0012348'],
      mock: true,
      queryType: 'ELASTIC_CAPACITY',
      timestamp,
    };
  }

  private generateClientStatusResponse(clientName: string, tickets: any[], alerts: any[], query: string, timestamp: string) {
    const clientTickets = tickets.filter(t => t.client === clientName);
    const clientAlerts = alerts.filter(a => a.client === clientName);

    let response = `📊 CLIENT HEALTH STATUS: ${clientName}\n\n`;
    response += `Query: "${query}"\n`;
    response += `Last Updated: ${new Date().toLocaleString()}\n`;
    response += `Deployment: AI CTRL (Gateway + Elastic + SharePoint Connector)\n\n`;

    response += `===== TICKETS (Last 7 Days) =====\n`;
    response += `Active: ${clientTickets.filter(t => t.status !== 'closed').length}\n`;
    response += `Closed: ${clientTickets.filter(t => t.status === 'closed').length}\n`;
    if (clientTickets.length > 0) {
      response += `\nCurrent Issues:\n`;
      clientTickets.forEach(ticket => {
        response += `• ${ticket.id} - ${ticket.priority.toUpperCase()} - ${ticket.title}\n`;
        response += `  Status: ${ticket.status} | Assigned: ${ticket.assignedTo}\n`;
      });
    }
    response += `\n`;

    response += `===== ALERTS =====\n`;
    if (clientAlerts.length > 0) {
      response += `Active Alerts: ${clientAlerts.length}\n`;
      clientAlerts.forEach(alert => {
        response += `• ${alert.alertId} - ${alert.severity.toUpperCase()} - ${alert.title}\n`;
        response += `  Component: ${alert.component} | Duration: ${alert.duration || 'ongoing'}\n`;
      });
    } else {
      response += `No active alerts ✅\n`;
    }
    response += `\n`;

    response += `===== PLATFORM METRICS =====\n`;
    response += `OpenWebUI:\n`;
    response += `  - Uptime: 99.12%\n`;
    response += `  - Active Users: 47 (↑ 12% week-over-week)\n`;
    response += `  - Avg Response Time: 2.3s\n`;
    response += `  - Model Usage: Claude Sonnet (68%), GPT-4o (32%)\n\n`;

    response += `Elastic:\n`;
    if (clientName === 'Alpha Manufacturing') {
      response += `  - Disk Usage: 87% (⚠️  WARNING - capacity planning needed)\n`;
    } else {
      response += `  - Disk Usage: 62% (✅ healthy)\n`;
    }
    response += `  - Document Count: 45,234 (SharePoint sync)\n`;
    response += `  - Last Sync: ${new Date().toLocaleString()} (successful)\n`;
    response += `  - Cluster Status: ${clientAlerts.length > 0 ? 'Yellow (active alerts)' : 'Green'}\n\n`;

    response += `===== RECOMMENDATIONS =====\n`;
    const criticalTickets = clientTickets.filter(t => t.priority === 'critical');
    if (criticalTickets.length > 0) {
      response += `❌ CRITICAL: Fix ${criticalTickets[0].title} (blocking users)\n`;
    }
    if (clientName === 'Alpha Manufacturing') {
      response += `⚠️  WARNING: Schedule Elastic capacity increase within 7 days\n`;
    }
    response += `✅ User adoption trending positively\n`;
    response += `💡 Consider reviewing model costs (Claude usage increased 15%)\n\n`;

    response += `📌 Citations: ${clientTickets.map(t => t.id).join(', ') || 'No active tickets'}\n`;

    return {
      success: true,
      response,
      usage: { input_tokens: 0, output_tokens: 0 },
      citations: clientTickets.map(t => t.id),
      mock: true,
      queryType: 'CLIENT_STATUS',
      timestamp,
    };
  }

  private generateGenericResponse(tickets: any[], alerts: any[], query: string, timestamp: string) {
    const criticalTickets = tickets.filter(t => t.priority === 'critical');
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');

    let response = `🤖 AI CTRL OPERATIONS ASSISTANT\n\n`;
    response += `Query: "${query}"\n\n`;

    response += `===== ANALYSIS =====\n`;
    response += `I found ${tickets.length} tickets and ${alerts.length} alerts for your authorized clients.\n\n`;

    if (criticalTickets.length > 0) {
      response += `⚠️  CRITICAL TICKETS (${criticalTickets.length}):\n`;
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
    response += `3. Verify client SSO configurations if auth issues present\n`;
    response += `4. For more specific analysis, try asking:\n`;
    response += `   - "Group by severity"\n`;
    response += `   - "Show authentication patterns"\n`;
    response += `   - "Check Elastic capacity"\n`;
    response += `   - "Status for [Client Name]"\n\n`;

    response += `💡 To enable real AI analysis, set ANTHROPIC_API_KEY in your .env file\n`;

    return {
      success: true,
      response,
      usage: { input_tokens: 0, output_tokens: 0 },
      citations: ['Mock Data'],
      mock: true,
      queryType: 'GENERIC',
      timestamp,
    };
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
Analyze the above data in response to the user's query. Always cite ticket IDs (e.g., INC0012345) and alert IDs (e.g., alert-001) when referencing specific issues.`;
  }
}