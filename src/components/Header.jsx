import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Settings, Database, Sun, Moon } from 'lucide-react';
import { dbService } from '../services/db';

export default function Header({ activeTab, setActiveTab, setSelectedProject, refreshTrigger, currency, setCurrency, theme, toggleTheme }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  // Generate notifications dynamically from DB state
  useEffect(() => {
    try {
      const projects = dbService.getProjects();
      const invoices = dbService.getInvoices();
      const list = [];

      projects.forEach(p => {
        if (p.status === 'review') {
          list.push({
            id: `notif-proj-${p.id}`,
            type: 'project',
            title: 'Review Needed',
            message: `Project "${p.name}" requires manager sign-off.`,
            meta: p.manager,
            timestamp: 'Action Required'
          });
        }
      });

      invoices.forEach(inv => {
        if (inv.status === 'pending') {
          list.push({
            id: `notif-inv-${inv.id}`,
            type: 'finance',
            title: 'Invoice Pending',
            message: `${inv.client} billing is pending.`,
            meta: inv.invoiceNumber,
            timestamp: 'Due soon'
          });
        }
      });

      setNotifications(list);
    } catch (e) {
      console.error(e);
    }
  }, [refreshTrigger, activeTab]);

  // Handle Search Queries
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const projects = dbService.getProjects();
      const query = searchQuery.toLowerCase();
      const filtered = projects.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.client.toLowerCase().includes(query) ||
        p.manager.toLowerCase().includes(query)
      );
      setSearchResults(filtered);
    } catch (e) {
      console.error(e);
    }
  }, [searchQuery, refreshTrigger]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (project) => {
    setActiveTab('projects');
    if (setSelectedProject) {
      setSelectedProject(project);
    }
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const getBreadcrumbName = () => {
    switch (activeTab) {
      case 'dashboard': return 'General Analytics';
      case 'projects': return 'Active Workspaces';
      case 'finances': return 'Client Billing & Ledger';
      case 'expenses': return 'Operating Expenditure';
      case 'catalogue': return 'Template Registry';
      case 'personal-projects': return 'Personal & Side Projects';
      case 'calendar': return 'Sprint Milestones';
      case 'team': return 'Cascade Development Team';
      default: return 'CDG Console';
    }
  };

  return (
    <header className="h-16 bg-slate-950/40 border-b border-slate-900 flex items-center justify-between px-6 shrink-0 z-20 sticky top-0 backdrop-blur-md">
      {/* Breadcrumb path */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span>Cascade Development Group</span>
        <span className="text-slate-700">/</span>
        <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">{getBreadcrumbName()}</span>
      </div>

      {/* Center live search */}
      <div ref={searchRef} className="relative w-80">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects, clients or managers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-slate-900/80 transition-all font-medium"
          />
        </div>

        {/* Live Search Results Dropdown */}
        {showSearchDropdown && searchQuery && (
          <div className="absolute top-10 left-0 right-0 glass-panel border border-slate-800 rounded-xl p-2 shadow-2xl z-50 animate-fade-in-up">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 border-b border-slate-800/50 mb-1">
              Matching Projects ({searchResults.length})
            </div>
            {searchResults.length > 0 ? (
              <div className="space-y-0.5 max-h-60 overflow-y-auto">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSearchResultClick(p)}
                    className="w-full text-left px-2 py-2 rounded-lg hover:bg-violet-600/10 hover:text-violet-300 transition-all flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block">{p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.client} • Manager: {p.manager}</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 font-semibold text-slate-400 capitalize">
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-2 py-3 text-center text-xs text-slate-500">
                No matching workspaces found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header action controls */}
      <div className="flex items-center gap-4">
        {/* Currency Conversion Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 font-bold text-[10px] select-none shadow">
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${currency === 'USD' ? 'bg-violet-600 text-white shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency('PHP')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${currency === 'PHP' ? 'bg-violet-600 text-white shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            PHP (₱)
          </button>
        </div>

        {/* Sync Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1.5 rounded-lg font-semibold">
          <Database size={11} className="animate-pulse" />
          <span>Local Sync Online</span>
        </div>

        {/* Notification Bell */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg border border-slate-800/60 relative transition-all cursor-pointer"
          >
            <Bell size={16} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full ring-2 ring-slate-950" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 glass-panel border border-slate-800 rounded-xl p-3 shadow-2xl z-50 animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-200">Alert Center</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-600/10 text-violet-400 font-semibold">
                  {notifications.length} Active alerts
                </span>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900/80 transition-all text-left">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-bold text-violet-400">{notif.title}</span>
                        <span className="text-[8px] text-slate-500 font-medium">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-tight m-0">{notif.message}</p>
                      {notif.meta && (
                        <span className="text-[9px] text-slate-500 font-semibold mt-1 block">Ref: {notif.meta}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No active developer alerts. All systems operational.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg border border-slate-800/60 transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Wipe Local Storage Database */}
        <button
          onClick={() => {
            const reset = confirm("Are you sure you want to completely WIPE the local database? This will clear all projects, invoices, expenses, team members, and events.");
            if (reset) {
              dbService.resetDatabase();
              window.location.reload();
            }
          }}
          title="Wipe Local Storage Database"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg border border-slate-800/60 transition-all cursor-pointer"
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
