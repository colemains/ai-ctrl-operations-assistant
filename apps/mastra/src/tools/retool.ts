import { createRetoolWorkflowsClient, createRetoolWorkflowTool } from '@ai-ctrl/retool-workflows';

// Initialize Retool client from environment variables
const retoolClient = createRetoolWorkflowsClient({
  apiUrl: process.env.RETOOL_API_URL || 'https://api.retool.com/v1',
  apiKey: process.env.RETOOL_API_KEY || '',
  environment: (process.env.RETOOL_ENVIRONMENT as 'production' | 'staging') || 'production',
});

// Create the tool
export const retoolWorkflowTool = createRetoolWorkflowTool(retoolClient);

// Export for registration
export const retoolTools = {
  executeWorkflow: retoolWorkflowTool,
};
