import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  DollarSign, 
  Receipt, 
  BookOpen, 
  Calendar,
  Users,
  LogOut,
  ChevronRight,
  Globe,
  Tag
} from 'lucide-react';
import { dbService } from '../services/db';

export default function Sidebar({ activeTab, setActiveTab, refreshTrigger, user = { name: 'Justine Salinas', role: 'Lead Developer' } }) {
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    try {
      const projects = dbService.getProjects();
      setProjectCount(projects.length);
    } catch (e) {
      console.error(e);
    }
  }, [refreshTrigger, activeTab]);

  const sections = [
    {
      title: "Operations & Analytics",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'finances', label: 'Finances', icon: DollarSign },
        { id: 'expenses', label: 'Expenses', icon: Receipt },
      ]
    },
    {
      title: "Workspace & Management",
      items: [
        { id: 'projects', label: 'Projects', icon: FolderGit2, badge: projectCount },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'team', label: 'Team', icon: Users },
      ]
    },
    {
      title: "Catalogue",
      items: [
        { id: 'catalogue', label: 'Services', icon: BookOpen },
        { id: 'pricing', label: 'Pricing', icon: Tag },
        { id: 'personal-projects', label: 'Personal Projects', icon: Globe },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900/80 border-r border-slate-800/60 p-5 flex flex-col h-screen shrink-0 z-30 sticky top-0 backdrop-blur-md">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3 px-2 py-3 mb-8 border-b border-slate-800/40 pb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-sm font-black text-slate-100 tracking-tight leading-none m-0">CDG</h1>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Cascade Dev Group</span>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {sections.map((section, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase px-3 mb-1.5">{section.title}</div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 group cursor-pointer ${
                      isActive 
                        ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-sm shadow-violet-500/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={`transition-transform duration-150 group-hover:scale-105 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-violet-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight size={12} className="text-violet-400/80" />}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Support & Logout */}
      <div className="border-t border-slate-800/60 pt-4 mt-auto space-y-3">
        <button 
          onClick={() => {
            if (confirm("Are you sure you want to sign out?")) {
              alert("Signing out. (State preserved in LocalStorage)");
            }
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/20 transition-all cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
        
        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-950/40 border border-slate-800/50 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs uppercase shadow-md shrink-0">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-200 truncate m-0 leading-tight">{user.name}</p>
            <span className="text-[9px] text-slate-500 font-medium truncate block leading-none mt-0.5">{user.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
