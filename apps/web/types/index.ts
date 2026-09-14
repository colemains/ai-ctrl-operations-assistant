export interface Ticket {
  id: string;
  title: string;
  client: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';
  discipline: 'SMC' | 'NOC' | 'Security' | 'Engineering';
  summary: string;
  affectedAssets?: string[];
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  tags?: string[];
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  client: string;
  source: string;
  timestamp: string;
  acknowledgedAt?: string | null;
}

export interface AuthContext {
  userId: string;
  organizationId: string;
  discipline: 'SMC' | 'NOC' | 'Security' | 'Engineering';
  authorizedClients: string[];
}