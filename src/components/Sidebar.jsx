import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  DollarSign, 
  Receipt, 
  BookOpen, 
  Calendar,
  Users,
  LogOut
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
      title: "Operations",
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
      title: "Registry & Assets",
      items: [
        { id: 'catalogue', label: 'Catalogue', icon: BookOpen },
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-mark">C</div>
        <div className="logo-text">CD<span>G</span></div>
      </div>
      
      <nav className="sidebar-nav">
        {sections.map((section, secIdx) => (
          <div key={secIdx}>
            <div className="nav-section-label">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-icon">
                    <Icon size={18} />
                  </div>
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card" onClick={() => setActiveTab('team')}>
          <div className="user-avatar">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
