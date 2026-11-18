'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Play, 
  Sparkles, 
  Code, 
  Check, 
  Copy,
  ChevronDown,
  Info
} from 'lucide-react';
import { NODE_DEFINITIONS } from '@/lib/node-registry';
import { NodeType, WorkflowNodeData } from '@/types/workflow';

interface NodeConfigDrawerProps {
  selectedNode: any | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updatedData: Partial<WorkflowNodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
  allNodes: any[];
}

export function NodeConfigDrawer({
  selectedNode,
  onClose,
  onUpdateNode,
  onDeleteNode,
  allNodes
}: NodeConfigDrawerProps) {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [label, setLabel] = useState('');
  const [testOutput, setTestOutput] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data?.config || {});
      setLabel(selectedNode.data?.label || '');
      setTestOutput(selectedNode.data?.lastExecution?.output || null);
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const nodeType = selectedNode.data?.type as NodeType;
  const def = NODE_DEFINITIONS[nodeType] || {
    label: selectedNode.data?.label,
    description: '',
    category: 'utility',
    color: '#6366F1',
    inputSchema: {}
  };

  const handleFieldChange = (key: string, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    onUpdateNode(selectedNode.id, {
      label,
      config: updated
    });
  };

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    onUpdateNode(selectedNode.id, {
      label: newLabel,
      config
    });
  };

  // Upstream variables suggestions
  const upstreamVariables = allNodes
    .filter(n => n.id !== selectedNode.id)
    .flatMap(n => {
      const type = n.data?.type || '';
      if (type.startsWith('trigger_')) {
        return [
          { token: '{{trigger.customer.name}}', desc: 'Customer Name' },
          { token: '{{trigger.customer.email}}', desc: 'Customer Email' },
          { token: '{{trigger.customer.feedback}}', desc: 'Raw Feedback text' },
          { token: '{{trigger.event}}', desc: 'Trigger event type' }
        ];
      }
      if (type === 'action_gemini') {
        return [
          { token: `{{${n.id}.sentiment}}`, desc: 'AI Sentiment (POSITIVE/NEGATIVE)' },
          { token: `{{${n.id}.confidence}}`, desc: 'AI Confidence score' },
          { token: `{{${n.id}.recommendedAction}}`, desc: 'AI Recommended action' },
          { token: `{{${n.id}.songRecommendation}}`, desc: 'AI Recommended song' }
        ];
      }
      if (type === 'action_spotify') {
        return [
          { token: `{{${n.id}.track.id}}`, desc: 'Spotify Track URI' },
          { token: `{{${n.id}.track.title}}`, desc: 'Spotify Track Title' }
        ];
      }
      return [{ token: `{{${n.id}.output}}`, desc: `${n.data?.label} Output` }];
    });

  const runSingleTest = async () => {
    setIsTesting(true);
    setTimeout(() => {
      let mockResult: any = {};
      if (nodeType === 'action_gemini') {
        mockResult = {
          model: config.model || 'gemini-1.5-flash',
          sentiment: 'POSITIVE',
          confidence: 0.96,
          recommendedAction: 'Engage customer with celebratory Spotify playlist and VIP perks',
          songRecommendation: 'Happy - Pharrell Williams',
          tokensUsed: 62
        };
      } else if (nodeType === 'action_gmail') {
        mockResult = {
          messageId: 'mock_msg_984128',
          to: config.to || 'sarah@cyberdyne.io',
          subject: config.subject,
          status: 'QUEUED_FOR_DISPATCH'
        };
      } else if (nodeType === 'action_spotify') {
        mockResult = {
          track: {
            title: config.trackQuery || 'Starboy',
            uri: 'spotify:track:demo_123',
            status: 'ADDED_TO_PLAYLIST'
          },
          playlist: config.playlistName || 'Blessing AI Automations'
        };
      } else {
        mockResult = { status: 'SUCCESS', evaluatedConfig: config };
      }
      setTestOutput(mockResult);
      setIsTesting(false);
    }, 500);
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedVar(token);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  return (
    <div className="absolute top-16 right-4 z-40 w-[420px] max-h-[calc(100vh-5rem)] bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-6 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: `${def.color}20`, color: def.color, border: `1px solid ${def.color}40` }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
              style={{
                borderColor: `${def.color}33`,
                backgroundColor: `${def.color}15`,
                color: def.color
              }}
            >
              {def.category}
            </span>
            <input
              type="text"
              value={label}
              onChange={e => handleLabelChange(e.target.value)}
              className="text-sm font-semibold text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-indigo-500 focus:outline-none transition-colors mt-0.5 block"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            title="Delete Node"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-2.5 bg-zinc-950/40 border-b border-zinc-800/60 text-xs text-zinc-400 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 shrink-0 text-zinc-500 mt-0.5" />
        <p>{def.description}</p>
      </div>

      {/* Dynamic Form Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {def.inputSchema && Object.entries(def.inputSchema).map(([key, schema]: [string, any]) => {
          const val = config[key] !== undefined ? config[key] : (def.defaultConfig?.[key] ?? '');

          return (
            <div key={key} className="space-y-1.5">
              <label className="flex items-center justify-between text-xs font-medium text-zinc-300">
                <span>{schema.label || key}</span>
                {schema.type === 'textarea' && (
                  <span className="text-[10px] text-zinc-500">Supports &#123;&#123;var&#125;&#125;</span>
                )}
              </label>

              {schema.type === 'select' ? (
                <div className="relative">
                  <select
                    value={val}
                    onChange={e => handleFieldChange(key, e.target.value)}
                    className="w-full appearance-none px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500 pr-8"
                  >
                    {schema.options?.map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : schema.type === 'textarea' ? (
                <textarea
                  rows={4}
                  value={val}
                  onChange={e => handleFieldChange(key, e.target.value)}
                  placeholder={schema.placeholder || ''}
                  className="w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500 resize-y leading-relaxed"
                />
              ) : schema.type === 'boolean' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={e => handleFieldChange(key, e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-zinc-400">{schema.label}</span>
                </label>
              ) : (
                <input
                  type={schema.type || 'text'}
                  value={val}
                  onChange={e => handleFieldChange(key, e.target.value)}
                  placeholder={schema.placeholder || ''}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              )}

              {schema.description && (
                <p className="text-[11px] text-zinc-500">{schema.description}</p>
              )}
            </div>
          );
        })}

        {/* Upstream Variable Picker */}
        {upstreamVariables.length > 0 && (
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                Dynamic Variables
              </span>
              <span className="text-[10px] text-zinc-500">Click to copy token</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-zinc-950/60 rounded-xl border border-zinc-800/60">
              {upstreamVariables.map((v, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => copyToClipboard(v.token)}
                  title={v.desc}
                  className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-indigo-300 hover:text-white flex items-center gap-1 transition-all"
                >
                  {copiedVar === v.token ? (
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 text-zinc-500" />
                  )}
                  {v.token}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Test Step Runner & Output Inspector */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-300">Step Tester</span>
            <button
              onClick={runSingleTest}
              disabled={isTesting}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Play className="w-3 h-3 fill-white" />
              {isTesting ? 'Testing...' : 'Test This Step'}
            </button>
          </div>

          {testOutput && (
            <div className="mt-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-300 max-h-48 overflow-auto">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 pb-1.5 mb-1.5 border-b border-zinc-800/60">
                <span>Output Payload</span>
                <span className="text-emerald-400">Status 200 OK</span>
              </div>
              <pre className="whitespace-pre-wrap">{JSON.stringify(testOutput, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
