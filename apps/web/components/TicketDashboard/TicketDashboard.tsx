'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Ticket } from '../../types';
import { useToast } from '../Toast/Toast';

interface TicketDashboardProps {
  onGenerateNote?: (ticket: Ticket) => void;
}

export default function TicketDashboard({ onGenerateNote }: TicketDashboardProps) {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Mock tickets for now
  React.useEffect(() => {
    const mockTickets: Ticket[] = [
      {
        id: 'INC0012345',
        title: 'Network Connectivity Issue',
        description: 'Users unable to access internal resources',
        status: 'open',
        priority: 'high',
        client: 'Alpha Manufacturing',
        assignedTo: 'Cole Mains',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['network', 'connectivity']
      },
      {
        id: 'INC0012346',
        title: 'Email Server Down',
        description: 'Email service unavailable',
        status: 'in-progress',
        priority: 'critical',
        client: 'Beta Tech Solutions',
        assignedTo: 'Cole Mains',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['email', 'server']
      }
    ];
    setTickets(mockTickets);
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = searchQuery === '' ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-900/20 text-red-500 border-red-700';
      case 'high': return 'bg-orange-900/20 text-orange-500 border-orange-700';
      case 'medium': return 'bg-yellow-900/20 text-yellow-500 border-yellow-700';
      case 'low': return 'bg-green-900/20 text-green-500 border-green-700';
      default: return 'bg-gray-900/20 text-gray-500 border-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Ticket Dashboard</h1>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:border-red-500 transition-colors cursor-pointer"
            onClick={() => setSelectedTicket(ticket)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(ticket.status)}
                  <h3 className="text-lg font-semibold text-white">{ticket.title}</h3>
                </div>
                <p className="text-sm text-gray-400">{ticket.id} • {ticket.client}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <p className="text-gray-300 mb-4">{ticket.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Assigned to: {ticket.assignedTo}</span>
              <span className="text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedTicket(null)}>
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 max-w-2xl w-full m-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-4">{selectedTicket.title}</h2>
            <p className="text-gray-300 mb-4">{selectedTicket.description}</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  onGenerateNote?.(selectedTicket);
                  setSelectedTicket(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Generate Note
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
