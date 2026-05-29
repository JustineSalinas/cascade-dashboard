import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';

export default function DashboardView({ activeTab, setActiveTab, setSelectedProject, refreshTrigger, formatAmount, currency }) {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    cashCollected: 0,
    pending: 0,
    totalCosts: 0,
    netCashFlow: 0
  });

  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState([]);
  const [activeQuickWinsFilter, setActiveQuickWinsFilter] = useState('active'); // 'active' or 'all'

  useEffect(() => {
    try {
      const dbProjects = dbService.getProjects();
      const dbExpenses = dbService.getExpenses();
      const dbInvoices = dbService.getInvoices();
      const dbTeam = dbService.getTeam();

      setProjects(dbProjects);
      setTeamMembers(dbTeam);
      setInvoices(dbInvoices);

      // Calculations
      let totalRevenue = 0;
      let cashCollected = 0;
      let pending = 0;

      dbInvoices.forEach(inv => {
        totalRevenue += inv.amount;
        if (inv.status === 'paid') {
          cashCollected += inv.amount;
        } else {
          pending += inv.amount;
        }
      });

      let totalCosts = 0;
      dbExpenses.forEach(exp => {
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

      // Generate upcoming milestones
      const upcoming = [];
      
      // Project due dates
      dbProjects.forEach(p => {
        if (p.status !== 'completed' && p.dueDate) {
          upcoming.push({
            type: 'project',
            projectName: p.name,
            text: `Delivery Target`,
            date: p.dueDate,
            priority: p.status === 'active' ? 'high' : 'medium'
          });
        }
      });

      // Invoice due dates
      dbInvoices.forEach(inv => {
        if (inv.status === 'pending' && inv.dueDate) {
          upcoming.push({
            type: 'invoice',
            projectName: inv.client,
            text: `Payment Pending`,
            date: inv.dueDate,
            priority: 'high'
          });
        }
      });

      // Sort by date ascending
      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      setUpcomingMilestones(upcoming.slice(0, 5)); // top 5

    } catch (e) {
      console.error(e);
    }
  }, [refreshTrigger, activeTab]);

  // Determine priority color for quick wins card
  const getProjectPriorityColor = (proj) => {
    if (proj.status === 'review') return 'border-rose-500/60';
    if (proj.status === 'active') return 'border-violet-500/60';
    return 'border-slate-800';
  };

  // Convert status to readable text
  const getProjectStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'In Progress';
      case 'review': return 'In Review';
      case 'completed': return 'Completed';
      case 'pipeline': return 'Pipeline';
      default: return 'Active';
    }
  };

  // Filter projects for Quick Wins
  const getQuickWinsProjects = () => {
    if (activeQuickWinsFilter === 'active') {
      return projects.filter(p => p.status === 'active' || p.status === 'review');
    }
    return projects;
  };

  // Calculate percentage of tasks completed
  const getTasksCompletionPercentage = (tasks) => {
    if (!tasks || tasks.length === 0) return 100;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  // Render Kanban Columns
  const renderKanbanBoard = () => {
    const columns = [
      { title: "Requirements", key: "requirements" },
      { title: "Solutioning", key: "solutioning" },
      { title: "Build", key: "build" },
      { title: "Testing", key: "testing" },
      { title: "Production", key: "production" },
      { title: "Stabilization", key: "stabilization" },
      { title: "Closed", key: "closed" }
    ];

    // Group projects by phase. If no phase is specified, fall back based on status
    const getProjectPhase = (p) => {
      if (p.phase) return p.phase;
      if (p.status === 'pipeline') return 'requirements';
      if (p.status === 'active') return 'build';
      if (p.status === 'review') return 'testing';
      if (p.status === 'completed') return 'production';
      return 'requirements';
    };

    return (
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {columns.map(col => {
          const colProjects = projects.filter(p => getProjectPhase(p) === col.key);
          return (
            <div className="min-w-[210px] flex-1 flex flex-col gap-2 bg-slate-900/30 border border-slate-800/40 p-3 rounded-xl" key={col.key}>
              <div className="flex items-center justify-between px-1.5 pb-1.5 border-b border-slate-800/50 mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{col.title}</span>
                <span className="bg-slate-950 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full">{colProjects.length}</span>
              </div>
              {colProjects.map(p => {
                const assignedTeam = teamMembers.filter(m => 
                  m.assignedProjects && m.assignedProjects.includes(p.id)
                );

                return (
                  <div 
                    key={p.id} 
                    className="glass-card p-3 rounded-lg border border-slate-800/40 hover:border-violet-500/30 transition-all cursor-pointer space-y-2.5" 
                    onClick={() => {
                      setSelectedProject(p);
                      setActiveTab('projects');
                    }}
                  >
                    <div className="text-xs font-bold text-slate-200 truncate leading-snug">{p.name}</div>
                    <div className="text-[9px] text-slate-500 font-semibold">{p.category || 'General Dev'}</div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {assignedTeam.slice(0, 3).map((t, index) => (
                          <div 
                            key={t.id} 
                            className="w-5 h-5 rounded-full bg-violet-600 border border-slate-950 flex items-center justify-center font-bold text-[9px] text-white uppercase shadow"
                            style={{ zIndex: 10 - index }}
                            title={t.name}
                          >
                            {t.name.charAt(0)}
                          </div>
                        ))}
                        {assignedTeam.length === 0 && (
                          <span className="text-[9px] text-slate-600 italic">Unassigned</span>
                        )}
                      </div>
                      <div className="text-[9px] font-semibold text-slate-500 font-mono">{p.dueDate}</div>
                    </div>
                    
                    <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-500 rounded-full" 
                        style={{ width: `${p.progress !== undefined ? p.progress : getTasksCompletionPercentage(p.tasks)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const isDbEmpty = stats.totalRevenue === 0 && stats.totalCosts === 0 && projects.length === 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 5-Column KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28 border border-slate-800/80">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span>Total Revenue</span>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-black text-slate-100 leading-none">{formatAmount(stats.totalRevenue)}</h3>
            <p className="text-[9px] text-slate-500 mt-1.5 leading-none">↑ {invoices.length} billings logged</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28 border border-slate-800/80">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Cash Collected</span>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-black text-emerald-400 leading-none">{formatAmount(stats.cashCollected)}</h3>
            <p className="text-[9px] text-slate-500 mt-1.5 leading-none">
              {stats.totalRevenue > 0 ? `${Math.round((stats.cashCollected / stats.totalRevenue) * 100)}%` : '0%'} collection yield
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28 border border-slate-800/80">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Pending Inflow</span>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-black text-amber-400 leading-none">{formatAmount(stats.pending)}</h3>
            <p className="text-[9px] text-slate-500 mt-1.5 leading-none">{invoices.filter(i => i.status === 'pending').length} invoices unpaid</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28 border border-slate-800/80">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Total Costs</span>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-black text-rose-400 leading-none">{formatAmount(stats.totalCosts)}</h3>
            <p className="text-[9px] text-slate-500 mt-1.5 leading-none">Operating expenditures</p>
          </div>
        </div>

        {/* Card 5 */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between h-28 border border-slate-800/80">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span>Net Cash Flow</span>
          </div>
          <div className="mt-2">
            <h3 className={`text-lg font-black leading-none ${stats.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatAmount(stats.netCashFlow)}
            </h3>
            <p className="text-[9px] text-slate-500 mt-1.5 leading-none">
              {stats.netCashFlow >= 0 ? '▲ Healthy Margin' : '▼ Net Deficit'}
            </p>
          </div>
        </div>
      </div>

      {isDbEmpty ? (
        /* Setup Onboarding State when LocalStorage is empty */
        <div className="glass-panel p-8 rounded-2xl border border-slate-900 max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/10">
            <svg className="w-8 h-8 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-base font-extrabold text-slate-100">Welcome to CDG console</h3>
            <p className="text-xs text-slate-400 max-w-lg mt-2 leading-relaxed">
              Your console is connected and synchronized with local storage. Let's initialize your dashboard workspace by logging your first entries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl text-left">
            <button 
              onClick={() => setActiveTab('projects')}
              className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-violet-500/30 rounded-xl transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-1 group-hover:underline">Step 1</span>
              <span className="text-xs font-bold text-slate-200 block">Launch a Project Workspace</span>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Register client specifications, sprint due dates, and initial milestones checklist.</p>
            </button>

            <button 
              onClick={() => setActiveTab('team')}
              className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-violet-500/30 rounded-xl transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-1 group-hover:underline">Step 2</span>
              <span className="text-xs font-bold text-slate-200 block">Register Development Team</span>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Add CDG developers, coordinate Titles/Emails, and map project workload rosters.</p>
            </button>

            <button 
              onClick={() => setActiveTab('finances')}
              className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-violet-500/30 rounded-xl transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-1 group-hover:underline">Step 3</span>
              <span className="text-xs font-bold text-slate-200 block">Issue Inbound Invoices</span>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Log billings issued, adjust payment status, and track revenue collection targets.</p>
            </button>

            <button 
              onClick={() => setActiveTab('expenses')}
              className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-violet-500/30 rounded-xl transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-1 group-hover:underline">Step 4</span>
              <span className="text-xs font-bold text-slate-200 block">Log Operating Expenditures</span>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Record hosting clusters, API seat licensing, and sub-contractor costs.</p>
            </button>
          </div>
        </div>
      ) : (
        /* Dashboard layout structure built around original glass designs */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Wins (Active Workspaces) */}
            <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                  <h4 className="text-sm font-bold text-slate-200">Opportunities & Quick Wins</h4>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setActiveQuickWinsFilter('active')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border transition-all cursor-pointer ${activeQuickWinsFilter === 'active' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'text-slate-500 border-transparent hover:text-slate-350'}`}
                    >
                      Active
                    </button>
                    <button 
                      onClick={() => setActiveQuickWinsFilter('all')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border transition-all cursor-pointer ${activeQuickWinsFilter === 'all' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'text-slate-500 border-transparent hover:text-slate-355'}`}
                    >
                      All
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {getQuickWinsProjects().slice(0, 3).map((p) => {
                    const completedTasks = p.tasks ? p.tasks.filter(t => t.completed).length : 0;
                    const totalTasks = p.tasks ? p.tasks.length : 0;
                    const compPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
                    const borderCol = getProjectPriorityColor(p);
                    
                    return (
                      <div 
                        key={p.id} 
                        className={`p-3 bg-slate-950/30 border-l-2 ${borderCol} hover:bg-slate-900/30 rounded-lg hover:border-violet-500/30 transition-all cursor-pointer relative`}
                        onClick={() => {
                          setSelectedProject(p);
                          setActiveTab('projects');
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="text-xs font-bold text-slate-200">{p.name}</div>
                          <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider ${p.status === 'review' ? 'bg-rose-500/10 text-rose-400' : p.status === 'active' ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-800 text-slate-400'}`}>
                            {getProjectStatusLabel(p.status)}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-violet-500" style={{ width: `${compPct}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                          <span>{completedTasks}/{totalTasks} tasks</span>
                          <span>{p.category || 'General Dev'}</span>
                        </div>
                      </div>
                    );
                  })}
                  {getQuickWinsProjects().length === 0 && (
                    <div className="text-center py-12 text-xs text-slate-500">
                      No active workspaces listed.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Revenue vertical bar chart */}
            <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="border-b border-slate-850 pb-3 mb-4">
                  <h4 className="text-sm font-bold text-slate-200">Revenue Yield by Project</h4>
                </div>

                <div className="flex items-end justify-between gap-4 h-44 pt-4 pb-2 px-2 border-b border-slate-900">
                  {projects.slice(0, 6).map(p => {
                    const pins = invoices.filter(inv => inv.projectAssociation === p.id);
                    let paidVal = 0;
                    let pendingVal = 0;
                    pins.forEach(inv => {
                      if (inv.status === 'paid') paidVal += inv.amount;
                      else pendingVal += inv.amount;
                    });

                    const totalValue = paidVal + pendingVal;
                    const maxVal = Math.max(...projects.map(pr => {
                      const pins = invoices.filter(inv => inv.projectAssociation === pr.id);
                      return pins.reduce((sum, inv) => sum + inv.amount, 0);
                    }), 1000);

                    const paidHeight = (paidVal / maxVal) * 110;
                    const pendingHeight = (pendingVal / maxVal) * 110;

                    return (
                      <div className="flex-1 flex flex-col items-center justify-end h-full gap-2 group cursor-pointer" key={p.id} title={`${p.name}: Total ${formatAmount(totalValue)}`}>
                        <div className="w-full max-w-[28px] flex flex-col gap-0.5 rounded-t overflow-hidden shrink-0">
                          {pendingHeight > 0 && (
                            <div className="bg-violet-550 bg-violet-600/30 w-full border border-dashed border-violet-500/20" style={{ height: `${pendingHeight}px` }} />
                          )}
                          {paidHeight > 0 && (
                            <div className="bg-violet-500 w-full" style={{ height: `${paidHeight}px` }} />
                          )}
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-semibold truncate w-full text-center">{p.name.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex gap-4 text-[9px] text-slate-500 font-bold px-2">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2 rounded bg-violet-500 block" />
                  <span>Paid Inflow</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2 rounded bg-violet-600/30 border border-dashed border-violet-500/20 block" />
                  <span>Pending Inflow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Project Pipeline (Kanban Board) */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900 space-y-4">
            <h4 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-3">Project Pipeline Stage</h4>
            <div>
              {renderKanbanBoard()}
            </div>
          </div>

          {/* Row 3: Payment Status table + Upcoming deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment table */}
            <div className="glass-panel p-5 rounded-xl border border-slate-900 space-y-4">
              <h4 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-3">Ledger & Payments</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/10">
                      <th className="px-3 py-2">Workspace</th>
                      <th className="px-3 py-2">Billing Value</th>
                      <th className="px-3 py-2">Settled</th>
                      <th className="px-3 py-2">Pending</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.slice(0, 5).map(p => {
                      const pins = invoices.filter(inv => inv.projectAssociation === p.id);
                      let paidVal = 0;
                      let pendingVal = 0;
                      pins.forEach(inv => {
                        if (inv.status === 'paid') paidVal += inv.amount;
                        else pendingVal += inv.amount;
                      });

                      const totalValue = paidVal + pendingVal;
                      const isPaid = pendingVal === 0 && totalValue > 0;

                      return (
                        <tr key={p.id}>
                          <td className="px-3 py-2.5 text-xs text-slate-250 font-bold border-b border-slate-900/40 truncate max-w-[120px]">{p.name}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-400 font-mono border-b border-slate-900/40">{formatAmount(totalValue)}</td>
                          <td className="px-3 py-2.5 text-xs text-emerald-400 font-mono border-b border-slate-900/40">{formatAmount(paidVal)}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-500 font-mono border-b border-slate-900/40">{formatAmount(pendingVal)}</td>
                          <td className="px-3 py-2.5 border-b border-slate-900/40">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <span>{isPaid ? 'Paid' : 'Pending'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-xs text-slate-500">
                          No ledger workspaces registered.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming items */}
            <div className="glass-panel p-5 rounded-xl border border-slate-900 space-y-4">
              <h4 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-3">Upcoming Milestones</h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {upcomingMilestones.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/40 border border-slate-900/60 hover:bg-slate-900/20 transition-all cursor-pointer">
                    <span className="text-[10px] font-mono text-slate-550 text-slate-450 font-bold w-12 shrink-0">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.priority === 'high' ? 'bg-rose-500' : 'bg-violet-500'}`} />
                    <div className="text-xs text-slate-400 truncate flex-1">
                      <strong className="text-slate-200 font-bold">{item.projectName}</strong> — {item.text}
                    </div>
                  </div>
                ))}
                {upcomingMilestones.length === 0 && (
                  <div className="text-center py-12 text-xs text-slate-500">
                    No deadlines logged. All sprints complete.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
