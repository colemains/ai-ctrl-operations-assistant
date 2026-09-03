// Authentication & Authorization
export interface AuthContext {
  userId: string;
  organizationId: string;
  discipline: 'SMC' | 'NOC' | 'Security' | 'Engineering';
  authorizedClients: string[];
  email?: string;
  role?: string;
  dataClassificationMaximum?: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
}

// Tickets
export type TicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';
export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  client: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Alerts
export type AlertSeverity = 'Critical' | 'Warning' | 'Info';
export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  client: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metadata?: Record<string, unknown>;
}

// Tool Results
export interface ToolResult<T> {
  success: boolean;
  data: T;
  error?: string;
  metadata?: {
    timestamp: string;
    executionTime?: number;
    [key: string]: unknown;
  };
  citations?: string[];
}

// Activity Logs
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
