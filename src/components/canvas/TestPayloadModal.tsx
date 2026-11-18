'use client';

import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Smile, 
  Frown, 
  HelpCircle, 
  RotateCcw,
  Sliders
} from 'lucide-react';

interface TestPayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRun: (payload: any) => void;
  isRunning: boolean;
}

export function TestPayloadModal({
  isOpen,
  onClose,
  onRun,
  isRunning
}: TestPayloadModalProps) {
  const PRESETS = [
    {
      id: 'positive',
      label: 'Positive Review (Branches to Spotify)',
      icon: Smile,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
      payload: {
        event: 'customer.feedback',
        customer: {
          name: 'Sarah Connor',
          email: 'sarah@cyberdyne.io',
          feedback: 'I absolutely love Blessing automation! It seamlessly connected our Spotify celebration playlist with Gemini AI.'
        }
      }
    },
    {
      id: 'negative',
      label: 'Negative Review (Branches to Gmail + Discord)',
      icon: Frown,
      color: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
      payload: {
        event: 'customer.feedback',
        customer: {
          name: 'John Connor',
          email: 'john@cyberdyne.io',
          feedback: 'The workflow crashed and failed completely! This is terrible, I demand an urgent apology and refund!'
        }
      }
    },
    {
      id: 'inquiry',
      label: 'General Inquiry / Pricing Question',
      icon: HelpCircle,
      color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40',
      payload: {
        event: 'customer.inquiry',
        customer: {
          name: 'Miles Dyson',
          email: 'miles@cyberdyne.io',
          feedback: 'Hello, could you explain the limits on the Pro plan and how Gemini models are integrated?'
        }
      }
    }
  ];

  const [jsonText, setJsonText] = useState(JSON.stringify(PRESETS[0].payload, null, 2));
  const [selectedPreset, setSelectedPreset] = useState('positive');
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset.id);
    setJsonText(JSON.stringify(preset.payload, null, 2));
    setParseError(null);
  };

  const handleExecute = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onRun(parsed);
      onClose();
    } catch (err: any) {
      setParseError(`JSON Syntax Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Test Execution Payload Simulator</h3>
              <p className="text-[11px] text-zinc-400">Simulate incoming webhook events to test conditional branching & AI response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/30 space-y-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Select Test Scenario Preset:
          </span>
          <div className="grid grid-cols-1 gap-2">
            {PRESETS.map(preset => {
              const Icon = preset.icon;
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? `${preset.color} ring-1 ring-indigo-500`
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium truncate">{preset.label}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Use Preset</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* JSON Editor */}
        <div className="p-4 space-y-2">
          <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
            <span>Payload Data (JSON)</span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Variables passed to &#123;&#123;trigger.body&#125;&#125;
            </span>
          </label>
          <textarea
            rows={7}
            value={jsonText}
            onChange={e => {
              setJsonText(e.target.value);
              setParseError(null);
            }}
            className="w-full p-3 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />

          {parseError && (
            <p className="text-xs text-rose-400 font-medium">{parseError}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <button
            onClick={() => handleSelectPreset(PRESETS[0])}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            onClick={handleExecute}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Execute Flow with This Payload</span>
          </button>
        </div>
      </div>
    </div>
  );
}
