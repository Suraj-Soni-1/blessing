import { Workflow, ServiceCredential, UserSubscription, WorkflowRun } from '@/types/workflow';

export const DEFAULT_WORKFLOW: Workflow = {
  id: 'wf_sentiment_triage',
  name: 'AI Customer Sentiment & Music Triage',
  description: 'Validates customer feedback via Webhook, runs Gemini sentiment analysis, branches to Spotify (positive celebration) or Gmail + Discord (urgent triage).',
  active: true,
  createdAt: '2026-11-15T12:00:00Z',
  updatedAt: '2026-11-15T13:45:00Z',
  runsCount: 14,
  lastRunAt: '2026-11-15T13:30:00Z',
  webhookSecret: 'bless_whsec_994a8bc39d8e7',
  nodes: [
    {
      id: 'node_trigger',
      type: 'custom',
      position: { x: 50, y: 180 },
      data: {
        label: 'Webhook Feedback',
        type: 'trigger_webhook',
        category: 'trigger',
        icon: 'Webhook',
        description: 'Receives customer review or ticket payload',
        config: {
          method: 'POST',
          path: '/api/v1/workflows/trigger',
          authRequired: true,
          samplePayload: '{\n  "event": "customer.feedback",\n  "customer": {\n    "name": "Sarah Connor",\n    "email": "sarah@cyberdyne.io",\n    "feedback": "I absolutely love Blessing automation! It seamlessly connected our Spotify playlist and Gemini AI workflows."\n  }\n}'
        }
      }
    },
    {
      id: 'node_gemini',
      type: 'custom',
      position: { x: 380, y: 180 },
      data: {
        label: 'Gemini Sentiment AI',
        type: 'action_gemini',
        category: 'ai',
        icon: 'Sparkles',
        description: 'Classifies sentiment, generates reply summary',
        config: {
          model: 'gemini-1.5-flash',
          taskMode: 'sentiment_analysis',
          prompt: 'Analyze sentiment for customer {{trigger.customer.name}}: "{{trigger.customer.feedback}}". Classify as POSITIVE, NEGATIVE, or NEUTRAL.'
        }
      }
    },
    {
      id: 'node_condition',
      type: 'custom',
      position: { x: 710, y: 180 },
      data: {
        label: 'Sentiment Branch',
        type: 'logic_condition',
        category: 'logic',
        icon: 'GitFork',
        description: 'Routes Positive vs Negative/Other',
        config: {
          leftOperand: '{{node_gemini.sentiment}}',
          operator: 'equals',
          rightOperand: 'POSITIVE'
        }
      }
    },
    {
      id: 'node_spotify',
      type: 'custom',
      position: { x: 1050, y: 70 },
      data: {
        label: 'Spotify Celebration Song',
        type: 'action_spotify',
        category: 'integration',
        icon: 'Radio',
        description: 'Adds celebratory track to office playlist',
        config: {
          action: 'add_to_playlist',
          trackQuery: 'Happy - Pharrell Williams',
          playlistName: 'Blessing AI Celebrations'
        }
      }
    },
    {
      id: 'node_gmail',
      type: 'custom',
      position: { x: 1050, y: 310 },
      data: {
        label: 'Gmail Customer Response',
        type: 'action_gmail',
        category: 'integration',
        icon: 'Send',
        description: 'Dispatches personalized email response',
        config: {
          operation: 'send_email',
          to: '{{trigger.customer.email}}',
          subject: 'Thank you for your feedback, {{trigger.customer.name}}!',
          body: 'Hi {{trigger.customer.name}},\n\nThank you for reaching out to Blessing automation. Our team has reviewed your note and we appreciate your support.\n\nWarm regards,\nBlessing Automated Care Team'
        }
      }
    },
    {
      id: 'node_discord',
      type: 'custom',
      position: { x: 1380, y: 310 },
      data: {
        label: 'Discord Alert',
        type: 'action_discord',
        category: 'integration',
        icon: 'MessageSquare',
        description: 'Notify customer support team channel',
        config: {
          channelName: '#urgent-feedback',
          message: '🚨 **Blessing Customer Alert**\nUser: {{trigger.customer.name}} ({{trigger.customer.email}})\nSentiment: {{node_gemini.sentiment}}\nFollow-up email dispatched.'
        }
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'node_trigger', target: 'node_gemini', animated: true },
    { id: 'e2', source: 'node_gemini', target: 'node_condition', animated: true },
    { id: 'e3', source: 'node_condition', target: 'node_spotify', sourceHandle: 'true', label: 'True (Positive)' },
    { id: 'e4', source: 'node_condition', target: 'node_gmail', sourceHandle: 'false', label: 'False (Other)' },
    { id: 'e5', source: 'node_gmail', target: 'node_discord', animated: true }
  ]
};

export const DEFAULT_CREDENTIALS: ServiceCredential[] = [
  {
    id: 'cred_gemini',
    service: 'gemini',
    name: 'Google Gemini Pro & Flash',
    connected: true,
    accountName: 'Blessing AI Workspace Engine',
    apiKey: 'AIzaSyDemo-GeminiKey-BlessingEngine-2026',
    lastValidated: '2026-11-15T13:40:00Z'
  },
  {
    id: 'cred_gmail',
    service: 'gmail',
    name: 'Gmail Integration',
    connected: true,
    accountEmail: 'suraj@blessing.ai',
    accountName: 'Blessing Production Mailer',
    lastValidated: '2026-11-15T13:42:00Z'
  },
  {
    id: 'cred_spotify',
    service: 'spotify',
    name: 'Spotify Web API',
    connected: true,
    accountName: "Suraj's Premium Spotify",
    lastValidated: '2026-11-15T13:41:00Z'
  },
  {
    id: 'cred_discord',
    service: 'discord',
    name: 'Discord Webhook Integration',
    connected: true,
    webhookUrl: 'https://discord.com/api/webhooks/blessing/alerts',
    accountName: '#workflow-alerts',
    lastValidated: '2026-11-15T13:35:00Z'
  }
];

export const DEFAULT_SUBSCRIPTION: UserSubscription = {
  planId: 'pro',
  status: 'active',
  currentPeriodStart: '2026-11-01T00:00:00Z',
  currentPeriodEnd: '2026-12-01T00:00:00Z',
  runsUsedThisMonth: 1420,
  runsLimit: 10000,
  activeWorkflowsCount: 4
};

export const STORAGE_KEYS = {
  WORKFLOWS: 'blessing_workflows_v1',
  ACTIVE_WF_ID: 'blessing_active_wf_id_v1',
  CREDENTIALS: 'blessing_credentials_v1',
  SUBSCRIPTION: 'blessing_subscription_v1',
  RUNS: 'blessing_runs_history_v1'
};

export function loadSavedWorkflows(): Workflow[] {
  if (typeof window === 'undefined') return [DEFAULT_WORKFLOW];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    if (!raw) {
      saveWorkflows([DEFAULT_WORKFLOW]);
      return [DEFAULT_WORKFLOW];
    }
    return JSON.parse(raw);
  } catch {
    return [DEFAULT_WORKFLOW];
  }
}

export function saveWorkflows(workflows: Workflow[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  } catch (e) {
    console.error('Failed to save workflows to localStorage', e);
  }
}

export function loadCredentials(): ServiceCredential[] {
  if (typeof window === 'undefined') return DEFAULT_CREDENTIALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    if (!raw) {
      saveCredentials(DEFAULT_CREDENTIALS);
      return DEFAULT_CREDENTIALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CREDENTIALS;
  }
}

export function saveCredentials(creds: ServiceCredential[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(creds));
  } catch (e) {
    console.error('Failed to save credentials', e);
  }
}

export function loadSubscription(): UserSubscription {
  if (typeof window === 'undefined') return DEFAULT_SUBSCRIPTION;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (!raw) {
      saveSubscription(DEFAULT_SUBSCRIPTION);
      return DEFAULT_SUBSCRIPTION;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

export function saveSubscription(sub: UserSubscription) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
  } catch (e) {
    console.error('Failed to save subscription', e);
  }
}

export function loadExecutionHistory(): WorkflowRun[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RUNS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExecutionRun(run: WorkflowRun) {
  if (typeof window === 'undefined') return;
  try {
    const history = loadExecutionHistory();
    const updated = [run, ...history.slice(0, 49)]; // Keep last 50
    localStorage.setItem(STORAGE_KEYS.RUNS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to record run', e);
  }
}
