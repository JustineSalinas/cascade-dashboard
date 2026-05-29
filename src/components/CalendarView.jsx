import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Trash2, 
  Video, 
  FileText, 
  DollarSign, 
  AlertCircle,
  X
} from 'lucide-react';
import { dbService } from '../services/db';

export default function CalendarView({ activeTab, refreshTrigger, triggerRefresh }) {
  // We will display a static month (May 2026) to align with our local time (2026-05-29) and make it look clean
  // but allow moving months if wanted or keep it fixed on May 2026 with fully interactive details
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // May (0-indexed: 4)
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  // Selection details
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('meeting');

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    setEvents(dbService.getEvents());
    setProjects(dbService.getProjects());
    setInvoices(dbService.getInvoices());
  }, [refreshTrigger, activeTab]);

  // Calendar dates generation helper
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  };

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonthDaysCount = currentMonth === 0 ? getDaysInMonth(currentYear - 1, 11) : getDaysInMonth(currentYear, currentMonth - 1);

  // Create date cells array
  const cells = [];
  
  // 1. Padding from previous month
  for (let i = firstDayOffset - 1; i >= 0; i--) {
    const day = prevMonthDaysCount - i;
    const pm = currentMonth === 0 ? 11 : currentMonth - 1;
    const py = currentMonth === 0 ? currentYear - 1 : currentYear;
    cells.push({
      day,
      month: pm,
      year: py,
      isCurrentMonth: false,
      dateString: `${py}-${String(pm + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }

  // 2. Current Month days
  for (let d = 1; d <= daysCount; d++) {
    cells.push({
      day: d,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
      dateString: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }

  // 3. Padding for next month
  const totalCellsNeeded = 42; // 6 rows of 7 days
  const remaining = totalCellsNeeded - cells.length;
  for (let n = 1; n <= remaining; n++) {
    const nm = currentMonth === 11 ? 0 : currentMonth + 1;
    const ny = currentMonth === 11 ? currentYear + 1 : currentYear;
    cells.push({
      day: n,
      month: nm,
      year: ny,
      isCurrentMonth: false,
      dateString: `${ny}-${String(nm + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`
    });
  }

  // Next / Prev Month click
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Compile all events on a specific day (projects due, invoices due, custom events)
  const getDayAgenda = (dateStr) => {
    const dayAgenda = [];
    
    // Project deadlines
    projects.forEach(p => {
      if (p.dueDate === dateStr) {
        dayAgenda.push({
          id: `agenda-proj-${p.id}`,
          sourceType: 'project',
          type: 'milestone',
          title: `Project Due: ${p.name}`,
          description: `Sprint release for client ${p.client}. Led by ${p.manager}.`,
          value: p.status
        });
      }
    });

    // Invoice targets
    invoices.forEach(inv => {
      if (inv.dueDate === dateStr && inv.status !== 'paid') {
        dayAgenda.push({
          id: `agenda-inv-${inv.id}`,
          sourceType: 'invoice',
          type: 'finance',
          title: `Invoice Due: ${inv.invoiceNumber}`,
          description: `Client: ${inv.client}. Payment of $${inv.amount.toLocaleString()} is due.`,
          value: `$${inv.amount.toLocaleString()}`
        });
      }
    });

    // Custom calendar events
    events.forEach(evt => {
      if (evt.date === dateStr) {
        dayAgenda.push({
          id: evt.id,
          sourceType: 'event',
          type: evt.type,
          title: evt.title,
          description: evt.description
        });
      }
    });

    return dayAgenda;
  };

  const handleCellClick = (cell) => {
    const agenda = getDayAgenda(cell.dateString);
    setSelectedDateStr(cell.dateString);
    setSelectedDayEvents(agenda);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!formTitle || !formDesc) {
      alert("Please fill in the event title and description.");
      return;
    }

    const eventData = {
      title: formTitle,
      description: formDesc,
      type: formType,
      date: selectedDateStr
    };

    dbService.saveEvent(eventData);
    triggerRefresh();

    // Re-trigger current selection review
    const updatedAgenda = getDayAgenda(selectedDateStr);
    setSelectedDayEvents(updatedAgenda);

    // Reset Form
    setFormTitle('');
    setFormDesc('');
    setFormType('meeting');
    setShowAddModal(false);
  };

  const handleDeleteEvent = (id) => {
    if (confirm("Are you sure you want to delete this scheduled meeting?")) {
      dbService.deleteEvent(id);
      triggerRefresh();

      // Update current selected details
      const updatedAgenda = getDayAgenda(selectedDateStr);
      setSelectedDayEvents(updatedAgenda);
    }
  };

  const getEventBadgeColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'milestone': return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'payroll': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'launch': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getEventDotColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'milestone': return 'bg-violet-500';
      case 'finance': return 'bg-amber-500';
      case 'payroll': return 'bg-rose-500';
      case 'launch': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Milestone Calendar & Scheduler</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track code freeze dates, deploy operations, client invoice deadlines, and stand-ups.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Grid Calendar */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-slate-900 overflow-hidden p-4 flex flex-col justify-between min-h-[460px]">
          
          {/* Calendar header controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-900 mb-4">
            <h3 className="text-sm font-bold text-slate-200">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded border border-slate-800 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => {
                  setCurrentYear(2026);
                  setCurrentMonth(4); // Reset to May 2026
                }}
                className="px-2.5 py-1 text-[10px] hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded border border-slate-800 font-bold uppercase cursor-pointer"
              >
                Today
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded border border-slate-800 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {cells.map((cell, idx) => {
              const agenda = getDayAgenda(cell.dateString);
              const isToday = cell.dateString === '2026-05-29'; // local time representation
              const isSelected = selectedDateStr === cell.dateString;

              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(cell)}
                  className={`min-h-[60px] p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    cell.isCurrentMonth 
                      ? 'bg-slate-900/30 border-slate-800/40 text-slate-200 hover:bg-slate-850 hover:border-violet-500/30' 
                      : 'bg-slate-950/20 border-transparent text-slate-600'
                  } ${isToday ? 'bg-violet-600/10 border-violet-500/40 text-violet-400' : ''} ${
                    isSelected ? 'border-violet-500 ring-1 ring-violet-500/20 bg-slate-900/80' : ''
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-[10px] font-black ${isToday ? 'text-violet-400 bg-violet-500/15 w-4 h-4 rounded-full flex items-center justify-center' : ''}`}>
                      {cell.day}
                    </span>
                    {isToday && (
                      <span className="text-[7.5px] uppercase font-bold tracking-wider text-violet-400 leading-none">Today</span>
                    )}
                  </div>

                  {/* Dots for tasks/meetings */}
                  {agenda.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agenda.slice(0, 3).map((item, keyIdx) => (
                        <span 
                          key={keyIdx} 
                          className={`w-1.5 h-1.5 rounded-full ${getEventDotColor(item.type || item.sourceType)}`} 
                          title={item.title}
                        />
                      ))}
                      {agenda.length > 3 && (
                        <span className="text-[7.5px] text-slate-500 font-bold">+{agenda.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Selected Date Agenda sidebar */}
        <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col justify-between min-h-[460px]">
          {selectedDateStr ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Selected Date</span>
                    <h3 className="text-xs font-black text-slate-200 mt-0.5">{selectedDateStr}</h3>
                  </div>
                  
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="p-1 text-violet-400 hover:text-violet-300 hover:bg-slate-900 rounded-lg border border-slate-800 cursor-pointer"
                    title="Schedule sprint event"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {selectedDayEvents.length > 0 ? (
                    selectedDayEvents.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl relative hover:bg-slate-900/40 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getEventBadgeColor(item.type || item.sourceType)}`}>
                            {item.type || item.sourceType}
                          </span>
                          
                          {/* Only allow deleting custom events, not project deadlines/invoices */}
                          {item.sourceType === 'event' && (
                            <button
                              onClick={() => handleDeleteEvent(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer absolute right-2 top-2"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-200 leading-tight mb-1 pr-6">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed m-0">{item.description}</p>
                        
                        {item.value && (
                          <div className="mt-2 text-[9px] font-mono text-slate-400 font-semibold uppercase">Ref Value: {item.value}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-xs text-slate-500 flex flex-col items-center">
                      <Clock size={24} className="mb-2 text-slate-700" />
                      <span>No milestones scheduled for this date.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[9px] text-slate-500 border-t border-slate-900 pt-3 mt-4 leading-relaxed font-semibold">
                Blue nodes: Sprint Syncs / QA checkins.<br />
                Violet nodes: Project final deadlines.<br />
                Amber nodes: Inbound invoice targets.<br />
                Green nodes: Product releases.
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-24">
              <CalendarIcon size={36} className="mb-3 text-slate-700" />
              <span className="text-xs font-bold block mb-1">Agenda Console</span>
              <p className="text-[11px] text-slate-500 leading-relaxed px-4">
                Click on any calendar day block to audit upcoming deadlines, invoices due, or schedule a custom developer meeting.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Add Custom Calendar Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 shadow-2xl animate-fade-in-up relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-extrabold text-slate-100 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-violet-400" />
              <span>Schedule Company Event</span>
            </h3>
            
            <p className="text-[11px] text-slate-400 mb-4">Date target selected: <strong className="text-slate-200">{selectedDateStr}</strong></p>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Event Name</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Weekly Stand-up & Demo"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Agenda Description</label>
                <textarea
                  required
                  rows="2.5"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Meeting links, topics to cover..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Event Category</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="meeting">Developer Sync / Meeting</option>
                  <option value="milestone">Milestone Target</option>
                  <option value="payroll">Operations / Billing Check</option>
                  <option value="launch">Product Launch Release</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-400 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white rounded-lg transition-all"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
