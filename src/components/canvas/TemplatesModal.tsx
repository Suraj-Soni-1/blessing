'use client';

import React from 'react';
import { 
  X, 
  FolderGit2, 
  ArrowRight
} from 'lucide-react';
import { generateWorkflowFromPrompt } from '@/lib/ai-copilot';
import { DEFAULT_WORKFLOW } from '@/lib/storage';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (workflowData: any) => void;
}

export function TemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate
}: TemplatesModalProps) {
  if (!isOpen) return null;

  const templates = [
    {
      id: 'sentiment_triage',
      title: 'AI Customer Sentiment Triage (Showcase)',
      description: 'Webhook receives customer reviews, Gemini classifies sentiment, branching into Spotify celebration or Gmail + Discord priority alerts.',
      tags: ['Webhook', 'Gemini AI', 'Spotify', 'Gmail', 'Discord', 'Condition Logic'],
      badge: 'Featured',
      color: 'from-purple-500/20 to-indigo-500/20',
      data: DEFAULT_WORKFLOW
    },
    {
      id: 'spotify_dj',
      title: 'Spotify AI Morning DJ & Curator',
      description: 'Scheduled cron triggers Gemini to recommend high-focus music daily, queuing tracks into your Spotify team playlist.',
      tags: ['Schedule', 'Gemini AI', 'Spotify', 'Discord'],
      badge: 'Music',
      color: 'from-emerald-500/20 to-teal-500/20',
      data: generateWorkflowFromPrompt('Every morning at 9am, ask Gemini for an energizing focus track and add it to our Spotify playlist')
    },
    {
      id: 'gmail_summarizer',
      title: 'Gmail AI Executive Briefing',
      description: 'Detects starred emails, generates concise action summaries with Gemini 1.5 Pro, and alerts key stakeholders via Discord.',
      tags: ['Gmail', 'Gemini AI', 'Discord'],
      badge: 'Productivity',
      color: 'from-rose-500/20 to-amber-500/20',
      data: generateWorkflowFromPrompt('When a starred email arrives in Gmail, summarize the action items with Gemini and notify our Discord channel')
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Workflow Templates Library</h3>
              <p className="text-[11px] text-zinc-400">Pre-validated production blueprints ready to deploy instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {templates.map(tpl => (
            <div
              key={tpl.id}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex items-start justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                    {tpl.title}
                  </h4>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {tpl.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{tpl.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tpl.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 flex items-center pt-2">
                <button
                  onClick={() => {
                    onSelectTemplate(tpl.data);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
