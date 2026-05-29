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

      // Generate upcoming milestones from project target dates and invoice due dates
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
      setUpcomingMilestones(upcoming.slice(0, 6)); // top 6

    } catch (e) {
      console.error(e);
    }
  }, [refreshTrigger, activeTab]);

  // Determine priority color for quick wins card
  const getProjectPriorityClass = (proj) => {
    if (proj.status === 'review') return 'high';
    if (proj.status === 'active') return 'medium';
    return 'low';
  };

  // Convert status to readable text and match style
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
      // fallback mapping
      if (p.status === 'pipeline') return 'requirements';
      if (p.status === 'active') return 'build';
      if (p.status === 'review') return 'testing';
      if (p.status === 'completed') return 'production';
      return 'requirements';
    };

    return (
      <div className="kanban-board">
        {columns.map(col => {
          const colProjects = projects.filter(p => getProjectPhase(p) === col.key);
          return (
            <div className="kanban-col" key={col.key}>
              <div className="kanban-col-header">
                <span className="kanban-col-title">{col.title}</span>
                <span className="kanban-col-count">{colProjects.length}</span>
              </div>
              {colProjects.map(p => {
                // Find team members assigned to this project
                const assignedTeam = teamMembers.filter(m => 
                  m.assignedProjects && m.assignedProjects.includes(p.id)
                );

                return (
                  <div key={p.id} className="kanban-card cursor-pointer" onClick={() => {
                    setSelectedProject(p);
                    setActiveTab('projects');
                  }}>
                    <div className="kanban-card-title">{p.name}</div>
                    <div className="kanban-card-desc">{p.category || 'General Dev'}</div>
                    
                    <div className="kanban-card-footer">
                      <div className="kanban-avatars">
                        {assignedTeam.slice(0, 3).map((t, index) => (
                          <div 
                            key={t.id} 
                            className="kanban-avatar" 
                            style={{ 
                              background: index === 0 ? 'var(--accent-gold)' : index === 1 ? 'var(--accent-teal)' : 'var(--border-medium)',
                              zIndex: 10 - index 
                            }}
                            title={t.name}
                          >
                            {t.name.charAt(0)}
                          </div>
                        ))}
                        {assignedTeam.length === 0 && (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </div>
                      <div className="kanban-date">{p.dueDate}</div>
                    </div>
                    
                    <div className="kanban-progress-mini">
                      <div 
                        className="kanban-progress-mini-fill" 
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
    <div className="space-y-6">
      {/* 5-Column KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card animate-in delay-1">
          <div className="kpi-label">
            <span className="kpi-dot" style={{ background: 'var(--accent-gold)' }} />
            Total Revenue
          </div>
          <div className="kpi-value">{formatAmount(stats.totalRevenue)}</div>
          <div className="kpi-sub">
            <span className="trend-up">↑ {invoices.length} billings logged</span>
          </div>
        </div>

        <div className="kpi-card animate-in delay-2">
          <div className="kpi-label">
            <span className="kpi-dot" style={{ background: 'var(--accent-teal)' }} />
            Cash Collected
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-teal)' }}>{formatAmount(stats.cashCollected)}</div>
          <div className="kpi-sub">
            {stats.totalRevenue > 0 ? (
              <span>{Math.round((stats.cashCollected / stats.totalRevenue) * 100)}% collection rate</span>
            ) : (
              <span>0% collection rate</span>
            )}
          </div>
        </div>

        <div className="kpi-card animate-in delay-3">
          <div className="kpi-label">
            <span className="kpi-dot" style={{ background: 'var(--status-pending)' }} />
            Pending Inflow
          </div>
          <div className="kpi-value" style={{ color: 'var(--status-pending)' }}>{formatAmount(stats.pending)}</div>
          <div className="kpi-sub">
            <span>{invoices.filter(i => i.status === 'pending').length} invoices outstanding</span>
          </div>
        </div>

        <div className="kpi-card animate-in delay-4">
          <div className="kpi-label">
            <span className="kpi-dot" style={{ background: 'var(--priority-high)' }} />
            Total Costs
          </div>
          <div className="kpi-value" style={{ color: 'var(--priority-high)' }}>{formatAmount(stats.totalCosts)}</div>
          <div className="kpi-sub">
            <span>Logged expenditures</span>
          </div>
        </div>

        <div className="kpi-card animate-in delay-5">
          <div className="kpi-label">
            <span className="kpi-dot" style={{ background: 'var(--status-completed)' }} />
            Net Cash Flow
          </div>
          <div className="kpi-value" style={{ color: stats.netCashFlow >= 0 ? 'var(--status-completed)' : 'var(--priority-high)' }}>
            {formatAmount(stats.netCashFlow)}
          </div>
          <div className="kpi-sub">
            {stats.netCashFlow >= 0 ? (
              <span className="trend-up">▲ Healthy Margin</span>
            ) : (
              <span className="trend-down">▼ Net Deficit</span>
            )}
          </div>
        </div>
      </div>

      {isDbEmpty ? (
        /* Empty onboarding dashboard structure */
        <div className="glass-panel p-8 rounded-2xl border border-slate-900 max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-6 animate-in delay-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/10">
            <svg className="w-8 h-8 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-base font-extrabold text-slate-100">CDG Dashboard Empty</h3>
            <p className="text-xs text-slate-400 max-w-lg mt-2 leading-relaxed">
              Your console is connected and ready. Initialize your workspace by configuring projects, team members, invoices, and expenses.
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
        /* Dynamic dashboard contents */
        <>
          {/* Row 1: Quick Wins + Vertical Revenue Stacked Bar Chart */}
          <div className="section-row two-col">
            {/* Quick Wins (Active Workspaces) */}
            <div className="card animate-in delay-6">
              <div className="card-header">
                <div className="card-title">Opportunities & Quick Wins</div>
                <div className="card-actions">
                  <button 
                    onClick={() => setActiveQuickWinsFilter('active')}
                    className={`card-action-btn ${activeQuickWinsFilter === 'active' ? 'active' : ''}`}
                  >
                    Active
                  </button>
                  <button 
                    onClick={() => setActiveQuickWinsFilter('all')}
                    className={`card-action-btn ${activeQuickWinsFilter === 'all' ? 'active' : ''}`}
                  >
                    All
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="qw-list">
                  {getQuickWinsProjects().slice(0, 4).map((p, idx) => {
                    const completedTasks = p.tasks ? p.tasks.filter(t => t.completed).length : 0;
                    const totalTasks = p.tasks ? p.tasks.length : 0;
                    const compPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
                    const pClass = getProjectPriorityClass(p);
                    
                    return (
                      <div 
                        key={p.id} 
                        className={`qw-card ${pClass}`}
                        onClick={() => {
                          setSelectedProject(p);
                          setActiveTab('projects');
                        }}
                      >
                        <div className="qw-top">
                          <div className="qw-name">{p.name}</div>
                          <span className={`status-badge ${p.status}`}>
                            {getProjectStatusLabel(p.status)}
                          </span>
                        </div>
                        <div className="qw-progress">
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${compPct}%` }} />
                          </div>
                        </div>
                        <div className="qw-meta">
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

            {/* Stacked Vertical Bar Chart: Revenue by Project */}
            <div className="card animate-in delay-6">
              <div className="card-header">
                <div className="card-title">Revenue by Project</div>
                <div className="card-actions">
                  <button className="card-action-btn active">Bar Chart</button>
                </div>
              </div>
              <div className="card-body">
                <div className="revenue-bars">
                  {projects.slice(0, 6).map(p => {
                    // Calculate paid and pending for this project
                    const projectInvoices = invoices.filter(inv => inv.projectAssociation === p.id);
                    let paidVal = 0;
                    let pendingVal = 0;
                    projectInvoices.forEach(inv => {
                      if (inv.status === 'paid') paidVal += inv.amount;
                      else pendingVal += inv.amount;
                    });

                    const totalValue = paidVal + pendingVal;
                    // Find max value in projects to scale heights
                    const maxVal = Math.max(...projects.map(pr => {
                      const pins = invoices.filter(inv => inv.projectAssociation === pr.id);
                      return pins.reduce((sum, inv) => sum + inv.amount, 0);
                    }), 1000);

                    const paidHeight = (paidVal / maxVal) * 160;
                    const pendingHeight = (pendingVal / maxVal) * 160;

                    return (
                      <div className="rev-bar-group" key={p.id} title={`${p.name}: Total ${formatAmount(totalValue)}`}>
                        <div className="rev-bar-value">{formatAmount(totalValue)}</div>
                        <div className="rev-bar-stack">
                          {pendingHeight > 0 && (
                            <div className="rev-bar pending" style={{ height: `${pendingHeight}px` }} />
                          )}
                          {paidHeight > 0 && (
                            <div className="rev-bar paid" style={{ height: `${paidHeight}px` }} />
                          )}
                        </div>
                        <div className="rev-bar-label">{p.name.split(' ')[0]}</div>
                      </div>
                    );
                  })}
                  {projects.length === 0 && (
                    <div className="text-center py-20 text-xs text-slate-500 w-full">
                      No project revenues tracked.
                    </div>
                  )}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: 'var(--accent-teal)' }} />
                    Paid Billings
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: 'var(--accent-gold)', opacity: 0.5 }} />
                    Pending Billings
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Project Pipeline (Kanban Board) */}
          <div className="section-row kanban-row">
            <div className="card animate-in delay-7">
              <div className="card-header">
                <div className="card-title">Project Pipeline</div>
                <div className="card-actions">
                  <button className="card-action-btn active">Board View</button>
                </div>
              </div>
              <div className="card-body">
                {renderKanbanBoard()}
              </div>
            </div>
          </div>

          {/* Row 3: Payment Status table + Upcoming Deadlines list */}
          <div className="section-row two-col">
            {/* Payment Status table */}
            <div className="card animate-in delay-8">
              <div className="card-header">
                <div className="card-title">Payment Status</div>
              </div>
              <div className="card-body">
                <div className="overflow-x-auto">
                  <table className="pay-table">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Total Billing</th>
                        <th>Paid</th>
                        <th>Pending</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.slice(0, 6).map(p => {
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
                            <td className="pay-project">{p.name}</td>
                            <td className="pay-amount">{formatAmount(totalValue)}</td>
                            <td className="pay-amount" style={{ color: 'var(--accent-teal)' }}>{formatAmount(paidVal)}</td>
                            <td className="pay-amount" style={{ color: pendingVal > 0 ? 'var(--status-pending)' : 'var(--text-muted)' }}>{formatAmount(pendingVal)}</td>
                            <td>
                              <span className={`pay-status ${isPaid ? 'paid' : totalValue === 0 ? 'pending' : 'pending'}`}>
                                <span className="pay-status-dot" />
                                {isPaid ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {projects.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-6 text-xs text-slate-500">
                            No ledger entries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines list */}
            <div className="card animate-in delay-8">
              <div className="card-header">
                <div className="card-title">Upcoming Milestones</div>
              </div>
              <div className="card-body">
                <div className="upcoming-list">
                  {upcomingMilestones.map((item, idx) => (
                    <div className="upcoming-item" key={idx}>
                      <div className="upcoming-time">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div 
                        className="upcoming-dot" 
                        style={{ 
                          background: item.priority === 'high' ? 'var(--priority-high)' : 'var(--accent-gold)' 
                        }} 
                      />
                      <div className="upcoming-text">
                        <strong>{item.projectName}</strong> — {item.text}
                      </div>
                    </div>
                  ))}
                  {upcomingMilestones.length === 0 && (
                    <div className="text-center py-12 text-xs text-slate-500">
                      All milestones complete. No upcoming deadlines.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
