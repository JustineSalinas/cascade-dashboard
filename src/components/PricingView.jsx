import React from 'react';

// ─── Service icon map (same SVGs as CatalogueView) ───────────────────────────
const ServiceIcons = {
  'Web Design & Development': (
    <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 shrink-0">
      <rect width="36" height="36" rx="7" fill="#3b82f6" fillOpacity="0.15"/>
      <rect x="5" y="9" width="26" height="18" rx="2" stroke="#60a5fa" strokeWidth="1.4"/>
      <path d="M5 13h26" stroke="#60a5fa" strokeWidth="1.4"/>
      <circle cx="8" cy="11" r="1" fill="#60a5fa"/>
      <circle cx="11" cy="11" r="1" fill="#60a5fa"/>
      <path d="M12 20l3 3-3 3" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 22h6" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  'Social Media Management': (
    <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 shrink-0">
      <rect width="36" height="36" rx="7" fill="#8b5cf6" fillOpacity="0.15"/>
      <rect x="7" y="7" width="9" height="9" rx="2" fill="#8b5cf6" fillOpacity="0.3" stroke="#a78bfa" strokeWidth="1"/>
      <rect x="20" y="7" width="9" height="9" rx="2" fill="#8b5cf6" fillOpacity="0.3" stroke="#a78bfa" strokeWidth="1"/>
      <rect x="7" y="20" width="9" height="9" rx="2" fill="#8b5cf6" fillOpacity="0.3" stroke="#a78bfa" strokeWidth="1"/>
      <rect x="20" y="20" width="9" height="9" rx="2" fill="#8b5cf6" fillOpacity="0.3" stroke="#a78bfa" strokeWidth="1"/>
    </svg>
  ),
  'Custom Software Development': (
    <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 shrink-0">
      <rect width="36" height="36" rx="7" fill="#10b981" fillOpacity="0.15"/>
      <path d="M9 18h3l3-7 4 14 3-7h5" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Automated Tracking Solutions': (
    <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 shrink-0">
      <rect width="36" height="36" rx="7" fill="#f59e0b" fillOpacity="0.15"/>
      <rect x="11" y="6" width="14" height="22" rx="3" stroke="#fbbf24" strokeWidth="1.4"/>
      <path d="M15 12h6M15 16h6M15 20h4" stroke="#fde68a" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="25" cy="27" r="4" fill="#f59e0b" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="1.2"/>
      <path d="M23.5 27l1.2 1.2 2-2" stroke="#fde68a" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Data Aggregation Pipelines': (
    <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 shrink-0">
      <rect width="36" height="36" rx="7" fill="#06b6d4" fillOpacity="0.15"/>
      <ellipse cx="18" cy="10" rx="9" ry="4" stroke="#22d3ee" strokeWidth="1.4"/>
      <path d="M9 10v8c0 2.2 4 4 9 4s9-1.8 9-4v-8" stroke="#22d3ee" strokeWidth="1.4"/>
      <path d="M9 18v8c0 2.2 4 4 9 4s9-1.8 9-4v-8" stroke="#67e8f9" strokeWidth="1.2"/>
    </svg>
  ),
  'AI & Real-Time Processing': (
    <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 shrink-0">
      <rect width="36" height="36" rx="7" fill="#ec4899" fillOpacity="0.15"/>
      <circle cx="18" cy="18" r="6" stroke="#f472b6" strokeWidth="1.4"/>
      <circle cx="18" cy="18" r="2" fill="#f9a8d4"/>
      <path d="M18 7v3M18 26v3M7 18h3M26 18h3" stroke="#f472b6" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  'Cloud Deployment & Architecture': (
    <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 shrink-0">
      <rect width="36" height="36" rx="7" fill="#6366f1" fillOpacity="0.15"/>
      <path d="M26 22a5 5 0 10-10.6-1.4A4.5 4.5 0 1011 26h15a3.5 3.5 0 000-4z" stroke="#818cf8" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M18 22v-5M15.5 19.5l2.5-2.5 2.5 2.5" stroke="#a5b4fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// Retainer plan icons
const PlanIcon = ({ name }) => {
  if (name === 'Starter') return (
    <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
      <circle cx="14" cy="14" r="13" stroke="#94a3b8" strokeWidth="1.5"/>
      <path d="M9 14l3 3 7-7" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (name === 'Growth') return (
    <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
      <circle cx="14" cy="14" r="13" stroke="#a78bfa" strokeWidth="1.5"/>
      <path d="M8 18l4-4 3 3 5-6" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
      <circle cx="14" cy="14" r="13" stroke="#fbbf24" strokeWidth="1.5"/>
      <path d="M14 7v7l4 4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};

// Subscription icons
const SubIcon = ({ name }) => {
  if (name === 'Maintenance') return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#64748b" strokeWidth="1.3"/>
      <path d="M12 7v5l3 3" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
  if (name === 'Analytics Add-on') return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="#64748b" strokeWidth="1.3"/>
      <path d="M7 16l3-4 3 3 4-6" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0">
      <circle cx="12" cy="12" r="9" stroke="#64748b" strokeWidth="1.3"/>
      <path d="M12 8v4M12 16h.01" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};

const services = [
  {
    tier: 'Tier 1',
    label: 'Digital Presence & Branding',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    items: [
      { name: 'Web Design & Development', priceUSD: '300 – 1,200', pricePHP: '17,400 – 69,600', note: 'Per project. Complexity-based. Includes revisions.' },
      { name: 'Social Media Management', priceUSD: '150 – 400', pricePHP: '8,700 – 23,200', note: 'Per month. Retainer preferred.' },
    ],
  },
  {
    tier: 'Tier 2',
    label: 'Custom Web Applications & Systems',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    items: [
      { name: 'Custom Software Development', priceUSD: '800 – 4,000', pricePHP: '46,400 – 232,000', note: 'Per project. Scoped and quoted per requirements.' },
      { name: 'Automated Tracking Solutions', priceUSD: '600 – 2,500', pricePHP: '34,800 – 145,000', note: 'Per system. Includes deployment and onboarding.' },
      { name: 'Data Aggregation Pipelines', priceUSD: '500 – 2,000', pricePHP: '29,000 – 116,000', note: 'Per pipeline. Monthly maintenance available.' },
    ],
  },
  {
    tier: 'Tier 3',
    label: 'Advanced Integration',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/20',
    items: [
      { name: 'AI & Real-Time Processing', priceUSD: '1,200 – 5,000', pricePHP: '69,600 – 290,000', note: 'Per integration. Research and testing included.' },
      { name: 'Cloud Deployment & Architecture', priceUSD: '400 – 1,800', pricePHP: '23,200 – 104,400', note: 'Setup fee. Ongoing maintenance quoted separately.' },
    ],
  },
];

const retainers = [
  {
    id: 'starter',
    name: 'Starter',
    target: 'Micro-enterprises & freelancers',
    priceUSD: 250,
    pricePHP: 14500,
    suffix: '/ mo',
    includes: [
      'Social media management (1 platform)',
      'Basic website maintenance',
      'Monthly performance report',
      'Email support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    target: 'Small businesses scaling digitally',
    priceUSD: 600,
    pricePHP: 34800,
    suffix: '/ mo',
    includes: [
      'Social media management (up to 3 platforms)',
      'Website updates & minor feature additions',
      'Bi-weekly reporting & strategy calls',
      'Priority support',
      'One custom tool or automation per quarter',
    ],
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    target: 'MSMEs with complex operational needs',
    priceUSD: 1200,
    pricePHP: 69600,
    suffix: '+ / mo',
    includes: [
      'Full-stack web application support',
      'Custom system development & iteration',
      'Data pipelines & integrations',
      'Dedicated dev allocation',
      'Weekly syncs & full reporting suite',
    ],
  },
];

const subscriptions = [
  {
    name: 'Maintenance',
    priceUSD: 175,
    pricePHP: 10000,
    suffix: '+ / mo',
    description: 'Hosting health checks, dependency updates, uptime monitoring, and minor content edits for deployed sites and apps.',
  },
  {
    name: 'Analytics Add-on',
    priceUSD: 50,
    pricePHP: 2900,
    suffix: '/ mo',
    description: 'Monthly performance dashboards covering traffic, engagement, and conversion metrics delivered via report or live dashboard.',
  },
  {
    name: 'Priority Support',
    priceUSD: 100,
    pricePHP: 5800,
    suffix: '/ mo',
    description: 'Guaranteed 24-hour response time, dedicated Slack/Viber channel, and emergency patch deployment coverage.',
  },
];

// Format monetary value
const fmt = (currency, usd, php, suffix = '') => {
  if (currency === 'PHP') {
    return `₱${php.toLocaleString()}${suffix}`;
  }
  return `$${usd.toLocaleString()}${suffix}`;
};

export default function PricingView({ currency }) {
  // Fallback if not passed from parent
  const cur = currency || 'PHP';

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up">

      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Pricing</p>
        <h2 className="text-xl font-bold text-slate-100">Rates & Packages</h2>
        <p className="text-xs text-slate-500 mt-1">
          Service pricing, MSME retainers, and monthly subscriptions.
          Showing prices in <span className="text-violet-400 font-bold">{cur === 'PHP' ? 'Philippine Pesos (₱)' : 'US Dollars ($)'}</span>
          {' '}— toggle in the header to switch.
        </p>
      </div>

      {/* Per-Service Pricing */}
      <section>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Per-Service Rates</p>
        <div className="space-y-6">
          {services.map((tier) => (
            <div key={tier.tier}>
              <div className={`mb-3 pb-2 border-b ${tier.borderColor}`}>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{tier.tier}</span>
                <p className={`text-xs font-semibold mt-0.5 ${tier.color}`}>{tier.label}</p>
              </div>
              <div className="space-y-2">
                {tier.items.map((item) => (
                  <div
                    key={item.name}
                    className="glass-card rounded-xl border border-slate-900 hover:border-slate-700 transition-colors p-3.5 flex items-center gap-3"
                  >
                    {/* Icon */}
                    <div className="shrink-0">
                      {ServiceIcons[item.name] || (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">
                          {item.name[0]}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-100">{item.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.note}</p>
                    </div>

                    {/* Price */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-200">
                        {cur === 'USD' ? `$${item.priceUSD}` : `₱${item.pricePHP}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MSME Retainers */}
      <section>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">MSME Retainer Packages</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {retainers.map((pkg) => (
            <div
              key={pkg.id}
              className={`glass-card rounded-xl border p-5 flex flex-col gap-3 transition-colors ${
                pkg.highlight
                  ? 'border-violet-500/30 bg-violet-500/5'
                  : 'border-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <PlanIcon name={pkg.name} />
                <div>
                  {pkg.highlight && (
                    <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest block">Most Popular</span>
                  )}
                  <h3 className={`text-sm font-bold ${pkg.highlight ? 'text-violet-300' : 'text-slate-100'}`}>
                    {pkg.name}
                  </h3>
                  <p className="text-[10px] text-slate-500">{pkg.target}</p>
                </div>
              </div>

              <p className="text-lg font-black text-slate-100">
                {fmt(cur, pkg.priceUSD, pkg.pricePHP, ` ${pkg.suffix}`)}
              </p>

              <ul className="space-y-1.5 flex-1">
                {pkg.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[11px] text-slate-400">
                    <span className="text-violet-500 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Subscriptions */}
      <section>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Monthly Subscriptions & Add-ons</p>
        <div className="space-y-2">
          {subscriptions.map((sub) => (
            <div
              key={sub.name}
              className="glass-card rounded-xl border border-slate-900 hover:border-slate-700 transition-colors p-3.5 flex items-center gap-3"
            >
              <SubIcon name={sub.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100">{sub.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{sub.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-slate-200">
                  {fmt(cur, sub.priceUSD, sub.pricePHP, ` ${sub.suffix}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footnote */}
      <p className="text-[10px] text-slate-600 border-t border-slate-800 pt-4">
        All prices are estimates. Final quotes are issued after project scoping. Exchange rate: 1 USD = ₱58.
      </p>

    </div>
  );
}
