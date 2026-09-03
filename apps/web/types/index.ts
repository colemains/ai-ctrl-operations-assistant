/**
 * Frontend type definitions
 * These mirror backend contracts but are maintained separately
 * to avoid build-time dependencies on backend packages
 */

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  client: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  affectedAssets?: string[];
  category?: string;
  notes?: Array<{
    content: string;
    author: string;
    timestamp: string;
  }>;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  source: string;
  client: string;
  timestamp: string;
  acknowledgedAt?: string;
}

export interface AuthContext {
  userId: string;
  organizationId: string;
  discipline: 'SMC' | 'NOC' | 'Security' | 'Engineering';
  authorizedClients: string[];
}
