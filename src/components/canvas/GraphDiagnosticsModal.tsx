'use client';

import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { GraphValidationResult } from '@/types/workflow';

interface GraphDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: GraphValidationResult;
  nodesCount: number;
  edgesCount: number;
}

export function GraphDiagnosticsModal({
  isOpen,
  onClose,
  validation,
  nodesCount,
  edgesCount
}: GraphDiagnosticsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${validation.isValid ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400' : 'bg-rose-950/60 border-rose-800/60 text-rose-400'}`}>
              {validation.isValid ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Graph Diagnostics & DAG Validation</h3>
              <p className="text-[11px] text-zinc-400">Loop prevention, topological order & cycle analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Banner */}
        <div className={`p-4 border-b text-xs flex items-center gap-3 ${
          validation.isValid 
            ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' 
            : 'bg-rose-950/30 border-rose-900/40 text-rose-300'
        }`}>
          {validation.isValid ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-200">Valid Directed Acyclic Graph (DAG)</p>
                <p className="text-[11px] text-emerald-400/80">No execution loops detected. Topological execution sequence is deterministic.</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold text-rose-200">Execution Loop or Cycle Detected!</p>
                <p className="text-[11px] text-rose-300/80">Loops prevent deterministic execution. The graph runner blocked execution until cycles are removed.</p>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-center">
              <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Nodes</span>
              <span className="text-lg font-bold text-zinc-100">{nodesCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-center">
              <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Edges</span>
              <span className="text-lg font-bold text-zinc-100">{edgesCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-center">
              <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Cycles</span>
              <span className={`text-lg font-bold ${validation.hasCycles ? 'text-rose-400' : 'text-emerald-400'}`}>
                {validation.cycleNodes.length}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-center">
              <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Orphans</span>
              <span className="text-lg font-bold text-amber-400">{validation.orphanNodes.length}</span>
            </div>
          </div>

          {/* Validation Errors & Cycle Details */}
          {validation.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Validation Errors</h4>
              {validation.errors.map((err, i) => (
                <div key={i} className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300">
                  <div className="font-semibold text-rose-200">{err.message}</div>
                  {err.details && (
                    <div className="mt-2 font-mono text-[11px] text-rose-400/90 flex flex-wrap items-center gap-1 bg-black/40 p-2 rounded-lg">
                      {err.details.map((nodeId, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-rose-900/60 border border-rose-700/60">{nodeId}</span>
                          {idx < err.details!.length - 1 && <ArrowRight className="w-3 h-3 text-rose-500" />}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Topological Execution Sequence (Kahn's Sort) */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span>Topological Execution Sequence (Kahn&apos;s Algorithm)</span>
              <span className="text-[10px] text-zinc-500 font-normal">Resolved order</span>
            </h4>
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              {validation.topologicalOrder.length === 0 ? (
                <span className="text-xs text-zinc-500 italic">No execution order could be derived due to cycles.</span>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  {validation.topologicalOrder.map((nodeId, idx) => (
                    <span key={nodeId} className="flex items-center gap-1.5">
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-indigo-300 rounded text-xs font-mono font-medium">
                        {idx + 1}. {nodeId}
                      </span>
                      {idx < validation.topologicalOrder.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Graph Warnings</h4>
              {validation.warnings.map((warn, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
