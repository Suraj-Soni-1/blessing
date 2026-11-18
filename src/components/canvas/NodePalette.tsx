'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Plus, 
  Layers, 
  X,
  Webhook, 
  Clock, 
  PlayCircle, 
  Mail, 
  Music, 
  Send, 
  Radio, 
  MessageSquare, 
  Globe, 
  GitFork, 
  Hourglass, 
  FileJson, 
  Code 
} from 'lucide-react';
import { NODE_DEFINITIONS } from '@/lib/node-registry';
import { NodeType } from '@/types/workflow';

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

interface NodePaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (type: NodeType) => void;
}

export function NodePalette({ isOpen, onClose, onAddNode }: NodePaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'trigger', label: 'Triggers' },
    { id: 'ai', label: 'AI' },
    { id: 'integration', label: 'Integrations' },
    { id: 'logic', label: 'Logic' },
    { id: 'utility', label: 'Utilities' }
  ];

  const filteredNodes = Object.values(NODE_DEFINITIONS).filter(node => {
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    const matchesSearch = 
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="absolute top-16 left-4 z-40 w-96 max-h-[calc(100vh-5rem)] bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Add Node to Flow</h3>
            <p className="text-[11px] text-zinc-400">Select triggers, AI agents, or service actions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-zinc-800/60 bg-zinc-950/40">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search nodes (e.g. Gemini, Gmail, Spotify, Filter)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-zinc-800/40">
        {filteredNodes.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No nodes found matching &ldquo;{searchTerm}&rdquo;
          </div>
        ) : (
          filteredNodes.map(node => {
            const Icon = ICON_MAP[node.icon] || Sparkles;
            return (
              <button
                key={node.type}
                onClick={() => {
                  onAddNode(node.type);
                  onClose();
                }}
                className="w-full pt-2 first:pt-0 group flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-800/60 text-left transition-all border border-transparent hover:border-zinc-700/60"
              >
                <div
                  className="p-2.5 rounded-xl shrink-0 mt-0.5 transition-transform group-hover:scale-105 shadow-sm"
                  style={{ backgroundColor: `${node.color}15`, color: node.color, border: `1px solid ${node.color}33` }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                      {node.label}
                    </span>
                    <span
                      className="text-[10px] font-medium uppercase px-1.5 py-0.2 rounded border"
                      style={{
                        borderColor: `${node.color}33`,
                        backgroundColor: `${node.color}10`,
                        color: node.color
                      }}
                    >
                      {node.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {node.description}
                  </p>
                </div>
                <div className="shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-opacity">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
