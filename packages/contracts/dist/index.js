"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelUsageRecordSchema = exports.InvestigationSchema = exports.HypothesisSchema = exports.EvidenceReferenceSchema = exports.AuthContextSchema = exports.ClientSchema = exports.TicketSchema = exports.AlertSchema = void 0;
const zod_1 = require("zod");
// ============================================================================
// ALERT SCHEMAS
// ============================================================================
exports.AlertSchema = zod_1.z.object({
    alertId: zod_1.z.string(),
    source: zod_1.z.string(),
    clientId: zod_1.z.string(),
    client: zod_1.z.string().optional(),
    environment: zod_1.z.string(),
    component: zod_1.z.string(),
    severity: zod_1.z.enum(['critical', 'high', 'medium', 'low', 'informational']),
    status: zod_1.z.enum(['active', 'acknowledged', 'resolved', 'closed']),
    title: zod_1.z.string(),
    message: zod_1.z.string(),
    observedAt: zod_1.z.string().datetime(),
    fingerprint: zod_1.z.string(),
    correlationIds: zod_1.z.array(zod_1.z.string()).optional(),
    sourceUrl: zod_1.z.string().optional(),
});
// ============================================================================
// TICKET SCHEMAS
// ============================================================================
exports.TicketSchema = zod_1.z.object({
    id: zod_1.z.string(),
    client: zod_1.z.string(),
    priority: zod_1.z.enum(['critical', 'high', 'medium', 'low']),
    status: zod_1.z.enum(['open', 'in_progress', 'resolved', 'closed']),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime().optional(),
    assigned_to: zod_1.z.string().optional(),
    problem_type: zod_1.z.string().optional(),
    environment: zod_1.z.string().optional(),
    affected_users: zod_1.z.number().optional(),
});
// ============================================================================
// CLIENT SCHEMAS
// ============================================================================
exports.ClientSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    environment: zod_1.z.string(),
    deployment_type: zod_1.z.string(),
    elastic_disk_usage: zod_1.z.number(),
    elastic_disk_total: zod_1.z.string(),
    elastic_disk_used: zod_1.z.string(),
    elastic_cluster_status: zod_1.z.enum(['green', 'yellow', 'red']),
    openwebui_uptime: zod_1.z.number(),
    openwebui_active_users: zod_1.z.number(),
    openwebui_avg_response_time: zod_1.z.number(),
    last_health_check: zod_1.z.string().datetime(),
});
// ============================================================================
// AUTH CONTEXT
// ============================================================================
exports.AuthContextSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    email: zod_1.z.string().email(),
    role: zod_1.z.string(),
    discipline: zod_1.z.string(),
    authorizedClients: zod_1.z.array(zod_1.z.string()),
    permissions: zod_1.z.array(zod_1.z.string()),
    dataClassificationMaximum: zod_1.z.enum(['public', 'internal', 'confidential', 'restricted']),
});
// ============================================================================
// INVESTIGATION SCHEMAS
// ============================================================================
exports.EvidenceReferenceSchema = zod_1.z.object({
    type: zod_1.z.enum(['ticket', 'alert', 'log', 'metric', 'document']),
    id: zod_1.z.string(),
    source: zod_1.z.string(),
    excerpt: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().datetime().optional(),
});
exports.HypothesisSchema = zod_1.z.object({
    description: zod_1.z.string(),
    confidence: zod_1.z.enum(['low', 'medium', 'high']),
    supporting_evidence: zod_1.z.array(exports.EvidenceReferenceSchema),
    contradicting_evidence: zod_1.z.array(exports.EvidenceReferenceSchema).optional(),
});
exports.InvestigationSchema = zod_1.z.object({
    investigationId: zod_1.z.string(),
    alertIds: zod_1.z.array(zod_1.z.string()),
    ticketIds: zod_1.z.array(zod_1.z.string()),
    clientId: zod_1.z.string(),
    component: zod_1.z.string(),
    startedAt: zod_1.z.string().datetime(),
    status: zod_1.z.enum(['open', 'investigating', 'resolved', 'closed']),
    evidence: zod_1.z.array(exports.EvidenceReferenceSchema),
    hypotheses: zod_1.z.array(exports.HypothesisSchema),
    actionsSuggested: zod_1.z.array(zod_1.z.string()),
    humanOwner: zod_1.z.string().optional(),
    lastUpdatedAt: zod_1.z.string().datetime(),
});
// ============================================================================
// MODEL USAGE (for cost tracking)
// ============================================================================
exports.ModelUsageRecordSchema = zod_1.z.object({
    requestId: zod_1.z.string(),
    subjectId: zod_1.z.string(),
    organizationId: zod_1.z.string().optional(),
    discipline: zod_1.z.string(),
    agentId: zod_1.z.string(),
    model: zod_1.z.string(),
    promptVersion: zod_1.z.string().optional(),
    inputTokens: zod_1.z.number(),
    outputTokens: zod_1.z.number(),
    estimatedCostUsd: zod_1.z.number(),
    createdAt: zod_1.z.string().datetime(),
    clientScope: zod_1.z.array(zod_1.z.string()).optional(),
});
