'use client';

import React, { useRef } from 'react';
import { 
  Play, 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  CreditCard, 
  FolderGit2, 
  Terminal, 
  RotateCw,
  Zap,
  Sliders,
  LayoutGrid,
  Download,
  Upload
} from 'lucide-react';
import { GraphValidationResult, UserSubscription } from '@/types/workflow';

interface NavbarProps {
  workflowName: string;
  onUpdateWorkflowName: (name: string) => void;
  isActive: boolean;
  onToggleActive: () => void;
  onRunTest: () => void;
  isRunning: boolean;
  validation: GraphValidationResult;
  onOpenPalette: () => void;
  onOpenAICopilot: () => void;
  onOpenDiagnostics: () => void;
  onOpenIntegrations: () => void;
  onOpenSubscription: () => void;
  onOpenTemplates: () => void;
  onOpenLogs: () => void;
  onOpenPayloadModal: () => void;
  onAutoLayout: () => void;
  onExportWorkflow: () => void;
  onImportWorkflow: (importedData: any) => void;
  subscription: UserSubscription;
}

export function Navbar({
  workflowName,
  onUpdateWorkflowName,
  isActive,
  onToggleActive,
  onRunTest,
  isRunning,
  validation,
  onOpenPalette,
  onOpenAICopilot,
  onOpenDiagnostics,
  onOpenIntegrations,
  onOpenSubscription,
  onOpenTemplates,
  onOpenLogs,
  onOpenPayloadModal,
  onAutoLayout,
  onExportWorkflow,
  onImportWorkflow,
  subscription
}: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImportWorkflow(parsed);
      } catch (err) {
        alert('Invalid workflow JSON file');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="h-16 px-4 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md flex items-center justify-between z-30 select-none">
      {/* Brand & Workflow Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">Blessing</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 -mt-0.5 font-medium">AI Automation Platform</p>
          </div>
        </div>

        {/* Workflow Title Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={workflowName}
            onChange={e => onUpdateWorkflowName(e.target.value)}
            className="text-xs font-semibold text-zinc-200 bg-transparent hover:bg-zinc-900 focus:bg-zinc-900 border border-transparent hover:border-zinc-800 focus:border-zinc-700 px-2 py-1 rounded-lg focus:outline-none transition-colors max-w-[220px] truncate"
            title="Click to rename workflow"
          />

          {/* Active Status Switch */}
          <button
            onClick={onToggleActive}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
              isActive
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
            <span>{isActive ? 'ACTIVE' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Middle Action Controls */}
      <div className="flex items-center gap-2">
        {/* Test Workflow Button Group */}
        <div className="flex items-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-0.5 shadow-lg shadow-emerald-600/20">
          <button
            onClick={onRunTest}
            disabled={isRunning || !validation.isValid}
            title={!validation.isValid ? 'Fix validation errors/loops before running' : 'Execute workflow asynchronously'}
            className={`px-3 py-1.5 rounded-l-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isRunning
                ? 'bg-cyan-600 text-white cursor-wait animate-pulse'
                : !validation.isValid
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                : 'hover:bg-black/10 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Test Flow</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenPayloadModal}
            title="Simulate custom payload (Positive vs Negative feedback)"
            className="px-2 py-1.5 border-l border-emerald-500/40 hover:bg-black/20 text-white rounded-r-[10px] transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Copilot Prompt-to-Workflow */}
        <button
          onClick={onOpenAICopilot}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Copilot</span>
        </button>

        {/* Add Node Button */}
        <button
          onClick={onOpenPalette}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          <span>Add Node</span>
        </button>

        {/* Organize / Auto-Layout */}
        <button
          onClick={onAutoLayout}
          title="Auto-organize nodes into clean hierarchical layout"
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Templates */}
        <button
          onClick={onOpenTemplates}
          className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />
          <span>Templates</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Graph Diagnostics Pill */}
        <button
          onClick={onOpenDiagnostics}
          className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
            validation.isValid
              ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400 hover:bg-emerald-950/60'
              : 'bg-rose-950/50 border-rose-800/60 text-rose-300 hover:bg-rose-950/80 animate-pulse'
          }`}
        >
          {validation.isValid ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DAG Valid</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Loop Detected</span>
            </>
          )}
        </button>

        {/* Export / Import Flow */}
        <button
          onClick={onExportWorkflow}
          title="Export Workflow JSON"
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <label
          title="Import Workflow JSON"
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Logs Button */}
        <button
          onClick={onOpenLogs}
          title="View execution logs"
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Integrations Vault */}
        <button
          onClick={onOpenIntegrations}
          title="Integrations (Gemini, Spotify, Gmail, Discord)"
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
        >
          <Key className="w-4 h-4" />
        </button>

        {/* Subscription Plan Button */}
        <button
          onClick={onOpenSubscription}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors"
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-zinc-200 capitalize">{subscription.planId}</span>
          <span className="text-[10px] text-zinc-500">
            {Math.round((subscription.runsUsedThisMonth / subscription.runsLimit) * 100)}%
          </span>
        </button>

        {/* User Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center border border-zinc-700 shadow">
          S
        </div>
      </div>
    </header>
  );
}
