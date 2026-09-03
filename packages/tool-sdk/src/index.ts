import { telemetry } from '@ai-ctrl/telemetry';

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executionTimeMs?: number;
    cached?: boolean;
    source?: string;
  };
}

export interface ToolContext {
  userId: string;
  discipline: string;
  authorizedClients: string[];
}

export abstract class BaseTool<TInput = unknown, TOutput = unknown> {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly requiredPermissions: string[];

  protected async executeWithAudit(
    input: TInput,
    context: ToolContext,
    operation: () => Promise<TOutput>
  ): Promise<ToolResult<TOutput>> {
    const startTime = Date.now();

    try {
      telemetry.recordAuditEvent({
        userId: context.userId,
        action: `tool.${this.name}.execute`,
        resource: JSON.stringify(input),
        result: 'success',
      });

      const result = await telemetry.traceOperation(
        `tool.${this.name}`,
        {
          userId: context.userId,
          discipline: context.discipline,
          clientScope: context.authorizedClients,
        },
        operation
      );

      return {
        success: true,
        data: result,
        metadata: {
          executionTimeMs: Date.now() - startTime,
          source: this.name,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      telemetry.recordAuditEvent({
        userId: context.userId,
        action: `tool.${this.name}.execute`,
        resource: JSON.stringify(input),
        result: 'failure',
        metadata: { error: errorMessage },
      });

      return {
        success: false,
        error: errorMessage,
        metadata: {
          executionTimeMs: Date.now() - startTime,
          source: this.name,
        },
      };
    }
  }

  abstract execute(input: TInput, context: ToolContext): Promise<ToolResult<TOutput>>;
}
