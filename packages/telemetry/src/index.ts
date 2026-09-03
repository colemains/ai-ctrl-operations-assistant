import { trace, context, SpanStatusCode } from '@opentelemetry/api';

export interface TraceContext {
  userId?: string;
  organizationId?: string;
  discipline?: string;
  clientScope?: string[];
}

export class TelemetryProvider {
  private readonly tracer = trace.getTracer('ai-ctrl-operations');

  async traceOperation<T>(
    operationName: string,
    traceContext: TraceContext,
    operation: () => Promise<T>
  ): Promise<T> {
    const span = this.tracer.startSpan(operationName, {
      attributes: {
        'user.id': traceContext.userId || 'anonymous',
        'organization.id': traceContext.organizationId || 'unknown',
        'discipline': traceContext.discipline || 'general',
      },
    });

    return context.with(trace.setSpan(context.active(), span), async () => {
      try {
        const result = await operation();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error),
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  recordAuditEvent(event: {
    userId: string;
    action: string;
    resource: string;
    result: 'success' | 'failure';
    metadata?: Record<string, unknown>;
  }): void {
    const span = this.tracer.startSpan('audit.event');
    span.setAttributes({
      'audit.user': event.userId,
      'audit.action': event.action,
      'audit.resource': event.resource,
      'audit.result': event.result,
    });
    span.end();

    console.log('[AUDIT]', JSON.stringify(event));
  }
}

export const telemetry = new TelemetryProvider();