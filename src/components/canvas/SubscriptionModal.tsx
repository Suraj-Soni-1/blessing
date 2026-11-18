'use client';

import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Check, 
  Gauge
} from 'lucide-react';
import { UserSubscription, SubscriptionPlan } from '@/types/workflow';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onUpdateSubscription: (updated: UserSubscription) => void;
}

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Starter Free',
    priceMonthly: 0,
    maxRunsPerMonth: 500,
    maxActiveWorkflows: 3,
    features: [
      '500 workflow runs / month',
      '3 active workflows',
      'Standard HTTP & Webhook triggers',
      'Community support',
      'Standard execution speed'
    ]
  },
  {
    id: 'pro',
    name: 'Blessing Pro',
    priceMonthly: 29,
    maxRunsPerMonth: 10000,
    maxActiveWorkflows: 25,
    features: [
      '10,000 workflow runs / month',
      '25 active workflows',
      'Google Gemini AI native nodes',
      'Gmail & Spotify automation integrations',
      'Sub-second asynchronous execution queue',
      '14-day execution logs history',
      'Priority email & chat support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Cloud',
    priceMonthly: 199,
    maxRunsPerMonth: 250000,
    maxActiveWorkflows: 999,
    features: [
      '250,000 workflow runs / month',
      'Unlimited workflows',
      'Dedicated background worker cluster',
      'Custom webhook security & HMAC verification',
      '99.99% uptime SLA',
      'Dedicated Slack channel & engineering support'
    ]
  }
];

export function SubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription
}: SubscriptionModalProps) {
  const [upgradedNotice, setUpgradedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = PLANS.find(p => p.id === subscription.planId) || PLANS[1];
  const usagePercent = Math.min(
    100,
    Math.round((subscription.runsUsedThisMonth / subscription.runsLimit) * 100)
  );

  const handleSelectPlan = (planId: 'free' | 'pro' | 'enterprise') => {
    const targetPlan = PLANS.find(p => p.id === planId)!;
    const updated: UserSubscription = {
      ...subscription,
      planId,
      runsLimit: targetPlan.maxRunsPerMonth
    };
    onUpdateSubscription(updated);
    setUpgradedNotice(`Successfully switched plan to ${targetPlan.name}!`);
    setTimeout(() => setUpgradedNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">Subscription & Usage Metering</h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                  Current: {currentPlan.name}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Scale execution capacity and unlock Gemini AI automation pipelines</p>
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {upgradedNotice && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-700 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{upgradedNotice}</span>
            </div>
          )}

          {/* Usage Meter Card */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-200">Monthly Run Quota Usage</span>
              </div>
              <span className="text-xs font-mono font-medium text-zinc-300">
                {subscription.runsUsedThisMonth.toLocaleString()} / {subscription.runsLimit.toLocaleString()} runs ({usagePercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent > 80
                    ? 'bg-rose-500'
                    : usagePercent > 50
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Billing Cycle resets on Dec 1, 2026</span>
              <span>Active Workflows: {subscription.activeWorkflowsCount} / {currentPlan.maxActiveWorkflows}</span>
            </div>
          </div>

          {/* Plan Comparison Cards */}
          <div className="grid grid-cols-3 gap-4">
            {PLANS.map(plan => {
              const isCurrent = subscription.planId === plan.id;
              const isPro = plan.id === 'pro';

              return (
                <div
                  key={plan.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-indigo-950/20 border-indigo-500/60 ring-2 ring-indigo-500/20'
                      : isPro
                      ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'
                      : 'bg-zinc-950/60 border-zinc-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-zinc-100">{plan.name}</h4>
                      {isPro && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-2xl font-black text-white">${plan.priceMonthly}</span>
                      <span className="text-xs text-zinc-400">/ month</span>
                    </div>

                    <p className="text-xs text-zinc-400 mb-4 font-medium">
                      Up to {plan.maxRunsPerMonth.toLocaleString()} runs/mo
                    </p>

                    <div className="space-y-2 border-t border-zinc-800/80 pt-3">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-3">
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isCurrent}
                      className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'bg-zinc-800 text-zinc-400 cursor-default'
                          : isPro
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Active Plan</span>
                        </>
                      ) : (
                        <span>Switch to {plan.name}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
