'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Webhook, 
  Clock, 
  PlayCircle, 
  Mail, 
  Music, 
  Sparkles, 
  Send, 
  Radio, 
  MessageSquare, 
  Globe, 
  GitFork, 
  Hourglass, 
  FileJson, 
  Code,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { WorkflowNodeData, NodeType } from '@/types/workflow';
import { NODE_DEFINITIONS } from '@/lib/node-registry';

const ICON_MAP: Record<string, React.ElementType> = {
  Webhook,
  Clock,
  PlayCircle,
  Mail,
  Music,
  Sparkles,
  Send,
  Radio,
  MessageSquare,
  Globe,
  GitFork,
  Hourglass,
  FileJson,
  Code
};

export const CustomWorkflowNode = memo((props: any) => {
  const { data, selected } = props;
  const nodeData = data as WorkflowNodeData;
  const def = NODE_DEFINITIONS[nodeData.type as NodeType] || {
    label: nodeData.label,
    icon: 'Sparkles',
    color: '#6366F1',
    category: 'utility'
  };

  const IconComponent = ICON_MAP[def.icon] || Sparkles;
  const isCondition = nodeData.type === 'logic_condition';
  const isTrigger = (nodeData.type || '').startsWith('trigger_');
  const status = nodeData.status || 'idle';

  // Status-based styling
  const getStatusBorder = () => {
    if (status === 'running') return 'border-cyan-400 ring-4 ring-cyan-400/20 shadow-lg shadow-cyan-500/20 animate-pulse';
    if (status === 'success') return 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10';
    if (status === 'failed') return 'border-rose-500 ring-4 ring-rose-500/30 shadow-lg shadow-rose-500/20 animate-bounce';
    if (status === 'skipped') return 'border-zinc-700 opacity-50';
    if (selected) return 'border-indigo-400 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10';
    return 'border-zinc-800 hover:border-zinc-700';
  };

  // Preview snippet for node data
  const renderPreview = () => {
    const cfg = nodeData.config || {};
    if (nodeData.type === 'action_gemini') {
      return (
        <div className="flex items-center gap-1.5 text-xs text-purple-300/80 truncate">
          <span className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-[10px] font-mono">
            {cfg.model || 'gemini-1.5-flash'}
          </span>
          <span className="truncate">{cfg.taskMode || 'sentiment_analysis'}</span>
        </div>
      );
    }
    if (nodeData.type === 'action_gmail') {
      return (
        <div className="text-xs text-rose-300/80 truncate">
          <span className="text-zinc-400">To: </span>
          <span className="font-mono text-[11px] truncate">{cfg.to || 'recipient'}</span>
        </div>
      );
    }
    if (nodeData.type === 'action_spotify') {
      return (
        <div className="text-xs text-emerald-300/80 truncate">
          <span className="text-zinc-400">Song: </span>
          <span className="font-mono text-[11px] truncate">{cfg.trackQuery || 'Starboy'}</span>
        </div>
      );
    }
    if (nodeData.type === 'trigger_webhook') {
      return (
        <div className="text-xs text-blue-300/80 truncate font-mono text-[11px]">
          {cfg.method || 'POST'} {cfg.path || '/webhook'}
        </div>
      );
    }
    if (nodeData.type === 'logic_condition') {
      return (
        <div className="text-xs text-amber-300/80 truncate font-mono text-[11px]">
          {cfg.leftOperand || 'input'} {cfg.operator || '=='} {cfg.rightOperand || 'val'}
        </div>
      );
    }
    return <p className="text-xs text-zinc-400 truncate">{nodeData.description || def.description}</p>;
  };

  return (
    <div
      className={`relative min-w-[260px] max-w-[300px] rounded-xl bg-zinc-900/95 backdrop-blur-md border transition-all duration-200 select-none shadow-xl ${getStatusBorder()}`}
    >
      {/* Input Handle (all non-trigger nodes) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3.5 !h-3.5 !-left-2 !bg-zinc-300 hover:!bg-indigo-400 !border-2 !border-zinc-900 transition-colors"
        />
      )}

      {/* Node Header */}
      <div className="p-3.5 pb-2.5 flex items-start gap-3">
        <div
          className="p-2.5 rounded-lg flex items-center justify-center shrink-0 shadow-inner"
          style={{ backgroundColor: `${def.color}1A`, color: def.color, border: `1px solid ${def.color}33` }}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded border"
              style={{
                borderColor: `${def.color}33`,
                backgroundColor: `${def.color}15`,
                color: def.color
              }}
            >
              {def.category}
            </span>

            {/* Execution Status Badge */}
            {status === 'running' && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-cyan-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Running
              </span>
            )}
            {status === 'success' && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </span>
            )}
            {status === 'failed' && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
                <AlertCircle className="w-3 h-3" />
                Error
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-zinc-100 truncate">{nodeData.label || def.label}</h3>
        </div>
      </div>

      {/* Node Content / Preview */}
      <div className="px-3.5 pb-3 pt-1 border-t border-zinc-800/60 mt-1">
        {renderPreview()}
      </div>

      {/* Latency / Result Footer if executed */}
      {nodeData.lastExecution?.durationMs !== undefined && (
        <div className="px-3.5 py-1.5 bg-zinc-950/50 rounded-b-xl border-t border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Latency</span>
          <span className="font-mono text-zinc-300 font-medium">{nodeData.lastExecution.durationMs}ms</span>
        </div>
      )}

      {/* Output Handles */}
      {isCondition ? (
        // Condition node provides True and False branches
        <div className="relative">
          <div className="absolute -right-2 top-[-36px] flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-800/40 shadow">
              TRUE
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="true"
              className="!w-3.5 !h-3.5 !bg-emerald-400 hover:!bg-emerald-300 !border-2 !border-zinc-900"
            />
          </div>

          <div className="absolute -right-2 top-[-10px] flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/80 px-1 rounded border border-amber-800/40 shadow">
              FALSE
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="false"
              className="!w-3.5 !h-3.5 !bg-amber-400 hover:!bg-amber-300 !border-2 !border-zinc-900"
            />
          </div>
        </div>
      ) : (
        // Standard single output handle
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3.5 !h-3.5 !-right-2 !bg-zinc-300 hover:!bg-indigo-400 !border-2 !border-zinc-900 transition-colors"
        />
      )}
    </div>
  );
});

CustomWorkflowNode.displayName = 'CustomWorkflowNode';
