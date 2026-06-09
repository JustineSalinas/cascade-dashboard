import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  UserPlus,
  CheckCircle,
  X,
  AlertCircle,
  Crown,
  Shield,
  Code2,
  Palette,
  Calendar,
  Flag,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock
} from 'lucide-react';
import { dbService } from '../services/db';

// ─── Project Category Options ───────────────────────────────────────────────
const PROJECT_CATEGORIES = [
  { group: 'Web Development', options: [
    'Enterprise Web Application',
    'E-Commerce Platform',
    'Company Website / Landing Page',
    'Web Portal',
    'Progressive Web App (PWA)',
    'SaaS Product',
  ]},
  { group: 'Mobile Development', options: [
    'iOS Application',
    'Android Application',
    'React Native (Cross-Platform)',
    'Mobile E-Commerce App',
  ]},
  { group: 'Design & Branding', options: [
    'UI/UX Design System',
    'Brand Identity & Design',
    'Prototype & Wireframing',
    'Motion & Animation Design',
  ]},
  { group: 'Data & AI', options: [
    'Data Analytics Dashboard',
    'Machine Learning Integration',
    'AI Chatbot / Assistant',
    'Business Intelligence System',
  ]},
  { group: 'Infrastructure & DevOps', options: [
    'Cloud Migration',
    'CI/CD Pipeline Setup',
    'Server Infrastructure',
    'Security Audit & Hardening',
  ]},
  { group: 'Business Systems', options: [
    'CRM System',
    'ERP Integration',
    'API Development & Integration',
    'Inventory Management System',
    'HR & Payroll System',
  ]},
  { group: 'Other', options: [
    'Research & Development',
    'Maintenance & Support',
    'Consulting',
    'General Development',
  ]},
];

// ─── Member Role Options ─────────────────────────────────────────────────────
const MEMBER_ROLES = [
  { group: 'Leadership', roles: ['Project Manager', 'Scrum Master', 'Tech Lead', 'Product Owner'] },
  { group: 'Development', roles: [
    'Lead Full-Stack Developer', 'Senior Full-Stack Developer', 'Full-Stack Developer',
    'Lead Frontend Developer', 'Senior Frontend Developer', 'Frontend Developer',
    'Lead Backend Developer', 'Senior Backend Developer', 'Backend Developer',
    'Mobile Developer (iOS)', 'Mobile Developer (Android)', 'React Native Developer',
    'DevOps Engineer', 'Cloud Engineer', 'Database Administrator', 'API Specialist',
  ]},
  { group: 'Design', roles: [
    'Lead UI/UX Designer', 'Senior UI/UX Designer', 'UI/UX Designer',
    'Graphic Designer', 'Motion Designer', 'Brand Designer',
  ]},
  { group: 'Quality Assurance', roles: [
    'Lead QA Engineer', 'Senior QA Engineer', 'QA Engineer', 'Manual Tester', 'Automation Tester',
  ]},
  { group: 'Support & Analytics', roles: [
    'Business Analyst', 'Systems Analyst', 'Data Analyst', 'Technical Support', 'Consultant', 'Intern / Trainee',
  ]},
];

// Task Priority Options
const TASK_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

const priorityColors = {
  Critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  High:     'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Medium:   'bg-violet-500/20 text-violet-400 border-violet-500/30',
  Low:      'bg-slate-700/60 text-slate-400 border-slate-700',
};

const priorityDots = {
  Critical: 'bg-rose-500',
  High:     'bg-amber-500',
  Medium:   'bg-violet-500',
  Low:      'bg-slate-500',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getAvatarColor = (name) => {
  const colors = [
    'bg-violet-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-amber-500', 'bg-sky-500', 'bg-pink-500', 'bg-teal-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

// ─── Empty Task Object ────────────────────────────────────────────────────────
const emptyTask = () => ({
  title: '',
  description: '',
  assignee: '',
  startDate: '',
  dueDate: '',
  priority: 'Medium',
  completed: false,
});

export default function ProjectsView({ activeTab, setSelectedProject, refreshTrigger, triggerRefresh }) {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
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
  const [formPhase, setFormPhase] = useState('requirements');
  const [formTasks, setFormTasks] = useState([emptyTask()]);
  const [formMembers, setFormMembers] = useState([{ name: '', role: 'Frontend Developer' }]);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Member picker dropdown state
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(null);

  useEffect(() => {
    setProjects(dbService.getProjects());
    setTeamMembers(dbService.getTeam ? dbService.getTeam() : []);
  }, [refreshTrigger]);

  // ── Task handlers ─────────────────────────────────────────────────────────
  const handleAddTask = () => {
    setFormTasks([...formTasks, emptyTask()]);
    // Auto-expand the new task
    setExpandedTasks(prev => ({ ...prev, [formTasks.length]: true }));
  };

  const handleRemoveTask = (index) => {
    const list = [...formTasks];
    list.splice(index, 1);
    setFormTasks(list);
  };

  const handleTaskChange = (index, field, value) => {
    const list = [...formTasks];
    list[index] = { ...list[index], [field]: value };
    setFormTasks(list);
  };

  const toggleTaskExpand = (index) => {
    setExpandedTasks(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // ── Member handlers ───────────────────────────────────────────────────────
  const handleAddMember = () => {
    setFormMembers([...formMembers, { name: '', role: 'Frontend Developer' }]);
  };

  const handleRemoveMember = (index) => {
    const list = [...formMembers];
    list.splice(index, 1);
    setFormMembers(list);
  };

  const handleMemberChange = (index, field, value) => {
    const list = [...formMembers];
    list[index] = { ...list[index], [field]: value };
    setFormMembers(list);
  };

  const selectTeamMember = (index, member) => {
    handleMemberChange(index, 'name', member.name);
    setMemberDropdownOpen(null);
  };

  // ── Role icons for display ────────────────────────────────────────────────
  const roleIcons = {
    lead: Crown,
    manager: Shield,
    developer: Code2,
    designer: Palette,
    qa: CheckCircle,
  };

  const roleLabels = {
    lead: 'Tech Lead',
    manager: 'Manager',
    developer: 'Developer',
    designer: 'Designer',
    qa: 'QA Engineer',
  };

  // ── Save project ──────────────────────────────────────────────────────────
  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!formName || !formClient || !formManager) {
      alert('Please fill in name, client and manager fields.');
      return;
    }

    // Format tasks — attach ids
    const formattedTasks = formTasks
      .filter(t => t.title.trim() !== '')
      .map((t, idx) => ({
        id: `t-${Date.now()}-${idx}`,
        text: t.title,
        title: t.title,
        description: t.description || '',
        assignee: t.assignee || '',
        startDate: t.startDate || '',
        dueDate: t.dueDate || '',
        priority: t.priority || 'Medium',
        completed: t.completed || false,
      }));

    const progress = formattedTasks.length > 0 ? 0 : 100;
    const formattedMembers = formMembers.filter(m => m.name.trim() !== '');

    const projectData = {
      name: formName,
      client: formClient,
      manager: formManager,
      category: formCategory || 'General Development',
      status: formStatus,
      phase: formPhase,
      dueDate: formDueDate || new Date().toISOString().split('T')[0],
      docsCount: editingId ? (projects.find(p => p.id === editingId)?.docsCount || 4) : 4,
      tasks: editingId
        ? (projects.find(p => p.id === editingId)?.tasks || formattedTasks)
        : formattedTasks,
      members: editingId
        ? (formattedMembers.length > 0
            ? formattedMembers
            : (projects.find(p => p.id === editingId)?.members || []))
        : formattedMembers,
    };

    if (editingId) {
      projectData.id = editingId;
      const currentTasks = projects.find(p => p.id === editingId)?.tasks || [];
      const completed = currentTasks.filter(t => t.completed).length;
      projectData.progress = currentTasks.length > 0
        ? Math.round((completed / currentTasks.length) * 100)
        : 100;
    } else {
      projectData.progress = progress;
    }

    dbService.saveProject(projectData);
    triggerRefresh();

    // Reset form
    setFormName(''); setFormClient(''); setFormManager('');
    setFormCategory(''); setFormStatus('pipeline');
    setFormPhase('requirements'); setFormDueDate('');
    setFormTasks([emptyTask()]);
    setFormMembers([{ name: '', role: 'Frontend Developer' }]);
    setExpandedTasks({});
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
    setFormPhase(project.phase || 'requirements');
    setFormDueDate(project.dueDate);
    // Map existing tasks to rich format
    setFormTasks(
      project.tasks && project.tasks.length > 0
        ? project.tasks.map(t => ({
            title: t.title || t.text || '',
            description: t.description || '',
            assignee: t.assignee || '',
            startDate: t.startDate || '',
            dueDate: t.dueDate || '',
            priority: t.priority || 'Medium',
            completed: t.completed || false,
          }))
        : [emptyTask()]
    );
    setFormMembers(
      project.members && project.members.length > 0
        ? project.members
        : [{ name: '', role: 'Frontend Developer' }]
    );
    setExpandedTasks({});
    setShowAddModal(true);
  };

  const handleDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete this workspace and all associated tasks?')) {
      dbService.deleteProject(id);
      triggerRefresh();
      if (selectedProjDetails?.id === id) setSelectedProjDetails(null);
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
    const total = project.tasks.length;
    const completed = project.tasks.filter(t => t.completed).length;
    project.progress = total > 0 ? Math.round((completed / total) * 100) : 100;
    dbService.saveProject(project);
    triggerRefresh();
    if (selectedProjDetails && selectedProjDetails.id === projectId) {
      setSelectedProjDetails({ ...project });
    }
  };

  // Visual thumbnail
  const getThumbnailGraphic = (index) => {
    const gradients = [
      'from-indigo-600/30 to-violet-950/40 border-violet-500/20',
      'from-emerald-600/30 to-teal-950/40 border-emerald-500/20',
      'from-rose-600/30 to-slate-950/40 border-rose-500/20',
      'from-amber-600/30 to-yellow-950/40 border-amber-500/20',
    ];
    return (
      <div className={`w-full h-28 bg-gradient-to-tr ${gradients[index % 4]} border-b flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
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

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get task priority badge
  const getPriorityBadge = (priority) => {
    const cls = priorityColors[priority] || priorityColors.Medium;
    const dot = priorityDots[priority] || priorityDots.Medium;
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${cls}`}>
        <span className={`w-1 h-1 rounded-full ${dot}`} />
        {priority}
      </span>
    );
  };

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
            setFormName(''); setFormClient(''); setFormManager('');
            setFormCategory(''); setFormStatus('pipeline');
            setFormDueDate(''); setFormTasks([emptyTask()]);
            setFormMembers([{ name: '', role: 'Frontend Developer' }]);
            setExpandedTasks({});
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

      {/* Main Grid & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid Area */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((p, idx) => (
              <div key={p.id} className="glass-card rounded-xl border border-slate-900 overflow-hidden flex flex-col justify-between">
                {getThumbnailGraphic(idx)}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">{p.category}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Due: {p.dueDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 leading-tight mb-2 truncate">{p.name}</h3>

                    {/* Progress */}
                    <div className="flex items-center justify-between bg-slate-950/20 border border-slate-900/60 p-2.5 rounded-lg mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Workspace Progress</span>
                        <span className="text-xs font-semibold text-slate-300 mt-0.5 block">
                          {p.tasks.filter(t => t.completed).length} / {p.tasks.length} tasks completed
                        </span>
                      </div>
                      <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="18" cy="18" r="14" stroke="#1d1b30" strokeWidth="2.5" fill="transparent" />
                          <circle
                            cx="18" cy="18" r="14"
                            stroke="#10b981" strokeWidth="2.5" fill="transparent"
                            strokeDasharray={2 * Math.PI * 14}
                            strokeDashoffset={2 * Math.PI * 14 * (1 - p.progress / 100)}
                            className="transition-all duration-300"
                          />
                        </svg>
                        <span className="absolute text-[8.5px] font-black text-slate-200">{p.progress}%</span>
                      </div>
                    </div>

                    {/* Manager & Client */}
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

                    {/* Member list with role pills */}
                    {p.members && p.members.length > 0 && (
                      <div className="mb-3">
                        <span className="text-slate-500 block uppercase tracking-wider text-[8px] font-bold mb-1.5">Team Members</span>
                        <div className="flex flex-col gap-1">
                          {p.members.slice(0, 4).map((member, mIdx) => (
                            <div
                              key={mIdx}
                              className="flex items-center gap-1.5"
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black text-white shrink-0 ${getAvatarColor(member.name || 'X')}`}>
                                {getInitials(member.name || '?')}
                              </div>
                              <span className="text-[10px] font-semibold text-slate-300 truncate">{member.name}</span>
                              <span className="text-[8px] text-slate-600 truncate">— {member.role}</span>
                            </div>
                          ))}
                          {p.members.length > 4 && (
                            <span className="text-[9px] text-slate-600 italic">+{p.members.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
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

                {/* Task List with details */}
                <div className="mt-6">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                    <span className="text-xs font-bold text-slate-300">Sprint Tasks</span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {selectedProjDetails.tasks.filter(t => t.completed).length}/{selectedProjDetails.tasks.length} done
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {selectedProjDetails.tasks.length > 0 ? (
                      selectedProjDetails.tasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-2.5 rounded-lg border transition-all ${task.completed ? 'bg-slate-900/20 border-slate-900/40' : 'bg-slate-900/40 border-slate-900/80'}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => handleToggleTask(selectedProjDetails.id, task.id)}
                              className="mt-0.5 shrink-0 text-violet-400 cursor-pointer"
                            >
                              {task.completed ? <CheckSquare size={13} /> : <Square size={13} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs font-semibold block ${task.completed ? 'line-through text-slate-600' : 'text-slate-200'}`}>
                                {task.title || task.text}
                              </span>
                              {task.description && (
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{task.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                {task.priority && getPriorityBadge(task.priority)}
                                {task.assignee && (
                                  <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                                    <Users size={9} /> {task.assignee}
                                  </span>
                                )}
                                {task.dueDate && (
                                  <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                                    <Calendar size={9} /> {task.dueDate}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-xs text-slate-500">No tasks defined. Click Edit to add tasks.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-4 mt-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Workspace Lead:</span>
                  <span className="font-semibold text-slate-200">{selectedProjDetails.manager}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Client Owner:</span>
                  <span className="font-semibold text-slate-200">{selectedProjDetails.client}</span>
                </div>

                {/* Members Roster */}
                {selectedProjDetails.members && selectedProjDetails.members.length > 0 && (
                  <div className="pt-3 border-t border-slate-900">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Users size={11} className="text-violet-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team Roster</span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedProjDetails.members.map((member, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-2.5 p-1.5 rounded-lg bg-slate-900/40 border border-slate-900/60">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 ${getAvatarColor(member.name || 'X')}`}>
                            {getInitials(member.name || '?')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-slate-200 block truncate">{member.name}</span>
                            <span className="text-[9px] text-slate-500">{member.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 animate-fade-in overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-800 p-6 shadow-2xl animate-fade-in-up relative mb-10">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-extrabold text-slate-100 mb-1">
              {editingId ? 'Edit Project Workspace' : 'Launch New Project Workspace'}
            </h3>
            <p className="text-[10px] text-slate-500 mb-5">Fill in all project details, assign team members, and define task timelines.</p>

            <form onSubmit={handleSaveProject} className="space-y-5">

              {/* ── Section 1: Basic Info ── */}
              <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 space-y-4">
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Project Details</span>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Project Name *</label>
                    <input
                      type="text" required value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Abstergo DD-2025"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Client Name *</label>
                    <input
                      type="text" required value={formClient}
                      onChange={(e) => setFormClient(e.target.value)}
                      placeholder="e.g. Barone LLC"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Project Manager *</label>
                    <input
                      type="text" required value={formManager}
                      onChange={(e) => setFormManager(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    >
                      <option value="">— Select Category —</option>
                      {PROJECT_CATEGORIES.map(group => (
                        <optgroup key={group.group} label={group.group}>
                          {group.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Dev Cycle Phase</label>
                    <select
                      value={formPhase}
                      onChange={(e) => setFormPhase(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    >
                      <option value="requirements">Requirements</option>
                      <option value="solutioning">Solutioning</option>
                      <option value="build">Build</option>
                      <option value="testing">Testing</option>
                      <option value="production">Production</option>
                      <option value="stabilization">Stabilization</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Target Due Date</label>
                    <input
                      type="date" value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 2: Team Members ── */}
              <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <UserPlus size={12} className="text-violet-400" />
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Team Members</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="text-[10px] text-violet-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus size={10} /> Add Member
                  </button>
                </div>

                <div className="space-y-2">
                  {formMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {/* Member selector — flat visible list rendered as select for compactness */}
                      <div className="relative flex-1">
                        <select
                          value={member.name}
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500 appearance-none cursor-pointer"
                        >
                          <option value="">— Select team member —</option>
                          {teamMembers.map(tm => (
                            <option key={tm.id} value={tm.name}>
                              {tm.name} ({tm.role})
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>

                      {/* Role selector */}
                      <select
                        value={member.role}
                        onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500 min-w-[140px]"
                      >
                        {MEMBER_ROLES.map(grp => (
                          <optgroup key={grp.group} label={grp.group}>
                            {grp.roles.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>

                      {formMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          className="p-1 hover:bg-slate-800 text-rose-400 rounded shrink-0 cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {teamMembers.length === 0 && (
                  <p className="text-[10px] text-amber-400/70 italic">
                    💡 Go to the Team tab first to add team members so you can select them here.
                  </p>
                )}
              </div>

              {/* ── Section 3: Task Assignments ── */}
              <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList size={12} className="text-violet-400" />
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Task Assignments & Timeline</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="text-[10px] text-violet-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    + Add Task
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {formTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden"
                    >
                      {/* Task header bar */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 border-b border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-500 shrink-0">#{idx + 1}</span>
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                          placeholder={`Task title…`}
                          className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-semibold"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleTaskExpand(idx)}
                            className="p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
                            title={expandedTasks[idx] ? 'Collapse' : 'Expand'}
                          >
                            {expandedTasks[idx] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                          {formTasks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTask(idx)}
                              className="p-1 hover:bg-slate-800 text-rose-400 rounded cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded task details */}
                      {expandedTasks[idx] && (
                        <div className="p-3 space-y-3">
                          {/* Description */}
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                            <textarea
                              value={task.description}
                              onChange={(e) => handleTaskChange(idx, 'description', e.target.value)}
                              placeholder="Describe what needs to be done for this task…"
                              rows={2}
                              className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none"
                            />
                          </div>

                          {/* Assignee + Priority */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Assign To</label>
                              <select
                                value={task.assignee}
                                onChange={(e) => handleTaskChange(idx, 'assignee', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                              >
                                <option value="">— Unassigned —</option>
                                {/* Members in the current form */}
                                {formMembers.filter(m => m.name.trim()).map((m, mIdx) => (
                                  <option key={`form-${mIdx}`} value={m.name}>{m.name}</option>
                                ))}
                                {/* Also allow any team member */}
                                {teamMembers
                                  .filter(tm => !formMembers.some(m => m.name === tm.name))
                                  .map(tm => (
                                    <option key={tm.id} value={tm.name}>{tm.name}</option>
                                  ))
                                }
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Priority</label>
                              <select
                                value={task.priority}
                                onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                              >
                                {TASK_PRIORITIES.map(p => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Start Date + Due Date */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                <Clock size={8} className="inline mr-0.5" /> Start Date
                              </label>
                              <input
                                type="date"
                                value={task.startDate}
                                onChange={(e) => handleTaskChange(idx, 'startDate', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                <Flag size={8} className="inline mr-0.5" /> Due Date
                              </label>
                              <input
                                type="date"
                                value={task.dueDate}
                                onChange={(e) => handleTaskChange(idx, 'dueDate', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                              />
                            </div>
                          </div>

                          {/* Task summary pill row */}
                          {(task.assignee || task.priority || task.startDate || task.dueDate) && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {task.priority && getPriorityBadge(task.priority)}
                              {task.assignee && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border bg-slate-800/60 text-slate-400 border-slate-700">
                                  <Users size={8} /> {task.assignee}
                                </span>
                              )}
                              {task.startDate && task.dueDate && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border bg-slate-800/60 text-slate-400 border-slate-700">
                                  <Calendar size={8} /> {task.startDate} → {task.dueDate}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Footer Buttons ── */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-400 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white rounded-lg transition-all cursor-pointer"
                >
                  {editingId ? 'Update Workspace' : 'Launch Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
