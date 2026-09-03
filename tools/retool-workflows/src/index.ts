import axios, { AxiosInstance } from 'axios';
import { BaseTool, ToolContext, ToolResult } from '@ai-ctrl/tool-sdk';
import { telemetry } from '@ai-ctrl/telemetry';

export interface RetoolWorkflowConfig {
  apiUrl: string;
  apiKey: string;
  environment?: 'production' | 'staging';
}

export interface WorkflowInput {
  workflowId: string;
  parameters: Record<string, unknown>;
}

export interface WorkflowExecutionResult {
  executionId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  output?: unknown;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export class RetoolWorkflowsClient {
  private readonly client: AxiosInstance;
  private readonly environment: string;

  constructor(config: RetoolWorkflowConfig) {
    this.environment = config.environment || 'production';
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async executeWorkflow(
    workflowId: string,
    parameters: Record<string, unknown>
  ): Promise<WorkflowExecutionResult> {
    const response = await this.client.post(`/workflows/${workflowId}/startTrigger`, {
      ...parameters,
    });

    return {
      executionId: response.data.id || response.data.executionId,
      status: 'queued',
      startedAt: new Date().toISOString(),
      output: response.data,
    };
  }

  async getExecutionStatus(executionId: string): Promise<WorkflowExecutionResult> {
    const response = await this.client.get(`/workflows/executions/${executionId}`);

    return {
      executionId: response.data.id,
      status: response.data.status,
      output: response.data.output,
      error: response.data.error,
      startedAt: response.data.startedAt,
      completedAt: response.data.completedAt,
    };
  }

  async waitForCompletion(
    executionId: string,
    maxWaitMs: number = 60000,
    pollIntervalMs: number = 2000
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getExecutionStatus(executionId);

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Workflow execution ${executionId} timed out after ${maxWaitMs}ms`);
  }
}

// Tool wrapper for Mastra integration
export class RetoolWorkflowTool extends BaseTool<WorkflowInput, WorkflowExecutionResult> {
  readonly name = 'retool.workflow.execute';
  readonly description = 'Execute a Retool Workflow and return results';
  readonly requiredPermissions = ['workflows:execute'];

  constructor(private readonly client: RetoolWorkflowsClient) {
    super();
  }

  async execute(
    input: WorkflowInput,
    context: ToolContext
  ): Promise<ToolResult<WorkflowExecutionResult>> {
    return this.executeWithAudit(input, context, async () => {
      // Start workflow execution
      const execution = await this.client.executeWorkflow(
        input.workflowId,
        input.parameters
      );

      // Wait for completion
      const result = await this.client.waitForCompletion(execution.executionId);

      if (result.status === 'failed') {
        throw new Error(result.error || 'Workflow execution failed');
      }

      return result;
    });
  }
}

// Factory function for creating clients
export function createRetoolWorkflowsClient(config: RetoolWorkflowConfig): RetoolWorkflowsClient {
  return new RetoolWorkflowsClient(config);
}

// Factory for creating tool
export function createRetoolWorkflowTool(client: RetoolWorkflowsClient): RetoolWorkflowTool {
  return new RetoolWorkflowTool(client);
}
