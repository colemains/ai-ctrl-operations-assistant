import { Ticket, ToolResult, AuthContext } from '@ai-ctrl/contracts';
import { canAccessClient } from '@ai-ctrl/authz';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SMC Ticket Adapter
 * Provides ticket management capabilities for the SMC discipline
 */
export class SMCTicketAdapter {
  private tickets: Ticket[] = [];

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    try {
      const dataPath = path.join(__dirname, '../../../data/mock/tickets.json');
      const data = fs.readFileSync(dataPath, 'utf-8');
      this.tickets = JSON.parse(data);
    } catch (error) {
      console.warn('Failed to load mock ticket data, using empty array:', error);
      this.tickets = [];
    }
  }

  /**
   * Get all tickets accessible to the user
   */
  async getTickets(authContext: AuthContext): Promise<ToolResult<Ticket[]>> {
    try {
      // Filter tickets by authorized clients
      const accessibleTickets = this.tickets.filter(ticket =>
        authContext.authorizedClients.length === 0 ||
        authContext.authorizedClients.includes(ticket.client)
      );

      return {
        success: true,
        data: accessibleTickets,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get tickets',
      };
    }
  }

  /**
   * Get a specific ticket by ID
   */
  async getTicketById(
    ticketId: string,
    authContext: AuthContext
  ): Promise<ToolResult<Ticket | null>> {
    try {
      const ticket = this.tickets.find(t => t.id === ticketId);

      if (!ticket) {
        return {
          success: false,
          data: null,
          error: `Ticket ${ticketId} not found`,
        };
      }

      // Check if user has access to this ticket's client
      if (!canAccessClient(authContext, ticket.client)) {
        return {
          success: false,
          data: null,
          error: `Access denied to ticket ${ticketId}`,
        };
      }

      return {
        success: true,
        data: ticket,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get ticket',
      };
    }
  }

  /**
   * Search tickets by query string
   */
  async searchTickets(
    query: string,
    authContext: AuthContext
  ): Promise<ToolResult<Ticket[]>> {
    try {
      // Filter tickets by authorized clients
      const accessibleTickets = this.tickets.filter(ticket =>
        authContext.authorizedClients.length === 0 ||
        authContext.authorizedClients.includes(ticket.client)
      );

      const lowerQuery = query.toLowerCase();
      const results = accessibleTickets.filter(ticket =>
        ticket.title.toLowerCase().includes(lowerQuery) ||
        ticket.description.toLowerCase().includes(lowerQuery) ||
        ticket.client.toLowerCase().includes(lowerQuery) ||
        ticket.id.toLowerCase().includes(lowerQuery)
      );

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to search tickets',
      };
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: Ticket['status'],
    authContext: AuthContext
  ): Promise<ToolResult<Ticket>> {
    try {
      const ticket = this.tickets.find(t => t.id === ticketId);

      if (!ticket) {
        return {
          success: false,
          data: null as any,
          error: `Ticket ${ticketId} not found`,
        };
      }

      // Check if user has access to this ticket's client
      if (!canAccessClient(authContext, ticket.client)) {
        return {
          success: false,
          data: null as any,
          error: `Access denied to ticket ${ticketId}`,
        };
      }

      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();

      return {
        success: true,
        data: ticket,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : 'Failed to update ticket',
      };
    }
  }

  /**
   * Add a note to a ticket
   */
  async addTicketNote(
    ticketId: string,
    note: string,
    userName: string,
    authContext: AuthContext
  ): Promise<ToolResult<Ticket>> {
    try {
      const ticket = this.tickets.find(t => t.id === ticketId);

      if (!ticket) {
        return {
          success: false,
          data: null as any,
          error: `Ticket ${ticketId} not found`,
        };
      }

      // Check if user has access to this ticket's client
      if (!canAccessClient(authContext, ticket.client)) {
        return {
          success: false,
          data: null as any,
          error: `Access denied to ticket ${ticketId}`,
        };
      }

      // Add note to ticket description (in a real system, this would be a separate notes field)
      ticket.description += `\n\n--- Note by ${userName} at ${new Date().toISOString()} ---\n${note}`;
      ticket.updatedAt = new Date().toISOString();

      return {
        success: true,
        data: ticket,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : 'Failed to add note',
      };
    }
  }
}
