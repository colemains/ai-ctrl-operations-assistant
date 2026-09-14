import type { Alert, ToolResult, AuthContext } from '@ai-ctrl/contracts';
import { canAccessClient } from '@ai-ctrl/authz';
import alertsData from '../../../data/mock/alerts.json';

export class AlertAdapter {
  private alerts: Alert[];

  constructor() {
    this.alerts = (alertsData as unknown as Array<{
      message: string;
      observedAt: string;
      [key: string]: unknown;
    }>).map(alert => ({
      ...alert,
      description: alert.message,
      triggeredAt: alert.observedAt
    })) as unknown as Alert[];
  }

  async getAlerts(authContext: AuthContext): Promise<ToolResult<Alert[]>> {
    try {
      const authorizedAlerts = this.alerts.filter(alert =>
        canAccessClient(authContext, alert.client)
      );

      return {
        success: true,
        data: authorizedAlerts,
        error: undefined
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch alerts'
      };
    }
  }

  async getAlertById(
    alertId: string,
    authContext: AuthContext
  ): Promise<ToolResult<Alert | null>> {
    try {
      const alert = this.alerts.find(a => a.id === alertId);

      if (!alert) {
        return {
          success: false,
          data: null,
          error: `Alert ${alertId} not found`
        };
      }

      if (!canAccessClient(authContext, alert.client)) {
        return {
          success: false,
          data: null,
          error: 'Access denied to this alert'
        };
      }

      return {
        success: true,
        data: alert,
        error: undefined
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch alert'
      };
    }
  }

  async acknowledgeAlert(
    alertId: string,
    authContext: AuthContext
  ): Promise<ToolResult<Alert>> {
    try {
      const alert = this.alerts.find(a => a.id === alertId);

      if (!alert) {
        return {
          success: false,
          data: null as any,
          error: `Alert ${alertId} not found`
        };
      }

      if (!canAccessClient(authContext, alert.client)) {
        return {
          success: false,
          data: null as any,
          error: 'Access denied to this alert'
        };
      }

      alert.acknowledgedAt = new Date().toISOString();

      return {
        success: true,
        data: alert,
        error: undefined
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : 'Failed to acknowledge alert'
      };
    }
  }

  async getAlertsBySeverity(
    severity: Alert['severity'],
    authContext: AuthContext
  ): Promise<ToolResult<Alert[]>> {
    try {
      const results = this.alerts.filter(alert =>
        alert.severity === severity && canAccessClient(authContext, alert.client)
      );

      return {
        success: true,
        data: results,
        error: undefined
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch alerts by severity'
      };
    }
  }

  async getUnacknowledgedAlerts(
    authContext: AuthContext
  ): Promise<ToolResult<Alert[]>> {
    try {
      const results = this.alerts.filter(alert =>
        !alert.acknowledgedAt && canAccessClient(authContext, alert.client)
      );

      return {
        success: true,
        data: results,
        error: undefined
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch unacknowledged alerts'
      };
    }
  }

  async searchAlerts(
    query: string,
    authContext: AuthContext
  ): Promise<ToolResult<Alert[]>> {
    try {
      const lowerQuery = query.toLowerCase();
      const results = this.alerts.filter(alert => {
        const matchesQuery =
          alert.title.toLowerCase().includes(lowerQuery) ||
          alert.description.toLowerCase().includes(lowerQuery) ||
          alert.client.toLowerCase().includes(lowerQuery);

        return matchesQuery && canAccessClient(authContext, alert.client);
      });

      return {
        success: true,
        data: results,
        error: undefined
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }
}