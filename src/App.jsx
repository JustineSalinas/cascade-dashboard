import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import FinancesView from './components/FinancesView';
import ExpensesView from './components/ExpensesView';
import CatalogueView from './components/CatalogueView';
import CalendarView from './components/CalendarView';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  
  // A refresh trigger counter to force child components to pull latest LocalStorage state
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setSelectedProject={setSelectedProject}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'projects':
        return (
          <ProjectsView
            activeTab={activeTab}
            setSelectedProject={setSelectedProject}
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
          />
        );
      case 'finances':
        return (
          <FinancesView
            activeTab={activeTab}
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
          />
        );
      case 'expenses':
        return (
          <ExpensesView
            activeTab={activeTab}
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
          />
        );
      case 'catalogue':
        return (
          <CatalogueView
            activeTab={activeTab}
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            activeTab={activeTab}
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
          />
        );
      default:
        return (
          <div className="text-center py-20 text-slate-500">
            View under construction.
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Sidebar - Persistent left navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Reset selected project details when changing tabs
          setSelectedProject(null);
        }} 
      />

      {/* Main Container - Header & Viewport */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header - Top navigation bar */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          setSelectedProject={setSelectedProject}
          refreshTrigger={refreshTrigger}
        />

        {/* Viewport - Renders active view with proper padding */}
        <main className="flex-1 p-6 overflow-y-auto max-w-[1400px] w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;
