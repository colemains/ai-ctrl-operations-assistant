import { BaseTool, ToolContext, ToolResult } from '@ai-ctrl/tool-sdk';
import { AuthContext } from '@ai-ctrl/contracts';

export type NoteType = 'internal' | 'public';

export interface NoteContext {
  ticketId: string;
  clientName: string;
  issue: string;
  assetDetails?: string;
  resolutionSteps?: string[];
  currentStatus?: string;
  impact?: string;
  rootCause?: string;
}

export interface GenerateNoteInput {
  noteType: NoteType;
  context: NoteContext;
  userName?: string; // Will auto-fill from user profile
  regenerate?: boolean;
}

export interface GeneratedNote {
  noteType: NoteType;
  content: string;
  timestamp: string;
  userName: string;
  ticketId: string;
  copyReady: string; // Pre-formatted for SMC paste
}

export class NoteGeneratorTool extends BaseTool<GenerateNoteInput, GeneratedNote> {
  readonly name = 'smc.notes.generate';
  readonly description = 'Generate internal or public-facing notes for SMC tickets';
  readonly requiredPermissions = ['tickets:write', 'notes:generate'];

  async execute(
    input: GenerateNoteInput,
    context: ToolContext
  ): Promise<ToolResult<GeneratedNote>> {
    return this.executeWithAudit(input, context, async () => {
      const userName = input.userName || context.userId || 'Unknown User';

      let noteContent: string;

      if (input.noteType === 'internal') {
        noteContent = this.generateInternalNote(input.context);
      } else {
        noteContent = this.generatePublicNote(input.context);
      }

      const generatedNote: GeneratedNote = {
        noteType: input.noteType,
        content: noteContent,
        timestamp: new Date().toISOString(),
        userName,
        ticketId: input.context.ticketId,
        copyReady: this.formatForSMC(noteContent, userName, input.context.clientName),
      };

      return generatedNote;
    });
  }

  /**
   * Generate internal note - technical, analytical
   */
  private generateInternalNote(ctx: NoteContext): string {
    const sections: string[] = [];

    sections.push('INTERNAL ANALYSIS');
    sections.push('─'.repeat(50));

    if (ctx.issue) {
      sections.push(`\n📋 ISSUE SUMMARY:`);
      sections.push(ctx.issue);
    }

    if (ctx.assetDetails) {
      sections.push(`\n🖥️  ASSET DETAILS:`);
      sections.push(ctx.assetDetails);
    }

    if (ctx.rootCause) {
      sections.push(`\n🔍 ROOT CAUSE:`);
      sections.push(ctx.rootCause);
    }

    if (ctx.resolutionSteps && ctx.resolutionSteps.length > 0) {
      sections.push(`\n🔧 RESOLUTION STEPS:`);
      ctx.resolutionSteps.forEach((step, idx) => {
        sections.push(`${idx + 1}. ${step}`);
      });
    }

    if (ctx.impact) {
      sections.push(`\n⚠️  IMPACT:`);
      sections.push(ctx.impact);
    }

    if (ctx.currentStatus) {
      sections.push(`\n📊 CURRENT STATUS:`);
      sections.push(ctx.currentStatus);
    }

    sections.push(`\n🕐 NEXT STEPS:`);
    sections.push('• Monitor for recurrence');
    sections.push('• Update client if status changes');
    sections.push('• Document any additional findings');

    return sections.join('\n');
  }

  /**
   * Generate public note - professional, jargon-free
   */
  private generatePublicNote(ctx: NoteContext): string {
    const sections: string[] = [];

    sections.push('UPDATE');
    sections.push('─'.repeat(50));

    // Opening
    sections.push('\nHello,');
    sections.push('');
    sections.push('Thank you for bringing this to our attention. Here is an update on the issue:');
    sections.push('');

    // Issue summary (simplified)
    if (ctx.issue) {
      sections.push('ISSUE:');
      sections.push(this.simplifyTechnicalLanguage(ctx.issue));
      sections.push('');
    }

    // Current status
    if (ctx.currentStatus) {
      sections.push('STATUS:');
      sections.push(this.simplifyTechnicalLanguage(ctx.currentStatus));
      sections.push('');
    }

    // Resolution (if provided)
    if (ctx.resolutionSteps && ctx.resolutionSteps.length > 0) {
      sections.push('RESOLUTION:');
      sections.push('We have completed the following steps to resolve this issue:');
      ctx.resolutionSteps.forEach((step, idx) => {
        sections.push(`${idx + 1}. ${this.simplifyTechnicalLanguage(step)}`);
      });
      sections.push('');
    }

    // Impact (simplified)
    if (ctx.impact) {
      sections.push('IMPACT:');
      sections.push(this.simplifyTechnicalLanguage(ctx.impact));
      sections.push('');
    }

    // Closing
    sections.push('Please let us know if you have any questions or continue to experience issues.');
    sections.push('');
    sections.push('Best regards,');

    return sections.join('\n');
  }

  /**
   * Simplify technical jargon for public notes
   */
  private simplifyTechnicalLanguage(text: string): string {
    const replacements: Record<string, string> = {
      'SSH': 'remote access',
      'API': 'connection',
      'VM': 'virtual machine',
      'DNS': 'domain name system',
      'DHCP': 'network configuration',
      'firewall': 'security system',
      'packet loss': 'network interruption',
      'latency': 'delay',
      'throughput': 'data transfer speed',
      'reboot': 'restart',
      'failover': 'backup system activation',
      'redundancy': 'backup',
      'SLA': 'service agreement',
      'RCA': 'root cause analysis',
    };

    let simplified = text;
    Object.entries(replacements).forEach(([technical, simple]) => {
      const regex = new RegExp(`\\b${technical}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    });

    return simplified;
  }

  /**
   * Format note for SMC paste (Client Name - Your Name - Note)
   */
  private formatForSMC(content: string, userName: string, clientName: string): string {
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return [
      `${clientName} - ${userName}`,
      `${timestamp}`,
      '',
      content,
    ].join('\n');
  }
}

// Export for easy import
export const noteGenerator = new NoteGeneratorTool();
