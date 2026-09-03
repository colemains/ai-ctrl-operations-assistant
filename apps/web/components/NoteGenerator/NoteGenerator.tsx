'use client';

import { useState, useEffect } from 'react';
import { FileText, Copy, Check, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../Toast/Toast';

type NoteType = 'internal' | 'public';

interface NoteContext {
  ticketId: string;
  clientName: string;
  issue: string;
  assetDetails?: string;
  resolutionSteps?: string;
  currentStatus?: string;
  impact?: string;
  rootCause?: string;
}

interface GeneratedNote {
  noteType: NoteType;
  content: string;
  timestamp: string;
  userName: string;
  ticketId: string;
  copyReady: string;
}

interface NoteGeneratorProps {
  initialContext?: Partial<NoteContext>;
  onClose?: () => void;
}

export default function NoteGenerator({ initialContext, onClose }: NoteGeneratorProps) {
  const { user } = useUser();
  const { showToast } = useToast();

  // Form state
  const [ticketId, setTicketId] = useState('');
  const [clientName, setClientName] = useState('');
  const [issue, setIssue] = useState('');
  const [assetDetails, setAssetDetails] = useState('');
  const [resolutionSteps, setResolutionSteps] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [impact, setImpact] = useState('');
  const [rootCause, setRootCause] = useState('');

  // Generated notes state
  const [internalNote, setInternalNote] = useState<GeneratedNote | null>(null);
  const [publicNote, setPublicNote] = useState<GeneratedNote | null>(null);

  // Loading and UI state
  const [loadingInternal, setLoadingInternal] = useState(false);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [copiedInternal, setCopiedInternal] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Prefill form when initialContext changes
  useEffect(() => {
    if (initialContext) {
      if (initialContext.ticketId) setTicketId(initialContext.ticketId);
      if (initialContext.clientName) setClientName(initialContext.clientName);
      if (initialContext.issue) setIssue(initialContext.issue);
      if (initialContext.assetDetails) setAssetDetails(initialContext.assetDetails);
      if (initialContext.resolutionSteps) setResolutionSteps(initialContext.resolutionSteps);
      if (initialContext.currentStatus) setCurrentStatus(initialContext.currentStatus);
      if (initialContext.impact) setImpact(initialContext.impact);
      if (initialContext.rootCause) setRootCause(initialContext.rootCause);

      setIsPrefilled(!!initialContext.ticketId);
    }
  }, [initialContext]);

  const generateNote = async (noteType: NoteType) => {
    if (!ticketId || !clientName || !issue) {
      showToast('error', 'Please fill in required fields: Ticket ID, Client Name, and Issue');
      return;
    }

    const setLoading = noteType === 'internal' ? setLoadingInternal : setLoadingPublic;
    const setNote = noteType === 'internal' ? setInternalNote : setPublicNote;

    setLoading(true);

    try {
      const context: NoteContext = {
        ticketId,
        clientName,
        issue,
        assetDetails: assetDetails || undefined,
        resolutionSteps: resolutionSteps || undefined,
        currentStatus: currentStatus || undefined,
        impact: impact || undefined,
        rootCause: rootCause || undefined,
      };

      const response = await fetch('http://localhost:8080/api/notes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteType,
          context,
          userName: user?.name || 'Cole Mains',
          authContext: {
            userId: user?.id || 'anonymous',
            discipline: 'SMC',
            authorizedClients: user?.permissions.authorizedClients || []
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.note) {
        setNote(data.note);
        showToast('success', `${noteType === 'internal' ? 'Internal' : 'Public'} note generated successfully`);
      } else {
        throw new Error(data.message || 'Failed to generate note');
      }
    } catch (error) {
      console.error('Error generating note:', error);
      showToast('error', 'Failed to generate note. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, noteType: NoteType) => {
    try {
      await navigator.clipboard.writeText(text);
      if (noteType === 'internal') {
        setCopiedInternal(true);
        setTimeout(() => setCopiedInternal(false), 2000);
      } else {
        setCopiedPublic(true);
        setTimeout(() => setCopiedPublic(false), 2000);
      }
      showToast('success', 'Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast('error', 'Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-400 mb-1">Ticket Data Loaded</h3>
              <p className="text-sm text-gray-300">
                Form has been pre-filled with ticket information. Review and add additional details as needed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-neutral-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          Ticket Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ticket ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="INC0012345"
              className="w-full bg-neutral-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Alpha Manufacturing"
              className="w-full bg-neutral-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Issue Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Describe the issue or incident..."
              rows={3}
              className="w-full bg-neutral-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Affected Assets
            </label>
            <input
              type="text"
              value={assetDetails}
              onChange={(e) => setAssetDetails(e.target.value)}
              placeholder="server01.example.com, firewall-dmz-01"
              className="w-full bg-neutral-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resolution Steps
            </label>
            <textarea
              value={resolutionSteps}
              onChange={(e) => setResolutionSteps(e.target.value)}
              placeholder="Describe the steps taken to resolve the issue..."
              rows={3}
              className="w-full bg-neutral-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Status
            </label>
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              className="w-full bg-neutral-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Select status...</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Impact/Priority
            </label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className="w-full bg-neutral-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Select priority...</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Root Cause (if known)
            </label>
            <textarea
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Describe the root cause if identified..."
              rows={2}
              className="w-full bg-neutral-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Generation Buttons and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Internal Note */}
        <div className="bg-neutral-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              Internal Note
            </h3>
            <button
              onClick={() => generateNote('internal')}
              disabled={loadingInternal || !ticketId || !clientName || !issue}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loadingInternal ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : internalNote ? (
                'Regenerate'
              ) : (
                'Generate'
              )}
            </button>
          </div>

          {internalNote ? (
            <div className="space-y-3">
              <div className="bg-neutral-900 border border-gray-600 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
                  {internalNote.copyReady}
                </pre>
              </div>
              <button
                onClick={() => copyToClipboard(internalNote.copyReady, 'internal')}
                className="w-full px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copiedInternal ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-gray-600 rounded-lg p-8 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Technical, analytical note for internal team use
              </p>
            </div>
          )}
        </div>

        {/* Public Note */}
        <div className="bg-neutral-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              Public Note
            </h3>
            <button
              onClick={() => generateNote('public')}
              disabled={loadingPublic || !ticketId || !clientName || !issue}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loadingPublic ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : publicNote ? (
                'Regenerate'
              ) : (
                'Generate'
              )}
            </button>
          </div>

          {publicNote ? (
            <div className="space-y-3">
              <div className="bg-neutral-900 border border-gray-600 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
                  {publicNote.copyReady}
                </pre>
              </div>
              <button
                onClick={() => copyToClipboard(publicNote.copyReady, 'public')}
                className="w-full px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copiedPublic ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-gray-600 rounded-lg p-8 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Professional, client-friendly note for external communication
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}