import { z } from 'zod';
export declare const AlertSchema: z.ZodObject<{
    alertId: z.ZodString;
    source: z.ZodString;
    clientId: z.ZodString;
    client: z.ZodOptional<z.ZodString>;
    environment: z.ZodString;
    component: z.ZodString;
    severity: z.ZodEnum<["critical", "high", "medium", "low", "informational"]>;
    status: z.ZodEnum<["active", "acknowledged", "resolved", "closed"]>;
    title: z.ZodString;
    message: z.ZodString;
    observedAt: z.ZodString;
    fingerprint: z.ZodString;
    correlationIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sourceUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    alertId: string;
    source: string;
    clientId: string;
    environment: string;
    component: string;
    severity: "critical" | "high" | "medium" | "low" | "informational";
    status: "active" | "acknowledged" | "resolved" | "closed";
    message: string;
    title: string;
    observedAt: string;
    fingerprint: string;
    client?: string | undefined;
    correlationIds?: string[] | undefined;
    sourceUrl?: string | undefined;
}, {
    alertId: string;
    source: string;
    clientId: string;
    environment: string;
    component: string;
    severity: "critical" | "high" | "medium" | "low" | "informational";
    status: "active" | "acknowledged" | "resolved" | "closed";
    message: string;
    title: string;
    observedAt: string;
    fingerprint: string;
    client?: string | undefined;
    correlationIds?: string[] | undefined;
    sourceUrl?: string | undefined;
}>;
export type Alert = z.infer<typeof AlertSchema>;
export declare const TicketSchema: z.ZodObject<{
    id: z.ZodString;
    client: z.ZodString;
    priority: z.ZodEnum<["critical", "high", "medium", "low"]>;
    status: z.ZodEnum<["open", "in_progress", "resolved", "closed"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodOptional<z.ZodString>;
    assigned_to: z.ZodOptional<z.ZodString>;
    problem_type: z.ZodOptional<z.ZodString>;
    environment: z.ZodOptional<z.ZodString>;
    affected_users: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    client: string;
    status: "resolved" | "closed" | "open" | "in_progress";
    title: string;
    id: string;
    priority: "critical" | "high" | "medium" | "low";
    created_at: string;
    environment?: string | undefined;
    description?: string | undefined;
    updated_at?: string | undefined;
    assigned_to?: string | undefined;
    problem_type?: string | undefined;
    affected_users?: number | undefined;
}, {
    client: string;
    status: "resolved" | "closed" | "open" | "in_progress";
    title: string;
    id: string;
    priority: "critical" | "high" | "medium" | "low";
    created_at: string;
    environment?: string | undefined;
    description?: string | undefined;
    updated_at?: string | undefined;
    assigned_to?: string | undefined;
    problem_type?: string | undefined;
    affected_users?: number | undefined;
}>;
export type Ticket = z.infer<typeof TicketSchema>;
export declare const ClientSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    environment: z.ZodString;
    deployment_type: z.ZodString;
    elastic_disk_usage: z.ZodNumber;
    elastic_disk_total: z.ZodString;
    elastic_disk_used: z.ZodString;
    elastic_cluster_status: z.ZodEnum<["green", "yellow", "red"]>;
    openwebui_uptime: z.ZodNumber;
    openwebui_active_users: z.ZodNumber;
    openwebui_avg_response_time: z.ZodNumber;
    last_health_check: z.ZodString;
}, "strip", z.ZodTypeAny, {
    environment: string;
    id: string;
    name: string;
    deployment_type: string;
    elastic_disk_usage: number;
    elastic_disk_total: string;
    elastic_disk_used: string;
    elastic_cluster_status: "green" | "yellow" | "red";
    openwebui_uptime: number;
    openwebui_active_users: number;
    openwebui_avg_response_time: number;
    last_health_check: string;
}, {
    environment: string;
    id: string;
    name: string;
    deployment_type: string;
    elastic_disk_usage: number;
    elastic_disk_total: string;
    elastic_disk_used: string;
    elastic_cluster_status: "green" | "yellow" | "red";
    openwebui_uptime: number;
    openwebui_active_users: number;
    openwebui_avg_response_time: number;
    last_health_check: string;
}>;
export type Client = z.infer<typeof ClientSchema>;
export declare const AuthContextSchema: z.ZodObject<{
    userId: z.ZodString;
    email: z.ZodString;
    role: z.ZodString;
    discipline: z.ZodString;
    authorizedClients: z.ZodArray<z.ZodString, "many">;
    permissions: z.ZodArray<z.ZodString, "many">;
    dataClassificationMaximum: z.ZodEnum<["public", "internal", "confidential", "restricted"]>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    email: string;
    role: string;
    discipline: string;
    authorizedClients: string[];
    permissions: string[];
    dataClassificationMaximum: "public" | "internal" | "confidential" | "restricted";
}, {
    userId: string;
    email: string;
    role: string;
    discipline: string;
    authorizedClients: string[];
    permissions: string[];
    dataClassificationMaximum: "public" | "internal" | "confidential" | "restricted";
}>;
export type AuthContext = z.infer<typeof AuthContextSchema>;
export declare const EvidenceReferenceSchema: z.ZodObject<{
    type: z.ZodEnum<["ticket", "alert", "log", "metric", "document"]>;
    id: z.ZodString;
    source: z.ZodString;
    excerpt: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source: string;
    type: "ticket" | "alert" | "log" | "metric" | "document";
    id: string;
    excerpt?: string | undefined;
    timestamp?: string | undefined;
}, {
    source: string;
    type: "ticket" | "alert" | "log" | "metric" | "document";
    id: string;
    excerpt?: string | undefined;
    timestamp?: string | undefined;
}>;
export type EvidenceReference = z.infer<typeof EvidenceReferenceSchema>;
export declare const HypothesisSchema: z.ZodObject<{
    description: z.ZodString;
    confidence: z.ZodEnum<["low", "medium", "high"]>;
    supporting_evidence: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["ticket", "alert", "log", "metric", "document"]>;
        id: z.ZodString;
        source: z.ZodString;
        excerpt: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }, {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }>, "many">;
    contradicting_evidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["ticket", "alert", "log", "metric", "document"]>;
        id: z.ZodString;
        source: z.ZodString;
        excerpt: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }, {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    confidence: "high" | "medium" | "low";
    supporting_evidence: {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }[];
    contradicting_evidence?: {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }[] | undefined;
}, {
    description: string;
    confidence: "high" | "medium" | "low";
    supporting_evidence: {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }[];
    contradicting_evidence?: {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }[] | undefined;
}>;
export type Hypothesis = z.infer<typeof HypothesisSchema>;
export declare const InvestigationSchema: z.ZodObject<{
    investigationId: z.ZodString;
    alertIds: z.ZodArray<z.ZodString, "many">;
    ticketIds: z.ZodArray<z.ZodString, "many">;
    clientId: z.ZodString;
    component: z.ZodString;
    startedAt: z.ZodString;
    status: z.ZodEnum<["open", "investigating", "resolved", "closed"]>;
    evidence: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["ticket", "alert", "log", "metric", "document"]>;
        id: z.ZodString;
        source: z.ZodString;
        excerpt: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }, {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }>, "many">;
    hypotheses: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        confidence: z.ZodEnum<["low", "medium", "high"]>;
        supporting_evidence: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["ticket", "alert", "log", "metric", "document"]>;
            id: z.ZodString;
            source: z.ZodString;
            excerpt: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }, {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }>, "many">;
        contradicting_evidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["ticket", "alert", "log", "metric", "document"]>;
            id: z.ZodString;
            source: z.ZodString;
            excerpt: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }, {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        confidence: "high" | "medium" | "low";
        supporting_evidence: {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }[];
        contradicting_evidence?: {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }[] | undefined;
    }, {
        description: string;
        confidence: "high" | "medium" | "low";
        supporting_evidence: {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }[];
        contradicting_evidence?: {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }[] | undefined;
    }>, "many">;
    actionsSuggested: z.ZodArray<z.ZodString, "many">;
    humanOwner: z.ZodOptional<z.ZodString>;
    lastUpdatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    clientId: string;
    component: string;
    status: "resolved" | "closed" | "open" | "investigating";
    investigationId: string;
    alertIds: string[];
    ticketIds: string[];
    startedAt: string;
    evidence: {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }[];
    hypotheses: {
        description: string;
        confidence: "high" | "medium" | "low";
        supporting_evidence: {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }[];
        contradicting_evidence?: {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }[] | undefined;
    }[];
    actionsSuggested: string[];
    lastUpdatedAt: string;
    humanOwner?: string | undefined;
}, {
    clientId: string;
    component: string;
    status: "resolved" | "closed" | "open" | "investigating";
    investigationId: string;
    alertIds: string[];
    ticketIds: string[];
    startedAt: string;
    evidence: {
        source: string;
        type: "ticket" | "alert" | "log" | "metric" | "document";
        id: string;
        excerpt?: string | undefined;
        timestamp?: string | undefined;
    }[];
    hypotheses: {
        description: string;
        confidence: "high" | "medium" | "low";
        supporting_evidence: {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }[];
        contradicting_evidence?: {
            source: string;
            type: "ticket" | "alert" | "log" | "metric" | "document";
            id: string;
            excerpt?: string | undefined;
            timestamp?: string | undefined;
        }[] | undefined;
    }[];
    actionsSuggested: string[];
    lastUpdatedAt: string;
    humanOwner?: string | undefined;
}>;
export type Investigation = z.infer<typeof InvestigationSchema>;
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
export declare const ModelUsageRecordSchema: z.ZodObject<{
    requestId: z.ZodString;
    subjectId: z.ZodString;
    organizationId: z.ZodOptional<z.ZodString>;
    discipline: z.ZodString;
    agentId: z.ZodString;
    model: z.ZodString;
    promptVersion: z.ZodOptional<z.ZodString>;
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
    estimatedCostUsd: z.ZodNumber;
    createdAt: z.ZodString;
    clientScope: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    discipline: string;
    requestId: string;
    subjectId: string;
    agentId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
    createdAt: string;
    organizationId?: string | undefined;
    promptVersion?: string | undefined;
    clientScope?: string[] | undefined;
}, {
    discipline: string;
    requestId: string;
    subjectId: string;
    agentId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
    createdAt: string;
    organizationId?: string | undefined;
    promptVersion?: string | undefined;
    clientScope?: string[] | undefined;
}>;
export type ModelUsageRecord = z.infer<typeof ModelUsageRecordSchema>;
export type AccessMode = 'read' | 'write' | 'delete' | 'admin';
export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';
