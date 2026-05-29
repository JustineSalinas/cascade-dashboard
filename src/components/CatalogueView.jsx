import React from 'react';

// SVG inline logos for each service
const ServiceIcons = {
  'Web Design & Development': (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <rect width="40" height="40" rx="8" fill="#3b82f6" fillOpacity="0.15"/>
      <rect x="6" y="10" width="28" height="20" rx="2" stroke="#60a5fa" strokeWidth="1.5"/>
      <path d="M6 14h28" stroke="#60a5fa" strokeWidth="1.5"/>
      <circle cx="9" cy="12" r="1" fill="#60a5fa"/>
      <circle cx="12" cy="12" r="1" fill="#60a5fa"/>
      <circle cx="15" cy="12" r="1" fill="#60a5fa"/>
      <path d="M14 21l3 3-3 3" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 24h6" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'Social Media Management': (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <rect width="40" height="40" rx="8" fill="#8b5cf6" fillOpacity="0.15"/>
      <rect x="8" y="8" width="10" height="10" rx="2" fill="#8b5cf6" fillOpacity="0.4" stroke="#a78bfa" strokeWidth="1"/>
      <rect x="22" y="8" width="10" height="10" rx="2" fill="#8b5cf6" fillOpacity="0.4" stroke="#a78bfa" strokeWidth="1"/>
      <rect x="8" y="22" width="10" height="10" rx="2" fill="#8b5cf6" fillOpacity="0.4" stroke="#a78bfa" strokeWidth="1"/>
      <rect x="22" y="22" width="10" height="10" rx="2" fill="#8b5cf6" fillOpacity="0.4" stroke="#a78bfa" strokeWidth="1"/>
      <path d="M18 13h4M18 27h4M13 18v4M27 18v4" stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  'Custom Software Development': (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <rect width="40" height="40" rx="8" fill="#10b981" fillOpacity="0.15"/>
      <path d="M10 20h4l3-8 4 16 3-8h6" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20" cy="20" r="10" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="3 2"/>
    </svg>
  ),
  'Automated Tracking Solutions': (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <rect width="40" height="40" rx="8" fill="#f59e0b" fillOpacity="0.15"/>
      <rect x="12" y="8" width="16" height="24" rx="3" stroke="#fbbf24" strokeWidth="1.5"/>
      <path d="M16 14h8M16 18h8M16 22h5" stroke="#fde68a" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="26" cy="28" r="5" fill="#f59e0b" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="1.2"/>
      <path d="M24 28l1.5 1.5 2.5-2.5" stroke="#fde68a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Data Aggregation Pipelines': (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <rect width="40" height="40" rx="8" fill="#06b6d4" fillOpacity="0.15"/>
      <ellipse cx="20" cy="12" rx="10" ry="4" stroke="#22d3ee" strokeWidth="1.5"/>
      <path d="M10 12v8c0 2.2 4.5 4 10 4s10-1.8 10-4v-8" stroke="#22d3ee" strokeWidth="1.5"/>
      <path d="M10 20v8c0 2.2 4.5 4 10 4s10-1.8 10-4v-8" stroke="#67e8f9" strokeWidth="1.2"/>
      <path d="M20 16v8M16 18v4M24 18v4" stroke="#a5f3fc" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  'AI & Real-Time Processing': (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <rect width="40" height="40" rx="8" fill="#ec4899" fillOpacity="0.15"/>
      <circle cx="20" cy="20" r="6" stroke="#f472b6" strokeWidth="1.5"/>
      <circle cx="20" cy="20" r="2" fill="#f9a8d4"/>
      <path d="M20 8v4M20 28v4M8 20h4M28 20h4" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12.1 12.1l2.8 2.8M25.1 25.1l2.8 2.8M12.1 27.9l2.8-2.8M25.1 14.9l2.8-2.8" stroke="#fbcfe8" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  'Cloud Deployment & Architecture': (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
      <rect width="40" height="40" rx="8" fill="#6366f1" fillOpacity="0.15"/>
      <path d="M28 24a6 6 0 10-11.8-1.6A5 5 0 1013 28h15a4 4 0 000-4z" stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M20 24v-6M17 21l3-3 3 3" stroke="#a5b4fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const tiers = [
  {
    id: 'tier1',
    tier: 'Tier 1',
    label: 'Digital Presence & Branding',
    tagline: 'Quick to deploy and get cash flowing.',
    color: 'text-blue-400',
    dotColor: 'bg-blue-400',
    services: [
      {
        id: 's1',
        name: 'Web Design & Development',
        description:
          'High-converting landing pages, corporate websites, and interactive portfolios engineered for performance and aesthetic precision.',
        tags: ['Landing Pages', 'Corporate Sites', 'Portfolios'],
        tech: ['React', 'Next.js', 'Tailwind CSS'],
      },
      {
        id: 's2',
        name: 'Social Media Management',
        description:
          'End-to-end brand management, content scheduling, and digital presence optimization across all major platforms.',
        tags: ['Brand Management', 'Content Scheduling', 'Digital Presence'],
        tech: ['Meta Ads', 'Canva', 'Analytics'],
      },
    ],
  },
  {
    id: 'tier2',
    tier: 'Tier 2',
    label: 'Custom Web Applications & Systems',
    tagline: 'Core engineering services at premium agency rates.',
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    services: [
      {
        id: 's3',
        name: 'Custom Software Development',
        description:
          'Building bespoke web applications tailored to specific operational needs — from localized digital delivery systems to financial tracking apps.',
        tags: ['Web Apps', 'Bespoke Systems', 'Operational Tools'],
        tech: ['Node.js', 'PostgreSQL', 'React'],
      },
      {
        id: 's4',
        name: 'Automated Tracking Solutions',
        description:
          'Hardware-free attendance and tracking systems capable of handling hundreds of users efficiently with zero extra infrastructure.',
        tags: ['Attendance Systems', 'Tracking', 'Scalable'],
        tech: ['QR/NFC', 'Supabase', 'Real-Time DB'],
      },
      {
        id: 's5',
        name: 'Data Aggregation Pipelines',
        description:
          'Secure backend systems that pull, organize, and synchronize data from multiple sources into a single unified dashboard.',
        tags: ['Pipelines', 'Backend', 'Dashboard Sync'],
        tech: ['REST APIs', 'Supabase', 'PostgreSQL'],
      },
    ],
  },
  {
    id: 'tier3',
    tier: 'Tier 3',
    label: 'Advanced Integration',
    tagline: 'What separates you from standard web-design agencies.',
    color: 'text-rose-400',
    dotColor: 'bg-rose-400',
    services: [
      {
        id: 's6',
        name: 'AI & Real-Time Processing',
        description:
          'Integrating lightweight AI models (like MediaPipe) directly into web applications for real-time video, text, or data processing at the edge.',
        tags: ['MediaPipe', 'Real-Time AI', 'Edge Processing'],
        tech: ['MediaPipe', 'TensorFlow.js', 'WebRTC'],
      },
      {
        id: 's7',
        name: 'Cloud Deployment & Architecture',
        description:
          'Reliable hosting, database management using PostgreSQL or Supabase, and seamless CI/CD deployment pipelines.',
        tags: ['PostgreSQL', 'Supabase', 'CI/CD'],
        tech: ['Vercel', 'Supabase', 'GitHub Actions'],
      },
    ],
  },
];

// Small tech pill icon using first letters / short codes
const TechPill = ({ label }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold text-slate-400 border border-slate-800 bg-slate-900/60 uppercase tracking-wide">
    {label}
  </span>
);

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
            <div className="mb-4 pb-3 border-b border-slate-800 flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${tier.dotColor} shrink-0`} />
              <div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{tier.tier}</span>
                <h3 className={`text-sm font-semibold mt-0 ${tier.color}`}>{tier.label}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{tier.tagline}</p>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-3">
              {tier.services.map((svc) => (
                <div
                  key={svc.id}
                  className="glass-card rounded-xl border border-slate-900 hover:border-slate-700 transition-colors p-4 flex gap-4"
                >
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5">
                    {ServiceIcons[svc.name] || (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">
                        {svc.name[0]}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-100 mb-1">{svc.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{svc.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {svc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-[9px] font-medium text-slate-500 border border-slate-800 uppercase tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Tech stack pills */}
                    {svc.tech && svc.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mr-0.5 self-center">Stack:</span>
                        {svc.tech.map((t) => (
                          <TechPill key={t} label={t} />
                        ))}
                      </div>
                    )}
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
