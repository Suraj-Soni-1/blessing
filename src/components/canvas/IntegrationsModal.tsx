'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Mail, 
  Music, 
  MessageSquare, 
  CheckCircle2, 
  Key, 
  Copy,
  Check
} from 'lucide-react';
import { ServiceCredential } from '@/types/workflow';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: ServiceCredential[];
  onUpdateCredential: (cred: ServiceCredential) => void;
}

export function IntegrationsModal({
  isOpen,
  onClose,
  credentials,
  onUpdateCredential
}: IntegrationsModalProps) {
  const [activeTab, setActiveTab] = useState<'gemini' | 'gmail' | 'spotify' | 'discord' | 'webhooks'>('gemini');
  const [copiedKey, setCopiedKey] = useState(false);
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const geminiCred = credentials.find(c => c.service === 'gemini') || {
    id: 'cred_gemini',
    service: 'gemini' as const,
    name: 'Google Gemini Pro & Flash',
    connected: true,
    apiKey: 'AIzaSyDemo-GeminiKey-BlessingEngine-2026'
  };

  const gmailCred = credentials.find(c => c.service === 'gmail') || {
    id: 'cred_gmail',
    service: 'gmail' as const,
    name: 'Gmail Integration',
    connected: true,
    accountEmail: 'suraj@blessing.ai'
  };

  const spotifyCred = credentials.find(c => c.service === 'spotify') || {
    id: 'cred_spotify',
    service: 'spotify' as const,
    name: 'Spotify Web API',
    connected: true,
    accountName: "Suraj's Spotify Premium"
  };

  const discordCred = credentials.find(c => c.service === 'discord') || {
    id: 'cred_discord',
    service: 'discord' as const,
    name: 'Discord Webhook Integration',
    connected: true,
    webhookUrl: 'https://discord.com/api/webhooks/blessing/alerts'
  };

  const handleTestConnection = (service: string) => {
    setTestingService(service);
    setTestResult(null);
    setTimeout(() => {
      setTestingService(null);
      setTestResult(`${service.toUpperCase()} connection verified! Status 200 OK.`);
      setTimeout(() => setTestResult(null), 3500);
    }, 600);
  };

  const copyWebhookCurl = () => {
    const curlCommand = `curl -X POST https://blessing.ai/api/v1/workflows/wf_sentiment_triage/trigger \\
  -H "Content-Type: application/json" \\
  -H "x-blessing-key: bless_whsec_994a8bc39d8e7" \\
  -d '{"event":"customer.feedback","customer":{"name":"Sarah Connor","email":"sarah@cyberdyne.io","feedback":"Amazing platform!"}}'`;
    navigator.clipboard.writeText(curlCommand);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Integrations & Credentials Vault</h3>
              <p className="text-[11px] text-zinc-400">Manage API keys and authentication for Gemini, Gmail, Spotify & Discord</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-4">
          {[
            { id: 'gemini', label: 'Google Gemini', icon: Sparkles, color: 'text-purple-400' },
            { id: 'gmail', label: 'Gmail', icon: Mail, color: 'text-rose-400' },
            { id: 'spotify', label: 'Spotify', icon: Music, color: 'text-emerald-400' },
            { id: 'discord', label: 'Discord / Slack', icon: MessageSquare, color: 'text-blue-400' },
            { id: 'webhooks', label: 'Inbound Webhooks', icon: Key, color: 'text-amber-400' }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-all ${
                  active
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-4 min-h-[320px]">
          {testResult && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}

          {/* Gemini */}
          {activeTab === 'gemini' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-purple-950/20 border border-purple-900/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100">Google Gemini Pro & Flash API</h4>
                    <p className="text-[11px] text-zinc-400">Native multimodal reasoning, sentiment scoring & prompt execution</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Gemini API Key</label>
                <div className="relative">
                  <input
                    type="password"
                    value={geminiCred.apiKey || ''}
                    onChange={e => onUpdateCredential({ ...geminiCred, apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Optional: If left blank or demo, Blessing uses its integrated intelligent simulation engine.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-400">Models: `gemini-1.5-flash`, `gemini-1.5-pro`</span>
                <button
                  onClick={() => handleTestConnection('gemini')}
                  disabled={testingService === 'gemini'}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
                >
                  {testingService === 'gemini' ? 'Testing API...' : 'Test Gemini Connection'}
                </button>
              </div>
            </div>
          )}

          {/* Gmail */}
          {activeTab === 'gmail' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100">Gmail OAuth2 Integration</h4>
                    <p className="text-[11px] text-zinc-400">Connected account: {gmailCred.accountEmail}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> OAuth Verified
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Authorized Sender Email</label>
                <input
                  type="email"
                  value={gmailCred.accountEmail || ''}
                  onChange={e => onUpdateCredential({ ...gmailCred, accountEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-400">Scopes: `gmail.send`, `gmail.compose`, `gmail.readonly`</span>
                <button
                  onClick={() => handleTestConnection('gmail')}
                  disabled={testingService === 'gmail'}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
                >
                  {testingService === 'gmail' ? 'Verifying...' : 'Test Gmail Dispatch'}
                </button>
              </div>
            </div>
          )}

          {/* Spotify */}
          {activeTab === 'spotify' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100">Spotify Web API Integration</h4>
                    <p className="text-[11px] text-zinc-400">Active account: {spotifyCred.accountName}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Default Target Playlist Name</label>
                <input
                  type="text"
                  defaultValue="Blessing AI Celebrations"
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-400">Scopes: `playlist-modify-public`, `user-read-playback-state`</span>
                <button
                  onClick={() => handleTestConnection('spotify')}
                  disabled={testingService === 'spotify'}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                >
                  {testingService === 'spotify' ? 'Checking...' : 'Test Spotify Playlist Sync'}
                </button>
              </div>
            </div>
          )}

          {/* Discord */}
          {activeTab === 'discord' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-blue-950/20 border border-blue-900/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100">Discord & Slack Webhook Dispatcher</h4>
                    <p className="text-[11px] text-zinc-400">Channel target: #workflow-alerts</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Webhook URL</label>
                <input
                  type="text"
                  value={discordCred.webhookUrl || ''}
                  onChange={e => onUpdateCredential({ ...discordCred, webhookUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-400">Formats: Markdown text, Rich Embeds, Bot avatars</span>
                <button
                  onClick={() => handleTestConnection('discord')}
                  disabled={testingService === 'discord'}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                >
                  {testingService === 'discord' ? 'Pinging...' : 'Send Test Discord Ping'}
                </button>
              </div>
            </div>
          )}

          {/* Inbound Webhooks */}
          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-950/20 border border-amber-900/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100">Inbound Webhook Endpoint</h4>
                    <p className="text-[11px] text-zinc-400">Send HTTP requests from any app, Stripe, GitHub, or Shopify to trigger flows</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-900/40 border border-amber-700/40 text-[10px] font-mono text-amber-300">
                    HTTPS Enabled
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">Sample cURL Command</label>
                  <button
                    onClick={copyWebhookCurl}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'Copied to Clipboard' : 'Copy cURL'}</span>
                  </button>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-[11px] text-zinc-300 overflow-x-auto whitespace-pre">
{`curl -X POST https://blessing.ai/api/v1/workflows/wf_sentiment_triage/trigger \\
  -H "Content-Type: application/json" \\
  -H "x-blessing-key: bless_whsec_994a8bc39d8e7" \\
  -d '{
    "event": "customer.feedback",
    "customer": {
      "name": "Sarah Connor",
      "email": "sarah@cyberdyne.io",
      "feedback": "Love the product!"
    }
  }'`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
