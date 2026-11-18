'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { CustomerFeedbackPortal } from '@/components/feedback/CustomerFeedbackPortal';
import { ArrowLeft } from 'lucide-react';

const WorkflowCanvas = dynamic(
  () => import('@/components/canvas/WorkflowCanvas').then(mod => mod.WorkflowCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono tracking-wider uppercase text-zinc-300">
          Loading Blessing Automation Canvas...
        </span>
      </div>
    )
  }
);

export default function Home() {
  const [currentView, setCurrentView] = useState<'portal' | 'canvas'>('portal');

  if (currentView === 'canvas') {
    return (
      <main className="w-screen h-screen overflow-hidden bg-zinc-950 flex flex-col">
        {/* Banner to switch back to portal */}
        <div className="h-10 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-300 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Visual DAG Automation Workflow Engine</span>
          </div>
          <button
            onClick={() => setCurrentView('portal')}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Product & Comment Portal</span>
          </button>
        </div>

        <div className="flex-1 w-full h-full relative">
          <WorkflowCanvas />
        </div>
      </main>
    );
  }

  return (
    <CustomerFeedbackPortal onViewWorkflow={() => setCurrentView('canvas')} />
  );
}
