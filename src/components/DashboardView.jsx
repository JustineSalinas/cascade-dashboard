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
    if (proj.status === 'review') return 'border-violet-400/60'; // Toned down from rose
    if (proj.status === 'active') return 'border-violet-600/60';
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

    const getProjectPhase = (p) => {
      if (p.phase) return p.phase;
      if (p.status === 'pipeline') return 'requirements';
      if (p.status === 'active') return 'build';
      if (p.status === 'review') return 'testing';
      if (p.status === 'completed') return 'production';
      return 'requirements';
    };

    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-violet-600 hover:scrollbar-thumb-violet-500">
        {columns.map(col => {
          const colProjects = projects.filter(p => getProjectPhase(p) === col.key);
          return (
            <div className="min-w-[220px] flex-1 flex flex-col gap-2.5 bg-slate-900/20 border border-slate-800/30 p-3 rounded-xl" key={col.key}>
              <div className="flex items-center justify-between px-1 pb-1 mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{col.title}</span>
                <span className="bg-slate-900 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded-md">{colProjects.length}</span>
              </div>
              {colProjects.map(p => {
                const assignedTeam = teamMembers.filter(m => 
                  m.assignedProjects && m.assignedProjects.includes(p.id)
                );

                return (
                  <div 
                    key={p.id} 
                    className="glass-card p-3 rounded-lg border border-slate-800/50 hover:border-violet-500/40 hover:bg-slate-800/20 transition-all cursor-pointer space-y-3" 
                    onClick={() => {
                      setSelectedProject(p);
                      setActiveTab('projects');
                    }}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 truncate leading-snug">{p.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.category || 'General Dev'}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {assignedTeam.slice(0, 3).map((t, index) => (
                          <div 
                            key={t.id} 
                            className="w-5 h-5 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center font-bold text-[9px] text-slate-200 uppercase shadow"
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
                      <div className="text-[9px] font-medium text-slate-400 font-mono">{p.dueDate}</div>
                    </div>
                    
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
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

  // Chart Data Calculations
  const hasChartData = projects.some(p => {
    const pins = invoices.filter(inv => inv.projectAssociation === p.id);
    return pins.reduce((sum, inv) => sum + inv.amount, 0) > 0;
  });
  const maxVal = hasChartData ? Math.max(...projects.map(pr => {
    const pins = invoices.filter(inv => inv.projectAssociation === pr.id);
    return pins.reduce((sum, inv) => sum + inv.amount, 0);
  })) : 1000;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* HERO KPI GRID: Addresses layout hierarchy and color noise. 
        Net Cash Flow is highlighted as the primary metric, 
        and other metrics use a muted, neutral palette.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Hero Card - Net Cash Flow */}
        <div className="lg:col-span-4 glass-card p-5 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[130px] bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              <span className={`w-2 h-2 rounded-full ${stats.netCashFlow >= 0 ? 'bg-emerald-500 pulse-emerald' : 'bg-rose-500'}`} />
              <span>Net Cash Flow</span>
            </div>
          </div>
          <div className="mt-2">
            <h3 className={`text-3xl font-black tracking-tight leading-none ${stats.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatAmount(stats.netCashFlow)}
            </h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {stats.netCashFlow >= 0 ? 'Positive operating margin' : 'Net deficit warning'}
            </p>
          </div>
        </div>

        {/* Secondary KPIs */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Total Revenue */}
          <div className="glass-card p-4 rounded-xl flex flex-col justify-between min-h-[130px] cursor-default group">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors group-hover:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span>Total Revenue</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-violet-400">{formatAmount(stats.totalRevenue)}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{invoices.length} billings logged</p>
            </div>
          </div>

          {/* Cash Collected */}
          <div className="glass-card p-4 rounded-xl flex flex-col justify-between min-h-[130px] cursor-default group">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors group-hover:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Cash Collected</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-400">{formatAmount(stats.cashCollected)}</h3>
              <p className="text-[10px] text-slate-500 mt-1">
                {stats.totalRevenue > 0 ? `${Math.round((stats.cashCollected / stats.totalRevenue) * 100)}%` : '0%'} yield
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="glass-card p-4 rounded-xl flex flex-col justify-between min-h-[130px] cursor-default group">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors group-hover:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span>Pending</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-400">{formatAmount(stats.pending)}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{invoices.filter(i => i.status === 'pending').length} unpaid</p>
            </div>
          </div>

          {/* Total Costs */}
          <div className="glass-card p-4 rounded-xl flex flex-col justify-between min-h-[130px] cursor-default group">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors group-hover:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Total Costs</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-rose-400">{formatAmount(stats.totalCosts)}</h3>
              <p className="text-[10px] text-slate-500 mt-1">Operating expenses</p>
            </div>
          </div>

        </div>
      </div>

      {isDbEmpty ? (
        /* Setup Onboarding State when LocalStorage is empty */
        <div className="glass-panel p-8 rounded-2xl border border-slate-900 max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
           {/* ... [Keeping original onboarding unchanged] ... */}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Wins (Active Workspaces) */}
            <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
                <h4 className="text-sm font-bold text-slate-200">Opportunities & Quick Wins</h4>
                
                {/* Enhanced Pill style toggle */}
                <div className="flex items-center bg-slate-900/60 p-1 rounded-full border border-slate-800">
                  <button 
                    onClick={() => setActiveQuickWinsFilter('active')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${activeQuickWinsFilter === 'active' ? 'bg-violet-500/20 text-violet-300' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Active
                  </button>
                  <button 
                    onClick={() => setActiveQuickWinsFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${activeQuickWinsFilter === 'all' ? 'bg-violet-500/20 text-violet-300' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    All
                  </button>
                </div>
                
              </div>
              
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[200px] scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-violet-600">
                {getQuickWinsProjects().slice(0, 4).map((p) => {
                  const totalTasks = p.tasks ? p.tasks.length : 0;
                  const completedTasks = p.tasks ? p.tasks.filter(t => t.completed).length : 0;
                  const compPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
                  const borderCol = getProjectPriorityColor(p);
                  
                  return (
                    <div 
                      key={p.id} 
                      className={`p-3.5 bg-slate-900/30 border-l-2 ${borderCol} hover:bg-slate-900/60 rounded-r-lg border-y border-r border-slate-800/40 hover:border-violet-500/30 transition-all cursor-pointer`}
                      onClick={() => {
                        setSelectedProject(p);
                        setActiveTab('projects');
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-bold text-slate-200">{p.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{p.category || 'General Dev'}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${p.status === 'review' ? 'bg-slate-800 text-slate-300' : p.status === 'active' ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-800 text-slate-400'}`}>
                          {getProjectStatusLabel(p.status)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${compPct}%` }} />
                      </div>
                      {/* Hide tasks count if 0/0 to look cleaner */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>{totalTasks > 0 ? `${completedTasks}/${totalTasks} tasks` : 'No tracked tasks'}</span>
                        <span>Due: {p.dueDate || 'Unscheduled'}</span>
                      </div>
                    </div>
                  );
                })}
                
                {getQuickWinsProjects().length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-lg">
                    <span className="text-2xl mb-2 block">📭</span>
                    <span className="text-xs font-medium text-slate-400">No active workspaces.</span>
                    <span className="text-[10px] text-slate-500 mt-1">Start a new project to see quick wins here.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Vertical Bar Chart */}
            <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col">
              <div className="border-b border-slate-800/60 pb-3 mb-4 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200">Revenue Yield by Project</h4>
                <div className="flex gap-4 text-[9px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-violet-500 block" />
                    <span>Paid</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-violet-900/50 border border-dashed border-violet-500/30 block" />
                    <span>Pending</span>
                  </div>
                </div>
              </div>

              {!hasChartData ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-slate-800 rounded-lg p-6 text-center">
                  <span className="text-2xl mb-2 block">📊</span>
                  <span className="text-xs font-medium text-slate-400">Not enough financial data</span>
                  <span className="text-[10px] text-slate-500 mt-1">Log invoices against projects to generate yield charts.</span>
                </div>
              ) : (
                <div className="relative flex-1 min-h-[200px] pt-4 pb-6 pl-12 pr-2 mt-2">
                  {/* Y-Axis Gridlines & Labels */}
                  <div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between pointer-events-none">
                    <div className="w-full flex items-center">
                      <span className="text-[9px] text-slate-500 font-mono w-10 text-right pr-2">{formatAmount(maxVal)}</span>
                      <div className="flex-1 border-b border-slate-800/50"></div>
                    </div>
                    <div className="w-full flex items-center">
                      <span className="text-[9px] text-slate-500 font-mono w-10 text-right pr-2">{formatAmount(maxVal / 2)}</span>
                      <div className="flex-1 border-b border-slate-800/50"></div>
                    </div>
                    <div className="w-full flex items-center">
                      <span className="text-[9px] text-slate-500 font-mono w-10 text-right pr-2">0</span>
                      <div className="flex-1 border-b border-slate-800/50"></div>
                    </div>
                  </div>

                  {/* Bars */}
                  <div className="relative h-full flex items-end justify-between gap-2 px-2 z-10">
                    {projects.slice(0, 6).map(p => {
                      const pins = invoices.filter(inv => inv.projectAssociation === p.id);
                      let paidVal = 0;
                      let pendingVal = 0;
                      pins.forEach(inv => {
                        if (inv.status === 'paid') paidVal += inv.amount;
                        else pendingVal += inv.amount;
                      });

                      const totalValue = paidVal + pendingVal;
                      const paidHeight = (paidVal / maxVal) * 100;
                      const pendingHeight = (pendingVal / maxVal) * 100;

                      if (totalValue === 0) return null;

                      return (
                        <div className="flex-1 flex flex-col items-center justify-end h-full gap-2 group cursor-pointer" key={p.id} title={`${p.name}: ${formatAmount(totalValue)}`}>
                          <div className="w-full max-w-[36px] flex flex-col gap-px rounded-t-sm overflow-hidden shrink-0 hover:opacity-80 transition-opacity">
                            {pendingHeight > 0 && (
                              <div className="bg-violet-900/40 w-full border border-dashed border-violet-500/30" style={{ height: `${pendingHeight}%` }} />
                            )}
                            {paidHeight > 0 && (
                              <div className="bg-violet-500 w-full" style={{ height: `${paidHeight}%` }} />
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium truncate w-full text-center">{p.name.split(' ')[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Project Pipeline (Kanban Board) */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900 space-y-4">
            <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800/60 pb-3">Project Pipeline Stage</h4>
            <div className="pt-2">
              {renderKanbanBoard()}
            </div>
          </div>

         {/* Row 3: Payment Status table + Upcoming deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-5 rounded-xl border border-slate-900 space-y-4">
              <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800/60 pb-3">Ledger & Payments</h4>
              <div className="overflow-x-auto scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-violet-600">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-3 py-3 font-medium">Workspace</th>
                      <th className="px-3 py-3 font-medium">Billing Value</th>
                      <th className="px-3 py-3 font-medium">Settled</th>
                      <th className="px-3 py-3 font-medium text-center">Pending</th>
                      <th className="px-3 py-3 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.slice(0, 5).map(p => {
                      const pins = invoices.filter(inv => inv.projectAssociation === p.id);
                      let paidVal = 0, pendingVal = 0;
                      pins.forEach(inv => inv.status === 'paid' ? paidVal += inv.amount : pendingVal += inv.amount);
                      const totalValue = paidVal + pendingVal;
                      const isPaid = pendingVal === 0 && totalValue > 0;
                      if (totalValue === 0) return null;

                      return (
                        <tr key={p.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="px-3 py-3 text-xs text-slate-300 font-medium border-b border-slate-800/50 truncate max-w-[120px]">{p.name}</td>
                          <td className="px-3 py-3 text-xs text-slate-400 font-mono border-b border-slate-800/50">{formatAmount(totalValue)}</td>
                          <td className="px-3 py-3 text-xs text-emerald-400 font-mono border-b border-slate-800/50">{formatAmount(paidVal)}</td>
                          <td className="px-3 py-3 text-xs text-yellow-400 font-mono border-b border-slate-800/50 text-center">{formatAmount(pendingVal)}</td>
                          <td className="px-3 py-3 border-b border-slate-800/50 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-yellow-400'}`} />
                              <span>{isPaid ? 'Paid' : 'Pending'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-900 space-y-4">
              <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800/60 pb-3">Upcoming Milestones</h4>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-violet-600">
                {upcomingMilestones.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-800/50 hover:bg-slate-900/60 transition-all cursor-pointer">
                    <div className="flex flex-col items-center justify-center bg-slate-950 rounded p-1.5 min-w-[45px] shrink-0 border border-slate-800">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-sm text-slate-300 font-black">{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric' })}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.priority === 'high' ? 'bg-rose-500' : 'bg-violet-500'}`} />
                        <span className="text-xs text-slate-200 font-bold truncate">{item.projectName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-3.5">{item.text}</div>
                    </div>
                  </div>
                ))}
                {upcomingMilestones.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center p-6 h-[150px]">
                    <span className="text-xs font-medium text-slate-400">No upcoming deadlines.</span>
                    <span className="text-[10px] text-slate-500 mt-1">You are all caught up!</span>
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