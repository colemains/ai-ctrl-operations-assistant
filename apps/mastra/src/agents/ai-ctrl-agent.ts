import Anthropic from '@anthropic-ai/sdk';
import { AuthContext } from '@ai-ctrl/contracts';
import { SMCTicketAdapter } from '@ai-ctrl/tool-smc';
import { AlertAdapter } from '@ai-ctrl/tool-alerts';

type QueryType =
  | 'SEVERITY_GROUPED'
  | 'AUTH_PATTERN'
  | 'ELASTIC_CAPACITY'
  | 'CLIENT_STATUS'
  | 'NETWORK_ISSUES'
  | 'SECURITY_PATTERNS'
  | 'INFRASTRUCTURE_CAPACITY'
  | 'CROSS_CLIENT_CORRELATION'
  | 'GENERIC';

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
        return {
          success: false,
          error: `Failed to fetch tickets: ${ticketsResult.error}`
        };
      }

      if (!alertsResult.success) {
        return {
          success: false,
          error: `Failed to fetch alerts: ${alertsResult.error}`
        };
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
        q.includes('beta financial') || q.includes('gamma healthcare') ||
        q.includes('delta logistics')) {
      return 'CLIENT_STATUS';
    }

    // Pattern 5: Network issues
    if (q.includes('network') || q.includes('vpn') || q.includes('firewall') ||
        q.includes('latency') || q.includes('bandwidth')) {
      return 'NETWORK_ISSUES';
    }

    // Pattern 6: Security patterns
    if (q.includes('security') || q.includes('failed login') || q.includes('mfa') ||
        q.includes('unauthorized access') || q.includes('certificate') || q.includes('compliance')) {
      return 'SECURITY_PATTERNS';
    }

    // Pattern 7: Infrastructure capacity
    if ((q.includes('infrastructure') || q.includes('cpu') || q.includes('memory') ||
         q.includes('storage') || q.includes('snapshot')) &&
        (q.includes('capacity') || q.includes('utilization') || q.includes('warning'))) {
      return 'INFRASTRUCTURE_CAPACITY';
    }

    // Pattern 8: Cross-client correlation
    if ((q.includes('cross-client') || q.includes('multiple clients') ||
         q.includes('all clients') || q.includes('across clients') || q.includes('similar issues')) &&
        (q.includes('pattern') || q.includes('correlation') || q.includes('affecting'))) {
      return 'CROSS_CLIENT_CORRELATION';
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

      case 'NETWORK_ISSUES':
        return this.generateNetworkIssuesResponse(tickets, alerts, query, timestamp);

      case 'SECURITY_PATTERNS':
        return this.generateSecurityPatternsResponse(tickets, alerts, query, timestamp);

      case 'INFRASTRUCTURE_CAPACITY':
        return this.generateInfrastructureCapacityResponse(tickets, alerts, query, timestamp);

      case 'CROSS_CLIENT_CORRELATION':
        return this.generateCrossClientCorrelationResponse(tickets, alerts, query, timestamp);

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

      const relatedAlert = criticalAlerts.find(a => a.client === ticket.client);
      if (relatedAlert) {
        response += `  🔔 Alert: ${relatedAlert.alertId} - ${relatedAlert.title}\n`;
        response += `  Severity: ${relatedAlert.severity} | Duration: ${relatedAlert.duration || 'ongoing'}\n`;
      }
      response += `\n`;
    });

    if (highTickets.length > 0) {
      response += `===== ⚠️ HIGH PRIORITY (${highTickets.length}) =====\n\n`;
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
    response += `  Action: ⚠️ Schedule capacity increase THIS WEEK\n`;
    response += `  Related Ticket: INC0012348\n\n`;

    response += `===== ⚠️ WARNING (75-85%) =====\n\n`;
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
      response += `  - Disk Usage: 87% (⚠️ WARNING - capacity planning needed)\n`;
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
      response += `⚠️ WARNING: Schedule Elastic capacity increase within 7 days\n`;
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

    // ADD THESE METHODS TO YOUR EXISTING FILE:

  private generateNetworkIssuesResponse(tickets: any[], alerts: any[], query: string, timestamp: string) {
    const networkAlerts = [
      {
        alertId: 'net-001',
        client: 'Beta Financial Services',
        component: 'vpn-gateway',
        severity: 'high',
        title: 'VPN Gateway High Latency',
        message: 'Site-to-site VPN latency exceeded 200ms (current: 347ms)',
        duration: '4h 15m'
      },
      {
        alertId: 'net-002',
        client: 'Alpha Manufacturing',
        component: 'firewall',
        severity: 'critical',
        title: 'Firewall Connection Limit Reached',
        message: 'Concurrent connections at 98% capacity (49,000/50,000)',
        duration: '2h 0m'
      },
      {
        alertId: 'net-003',
        client: 'Gamma Healthcare',
        component: 'wan-link',
        severity: 'high',
        title: 'WAN Link Packet Loss',
        message: 'Primary WAN link experiencing 3.2% packet loss',
        duration: '1h 30m'
      }
    ];

    let response = `🌐 NETWORK ISSUES DETECTION\n\n`;
    response += `Query: "${query}"\n`;
    response += `Scan Time: ${new Date().toLocaleString()}\n\n`;

    response += `===== SUMMARY =====\n`;
    response += `Active Network Alerts: ${networkAlerts.length}\n`;
    response += `Critical: ${networkAlerts.filter(a => a.severity === 'critical').length}\n`;
    response += `High: ${networkAlerts.filter(a => a.severity === 'high').length}\n`;
    response += `Affected Clients: ${new Set(networkAlerts.map(a => a.client)).size}\n\n`;

    const critical = networkAlerts.filter(a => a.severity === 'critical');
    if (critical.length > 0) {
      response += `===== 🚨 CRITICAL NETWORK ISSUES =====\n\n`;
      critical.forEach(alert => {
        response += `• ${alert.alertId} - [${alert.client}]\n`;
        response += `  Component: ${alert.component}\n`;
        response += `  Issue: ${alert.title}\n`;
        response += `  Details: ${alert.message}\n`;
        response += `  Duration: ${alert.duration}\n\n`;
      });
    }

    const high = networkAlerts.filter(a => a.severity === 'high');
    if (high.length > 0) {
      response += `===== ⚠️ HIGH PRIORITY NETWORK ISSUES =====\n\n`;
      high.forEach(alert => {
        response += `• ${alert.alertId} - [${alert.client}]\n`;
        response += `  Component: ${alert.component}\n`;
        response += `  Issue: ${alert.title}\n`;
        response += `  Details: ${alert.message}\n`;
        response += `  Duration: ${alert.duration}\n\n`;
      });
    }

    response += `===== IMPACT ANALYSIS =====\n`;
    response += `• Beta Financial Services: VPN performance degradation affecting remote users\n`;
    response += `• Alpha Manufacturing: Risk of new connection failures (at capacity)\n`;
    response += `• Gamma Healthcare: Intermittent application timeouts due to packet loss\n\n`;

    response += `===== RECOMMENDED ACTIONS =====\n`;
    response += `1. 🔴 IMMEDIATE: Expand Alpha firewall connection pool before new connections fail\n`;
    response += `2. Investigate Beta VPN gateway - check ISP circuit and gateway CPU\n`;
    response += `3. Run WAN circuit diagnostics for Gamma - coordinate with carrier\n`;
    response += `4. Review firewall rules for Alpha - optimize or migrate to higher capacity device\n`;
    response += `5. Schedule network capacity review for all affected clients\n\n`;

    response += `===== RELATED DOCUMENTATION =====\n`;
    response += `• SOP - Network - VPN Troubleshooting\n`;
    response += `• SOP - Network - Firewall Capacity Planning\n`;
    response += `• Runbook - WAN Circuit Diagnostics\n\n`;

    response += `📌 Citations: ${networkAlerts.map(a => a.alertId).join(', ')}\n`;

    return {
      success: true,
      response,
      usage: { input_tokens: 0, output_tokens: 0 },
      citations: networkAlerts.map(a => a.alertId),
      mock: true,
      queryType: 'NETWORK_ISSUES',
      timestamp,
    };
  }

  private generateSecurityPatternsResponse(tickets: any[], alerts: any[], query: string, timestamp: string) {
    const securityAlerts = [
      {
        alertId: 'sec-001',
        client: 'Beta Financial Services',
        component: 'identity-provider',
        severity: 'critical',
        title: 'Multiple Failed Login Attempts',
        message: '87 failed login attempts from 12 unique IPs in last hour',
        duration: '3h 15m'
      },
      {
        alertId: 'sec-002',
        client: 'Alpha Manufacturing',
        component: 'mfa-service',
        severity: 'high',
        title: 'MFA Enrollment Below Policy',
        message: 'Only 67% of users have MFA enabled (policy requires 90%)',
        duration: '22h 15m'
      },
      {
        alertId: 'sec-003',
        client: 'Gamma Healthcare',
        component: 'access-control',
        severity: 'high',
        title: 'Unauthorized Access Attempt',
        message: 'Attempted access to restricted PHI data by unauthorized service account',
        duration: '5h 45m'
      },
      {
        alertId: 'sec-004',
        client: 'Delta Logistics',
        component: 'certificate-manager',
        severity: 'high',
        title: 'SSL Certificate Expiring Soon',
        message: 'Production SSL certificate expires in 14 days',
        duration: '6h 15m'
      }
    ];

    let response = `🔒 SECURITY ALERT PATTERNS\n\n`;
    response += `Query: "${query}"\n`;
    response += `Analysis Time: ${new Date().toLocaleString()}\n\n`;

    response += `===== SECURITY POSTURE SUMMARY =====\n`;
    response += `Active Security Alerts: ${securityAlerts.length}\n`;
    response += `Critical: ${securityAlerts.filter(a => a.severity === 'critical').length}\n`;
    response += `High: ${securityAlerts.filter(a => a.severity === 'high').length}\n`;
    response += `Clients Affected: ${new Set(securityAlerts.map(a => a.client)).size} of 4\n\n`;

    const critical = securityAlerts.filter(a => a.severity === 'critical');
    if (critical.length > 0) {
      response += `===== 🚨 CRITICAL SECURITY ALERTS =====\n\n`;
      critical.forEach(alert => {
        response += `• ${alert.alertId} - [${alert.client}]\n`;
        response += `  Component: ${alert.component}\n`;
        response += `  Alert: ${alert.title}\n`;
        response += `  Details: ${alert.message}\n`;
        response += `  Active For: ${alert.duration}\n\n`;
      });
    }

    response += `===== ⚠️ HIGH PRIORITY SECURITY ISSUES =====\n\n`;
    securityAlerts.filter(a => a.severity === 'high').forEach(alert => {
      response += `• ${alert.alertId} - [${alert.client}] ${alert.title}\n`;
      response += `  ${alert.message}\n\n`;
    });

    response += `===== THREAT ANALYSIS =====\n`;
    response += `Pattern Type: Mixed - Authentication attacks, compliance gaps, access control\n`;
    response += `Risk Level: HIGH\n\n`;
    response += `Key Findings:\n`;
    response += `• Beta Financial: Potential credential stuffing attack (87 failures, 12 IPs)\n`;
    response += `• Alpha Manufacturing: MFA compliance gap creates vulnerability\n`;
    response += `• Gamma Healthcare: HIPAA compliance risk - unauthorized PHI access attempt\n`;
    response += `• Delta Logistics: Certificate expiry risk - potential service disruption\n\n`;

    response += `===== RECOMMENDED ACTIONS =====\n`;
    response += `1. 🔴 IMMEDIATE: Enable rate limiting on Beta authentication endpoint\n`;
    response += `2. 🔴 IMMEDIATE: Review Gamma access logs - identify unauthorized service account\n`;
    response += `3. Block suspicious IPs at Beta (coordinate with client security team)\n`;
    response += `4. Schedule emergency MFA enrollment campaign for Alpha (67% → 90%)\n`;
    response += `5. Renew Delta SSL certificate within 7 days (14 days until expiry)\n`;
    response += `6. Run security audit across all clients - check for similar patterns\n\n`;

    response += `===== COMPLIANCE IMPACT =====\n`;
    response += `• Gamma Healthcare: HIPAA violation risk - requires incident report\n`;
    response += `• Beta Financial: PCI-DSS concern if payment systems affected\n`;
    response += `• Alpha Manufacturing: SOC 2 control gap (MFA requirement)\n\n`;

    response += `===== RELATED DOCUMENTATION =====\n`;
    response += `• SOP - Security - Incident Response\n`;
    response += `• SOP - Security - Failed Login Investigation\n`;
    response += `• Runbook - Certificate Renewal Process\n`;
    response += `• Policy - MFA Enforcement Requirements\n\n`;

    response += `📌 Citations: ${securityAlerts.map(a => a.alertId).join(', ')}\n`;

    return {
      success: true,
      response,
      usage: { input_tokens: 0, output_tokens: 0 },
      citations: securityAlerts.map(a => a.alertId),
      mock: true,
      queryType: 'SECURITY_PATTERNS',
      timestamp,
    };
  }

  private generateInfrastructureCapacityResponse(tickets: any[], alerts: any[], query: string, timestamp: string) {
    const infraMetrics = [
      {
        client: 'Alpha Manufacturing',
        component: 'compute-cluster',
        metric: 'CPU Utilization',
        value: '89%',
        threshold: '85%',
        status: 'warning',
        trend: 'increasing'
      },
      {
        client: 'Beta Financial Services',
        component: 'storage-array',
        metric: 'Storage Capacity',
        value: '82%',
        threshold: '80%',
        status: 'warning',
        trend: 'stable',
        details: '4.1TB / 5TB used'
      },
      {
        client: 'Gamma Healthcare',
        component: 'memory-pool',
        metric: 'Memory Utilization',
        value: '76%',
        threshold: '80%',
        status: 'healthy',
        trend: 'stable'
      },
      {
        client: 'Delta Logistics',
        component: 'vm-cluster',
        metric: 'Snapshot Age',
        value: '45 days',
        threshold: '30 days',
        status: 'warning',
        trend: 'increasing',
        details: 'Oldest snapshot: 45 days'
      }
    ];

    let response = `🏗️ INFRASTRUCTURE CAPACITY ANALYSIS\n\n`;
    response += `Query: "${query}"\n`;
    response += `Report Generated: ${new Date().toLocaleString()}\n\n`;

    response += `===== CAPACITY SUMMARY =====\n`;
    const warnings = infraMetrics.filter(m => m.status === 'warning');
    const healthy = infraMetrics.filter(m => m.status === 'healthy');
    response += `Total Metrics Monitored: ${infraMetrics.length}\n`;
    response += `⚠️ Warning Thresholds Exceeded: ${warnings.length}\n`;
    response += `✅ Healthy: ${healthy.length}\n`;
    response += `Clients Requiring Attention: ${warnings.length}\n\n`;

    response += `===== ⚠️ RESOURCES APPROACHING CAPACITY =====\n\n`;
    warnings.forEach(metric => {
      response += `• ${metric.client} - ${metric.component}\n`;
      response += `  Metric: ${metric.metric}\n`;
      response += `  Current: ${metric.value} | Threshold: ${metric.threshold}\n`;
      response += `  Trend: ${metric.trend.toUpperCase()}\n`;
      if (metric.details) {
        response += `  Details: ${metric.details}\n`;
      }
      response += `\n`;
    });

    response += `===== ✅ HEALTHY RESOURCES =====\n\n`;
    healthy.forEach(metric => {
      response += `• ${metric.client} - ${metric.component}: ${metric.value} (within normal range)\n`;
    });
    response += `\n`;

    response += `===== CAPACITY FORECAST =====\n`;
    response += `Based on current growth trends:\n\n`;
    response += `• Alpha Manufacturing CPU:\n`;
    response += `  Current: 89% | Weekly Growth: 3-5%\n`;
    response += `  ⚠️ Estimated capacity exhaustion: 2-3 weeks\n`;
    response += `  Action: Schedule compute expansion within 10 days\n\n`;
    response += `• Beta Financial Storage:\n`;
    response += `  Current: 82% (4.1TB/5TB) | Daily Growth: 50GB\n`;
    response += `  ⚠️ Estimated full: 18 days\n`;
    response += `  Action: Provision additional storage or archive old data\n\n`;
    response += `• Delta Logistics Snapshots:\n`;
    response += `  Oldest: 45 days | Policy: 30 days max\n`;
    response += `  Risk: Storage bloat, backup window impact\n`;
    response += `  Action: Implement automated snapshot cleanup\n\n`;

    response += `===== RECOMMENDED ACTIONS =====\n`;
    response += `1. 🔴 URGENT: Schedule Alpha CPU expansion (2-3 weeks to capacity)\n`;
    response += `2. Provision 2TB additional storage for Beta within 2 weeks\n`;
    response += `3. Implement snapshot retention policy for Delta (auto-delete >30 days)\n`;
    response += `4. Run capacity planning review for Alpha (CPU trend concerning)\n`;
    response += `5. Enable automated capacity alerts for all clients\n`;
    response += `6. Consider Delta VM consolidation to reduce snapshot overhead\n\n`;

    response += `===== OPTIMIZATION OPPORTUNITIES =====\n`;
    response += `• Alpha: Right-size VMs - some VMs over-provisioned by 20-30%\n`;
    response += `• Beta: Enable storage deduplication (estimated 15-20% savings)\n`;
    response += `• Delta: Clean up old snapshots (estimated 500GB recovery)\n`;
    response += `• Gamma: Current headroom allows for 30% user growth\n\n`;

    response += `===== RELATED DOCUMENTATION =====\n`;
    response += `• SOP - Infrastructure - Capacity Planning\n`;
    response += `• Runbook - Compute Cluster Expansion\n`;
    response += `• Runbook - Storage Provisioning\n`;
    response += `• Policy - Snapshot Retention Requirements\n\n`;

    response += `📌 Data Sources: vCenter, Storage Arrays, Snapshot Manager\n`;

    return {
      success: true,
      response,
      usage: { input_tokens: 0, output_tokens: 0 },
      citations: ['Infrastructure Metrics', 'Capacity Monitoring'],
      mock: true,
      queryType: 'INFRASTRUCTURE_CAPACITY',
      timestamp,
    };
  }

  private generateCrossClientCorrelationResponse(tickets: any[], alerts: any[], query: string, timestamp: string) {
    let response = `🔗 CROSS-CLIENT CORRELATION ANALYSIS\n\n`;
    response += `Query: "${query}"\n`;
    response += `Analysis Period: Last 48 hours\n`;
    response += `Clients Analyzed: 4 (Alpha Manufacturing, Beta Financial, Gamma Healthcare, Delta Logistics)\n\n`;

    response += `===== CORRELATION SUMMARY =====\n`;
    response += `Patterns Detected: 3\n`;
    response += `Clients Affected by Shared Issues: 3 of 4\n`;
    response += `Platform-Wide Issues: 1\n`;
    response += `Similar Issues (Different Root Cause): 2\n\n`;

    response += `===== 🔴 PATTERN 1: AUTHENTICATION FAILURES =====\n`;
    response += `Type: Platform-Wide Issue\n`;
    response += `Affected Clients: Alpha Manufacturing, Beta Financial Services\n`;
    response += `Timeframe: Jan 15, 08:00 - 12:00 (4 hours)\n`;
    response += `Common Factor: All using Azure AD / Entra ID SSO\n\n`;
    response += `Timeline:\n`;
    response += `08:15 - Alpha reports authentication failures (INC0012345)\n`;
    response += `09:30 - Beta reports similar SSO issues\n`;
    response += `10:45 - Pattern confirmed - Azure AD certificate rotation\n\n`;
    response += `Root Cause: Microsoft Entra ID certificate auto-rotation\n`;
    response += `Impact: ~200 users affected across 2 clients\n`;
    response += `Status: Certificates updated, monitoring for recurrence\n\n`;

    response += `===== ⚠️ PATTERN 2: CAPACITY WARNINGS =====\n`;
    response += `Type: Similar Issue, Different Root Causes\n`;
    response += `Affected Clients: Alpha Manufacturing, Delta Logistics\n\n`;
    response += `Alpha Manufacturing:\n`;
    response += `• Resource: Elastic disk usage (87%)\n`;
    response += `• Cause: High document ingestion rate\n`;
    response += `• Alert: INC0012348\n\n`;
    response += `Delta Logistics:\n`;
    response += `• Resource: Storage array capacity (81%)\n`;
    response += `• Cause: Snapshot accumulation (oldest: 45 days)\n`;
    response += `• No active ticket yet\n\n`;
    response += `Correlation: Both clients approaching capacity thresholds\n`;
    response += `Difference: Different systems, different underlying causes\n`;
    response += `Action: Separate remediation plans required\n\n`;

    response += `===== 📊 PATTERN 3: NETWORK PERFORMANCE =====\n`;
    response += `Type: Potentially Related Issues\n`;
    response += `Affected Clients: Beta Financial, Gamma Healthcare\n\n`;
    response += `Beta Financial:\n`;
    response += `• Issue: Gateway timeout errors (504)\n`;
    response += `• Component: OpenWebUI gateway\n`;
    response += `• Alert: alert-002\n\n`;
    response += `Gamma Healthcare:\n`;
    response += `• Issue: WAN link packet loss (3.2%)\n`;
    response += `• Component: Primary WAN circuit\n`;
    response += `• Alert: net-003\n\n`;
    response += `Possible Connection: Both experiencing connectivity degradation\n`;
    response += `Investigation Needed: Check if both use same ISP or regional circuit\n\n`;

    response += `===== CLIENT-SPECIFIC ISSUES (NO CORRELATION) =====\n`;
    response += `• Delta Logistics: Data connector sync delay (isolated issue)\n`;
    response += `• Gamma Healthcare: Unauthorized access attempt (security-specific)\n\n`;

    response += `===== RECOMMENDED ACTIONS =====\n`;
    response += `1. 🔴 IMMEDIATE: Complete Azure AD certificate validation for remaining clients\n`;
    response += `2. Create proactive monitoring for Azure AD cert expiration\n`;
    response += `3. Schedule capacity planning reviews for Alpha and Delta\n`;
    response += `4. Investigate Beta/Gamma network correlation - check ISP/circuit paths\n`;
    response += `5. Document authentication incident for future reference\n`;
    response += `6. Add cross-client correlation alerts to monitoring\n\n`;

    response += `===== PLATFORM HEALTH SCORE =====\n`;
    response += `Overall Platform Status: HEALTHY WITH CONCERNS\n\n`;
    response += `✅ Strengths:\n`;
    response += `• Most issues are client-specific, not systemic\n`;
    response += `• Authentication issue resolved quickly\n`;
    response += `• Only 1 critical shared vulnerability detected\n\n`;
    response += `⚠️ Areas for Improvement:\n`;
    response += `• Capacity monitoring needs automation\n`;
    response += `• Network performance patterns require investigation\n`;
    response += `• Proactive Azure AD monitoring gaps identified\n\n`;

    response += `===== RELATED DOCUMENTATION =====\n`;
    response += `• SOP - Platform - Cross-Client Incident Management\n`;
    response += `• Runbook - Azure AD Certificate Rotation\n`;
    response += `• Post-Incident Review Template\n\n`;

    response += `📌 Citations: INC0012345, INC0012348, alert-002, net-003\n`;

    return {
      success: true,
      response,
      usage: { input_tokens: 0, output_tokens: 0 },
      citations: ['INC0012345', 'INC0012348', 'alert-002', 'net-003', 'Cross-Client Analysis'],
      mock: true,
      queryType: 'CROSS_CLIENT_CORRELATION',
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
    response += `3. Verify client SSO configurations if auth issues present\n`;
    response += `4. For more specific analysis, try asking:\n`;
    response += `  - "Group by severity"\n`;
    response += `  - "Show authentication patterns"\n`;
    response += `  - "Check Elastic capacity"\n`;
    response += `  - "Status for [Client Name]"\n`;
    response += `  - "Show network issues"\n`;
    response += `  - "Security alert patterns"\n`;
    response += `  - "Infrastructure capacity"\n`;
    response += `  - "Cross-client correlation"\n\n`;

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