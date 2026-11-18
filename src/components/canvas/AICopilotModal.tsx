'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Wand2,
  RefreshCw
} from 'lucide-react';
import { generateWorkflowFromPrompt, GeneratedWorkflowTemplate } from '@/lib/ai-copilot';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedWorkflow: (template: GeneratedWorkflowTemplate) => void;
}

export function AICopilotModal({
  isOpen,
  onClose,
  onApplyGeneratedWorkflow
}: AICopilotModalProps) {
  const [prompt, setPrompt] = useState(
    'When a customer submits feedback on our webhook, analyze the sentiment with Gemini AI. If positive, celebrate by adding an upbeat track to our Spotify playlist. If negative or urgent, draft an apology email in Gmail and send an alert to our Discord channel.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedWorkflowTemplate | null>(null);

  if (!isOpen) return null;

  const examplePrompts = [
    'Analyze customer feedback with Gemini and branch to Spotify celebration or Gmail triage',
    'Every day at 9 AM, use Gemini to curate a focus track and add it to our Spotify playlist',
    'When a new starred email arrives in Gmail, summarize action items with Gemini and ping Discord'
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateWorkflowFromPrompt(prompt);
      setGeneratedResult(result);
      setIsGenerating(false);
    }, 700);
  };

  const handleApply = () => {
    if (generatedResult) {
      onApplyGeneratedWorkflow(generatedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">Blessing AI Copilot</h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                  Prompt to Workflow
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Describe an automation in natural language to generate nodes and connections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Input Section */}
        <div className="p-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>What workflow would you like to build?</span>
              <span className="text-[10px] text-zinc-500">Gemini 1.5 Architecture Model</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. When a webhook gets a lead, use Gemini to score it, then send an email with Gmail..."
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none leading-relaxed"
            />
          </div>

          {/* Quick Preset Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-zinc-400 font-medium">Quick suggestions:</span>
            <div className="flex flex-wrap gap-1.5">
              {examplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-purple-300 transition-all text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Nodes & Graph Topology...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Workflow with AI</span>
              </>
            )}
          </button>

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-purple-900/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-purple-200">{generatedResult.name}</h4>
                  <p className="text-[11px] text-zinc-400">{generatedResult.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/80 text-[10px] font-mono text-purple-300">
                  {generatedResult.nodes.length} Nodes • {generatedResult.edges.length} Edges
                </span>
              </div>

              {/* Node Sequence Preview */}
              <div className="p-3 bg-zinc-900/90 rounded-lg border border-zinc-800 flex flex-wrap items-center gap-2">
                {generatedResult.nodes.map((node, idx) => (
                  <span key={node.id} className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-zinc-800 text-[11px] font-medium text-zinc-200 border border-zinc-700">
                      {node.data?.label}
                    </span>
                    {idx < generatedResult.nodes.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-purple-400" />
                    )}
                  </span>
                ))}
              </div>

              <button
                onClick={handleApply}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Check className="w-4 h-4" />
                Apply to Canvas & Replace Current Flow
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
