import { Alert, ToolResult, AuthContext } from '@ai-ctrl/contracts';
import { canAccessClient, filterByAuthorizedClients } from '@ai-ctrl/authz';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Alert Adapter
 * Provides alert management capabilities across all disciplines
 */
export class AlertAdapter {
  private alerts: Alert[] = [];

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    try {
      const dataPath = path.join(__dirname, '../../../data/mock/alerts.json');
      const data = fs.readFileSync(dataPath, 'utf-8');
      this.alerts = JSON.parse(data);
    } catch (error) {
      console.warn('Failed to load mock alert data, using empty array:', error);
      this.alerts = [];
    }
  }

  /**
   * Get all alerts accessible to the user
   */
  async getAlerts(authContext: AuthContext): Promise<ToolResult<Alert[]>> {
    try {
      const accessibleAlerts = filterByAuthorizedClients(
        this.alerts,
        authContext
      );

      return {
        success: true,
        data: accessibleAlerts,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get alerts',
      };
    }
  }

  /**
   * Get a specific alert by ID
   */
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
          error: `Alert ${alertId} not found`,
        };
      }

      // Check if user has access to this alert's client
      if (!canAccessClient(authContext, alert.client)) {
        return {
          success: false,
          data: null,
          error: `Access denied to alert ${alertId}`,
        };
      }

      return {
        success: true,
        data: alert,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get alert',
      };
    }
  }

  /**
   * Acknowledge an alert
   */
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
          error: `Alert ${alertId} not found`,
        };
      }

      // Check if user has access to this alert's client
      if (!canAccessClient(authContext, alert.client)) {
        return {
          success: false,
          data: null as any,
          error: `Access denied to alert ${alertId}`,
        };
      }

      // Set acknowledgedAt timestamp instead of boolean
      alert.acknowledgedAt = new Date().toISOString();

      return {
        success: true,
        data: alert,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : 'Failed to acknowledge alert',
      };
    }
  }

  /**
   * Search alerts by query string
   */
  async searchAlerts(
    query: string,
    authContext: AuthContext
  ): Promise<ToolResult<Alert[]>> {
    try {
      const accessibleAlerts = filterByAuthorizedClients(
        this.alerts,
        authContext
      );

      const lowerQuery = query.toLowerCase();
      const results = accessibleAlerts.filter(alert =>
        alert.title.toLowerCase().includes(lowerQuery) ||
        alert.description.toLowerCase().includes(lowerQuery) ||
        alert.source.toLowerCase().includes(lowerQuery) ||
        alert.client.toLowerCase().includes(lowerQuery)
      );

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to search alerts',
      };
    }
  }

  /**
   * Get alerts by severity
   */
  async getAlertsBySeverity(
    severity: Alert['severity'],
    authContext: AuthContext
  ): Promise<ToolResult<Alert[]>> {
    try {
      const accessibleAlerts = filterByAuthorizedClients(
        this.alerts,
        authContext
      );

      const results = accessibleAlerts.filter(alert => alert.severity === severity);

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to filter alerts by severity',
      };
    }
  }

  /**
   * Get unacknowledged alerts
   */
  async getUnacknowledgedAlerts(
    authContext: AuthContext
  ): Promise<ToolResult<Alert[]>> {
    try {
      const accessibleAlerts = filterByAuthorizedClients(
        this.alerts,
        authContext
      );

      // Filter alerts where acknowledgedAt is null/undefined
      const results = accessibleAlerts.filter(alert => !alert.acknowledgedAt);

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get unacknowledged alerts',
      };
    }
  }
}
