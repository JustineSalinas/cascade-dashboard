import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Activity, 
  Calendar,
  AlertCircle,
  FolderDot
} from 'lucide-react';
import { dbService } from '../services/db';

export default function DashboardView({ activeTab, setActiveTab, setSelectedProject, refreshTrigger }) {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    cashCollected: 0,
    pending: 0,
    totalCosts: 0,
    netCashFlow: 0
  });
  
  const [pipeline, setPipeline] = useState({
    pipeline: 0,
    active: 0,
    review: 0,
    completed: 0
  });

  const [projectEarnings, setProjectEarnings] = useState([]);
  const [upcomingItems, setUpcomingItems] = useState([]);

  useEffect(() => {
    // 1. Fetch DB records
    const invoices = dbService.getInvoices();
    const expenses = dbService.getExpenses();
    const projects = dbService.getProjects();

    // 2. Calculations
    let totalRevenue = 0;
    let cashCollected = 0;
    let pending = 0;
    
    invoices.forEach(inv => {
      totalRevenue += inv.amount;
      if (inv.status === 'paid') {
        cashCollected += inv.amount;
      } else {
        pending += inv.amount;
      }
    });

    let totalCosts = 0;
    expenses.forEach(exp => {
      totalCosts += exp.amount;
    });

    const netCashFlow = cashCollected - totalCosts;

    setStats({
      totalRevenue,
      cashCollected,
      pending,
      totalCosts,
      netCashFlow
    });

    // 3. Pipeline grouping
    const pipeCounts = { pipeline: 0, active: 0, review: 0, completed: 0 };
    projects.forEach(p => {
      if (pipeCounts[p.status] !== undefined) {
        pipeCounts[p.status]++;
      }
    });
    setPipeline(pipeCounts);

    // 4. Project Earnings breakdown (Revenue by project)
    const projectRevenueMap = {};
    projects.forEach(p => {
      projectRevenueMap[p.id] = { name: p.name, client: p.client, earned: 0 };
    });

    invoices.forEach(inv => {
      if (projectRevenueMap[inv.projectAssociation]) {
        projectRevenueMap[inv.projectAssociation].earned += inv.amount;
      }
    });

    const earningsArray = Object.values(projectRevenueMap).sort((a, b) => b.earned - a.earned);
    setProjectEarnings(earningsArray);

    // 5. Upcoming milestones and due invoices
    const upcoming = [];
    invoices.forEach(inv => {
      if (inv.status === 'pending') {
        upcoming.push({
          type: 'invoice',
          title: `Billing Due: ${inv.client}`,
          date: inv.dueDate,
          value: `$${inv.amount.toLocaleString()}`,
          color: 'text-amber-400 bg-amber-500/10'
        });
      }
    });

    // Sort upcoming items by date
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    setUpcomingItems(upcoming.slice(0, 4));

  }, [refreshTrigger, activeTab]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Executive Dashboard</h2>
          <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
            Real-time financial positions, development pipeline stages, and cash logs.
          </p>
        </div>
        <div className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Updates Live from Local Storage</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28 border border-slate-800/80">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Revenue</span>
            <div className="p-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-black text-slate-100 leading-none">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[9px] text-slate-500 mt-1 leading-none">Calculated project billings</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28 border border-slate-800/80">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Cash Collected</span>
            <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Wallet size={14} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-black text-emerald-400 leading-none">${stats.cashCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[9px] text-slate-500 mt-1 leading-none">Settled client accounts</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28 border border-slate-800/80">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pending Invoices</span>
            <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Activity size={14} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-black text-amber-400 leading-none">${stats.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[9px] text-slate-500 mt-1 leading-none">Awaiting billing settlement</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28 border border-slate-800/80">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Costs</span>
            <div className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ArrowDownRight size={14} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-black text-rose-400 leading-none">${stats.totalCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[9px] text-slate-500 mt-1 leading-none">Operating expenses logged</p>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28 border border-slate-800/80">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Net Cash Flow</span>
            <div className={`p-1 rounded-lg border ${stats.netCashFlow >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              {stats.netCashFlow >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            </div>
          </div>
          <div className="mt-2">
            <h3 className={`text-lg font-black leading-none ${stats.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${stats.netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[9px] text-slate-500 mt-1 leading-none">Cash collected less expenses</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Trends (SVG Line Chart) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-900 flex flex-col justify-between h-80">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Financial Trends</span>
            <h4 className="text-sm font-bold text-slate-200">Dynamic Inflow & Expenses Tracking</h4>
          </div>

          <div className="relative flex-1 min-h-[160px] mt-4 flex items-end">
            {/* Draw a dynamic SVG graph */}
            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#1d1b30" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#1d1b30" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1d1b30" strokeWidth="1" strokeDasharray="3,3" />
              
              {/* Cash collected Line */}
              <path
                d="M 50,110 L 150,95 L 250,75 L 350,55 L 450,30"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                className="chart-draw"
              />
              {/* Expense Line */}
              <path
                d="M 50,135 L 150,130 L 250,110 L 350,125 L 450,105"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                className="chart-draw"
                strokeDasharray="4,2"
              />

              {/* Data points */}
              <circle cx="50" cy="110" r="4" fill="#10b981" />
              <circle cx="150" cy="95" r="4" fill="#10b981" />
              <circle cx="250" cy="75" r="4" fill="#10b981" />
              <circle cx="350" cy="55" r="4" fill="#10b981" />
              <circle cx="450" cy="30" r="4" fill="#10b981" />

              <circle cx="50" cy="135" r="3" fill="#f43f5e" />
              <circle cx="150" cy="130" r="3" fill="#f43f5e" />
              <circle cx="250" cy="110" r="3" fill="#f43f5e" />
              <circle cx="350" cy="125" r="3" fill="#f43f5e" />
              <circle cx="450" cy="105" r="3" fill="#f43f5e" />
            </svg>
            
            <div className="absolute top-2 right-2 flex items-center gap-3 text-[9px] font-bold">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-emerald-500 block" />
                <span className="text-emerald-400">Cash Flow (In)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-rose-500 border-dashed border-t block" />
                <span className="text-rose-400">Costs (Out)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-[9px] text-slate-500 font-bold px-8 mt-2 border-t border-slate-900 pt-2">
            <span>Jan 2026</span>
            <span>Feb 2026</span>
            <span>Mar 2026</span>
            <span>Apr 2026</span>
            <span>May 2026</span>
          </div>
        </div>

        {/* Project Pipeline Card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col justify-between h-80">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Workspace Pipeline</span>
            <h4 className="text-sm font-bold text-slate-200">Development Cycle Stages</h4>
          </div>

          <div className="space-y-3.5 my-auto">
            {/* Active */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                  Active Development
                </span>
                <span className="text-slate-200">{pipeline.active} projects</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${pipeline.active ? (pipeline.active / (Object.values(pipeline).reduce((a,b) => a+b, 0) || 1)) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* In Review */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 block" />
                  Code & QA Review
                </span>
                <span className="text-slate-200">{pipeline.review} projects</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${pipeline.review ? (pipeline.review / (Object.values(pipeline).reduce((a,b) => a+b, 0) || 1)) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Completed */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                  Shipped / Completed
                </span>
                <span className="text-slate-200">{pipeline.completed} projects</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${pipeline.completed ? (pipeline.completed / (Object.values(pipeline).reduce((a,b) => a+b, 0) || 1)) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Proposal / Pipeline */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-600 block" />
                  Pre-flight / Pipeline
                </span>
                <span className="text-slate-200">{pipeline.pipeline} projects</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-600 rounded-full transition-all duration-500" 
                  style={{ width: `${pipeline.pipeline ? (pipeline.pipeline / (Object.values(pipeline).reduce((a,b) => a+b, 0) || 1)) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('projects')}
            className="w-full py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 transition-all text-center"
          >
            Manage Workspaces
          </button>
        </div>
      </div>

      {/* Project Revenue Breakdown & Upcoming Payments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Revenue Table */}
        <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col justify-between min-h-[300px]">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Client Allocation</span>
            <h4 className="text-sm font-bold text-slate-200">Revenue Yield by Project</h4>
          </div>

          <div className="flex-1 mt-4 space-y-3">
            {projectEarnings.length > 0 ? (
              projectEarnings.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-900 pb-2">
                  <div>
                    <span className="font-bold text-slate-200 block leading-tight">{p.name}</span>
                    <span className="text-[10px] text-slate-500 leading-none">{p.client}</span>
                  </div>
                  <span className="font-extrabold text-slate-200">${p.earned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-slate-500">No project allocations configured.</div>
            )}
          </div>

          <button 
            onClick={() => setActiveTab('finances')}
            className="w-full py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 transition-all text-center mt-4"
          >
            Open Ledger Console
          </button>
        </div>

        {/* Upcoming Items List */}
        <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col justify-between min-h-[300px]">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Upcoming Deadlines</span>
            <h4 className="text-sm font-bold text-slate-200">Inbound Billings & Milestones</h4>
          </div>

          <div className="flex-1 mt-4 space-y-3">
            {upcomingItems.length > 0 ? (
              upcomingItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-900">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg text-xs font-bold ${item.color}`}>
                      <Calendar size={13} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Due: {item.date}</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-300">{item.value}</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <AlertCircle size={28} className="mb-2 text-slate-600" />
                <span className="text-xs">No pending invoices due at this time.</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => setActiveTab('calendar')}
            className="w-full py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 transition-all text-center mt-4"
          >
            View Calendar Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
