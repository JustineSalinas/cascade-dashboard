import React, { useState } from 'react';
import {
  Globe,
  Smartphone,
  Code2,
  Cpu,
  Database,
  Cloud,
  Zap,
  BarChart3,
  Layers,
  ChevronRight,
  Star,
  Sparkles,
  TrendingUp,
  Shield
} from 'lucide-react';

const tiers = [
  {
    id: 'tier1',
    tier: 'Tier 1',
    label: 'Digital Presence & Branding',
    tagline: 'The bread-and-butter services that are quick to deploy and get cash flowing.',
    accentColor: 'from-emerald-500 to-teal-600',
    accentLight: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    accentBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    glowColor: 'shadow-emerald-500/10',
    barColor: 'bg-emerald-500',
    icon: Globe,
    services: [
      {
        id: 's1',
        name: 'Web Design & Development',
        description:
          'High-converting landing pages, corporate websites, and interactive portfolios engineered for performance and aesthetic precision.',
        icon: Globe,
        tags: ['Landing Pages', 'Corporate Sites', 'Portfolios'],
      },
      {
        id: 's2',
        name: 'Social Media Management',
        description:
          'End-to-end brand management, content scheduling, and digital presence optimization across all major platforms.',
        icon: Smartphone,
        tags: ['Brand Management', 'Content Scheduling', 'Digital Presence'],
      },
    ],
  },
  {
    id: 'tier2',
    tier: 'Tier 2',
    label: 'Custom Web Applications & Systems',
    tagline: 'The core engineering services where you can charge premium agency rates.',
    accentColor: 'from-violet-500 to-indigo-600',
    accentLight: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    accentBadge: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    glowColor: 'shadow-violet-500/10',
    barColor: 'bg-violet-500',
    icon: Code2,
    services: [
      {
        id: 's3',
        name: 'Custom Software Development',
        description:
          'Building bespoke web applications tailored to specific operational needs — from localized digital delivery systems to financial tracking apps.',
        icon: Code2,
        tags: ['Web Apps', 'Bespoke Systems', 'Operational Tools'],
      },
      {
        id: 's4',
        name: 'Automated Tracking Solutions',
        description:
          'Developing custom, hardware-free attendance and tracking systems capable of handling hundreds of users efficiently with zero extra infrastructure.',
        icon: BarChart3,
        tags: ['Attendance Systems', 'Tracking', 'Scalable'],
      },
      {
        id: 's5',
        name: 'Data Aggregation Pipelines',
        description:
          'Building secure backend systems that pull, organize, and synchronize data from multiple sources into a single unified dashboard.',
        icon: Database,
        tags: ['Pipelines', 'Backend', 'Dashboard Sync'],
      },
    ],
  },
  {
    id: 'tier3',
    tier: 'Tier 3',
    label: 'Advanced Integration',
    tagline: 'The cutting-edge services that separate you from standard web-design agencies.',
    accentColor: 'from-amber-500 to-orange-600',
    accentLight: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    accentBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    glowColor: 'shadow-amber-500/10',
    barColor: 'bg-amber-500',
    icon: Cpu,
    services: [
      {
        id: 's6',
        name: 'AI & Real-Time Processing',
        description:
          'Integrating lightweight AI models (like MediaPipe) directly into web applications for real-time video, text, or data processing at the edge.',
        icon: Cpu,
        tags: ['MediaPipe', 'Real-Time AI', 'Edge Processing'],
      },
      {
        id: 's7',
        name: 'Cloud Deployment & Architecture',
        description:
          'Setting up reliable hosting, database management using tools like PostgreSQL or Supabase, and seamless CI/CD deployment pipelines.',
        icon: Cloud,
        tags: ['PostgreSQL', 'Supabase', 'CI/CD Pipelines'],
      },
    ],
  },
];

const tierIcons = { tier1: TrendingUp, tier2: Layers, tier3: Sparkles };

export default function CatalogueView() {
  const [activeTier, setActiveTier] = useState('all');

  const visibleTiers = activeTier === 'all' ? tiers : tiers.filter(t => t.id === activeTier);

  return (
    <div className="space-y-8 animate-fade-in-up">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-600" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service Catalogue</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight leading-tight">
            What We Build & Deliver
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
            Three progressive tiers of digital services — from rapid-deploy branding to advanced AI integration.
          </p>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg">
            <Shield size={12} className="text-violet-400" />
            <span className="text-[10px] font-bold text-slate-300">3 Service Tiers</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg">
            <Star size={12} className="text-amber-400" />
            <span className="text-[10px] font-bold text-slate-300">7 Core Services</span>
          </div>
        </div>
      </div>

      {/* Tier Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveTier('all')}
          className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTier === 'all'
              ? 'bg-slate-100 text-slate-900 border-slate-200'
              : 'text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
          }`}
        >
          All Tiers
        </button>
        {tiers.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTier(t.id)}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              activeTier === t.id
                ? t.accentLight
                : 'text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            {t.tier}
          </button>
        ))}
      </div>

      {/* Tier Cards */}
      <div className="space-y-8">
        {visibleTiers.map((tier, tierIdx) => {
          const TierIcon = tier.icon;
          return (
            <div key={tier.id} className="space-y-4">

              {/* Tier Header Banner */}
              <div className={`glass-panel rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-lg ${tier.glowColor} border-slate-800`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.accentColor} flex items-center justify-center shadow-lg shrink-0`}>
                  <TierIcon size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${tier.accentBadge}`}>
                      {tier.tier}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-100 leading-tight">{tier.label}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{tier.tagline}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500">{tier.services.length} services</span>
                  <ChevronRight size={12} className="text-slate-600" />
                </div>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pl-1">
                {tier.services.map((svc) => {
                  const SvcIcon = svc.icon;
                  return (
                    <div
                      key={svc.id}
                      className="glass-card rounded-xl border border-slate-900 p-5 flex flex-col gap-3 hover:border-slate-700 transition-all group"
                    >
                      {/* Icon + Name */}
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tier.accentColor} flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                          <SvcIcon size={16} className="text-white" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-100 leading-tight">{svc.name}</h4>
                          <div className={`w-8 h-0.5 rounded-full mt-1.5 ${tier.barColor}`} />
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-400 leading-relaxed flex-1">{svc.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {svc.tags.map(tag => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${tier.accentBadge}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA / Note */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-violet-500/5 to-indigo-500/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
          <Zap size={18} className="text-white" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-bold text-slate-200">Ready to scope a project?</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Services are bundled or quoted individually. Log active project workspaces under the Projects section to track deliverables and timelines.
          </p>
        </div>
      </div>
    </div>
  );
}
