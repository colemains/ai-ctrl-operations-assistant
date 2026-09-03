import { Ticket, TicketStatus, TicketPriority, AuthContext } from '@ai-ctrl/contracts';

export class TicketService {
  private tickets: Ticket[] = [
    {
      id: 'TICK-001',
      title: 'Database Connection Issues',
      description: 'Production database experiencing intermittent connection failures',
      status: 'Resolved',
      priority: 'Critical',
      client: 'Alpha Manufacturing',
      assignedTo: 'john.doe@expedient.com',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'Infrastructure',
      tags: ['database', 'production', 'critical'],
    },
    {
      id: 'TICK-002',
      title: 'VPN Access Request',
      description: 'New employee needs VPN access configured',
      status: 'In Progress',
      priority: 'High',
      client: 'Beta Tech Solutions',
      assignedTo: 'jane.smith@expedient.com',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'Access Management',
      tags: ['vpn', 'access', 'onboarding'],
    },
    {
      id: 'TICK-003',
      title: 'SSL Certificate Renewal',
      description: 'Main website SSL certificate expiring in 7 days',
      status: 'Open',
      priority: 'High',
      client: 'Gamma Logistics',
      assignedTo: 'bob.jones@expedient.com',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      category: 'Security',
      tags: ['ssl', 'certificate', 'security'],
    },
    {
      id: 'TICK-004',
      title: 'Backup Job Failed',
      description: 'Nightly backup job failed for fileserver-prod-01',
      status: 'In Progress',
      priority: 'Medium',
      client: 'Delta Financial Services',
      assignedTo: 'alice.brown@expedient.com',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      category: 'Backup',
      tags: ['backup', 'failure', 'storage'],
    },
    {
      id: 'TICK-005',
      title: 'Email Delivery Delays',
      description: 'Users reporting 10-15 minute delays in email delivery',
      status: 'Open',
      priority: 'Medium',
      client: 'Alpha Manufacturing',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      category: 'Email',
      tags: ['email', 'performance'],
    },
    {
      id: 'TICK-006',
      title: 'Firewall Rule Update',
      description: 'Need to allow new IP range for remote office',
      status: 'Open',
      priority: 'Critical',
      client: 'Beta Tech Solutions',
      assignedTo: 'john.doe@expedient.com',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      category: 'Network',
      tags: ['firewall', 'network', 'security'],
    },
  ];

  async getAllTickets(authContext: AuthContext): Promise<Ticket[]> {
    // Filter by authorized clients
    return this.tickets.filter((t) =>
      authContext.authorizedClients.length === 0 ||
      authContext.authorizedClients.includes(t.client)
    );
  }

  async getTicketsByClient(clientId: string): Promise<Ticket[]> {
    return this.tickets.filter((t) => t.client === clientId);
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    return this.tickets.find((t) => t.id === id);
  }

  async updateTicketStatus(
    id: string,
    status: TicketStatus
  ): Promise<Ticket | undefined> {
    const index = this.tickets.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    this.tickets[index] = {
      ...this.tickets[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    return this.tickets[index];
  }

  async addNote(
    ticketId: string,
    note: { content: string; author: string }
  ): Promise<boolean> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) return false;

    // In a real implementation, notes would be stored separately
    // For now, we'll just return success
    return true;
  }

  async updateTicketAssignee(
    ticketId: string,
    assignee: string
  ): Promise<Ticket | undefined> {
    const index = this.tickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return undefined;

    this.tickets[index] = {
      ...this.tickets[index],
      assignedTo: assignee,
      updatedAt: new Date().toISOString(),
    };

    return this.tickets[index];
  }

  async searchTickets(query: string, authContext: AuthContext): Promise<Ticket[]> {
    const lowerQuery = query.toLowerCase();
    const authorizedTickets = await this.getAllTickets(authContext);

    return authorizedTickets.filter((t) =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.client.toLowerCase().includes(lowerQuery) ||
      (t.category && t.category.toLowerCase().includes(lowerQuery))
    );
  }
}
