"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMCTicketAdapter = void 0;
const authz_1 = require("@ai-ctrl/authz");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class SMCTicketAdapter {
    constructor(mockDataPath) {
        // Default to the mock data location
        this.mockDataPath = mockDataPath || path_1.default.join(__dirname, '../../../data/mock/tickets.json');
    }
    async getTickets(authContext, filters) {
        // Enforce READ-ONLY
        (0, authz_1.enforceReadOnly)('query_tickets');
        try {
            const rawData = await promises_1.default.readFile(this.mockDataPath, 'utf-8');
            let tickets = JSON.parse(rawData);
            // CRITICAL: Filter by authorized clients FIRST
            tickets = (0, authz_1.filterByAuthorizedClients)(authContext, tickets);
            // Apply additional filters
            if (filters?.client) {
                tickets = tickets.filter(t => t.client === filters.client);
            }
            if (filters?.priority) {
                tickets = tickets.filter(t => t.priority === filters.priority);
            }
            if (filters?.status) {
                tickets = tickets.filter(t => t.status === filters.status);
            }
            if (filters?.problem_type) {
                tickets = tickets.filter(t => t.problem_type === filters.problem_type);
            }
            if (filters?.assigned_to) {
                tickets = tickets.filter(t => t.assigned_to === filters.assigned_to);
            }
            return {
                success: true,
                data: tickets,
                citations: ['SMC Mock Data'],
                auditLog: {
                    action: 'query_tickets',
                    resource: 'smc_tickets',
                    timestamp: new Date().toISOString(),
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error reading tickets',
            };
        }
    }
    async getTicketById(authContext, ticketId) {
        (0, authz_1.enforceReadOnly)('get_ticket_by_id');
        try {
            const result = await this.getTickets(authContext);
            if (!result.success || !result.data) {
                return { success: false, error: result.error };
            }
            const ticket = result.data.find(t => t.id === ticketId);
            if (!ticket) {
                return {
                    success: true,
                    data: null,
                    citations: ['SMC Mock Data'],
                };
            }
            return {
                success: true,
                data: ticket,
                citations: ['SMC Mock Data'],
                auditLog: {
                    action: 'get_ticket',
                    resource: 'smc_tickets',
                    resourceId: ticketId,
                    clientId: ticket.client,
                    timestamp: new Date().toISOString(),
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.SMCTicketAdapter = SMCTicketAdapter;
