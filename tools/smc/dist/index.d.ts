import { Ticket, ToolResult, AuthContext } from '@ai-ctrl/contracts';
export interface TicketFilters {
    client?: string;
    priority?: string;
    status?: string;
    problem_type?: string;
    assigned_to?: string;
}
export declare class SMCTicketAdapter {
    private mockDataPath;
    constructor(mockDataPath?: string);
    getTickets(authContext: AuthContext, filters?: TicketFilters): Promise<ToolResult<Ticket[]>>;
    getTicketById(authContext: AuthContext, ticketId: string): Promise<ToolResult<Ticket | null>>;
}
