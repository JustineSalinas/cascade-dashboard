import React, { useState } from 'react';

const services = [
  {
    tier: 'Tier 1',
    label: 'Digital Presence & Branding',
    items: [
      {
        name: 'Web Design & Development',
        priceUSD: '300 – 1,200',
        pricePHP: '17,400 – 69,600',
        note: 'Per project. Complexity-based. Includes revisions.',
      },
      {
        name: 'Social Media Management',
        priceUSD: '150 – 400',
        pricePHP: '8,700 – 23,200',
        note: 'Per month. Retainer preferred.',
      },
    ],
  },
  {
    tier: 'Tier 2',
    label: 'Custom Web Applications & Systems',
    items: [
      {
        name: 'Custom Software Development',
        priceUSD: '800 – 4,000',
        pricePHP: '46,400 – 232,000',
        note: 'Per project. Scoped and quoted per requirements.',
      },
      {
        name: 'Automated Tracking Solutions',
        priceUSD: '600 – 2,500',
        pricePHP: '34,800 – 145,000',
        note: 'Per system. Includes deployment and onboarding.',
      },
      {
        name: 'Data Aggregation Pipelines',
        priceUSD: '500 – 2,000',
        pricePHP: '29,000 – 116,000',
        note: 'Per pipeline. Monthly maintenance available.',
      },
    ],
  },
  {
    tier: 'Tier 3',
    label: 'Advanced Integration',
    items: [
      {
        name: 'AI & Real-Time Processing',
        priceUSD: '1,200 – 5,000',
        pricePHP: '69,600 – 290,000',
        note: 'Per integration. Research and testing included.',
      },
      {
        name: 'Cloud Deployment & Architecture',
        priceUSD: '400 – 1,800',
        pricePHP: '23,200 – 104,400',
        note: 'Setup fee. Ongoing maintenance quoted separately.',
      },
    ],
  },
];

const retainers = [
  {
    id: 'starter',
    name: 'Starter',
    target: 'Micro-enterprises & freelancers',
    priceUSD: '250 / mo',
    pricePHP: '₱14,500 / mo',
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
    priceUSD: '600 / mo',
    pricePHP: '₱34,800 / mo',
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
    priceUSD: '1,200+ / mo',
    pricePHP: '₱69,600+ / mo',
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
    priceUSD: '175+ / mo',
    pricePHP: '₱10,000+ / mo',
    description: 'Hosting health checks, dependency updates, uptime monitoring, and minor content edits for deployed sites and apps. Minimum ₱10,000/mo — scales with system complexity.',
  },
  {
    name: 'Analytics Add-on',
    priceUSD: '50 / mo',
    pricePHP: '₱2,900 / mo',
    description: 'Monthly performance dashboards covering traffic, engagement, and conversion metrics delivered via report or live dashboard.',
  },
  {
    name: 'Priority Support',
    priceUSD: '100 / mo',
    pricePHP: '₱5,800 / mo',
    description: 'Guaranteed 24-hour response time, dedicated Slack/Viber channel, and emergency patch deployment coverage.',
  },
];

export default function PricingView() {
  const [currency, setCurrency] = useState('USD');

  return (
    <div className="space-y-10 animate-fade-in-up">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Pricing</p>
          <h2 className="text-xl font-bold text-slate-100">Rates & Packages</h2>
          <p className="text-xs text-slate-500 mt-1">
            Service pricing, MSME retainers, and monthly subscriptions.
          </p>
        </div>
        {/* Currency Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {['USD', 'PHP'].map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currency === c
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Per-Service Pricing */}
      <section>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Per-Service Rates</p>
        <div className="space-y-6">
          {services.map((tier) => (
            <div key={tier.tier}>
              <div className="mb-2 pb-2 border-b border-slate-800">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{tier.tier}</span>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">{tier.label}</p>
              </div>
              <div className="space-y-2">
                {tier.items.map((item) => (
                  <div
                    key={item.name}
                    className="glass-card rounded-xl border border-slate-900 hover:border-slate-700 transition-colors p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-100">{item.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.note}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-200">
                        {currency === 'USD' ? `$${item.priceUSD}` : `₱${item.pricePHP}`}
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
              <div>
                {pkg.highlight && (
                  <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Most Popular</span>
                )}
                <h3 className={`text-sm font-bold mt-0.5 ${pkg.highlight ? 'text-violet-300' : 'text-slate-100'}`}>
                  {pkg.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{pkg.target}</p>
              </div>

              <p className="text-lg font-black text-slate-100">
                {currency === 'USD' ? `$${pkg.priceUSD}` : pkg.pricePHP}
              </p>

              <ul className="space-y-1.5 flex-1">
                {pkg.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[11px] text-slate-400">
                    <span className="text-slate-600 mt-0.5 shrink-0">—</span>
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
              className="glass-card rounded-xl border border-slate-900 hover:border-slate-700 transition-colors p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100">{sub.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{sub.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-slate-200">
                  {currency === 'USD' ? `$${sub.priceUSD}` : sub.pricePHP}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footnote */}
      <p className="text-[10px] text-slate-600 border-t border-slate-800 pt-4">
        All prices are estimates. Final quotes are issued after project scoping. Exchange rate used: 1 USD = ₱58.
      </p>

    </div>
  );
}
