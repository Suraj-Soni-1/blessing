'use client';

import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  RotateCcw
} from 'lucide-react';
import { WorkflowRun, WorkflowExecutionLog } from '@/types/workflow';

interface ExecutionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentRun: WorkflowRun | null;
  onReplayRun?: () => void;
}

export function ExecutionPanel({
  isOpen,
  onClose,
  currentRun,
  onReplayRun
}: ExecutionPanelProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  if (!isOpen || !currentRun) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-40 max-h-[360px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-100">Workflow Execution Logs</h3>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  currentRun.status === 'success'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                    : currentRun.status === 'failed'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800/40 animate-pulse'
                }`}
              >
                {currentRun.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                {currentRun.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                {currentRun.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5 font-mono">
              <span>Run ID: {currentRun.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                {currentRun.durationMs ?? 0}ms total latency
              </span>
              <span>•</span>
              <span>Trigger: {currentRun.triggerSource}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onReplayRun && (
            <button
              onClick={onReplayRun}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-run
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Step List */}
        <div className="w-1/2 border-r border-zinc-800/80 overflow-y-auto divide-y divide-zinc-800/40 p-2 space-y-1">
          {currentRun.logs.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">
              No steps executed yet or execution was aborted.
            </div>
          ) : (
            currentRun.logs.map((log: WorkflowExecutionLog, idx: number) => {
              const isSelected = selectedLogId === log.nodeId || (!selectedLogId && idx === 0);
              return (
                <button
                  key={log.nodeId + idx}
                  onClick={() => setSelectedLogId(log.nodeId)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-zinc-800/90 border border-zinc-700/80'
                      : 'hover:bg-zinc-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[11px] font-mono text-zinc-500 w-4">{idx + 1}</span>
                    {log.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">{log.nodeLabel}</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{log.nodeType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-zinc-400">{log.durationMs}ms</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Step Payload Inspector */}
        <div className="w-1/2 overflow-y-auto p-4 bg-zinc-950/60 font-mono text-xs">
          {(() => {
            const activeLog = currentRun.logs.find(
              l => l.nodeId === selectedLogId
            ) || currentRun.logs[0];

            if (!activeLog) {
              return (
                <div className="text-zinc-500 text-center py-8">
                  {currentRun.error ? (
                    <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300">
                      <strong>Workflow Error:</strong>
                      <p className="mt-1 font-mono text-xs">{currentRun.error}</p>
                    </div>
                  ) : (
                    'Select a step to inspect payload'
                  )}
                </div>
              );
            }

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-[11px] text-zinc-400">
                  <span className="text-zinc-200 font-semibold">{activeLog.nodeLabel}</span>
                  <span className="text-emerald-400 font-medium">Status: {activeLog.status}</span>
                </div>

                {activeLog.error && (
                  <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs">
                    <strong>Error: </strong> {activeLog.error}
                  </div>
                )}

                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1">
                    Output Data
                  </span>
                  <pre className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-300 overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(activeLog.output, null, 2)}
                  </pre>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1">
                    Input Parameters
                  </span>
                  <pre className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-zinc-400 overflow-x-auto text-[10px] leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(activeLog.input, null, 2)}
                  </pre>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
