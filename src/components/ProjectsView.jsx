import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Square, 
  ArrowUpRight, 
  FileText, 
  Users, 
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import { dbService } from '../services/db';

export default function ProjectsView({ activeTab, setSelectedProject, refreshTrigger, triggerRefresh }) {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProjDetails, setSelectedProjDetails] = useState(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formManager, setFormManager] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formStatus, setFormStatus] = useState('pipeline');
  const [formDueDate, setFormDueDate] = useState('');
  const [formTasks, setFormTasks] = useState(['']); // initial one empty task
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setProjects(dbService.getProjects());
  }, [refreshTrigger]);

  const handleAddTaskInput = () => {
    setFormTasks([...formTasks, '']);
  };

  const handleRemoveTaskInput = (index) => {
    const list = [...formTasks];
    list.splice(index, 1);
    setFormTasks(list);
  };

  const handleTaskChange = (index, value) => {
    const list = [...formTasks];
    list[index] = value;
    setFormTasks(list);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!formName || !formClient || !formManager) {
      alert("Please fill in name, client and manager fields.");
      return;
    }

    // Process tasks
    const formattedTasks = formTasks
      .filter(t => t.trim() !== '')
      .map((t, idx) => ({
        id: `t-${Date.now()}-${idx}`,
        text: t,
        completed: false
      }));

    // Calculate initial progress
    const progress = formattedTasks.length > 0 ? 0 : 100;

    const projectData = {
      name: formName,
      client: formClient,
      manager: formManager,
      category: formCategory || 'General Development',
      status: formStatus,
      dueDate: formDueDate || new Date().toISOString().split('T')[0],
      docsCount: editingId ? (projects.find(p => p.id === editingId)?.docsCount || 4) : 4,
      tasks: editingId ? (projects.find(p => p.id === editingId)?.tasks || formattedTasks) : formattedTasks,
    };

    if (editingId) {
      projectData.id = editingId;
      // recalculate progress based on existing tasks
      const currentTasks = projects.find(p => p.id === editingId)?.tasks || [];
      const completed = currentTasks.filter(t => t.completed).length;
      projectData.progress = currentTasks.length > 0 ? Math.round((completed / currentTasks.length) * 100) : 100;
    } else {
      projectData.progress = progress;
    }

    dbService.saveProject(projectData);
    triggerRefresh();
    
    // Reset form
    setFormName('');
    setFormClient('');
    setFormManager('');
    setFormCategory('');
    setFormStatus('pipeline');
    setFormDueDate('');
    setFormTasks(['']);
    setEditingId(null);
    setShowAddModal(false);
  };

  const handleEditClick = (project) => {
    setEditingId(project.id);
    setFormName(project.name);
    setFormClient(project.client);
    setFormManager(project.manager);
    setFormCategory(project.category);
    setFormStatus(project.status);
    setFormDueDate(project.dueDate);
    setFormTasks(project.tasks.map(t => t.text));
    setShowAddModal(true);
  };

  const handleDeleteClick = (id) => {
    if (confirm("Are you sure you want to delete this workspace and all associated tasks?")) {
      dbService.deleteProject(id);
      triggerRefresh();
      if (selectedProjDetails?.id === id) {
        setSelectedProjDetails(null);
      }
    }
  };

  const handleToggleTask = (projectId, taskId) => {
    const list = dbService.getProjects();
    const projIdx = list.findIndex(p => p.id === projectId);
    if (projIdx === -1) return;

    const project = list[projIdx];
    const taskIdx = project.tasks.findIndex(t => t.id === taskId);
    if (taskIdx === -1) return;

    project.tasks[taskIdx].completed = !project.tasks[taskIdx].completed;

    // Recalculate progress %
    const total = project.tasks.length;
    const completed = project.tasks.filter(t => t.completed).length;
    project.progress = total > 0 ? Math.round((completed / total) * 100) : 100;

    dbService.saveProject(project);
    triggerRefresh();

    // If detail side panel is open, update details state
    if (selectedProjDetails && selectedProjDetails.id === projectId) {
      setSelectedProjDetails({ ...project });
    }
  };

  // Abstract SVG background generators based on project indices
  const getThumbnailGraphic = (index, name) => {
    const gradients = [
      'from-indigo-600/30 to-violet-950/40 border-violet-500/20',
      'from-emerald-600/30 to-teal-950/40 border-emerald-500/20',
      'from-rose-600/30 to-slate-950/40 border-rose-500/20',
      'from-amber-600/30 to-yellow-950/40 border-amber-500/20'
    ];
    const gradIndex = index % gradients.length;
    
    return (
      <div className={`w-full h-28 bg-gradient-to-tr ${gradients[gradIndex]} border-b flex items-center justify-center relative overflow-hidden`}>
        {/* Aesthetic design grid patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
        
        {/* Glowing floating blobs */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Styled abstract floating vector */}
        <svg className="w-16 h-16 text-slate-100/10" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" strokeDasharray="5,3" />
          <path d="M 25,50 L 50,25 L 75,50 L 50,75 Z" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="6" fill="currentColor" fillOpacity="0.2" />
        </svg>

        <span className="absolute top-2 right-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/60 px-2 py-0.5 rounded border border-slate-900">
          0{index + 1}
        </span>
      </div>
    );
  };

  // Filter project arrays
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Project Workspaces</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage development targets, task checklists, and documentation records.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormName('');
            setFormClient('');
            setFormManager('');
            setFormCategory('');
            setFormStatus('pipeline');
            setFormDueDate('');
            setFormTasks(['']);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-xs font-bold rounded-lg text-white shadow-md shadow-violet-500/20 transition-all cursor-pointer"
        >
          <FolderPlus size={14} />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950/20 border border-slate-900 p-3 rounded-xl">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Status Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['all', 'active', 'review', 'completed', 'pipeline'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid Area */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((p, idx) => (
              <div 
                key={p.id} 
                className="glass-card rounded-xl border border-slate-900 overflow-hidden flex flex-col justify-between"
              >
                {/* Visual Header */}
                {getThumbnailGraphic(idx, p.name)}

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Due: {p.dueDate}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 leading-tight mb-2 truncate">
                      {p.name}
                    </h3>

                    {/* Progress details */}
                    <div className="flex items-center justify-between bg-slate-950/20 border border-slate-900/60 p-2.5 rounded-lg mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Workspace Progress</span>
                        <span className="text-xs font-semibold text-slate-300 mt-0.5 block">
                          {p.tasks.filter(t => t.completed).length} / {p.tasks.length} tasks completed
                        </span>
                      </div>
                      
                      {/* SVG Progress Circle */}
                      <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="18" cy="18" r="14" stroke="#1d1b30" strokeWidth="2.5" fill="transparent" />
                          <circle 
                            cx="18" 
                            cy="18" 
                            r="14" 
                            stroke="#10b981" 
                            strokeWidth="2.5" 
                            fill="transparent" 
                            strokeDasharray={2 * Math.PI * 14}
                            strokeDashoffset={2 * Math.PI * 14 * (1 - p.progress / 100)}
                            className="transition-all duration-300"
                          />
                        </svg>
                        <span className="absolute text-[8.5px] font-black text-slate-200">
                          {p.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Manager & Client Grid */}
                    <div className="grid grid-cols-2 gap-3 text-[10px] border-b border-slate-900 pb-3 mb-3">
                      <div>
                        <span className="text-slate-500 block uppercase tracking-wider text-[8px] font-bold">Project Manager</span>
                        <span className="text-slate-300 font-semibold block truncate mt-0.5">{p.manager}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase tracking-wider text-[8px] font-bold">Account Owner</span>
                        <span className="text-slate-300 font-semibold block truncate mt-0.5">{p.client}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProjDetails(p)}
                      className="flex-1 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-850 rounded-lg text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle size={12} />
                      <span>Open Workspace</span>
                    </button>
                    <button
                      onClick={() => handleEditClick(p)}
                      className="p-1.5 text-slate-500 hover:text-violet-400 hover:bg-slate-900 rounded-lg border border-slate-900 transition-all cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(p.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg border border-slate-900 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-24 glass-panel rounded-xl border border-slate-900 flex flex-col items-center justify-center text-slate-500">
              <AlertCircle size={32} className="mb-2 text-slate-600 animate-pulse" />
              <span className="text-xs">No active workspaces match your current filters.</span>
            </div>
          )}
        </div>

        {/* Task Details Side Panel */}
        <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col justify-between min-h-[400px]">
          {selectedProjDetails ? (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">{selectedProjDetails.category}</span>
                    <h3 className="text-base font-extrabold text-slate-100 mt-0.5">{selectedProjDetails.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedProjDetails(null)}
                    className="p-1 hover:bg-slate-900 text-slate-500 hover:text-slate-300 rounded-lg"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="mt-4 p-3 bg-slate-950/50 rounded-xl border border-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText size={14} className="text-slate-500" />
                    <span className="text-slate-400">Documentation Hub:</span>
                  </div>
                  <span className="text-xs font-bold text-slate-200">{selectedProjDetails.docsCount} assets listed</span>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                    <span className="text-xs font-bold text-slate-300">Sprint Tasks</span>
                    <span className="text-[10px] text-slate-500 font-bold">Check items to complete</span>
                  </div>
                  
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {selectedProjDetails.tasks.length > 0 ? (
                      selectedProjDetails.tasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => handleToggleTask(selectedProjDetails.id, task.id)}
                          className="w-full text-left p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900/80 flex items-start gap-2.5 text-xs text-slate-300 transition-all"
                        >
                          <span className="mt-0.5 shrink-0 text-violet-400">
                            {task.completed ? <CheckSquare size={13} /> : <Square size={13} />}
                          </span>
                          <span className={task.completed ? 'line-through text-slate-600' : ''}>
                            {task.text}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-xs text-slate-500">No tasks defined for this workspace. Click Edit to add sprint tasks.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-4 mt-6">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Workspace Lead:</span>
                  <span className="font-semibold text-slate-200">{selectedProjDetails.manager}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Client Owner:</span>
                  <span className="font-semibold text-slate-200">{selectedProjDetails.client}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-20">
              <Users size={36} className="mb-3 text-slate-700" />
              <span className="text-xs font-bold block mb-1">Workspace Details Panel</span>
              <p className="text-[11px] text-slate-500 leading-relaxed px-4">
                Select "Open Workspace" on any project card to view document libraries, active task items, and toggle completeness.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Workspace Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl animate-fade-in-up relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-extrabold text-slate-100 mb-4">
              {editingId ? "Edit Project Workspace" : "Launch New Project Workspace"}
            </h3>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Project Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Abstergo DD-2025"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Client Name</label>
                  <input
                    type="text"
                    required
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    placeholder="e.g. Barone LLC"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Project Manager</label>
                  <input
                    type="text"
                    required
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Enterprise Web"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Sprint Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="pipeline">Proposal / Pipeline</option>
                    <option value="active">Active Development</option>
                    <option value="review">Under Review / QA</option>
                    <option value="completed">Shipped / Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Target Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Tasks Builder (Only for NEW workspaces) */}
              {!editingId && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Define Tasks Checklist</label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {formTasks.map((task, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={task}
                          onChange={(e) => handleTaskChange(idx, e.target.value)}
                          placeholder={`Task #${idx + 1}`}
                          className="flex-1 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                        />
                        {formTasks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTaskInput(idx)}
                            className="p-1 hover:bg-slate-800 text-rose-400 rounded"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTaskInput}
                    className="text-[10px] text-violet-400 font-bold hover:underline mt-2 block"
                  >
                    + Add Task Item
                  </button>
                </div>
              )}

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
                  Save Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
