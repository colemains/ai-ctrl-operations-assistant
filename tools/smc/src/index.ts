import { Ticket, ToolResult, AuthContext } from '@ai-ctrl/contracts';
import { canAccessClient, enforceReadOnly, filterByAuthorizedClients } from '@ai-ctrl/authz';
import fs from 'fs/promises';
import path from 'path';

export interface TicketFilters {
  client?: string;
  priority?: string;
  status?: string;
  problem_type?: string;
  assigned_to?: string;
}

export class SMCTicketAdapter {
  private mockDataPath: string;

  constructor(mockDataPath?: string) {
    // Default to the mock data location
    this.mockDataPath = mockDataPath || path.join(__dirname, '../../../data/mock/tickets.json');
  }

  async getTickets(
    authContext: AuthContext,
    filters?: TicketFilters
  ): Promise<ToolResult<Ticket[]>> {
    // Enforce READ-ONLY
    enforceReadOnly('query_tickets');

    try {
      const rawData = await fs.readFile(this.mockDataPath, 'utf-8');
      let tickets: Ticket[] = JSON.parse(rawData);

      // CRITICAL: Filter by authorized clients FIRST
      tickets = filterByAuthorizedClients(authContext, tickets);

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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error reading tickets',
      };
    }
  }

  async getTicketById(
    authContext: AuthContext,
    ticketId: string
  ): Promise<ToolResult<Ticket | null>> {
    enforceReadOnly('get_ticket_by_id');

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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}