import React from 'react';

const tiers = [
  {
    id: 'tier1',
    tier: 'Tier 1',
    label: 'Digital Presence & Branding',
    tagline: 'Quick to deploy and get cash flowing.',
    services: [
      {
        id: 's1',
        name: 'Web Design & Development',
        description:
          'High-converting landing pages, corporate websites, and interactive portfolios engineered for performance and aesthetic precision.',
        tags: ['Landing Pages', 'Corporate Sites', 'Portfolios'],
      },
      {
        id: 's2',
        name: 'Social Media Management',
        description:
          'End-to-end brand management, content scheduling, and digital presence optimization across all major platforms.',
        tags: ['Brand Management', 'Content Scheduling', 'Digital Presence'],
      },
    ],
  },
  {
    id: 'tier2',
    tier: 'Tier 2',
    label: 'Custom Web Applications & Systems',
    tagline: 'Core engineering services at premium agency rates.',
    services: [
      {
        id: 's3',
        name: 'Custom Software Development',
        description:
          'Building bespoke web applications tailored to specific operational needs — from localized digital delivery systems to financial tracking apps.',
        tags: ['Web Apps', 'Bespoke Systems', 'Operational Tools'],
      },
      {
        id: 's4',
        name: 'Automated Tracking Solutions',
        description:
          'Hardware-free attendance and tracking systems capable of handling hundreds of users efficiently with zero extra infrastructure.',
        tags: ['Attendance Systems', 'Tracking', 'Scalable'],
      },
      {
        id: 's5',
        name: 'Data Aggregation Pipelines',
        description:
          'Secure backend systems that pull, organize, and synchronize data from multiple sources into a single unified dashboard.',
        tags: ['Pipelines', 'Backend', 'Dashboard Sync'],
      },
    ],
  },
  {
    id: 'tier3',
    tier: 'Tier 3',
    label: 'Advanced Integration',
    tagline: 'What separates you from standard web-design agencies.',
    services: [
      {
        id: 's6',
        name: 'AI & Real-Time Processing',
        description:
          'Integrating lightweight AI models (like MediaPipe) directly into web applications for real-time video, text, or data processing at the edge.',
        tags: ['MediaPipe', 'Real-Time AI', 'Edge Processing'],
      },
      {
        id: 's7',
        name: 'Cloud Deployment & Architecture',
        description:
          'Reliable hosting, database management using PostgreSQL or Supabase, and seamless CI/CD deployment pipelines.',
        tags: ['PostgreSQL', 'Supabase', 'CI/CD'],
      },
    ],
  },
];

export default function CatalogueView() {
  return (
    <div className="space-y-10 animate-fade-in-up">

      {/* Page Header */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Services</p>
        <h2 className="text-xl font-bold text-slate-100">What We Build & Deliver</h2>
        <p className="text-xs text-slate-500 mt-1">
          Three progressive service tiers — from rapid-deploy branding to advanced AI integration.
        </p>
      </div>

      {/* Tiers */}
      <div className="space-y-10">
        {tiers.map((tier) => (
          <div key={tier.id}>

            {/* Tier Header */}
            <div className="mb-4 pb-3 border-b border-slate-800">
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{tier.tier}</span>
              <h3 className="text-sm font-semibold text-slate-200 mt-0.5">{tier.label}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{tier.tagline}</p>
            </div>

            {/* Services */}
            <div className="space-y-3">
              {tier.services.map((svc) => (
                <div
                  key={svc.id}
                  className="glass-card rounded-xl border border-slate-900 hover:border-slate-700 transition-colors p-4"
                >
                  <h4 className="text-sm font-semibold text-slate-100 mb-1">{svc.name}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{svc.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {svc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[9px] font-medium text-slate-500 border border-slate-800 uppercase tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
