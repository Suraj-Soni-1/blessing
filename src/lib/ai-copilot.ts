export interface GeneratedWorkflowTemplate {
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
}

/**
 * Intelligent prompt-to-workflow AI synthesizer
 */
export function generateWorkflowFromPrompt(prompt: string): GeneratedWorkflowTemplate {
  const p = prompt.toLowerCase();

  // Pattern 1: Sentiment analysis & customer triage with Gemini, Gmail, Discord, and Spotify
  if (p.includes('sentiment') || p.includes('feedback') || p.includes('customer') || p.includes('triage')) {
    return {
      name: 'AI Customer Sentiment Triage',
      description: 'Automatically analyzes customer sentiment using Gemini AI and routes responses via Gmail, Discord, and Spotify.',
      nodes: [
        {
          id: 'node_trigger',
          type: 'custom',
          position: { x: 80, y: 180 },
          data: {
            label: 'Webhook Feedback',
            type: 'trigger_webhook',
            category: 'trigger',
            icon: 'Webhook',
            description: 'Receives customer review & feedback payload',
            config: {
              method: 'POST',
              samplePayload: '{\n  "customer": {\n    "name": "Sarah Connor",\n    "email": "sarah@cyberdyne.io",\n    "feedback": "I love the new workflow platform! Everything is fast and intuitive."\n  }\n}'
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
            description: 'Analyzes tone, sentiment, and recommended actions',
            config: {
              taskMode: 'sentiment_analysis',
              model: 'gemini-1.5-flash',
              prompt: 'Analyze sentiment for customer {{trigger.customer.name}}: "{{trigger.customer.feedback}}". Classify as POSITIVE, NEGATIVE, or NEUTRAL.'
            }
          }
        },
        {
          id: 'node_condition',
          type: 'custom',
          position: { x: 680, y: 180 },
          data: {
            label: 'Check Sentiment',
            type: 'logic_condition',
            category: 'logic',
            icon: 'GitFork',
            description: 'Branches based on AI sentiment classification',
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
          position: { x: 1000, y: 80 },
          data: {
            label: 'Spotify Add Track',
            type: 'action_spotify',
            category: 'integration',
            icon: 'Radio',
            description: 'Celebrate happy customer with a victory song',
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
          position: { x: 1000, y: 280 },
          data: {
            label: 'Gmail Customer Reply',
            type: 'action_gmail',
            category: 'integration',
            icon: 'Send',
            description: 'Send personalized follow-up email',
            config: {
              operation: 'send_email',
              to: '{{trigger.customer.email}}',
              subject: 'Thank you for your feedback, {{trigger.customer.name}}!',
              body: 'Hi {{trigger.customer.name}},\n\nOur team saw your feedback and wanted to thank you personally. We are thrilled to have you with us!\n\nBest,\nBlessing Team'
            }
          }
        },
        {
          id: 'node_discord',
          type: 'custom',
          position: { x: 1300, y: 280 },
          data: {
            label: 'Discord Alert',
            type: 'action_discord',
            category: 'integration',
            icon: 'MessageSquare',
            description: 'Notify engineering and support team',
            config: {
              channelName: '#customer-alerts',
              message: '⚡ **New Customer Feedback Processed**\nUser: {{trigger.customer.name}}\nSentiment: {{node_gemini.sentiment}}\nAction: Email dispatched'
            }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'node_trigger', target: 'node_gemini', animated: true },
        { id: 'e2', source: 'node_gemini', target: 'node_condition', animated: true },
        { id: 'e3', source: 'node_condition', target: 'node_spotify', sourceHandle: 'true', label: 'True (Positive)' },
        { id: 'e4', source: 'node_condition', target: 'node_gmail', sourceHandle: 'false', label: 'False (Other)' },
        { id: 'e5', source: 'node_gmail', target: 'node_discord' }
      ]
    };
  }

  // Pattern 2: Spotify DJ / Music Automation
  if (p.includes('spotify') || p.includes('music') || p.includes('playlist') || p.includes('song')) {
    return {
      name: 'Spotify AI Smart DJ & Scheduler',
      description: 'Generates mood-based music recommendations with Gemini AI and curates Spotify playlists on a schedule.',
      nodes: [
        {
          id: 'node_cron',
          type: 'custom',
          position: { x: 80, y: 150 },
          data: {
            label: 'Daily 9 AM Schedule',
            type: 'trigger_schedule',
            category: 'trigger',
            icon: 'Clock',
            description: 'Runs every morning to curate day playlist',
            config: {
              interval: 'daily_at_9am',
              cronExpression: '0 9 * * *'
            }
          }
        },
        {
          id: 'node_gemini_dj',
          type: 'custom',
          position: { x: 380, y: 150 },
          data: {
            label: 'Gemini DJ Curator',
            type: 'action_gemini',
            category: 'ai',
            icon: 'Sparkles',
            description: 'Selects the perfect track and mood theme',
            config: {
              taskMode: 'prompt_generation',
              prompt: 'Generate an upbeat, energizing morning song title and artist for productive deep focus.'
            }
          }
        },
        {
          id: 'node_spotify_add',
          type: 'custom',
          position: { x: 700, y: 150 },
          data: {
            label: 'Add to Spotify',
            type: 'action_spotify',
            category: 'integration',
            icon: 'Radio',
            description: 'Adds track to automated morning playlist',
            config: {
              action: 'add_to_playlist',
              trackQuery: 'Starboy The Weeknd',
              playlistName: 'Blessing Morning Flow'
            }
          }
        },
        {
          id: 'node_discord_music',
          type: 'custom',
          position: { x: 1000, y: 150 },
          data: {
            label: 'Discord DJ Broadcast',
            type: 'action_discord',
            category: 'integration',
            icon: 'MessageSquare',
            description: 'Broadcast today playlist song to company channel',
            config: {
              channelName: '#music-lounge',
              message: '🎵 **Blessing AI DJ Pick of the Day:**\nAdded to the office Spotify playlist! Have an energized morning.'
            }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'node_cron', target: 'node_gemini_dj', animated: true },
        { id: 'e2', source: 'node_gemini_dj', target: 'node_spotify_add', animated: true },
        { id: 'e3', source: 'node_spotify_add', target: 'node_discord_music' }
      ]
    };
  }

  // Pattern 3: Gmail Automation & AI Summarization
  if (p.includes('email') || p.includes('gmail') || p.includes('inbox') || p.includes('digest')) {
    return {
      name: 'Gmail AI Assistant & Digest',
      description: 'Monitors inbox for important emails, summarizes content with Gemini, and alerts Discord.',
      nodes: [
        {
          id: 'node_gmail_trig',
          type: 'custom',
          position: { x: 80, y: 160 },
          data: {
            label: 'New Starred Email',
            type: 'trigger_gmail',
            category: 'trigger',
            icon: 'Mail',
            description: 'Triggers when an email is starred or labeled urgent',
            config: {
              searchQuery: 'is:starred label:inbox'
            }
          }
        },
        {
          id: 'node_gemini_sum',
          type: 'custom',
          position: { x: 400, y: 160 },
          data: {
            label: 'Gemini Executive Summary',
            type: 'action_gemini',
            category: 'ai',
            icon: 'Sparkles',
            description: 'Extracts action items and creates concise 2-sentence summary',
            config: {
              taskMode: 'summarization',
              prompt: 'Summarize incoming email subject and body into 2 bullet points with required action.'
            }
          }
        },
        {
          id: 'node_discord_notify',
          type: 'custom',
          position: { x: 740, y: 160 },
          data: {
            label: 'Discord Executive Alert',
            type: 'action_discord',
            category: 'integration',
            icon: 'MessageSquare',
            description: 'Post executive briefing to private alert channel',
            config: {
              channelName: '#executive-briefs',
              message: '📬 **Important Email Summarized by Blessing AI:**\n{{node_gemini_sum.summary}}'
            }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'node_gmail_trig', target: 'node_gemini_sum', animated: true },
        { id: 'e2', source: 'node_gemini_sum', target: 'node_discord_notify', animated: true }
      ]
    };
  }

  // Default General AI Automation Pipeline
  return {
    name: 'Smart AI Automation Flow',
    description: `Automated pipeline created for: "${prompt}"`,
    nodes: [
      {
        id: 'node_start',
        type: 'custom',
        position: { x: 80, y: 160 },
        data: {
          label: 'Inbound Webhook',
          type: 'trigger_webhook',
          category: 'trigger',
          icon: 'Webhook',
          description: 'Receives incoming data payload',
          config: {
            method: 'POST',
            samplePayload: '{\n  "task": "' + prompt.replace(/"/g, '') + '",\n  "timestamp": "' + new Date().toISOString() + '"\n}'
          }
        }
      },
      {
        id: 'node_ai_brain',
        type: 'custom',
        position: { x: 400, y: 160 },
        data: {
          label: 'Gemini AI Processor',
          type: 'action_gemini',
          category: 'ai',
          icon: 'Sparkles',
          description: 'Processes data and formulates automated decision',
          config: {
            taskMode: 'prompt_generation',
            prompt: `Process workflow intent: "${prompt}". Input payload: {{trigger.task}}`
          }
        }
      },
      {
        id: 'node_notify_gmail',
        type: 'custom',
        position: { x: 740, y: 160 },
        data: {
          label: 'Gmail Auto-Notification',
          type: 'action_gmail',
          category: 'integration',
          icon: 'Send',
          description: 'Dispatches update to team',
          config: {
            to: 'admin@blessing.ai',
            subject: 'Blessing Workflow Automated Action Completed',
            body: 'Workflow for "' + prompt + '" executed with result: {{node_ai_brain.generatedText}}'
          }
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'node_start', target: 'node_ai_brain', animated: true },
      { id: 'e2', source: 'node_ai_brain', target: 'node_notify_gmail', animated: true }
    ]
  };
}
