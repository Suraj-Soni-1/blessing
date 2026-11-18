import { NodeDefinition, NodeType } from '@/types/workflow';

export const NODE_DEFINITIONS: Record<NodeType, NodeDefinition> = {
  // TRIGGERS
  trigger_webhook: {
    type: 'trigger_webhook',
    label: 'Webhook Trigger',
    category: 'trigger',
    description: 'Triggers the workflow when an HTTP POST or GET request is received.',
    icon: 'Webhook',
    color: '#3B82F6', // Blue
    defaultConfig: {
      method: 'POST',
      path: '/api/v1/workflows/trigger',
      authRequired: true,
      samplePayload: '{\n  "event": "customer.created",\n  "customer": {\n    "name": "Sarah Connor",\n    "email": "sarah@cyberdyne.io",\n    "feedback": "Love the product! Needs Spotify integration."\n  }\n}'
    },
    inputSchema: {
      method: { type: 'select', label: 'HTTP Method', options: ['POST', 'GET', 'PUT'] },
      authRequired: { type: 'boolean', label: 'Require API Key Header (x-blessing-key)' },
      samplePayload: { type: 'textarea', label: 'Test Payload (JSON)', description: 'Mock data used during testing' }
    }
  },

  trigger_schedule: {
    type: 'trigger_schedule',
    label: 'Schedule (Cron)',
    category: 'trigger',
    description: 'Executes the workflow periodically on a cron schedule or fixed interval.',
    icon: 'Clock',
    color: '#06B6D4', // Cyan
    defaultConfig: {
      interval: 'every_hour',
      cronExpression: '0 * * * *',
      timezone: 'UTC'
    },
    inputSchema: {
      interval: {
        type: 'select',
        label: 'Frequency',
        options: ['every_5_minutes', 'every_15_minutes', 'every_hour', 'daily_at_9am', 'custom_cron']
      },
      cronExpression: {
        type: 'text',
        label: 'Cron Expression',
        placeholder: '0 * * * *'
      }
    }
  },

  trigger_manual: {
    type: 'trigger_manual',
    label: 'Manual Trigger',
    category: 'trigger',
    description: 'Trigger workflow manually via dashboard button or API call.',
    icon: 'PlayCircle',
    color: '#6366F1', // Indigo
    defaultConfig: {
      mockData: '{\n  "userId": "usr_9982",\n  "action": "test_run",\n  "timestamp": "2026-11-15T13:45:00Z"\n}'
    },
    inputSchema: {
      mockData: { type: 'textarea', label: 'Default Test Data (JSON)' }
    }
  },

  trigger_gmail: {
    type: 'trigger_gmail',
    label: 'Gmail New Email',
    category: 'trigger',
    description: 'Fires when a new email arrives matching specified search criteria.',
    icon: 'Mail',
    color: '#EF4444', // Red
    defaultConfig: {
      searchQuery: 'is:unread label:inbox',
      includeAttachments: false,
      markAsRead: false
    },
    inputSchema: {
      searchQuery: { type: 'text', label: 'Gmail Search Filter', placeholder: 'from:billing@ or subject:urgent' },
      markAsRead: { type: 'boolean', label: 'Mark as read after trigger' }
    }
  },

  trigger_spotify: {
    type: 'trigger_spotify',
    label: 'Spotify Track Saved',
    category: 'trigger',
    description: 'Fires when a new track is added to Liked Songs or a specific playlist.',
    icon: 'Music',
    color: '#10B981', // Spotify Emerald
    defaultConfig: {
      source: 'liked_songs',
      playlistId: ''
    },
    inputSchema: {
      source: { type: 'select', label: 'Trigger Source', options: ['liked_songs', 'specific_playlist', 'now_playing_change'] },
      playlistId: { type: 'text', label: 'Playlist ID (if specific)', placeholder: '37i9dQZF1DXcBWIGoYBM5M' }
    }
  },

  // AI NODES
  action_gemini: {
    type: 'action_gemini',
    label: 'Google Gemini AI',
    category: 'ai',
    description: 'Generate text, analyze sentiment, extract structured data, or summarize with Gemini.',
    icon: 'Sparkles',
    color: '#8B5CF6', // Purple
    defaultConfig: {
      model: 'gemini-1.5-flash',
      taskMode: 'sentiment_analysis', // sentiment_analysis, prompt_generation, summarization, json_extractor
      prompt: 'Analyze the sentiment of the following customer text: "{{trigger.customer.feedback}}". Classify as POSITIVE, NEGATIVE, or NEUTRAL. Return a JSON object with keys: sentiment, confidence, and recommendedAction.',
      temperature: 0.2,
      maxTokens: 500
    },
    inputSchema: {
      taskMode: {
        type: 'select',
        label: 'Task Mode',
        options: ['sentiment_analysis', 'prompt_generation', 'summarization', 'json_extractor']
      },
      model: {
        type: 'select',
        label: 'Model Version',
        options: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp']
      },
      prompt: {
        type: 'textarea',
        label: 'AI Prompt / Instructions',
        description: 'Use {{node_id.field}} to reference outputs from previous nodes'
      },
      temperature: {
        type: 'number',
        label: 'Creativity (Temperature)',
        placeholder: '0.2'
      }
    }
  },

  // INTEGRATIONS
  action_gmail: {
    type: 'action_gmail',
    label: 'Gmail Send / Draft',
    category: 'integration',
    description: 'Send an email or create a draft in Gmail with dynamic variables.',
    icon: 'Send',
    color: '#EA4335', // Google Red
    defaultConfig: {
      operation: 'send_email', // send_email, create_draft
      to: '{{trigger.customer.email}}',
      subject: 'Thank you for your feedback! Here is your update',
      body: 'Hi {{trigger.customer.name}},\n\nThank you for reaching out to Blessing automation. Our AI analyzed your message and we are already on it.\n\nBest regards,\nBlessing Team',
      isHtml: false
    },
    inputSchema: {
      operation: { type: 'select', label: 'Action', options: ['send_email', 'create_draft'] },
      to: { type: 'text', label: 'Recipient Email(s)', placeholder: 'recipient@example.com' },
      subject: { type: 'text', label: 'Email Subject', placeholder: 'Subject line' },
      body: { type: 'textarea', label: 'Message Body', description: 'Supports {{variable}} placeholders' }
    }
  },

  action_spotify: {
    type: 'action_spotify',
    label: 'Spotify Action',
    category: 'integration',
    description: 'Create playlists, search tracks, add songs, or control playback.',
    icon: 'Radio',
    color: '#1DB954', // Spotify Green
    defaultConfig: {
      action: 'add_to_playlist', // add_to_playlist, create_playlist, search_and_play
      trackQuery: '{{gemini_1.songRecommendation}} or Starboy',
      playlistName: 'Blessing AI Automations',
      playlistId: 'pl_blessing_favorites'
    },
    inputSchema: {
      action: {
        type: 'select',
        label: 'Spotify Action',
        options: ['add_to_playlist', 'create_playlist', 'search_and_play', 'get_current_track']
      },
      trackQuery: {
        type: 'text',
        label: 'Search Track / Artist',
        placeholder: 'Artist - Song Title or {{gemini.output}}'
      },
      playlistName: {
        type: 'text',
        label: 'Target Playlist Name',
        placeholder: 'My Automated Playlist'
      }
    }
  },

  action_discord: {
    type: 'action_discord',
    label: 'Discord / Slack Webhook',
    category: 'integration',
    description: 'Post automated notifications or alert messages to Discord channels.',
    icon: 'MessageSquare',
    color: '#5865F2', // Discord Blurple
    defaultConfig: {
      channelName: '#workflow-alerts',
      message: '🚨 **Blessing Workflow Alert**\nEvent triggered: {{trigger.event}}\nStatus: Processed successfully by Gemini AI.',
      botName: 'Blessing Bot',
      avatarUrl: 'https://blessing.ai/icon.png'
    },
    inputSchema: {
      channelName: { type: 'text', label: 'Channel / Room' },
      message: { type: 'textarea', label: 'Markdown Message Content' },
      botName: { type: 'text', label: 'Bot Display Name' }
    }
  },

  action_http: {
    type: 'action_http',
    label: 'HTTP Request',
    category: 'integration',
    description: 'Make generic REST API calls (GET, POST, PUT, DELETE) with headers and auth.',
    icon: 'Globe',
    color: '#F59E0B', // Amber
    defaultConfig: {
      method: 'POST',
      url: 'https://api.example.com/v1/event',
      headers: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer YOUR_TOKEN"\n}',
      body: '{\n  "status": "success",\n  "data": {{gemini_1.sentiment}}\n}'
    },
    inputSchema: {
      method: { type: 'select', label: 'Method', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
      url: { type: 'text', label: 'Endpoint URL', placeholder: 'https://api.example.com/webhook' },
      headers: { type: 'textarea', label: 'HTTP Headers (JSON)' },
      body: { type: 'textarea', label: 'Request Body' }
    }
  },

  // LOGIC
  logic_condition: {
    type: 'logic_condition',
    label: 'If / Else Condition',
    category: 'logic',
    description: 'Evaluate conditions to split workflow into True and False execution branches.',
    icon: 'GitFork',
    color: '#F97316', // Orange
    defaultConfig: {
      leftOperand: '{{gemini_1.sentiment}}',
      operator: 'equals',
      rightOperand: 'POSITIVE'
    },
    inputSchema: {
      leftOperand: { type: 'text', label: 'Value A (Variable or literal)', placeholder: '{{gemini_1.sentiment}}' },
      operator: {
        type: 'select',
        label: 'Condition Operator',
        options: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']
      },
      rightOperand: { type: 'text', label: 'Value B', placeholder: 'POSITIVE' }
    }
  },

  logic_delay: {
    type: 'logic_delay',
    label: 'Delay / Wait',
    category: 'logic',
    description: 'Pause execution for a specified duration before continuing.',
    icon: 'Hourglass',
    color: '#EAB308', // Yellow
    defaultConfig: {
      durationSeconds: 2,
      unit: 'seconds'
    },
    inputSchema: {
      durationSeconds: { type: 'number', label: 'Wait Duration' },
      unit: { type: 'select', label: 'Time Unit', options: ['seconds', 'minutes', 'hours'] }
    }
  },

  // UTILITY
  util_transform: {
    type: 'util_transform',
    label: 'Data Transform (JSON)',
    category: 'utility',
    description: 'Reshape, extract, or map incoming JSON fields to a new data format.',
    icon: 'FileJson',
    color: '#14B8A6', // Teal
    defaultConfig: {
      mappingTemplate: '{\n  "user_email": "{{trigger.customer.email}}",\n  "ai_result": "{{gemini_1.sentiment}}",\n  "processed_at": "2026-11-15T13:45:00Z"\n}'
    },
    inputSchema: {
      mappingTemplate: { type: 'textarea', label: 'Output JSON Template', description: 'Template using {{variable}} references' }
    }
  },

  util_code: {
    type: 'util_code',
    label: 'Custom JS Code',
    category: 'utility',
    description: 'Execute custom JavaScript code with access to `input` and `return output`.',
    icon: 'Code',
    color: '#64748B', // Slate
    defaultConfig: {
      code: '// "input" holds variables from previous steps\nconst sentiment = input.gemini_1?.sentiment || "NEUTRAL";\nreturn {\n  flagged: sentiment === "NEGATIVE",\n  score: sentiment === "POSITIVE" ? 95 : 40,\n  processedAt: new Date().toISOString()\n};'
    },
    inputSchema: {
      code: { type: 'textarea', label: 'JavaScript Function Body' }
    }
  }
};
