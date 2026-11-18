export type NodeCategory = 
  | 'trigger' 
  | 'ai' 
  | 'integration' 
  | 'logic' 
  | 'utility';

export type NodeType =
  // Triggers
  | 'trigger_webhook'
  | 'trigger_schedule'
  | 'trigger_manual'
  | 'trigger_gmail'
  | 'trigger_spotify'
  // AI
  | 'action_gemini'
  // Integrations
  | 'action_gmail'
  | 'action_spotify'
  | 'action_discord'
  | 'action_http'
  // Logic
  | 'logic_condition'
  | 'logic_delay'
  // Utility
  | 'util_transform'
  | 'util_code';

export type NodeExecutionStatus = 'idle' | 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export interface WorkflowNodeData {
  label: string;
  type: NodeType;
  category: NodeCategory;
  description: string;
  icon: string;
  config: Record<string, any>;
  status?: NodeExecutionStatus;
  lastExecution?: {
    startedAt?: string;
    completedAt?: string;
    durationMs?: number;
    input?: any;
    output?: any;
    error?: string;
  };
}

export interface NodeDefinition {
  type: NodeType;
  label: string;
  category: NodeCategory;
  description: string;
  icon: string;
  color: string;
  defaultConfig: Record<string, any>;
  outputSchema?: Record<string, string>;
  inputSchema?: Record<string, { type: string; label: string; placeholder?: string; options?: string[]; required?: boolean; description?: string }>;
}

export interface GraphValidationError {
  nodeId?: string;
  type: 'cycle' | 'orphan' | 'missing_trigger' | 'invalid_config' | 'disconnected';
  message: string;
  details?: string[];
}

export interface GraphValidationResult {
  isValid: boolean;
  hasCycles: boolean;
  cycleNodes: string[][];
  orphanNodes: string[];
  topologicalOrder: string[];
  errors: GraphValidationError[];
  warnings: string[];
}

export interface WorkflowExecutionLog {
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  status: NodeExecutionStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  input: any;
  output: any;
  error?: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerSource: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  logs: WorkflowExecutionLog[];
  initialPayload?: any;
  error?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
  runsCount: number;
  lastRunAt?: string;
  webhookSecret?: string;
}

export interface ServiceCredential {
  id: string;
  service: 'gemini' | 'gmail' | 'spotify' | 'discord' | 'custom_api';
  name: string;
  connected: boolean;
  accountEmail?: string;
  accountName?: string;
  apiKey?: string;
  webhookUrl?: string;
  lastValidated?: string;
}

export interface SubscriptionPlan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  priceMonthly: number;
  maxRunsPerMonth: number;
  maxActiveWorkflows: number;
  features: string[];
}

export interface UserSubscription {
  planId: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'trialing' | 'cancelled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  runsUsedThisMonth: number;
  runsLimit: number;
  activeWorkflowsCount: number;
}
