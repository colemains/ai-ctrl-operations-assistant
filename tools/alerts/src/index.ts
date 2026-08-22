import { Alert, ToolResult, AuthContext } from '@ai-ctrl/contracts';
import { enforceReadOnly, filterByAuthorizedClients } from '@ai-ctrl/authz';
import fs from 'fs/promises';
import path from 'path';

export interface AlertFilters {
  severity?: string;
  status?: string;
  component?: string;
  client?: string;
}

export class AlertAdapter {
  private mockDataPath: string;

  constructor(mockDataPath?: string) {
    this.mockDataPath = mockDataPath || path.join(__dirname, '../../../data/mock/alerts.json');
  }

  async getAlerts(
    authContext: AuthContext,
    filters?: AlertFilters
  ): Promise<ToolResult<Alert[]>> {
    enforceReadOnly('query_alerts');

    try {
      const rawData = await fs.readFile(this.mockDataPath, 'utf-8');
      let alerts: Alert[] = JSON.parse(rawData);

      // Filter by authorized clients
      alerts = filterByAuthorizedClients(authContext, alerts);

      // Apply filters
      if (filters?.severity) {
        alerts = alerts.filter(a => a.severity === filters.severity);
      }
      if (filters?.status) {
        alerts = alerts.filter(a => a.status === filters.status);
      }
      if (filters?.component) {
        alerts = alerts.filter(a => a.component === filters.component);
      }
      if (filters?.client) {
        alerts = alerts.filter(a => a.client === filters.client);
      }

      return {
        success: true,
        data: alerts,
        citations: ['Alert System Mock Data'],
        auditLog: {
          action: 'query_alerts',
          resource: 'alerts',
          timestamp: new Date().toISOString(),
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error reading alerts',
      };
    }
  }
}