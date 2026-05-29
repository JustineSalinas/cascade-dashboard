import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  DollarSign, 
  Receipt, 
  BookOpen, 
  Calendar,
  HelpCircle, 
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user = { name: 'Justine Salinas', role: 'Lead Developer' } }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'finances', label: 'Finances', icon: DollarSign },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'catalogue', label: 'Catalogue', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 border-r border-slate-800/60 p-5 flex flex-col h-screen shrink-0 z-30 sticky top-0">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3 px-2 py-4 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-extrabold text-slate-100 tracking-tight leading-tight m-0">CDG</h1>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Cascade Dev Group</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5">
        <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-3 mb-2.5">Developer Hub</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive 
                  ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-sm shadow-violet-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-violet-400/80" />}
            </button>
          );
        })}
      </nav>

      {/* Support & Logout */}
      <div className="border-t border-slate-800/60 pt-4 mt-auto space-y-1">
        <button 
          onClick={() => alert("Cascade Helpdesk Ticket System - Connected")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
        >
          <HelpCircle size={15} />
          <span>Help & Support</span>
        </button>
        
        <button 
          onClick={() => {
            if (confirm("Are you sure you want to sign out?")) {
              alert("Signing out. (State preserved in LocalStorage)");
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/20 transition-all"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
        
        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-3 mt-3 bg-slate-950/40 border border-slate-800/50 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs uppercase shadow-md">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-200 truncate m-0 leading-tight">{user.name}</p>
            <span className="text-[10px] text-slate-500 font-medium truncate block leading-none mt-0.5">{user.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
