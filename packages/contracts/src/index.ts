import { z } from 'zod';

// ============================================================================
// ALERT SCHEMAS
// ============================================================================

export const AlertSchema = z.object({
  alertId: z.string(),
  source: z.string(),
  clientId: z.string(),
  client: z.string().optional(),
  environment: z.string(),
  component: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'informational']),
  status: z.enum(['active', 'acknowledged', 'resolved', 'closed']),
  title: z.string(),
  message: z.string(),
  observedAt: z.string().datetime(),
  fingerprint: z.string(),
  correlationIds: z.array(z.string()).optional(),
  sourceUrl: z.string().optional(),
});

export type Alert = z.infer<typeof AlertSchema>;

// ============================================================================
// TICKET SCHEMAS
// ============================================================================

export const TicketSchema = z.object({
  id: z.string(),
  client: z.string(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  title: z.string(),
  description: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
  assigned_to: z.string().optional(),
  problem_type: z.string().optional(),
  environment: z.string().optional(),
  affected_users: z.number().optional(),
});

export type Ticket = z.infer<typeof TicketSchema>;

// ============================================================================
// CLIENT SCHEMAS
// ============================================================================

export const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  environment: z.string(),
  deployment_type: z.string(),
  elastic_disk_usage: z.number(),
  elastic_disk_total: z.string(),
  elastic_disk_used: z.string(),
  elastic_cluster_status: z.enum(['green', 'yellow', 'red']),
  openwebui_uptime: z.number(),
  openwebui_active_users: z.number(),
  openwebui_avg_response_time: z.number(),
  last_health_check: z.string().datetime(),
});

export type Client = z.infer<typeof ClientSchema>;

// ============================================================================
// AUTH CONTEXT
// ============================================================================

export const AuthContextSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.string(),
  discipline: z.string(),
  authorizedClients: z.array(z.string()),
  permissions: z.array(z.string()),
  dataClassificationMaximum: z.enum(['public', 'internal', 'confidential', 'restricted']),
});

export type AuthContext = z.infer<typeof AuthContextSchema>;

// ============================================================================
// INVESTIGATION SCHEMAS
// ============================================================================

export const EvidenceReferenceSchema = z.object({
  type: z.enum(['ticket', 'alert', 'log', 'metric', 'document']),
  id: z.string(),
  source: z.string(),
  excerpt: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export type EvidenceReference = z.infer<typeof EvidenceReferenceSchema>;

export const HypothesisSchema = z.object({
  description: z.string(),
  confidence: z.enum(['low', 'medium', 'high']),
  supporting_evidence: z.array(EvidenceReferenceSchema),
  contradicting_evidence: z.array(EvidenceReferenceSchema).optional(),
});

export type Hypothesis = z.infer<typeof HypothesisSchema>;

export const InvestigationSchema = z.object({
  investigationId: z.string(),
  alertIds: z.array(z.string()),
  ticketIds: z.array(z.string()),
  clientId: z.string(),
  component: z.string(),
  startedAt: z.string().datetime(),
  status: z.enum(['open', 'investigating', 'resolved', 'closed']),
  evidence: z.array(EvidenceReferenceSchema),
  hypotheses: z.array(HypothesisSchema),
  actionsSuggested: z.array(z.string()),
  humanOwner: z.string().optional(),
  lastUpdatedAt: z.string().datetime(),
});

export type Investigation = z.infer<typeof InvestigationSchema>;

// ============================================================================
// TOOL RESULT WRAPPER
// ============================================================================

export interface ToolResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  citations?: string[];
  auditLog?: {
    action: string;
    resource: string;
    resourceId?: string;
    clientId?: string;
    timestamp: string;
  };
}

// ============================================================================
// MODEL USAGE (for cost tracking)
// ============================================================================

export const ModelUsageRecordSchema = z.object({
  requestId: z.string(),
  subjectId: z.string(),
  organizationId: z.string().optional(),
  discipline: z.string(),
  agentId: z.string(),
  model: z.string(),
  promptVersion: z.string().optional(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  estimatedCostUsd: z.number(),
  createdAt: z.string().datetime(),
  clientScope: z.array(z.string()).optional(),
});

export type ModelUsageRecord = z.infer<typeof ModelUsageRecordSchema>;

// ============================================================================
// ACCESS MODES
// ============================================================================

export type AccessMode = 'read' | 'write' | 'delete' | 'admin';

// ============================================================================
// DATA CLASSIFICATION
// ============================================================================

export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';