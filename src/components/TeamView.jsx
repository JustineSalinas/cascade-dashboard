import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Mail, 
  Activity, 
  Briefcase,
  AlertCircle,
  FolderOpen,
  X 
} from 'lucide-react';
import { dbService } from '../services/db';

export default function TeamView({ activeTab, refreshTrigger, triggerRefresh }) {
  const [team, setTeam] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [formAssignedProjects, setFormAssignedProjects] = useState([]);

  useEffect(() => {
    setTeam(dbService.getTeam());
    setProjects(dbService.getProjects());
  }, [refreshTrigger, activeTab]);

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (!formName || !formRole || !formEmail) {
      alert("Please fill in name, role, and email fields.");
      return;
    }

    const memberData = {
      name: formName,
      role: formRole,
      email: formEmail,
      status: formStatus,
      assignedProjects: formAssignedProjects
    };

    if (editingId) {
      memberData.id = editingId;
    }

    dbService.saveTeamMember(memberData);
    triggerRefresh();

    // Reset Form
    setFormName('');
    setFormRole('');
    setFormEmail('');
    setFormStatus('active');
    setFormAssignedProjects([]);
    setEditingId(null);
    setShowAddModal(false);
  };

  const handleEditClick = (member) => {
    setEditingId(member.id);
    setFormName(member.name);
    setFormRole(member.role);
    setFormEmail(member.email);
    setFormStatus(member.status);
    setFormAssignedProjects(member.assignedProjects || []);
    setShowAddModal(true);
  };

  const handleDeleteClick = (id) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      dbService.deleteTeamMember(id);
      triggerRefresh();
    }
  };

  const handleProjectToggle = (projId) => {
    if (formAssignedProjects.includes(projId)) {
      setFormAssignedProjects(formAssignedProjects.filter(id => id !== projId));
    } else {
      setFormAssignedProjects([...formAssignedProjects, projId]);
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500 ring-emerald-500/20';
      case 'busy': return 'bg-amber-500 ring-amber-500/20';
      case 'inactive': return 'bg-slate-500 ring-slate-500/20';
      default: return 'bg-slate-500 ring-slate-500/20';
    }
  };

  const getStatusLabelColor = (status) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10';
      case 'busy': return 'text-amber-400 bg-amber-500/5 border-amber-500/10';
      case 'inactive': return 'text-slate-400 bg-slate-800/20 border-slate-700/30';
      default: return 'text-slate-400 bg-slate-800/20 border-slate-700/30';
    }
  };

  // Derive all project IDs a member is involved in:
  // 1. Manually assigned via Team modal (assignedProjects)
  // 2. Auto-detected: added as a member from the ProjectsView workspace form (by name match)
  const getMergedProjectIds = (member) => {
    const manual = new Set(member.assignedProjects || []);
    projects.forEach(proj => {
      if (proj.members && proj.members.some(
        m => m.name.trim().toLowerCase() === member.name.trim().toLowerCase()
      )) {
        manual.add(proj.id);
      }
    });
    return Array.from(manual);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Cascade Development Team</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage developer profiles, workloads, availability status, and workspace assignments.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormName('');
            setFormRole('');
            setFormEmail('');
            setFormStatus('active');
            setFormAssignedProjects([]);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-xs font-bold rounded-lg text-white shadow-md shadow-violet-500/20 transition-all cursor-pointer"
        >
          <UserPlus size={14} />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Grid of Team Cards */}
      {team.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <div 
              key={member.id} 
              className="glass-card rounded-xl border border-slate-900 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm uppercase shadow-md">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 leading-tight">{member.name}</h3>
                      <span className="text-[10px] text-slate-500 font-semibold">{member.role}</span>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${getStatusLabelColor(member.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ring-2 ${getStatusDotColor(member.status)}`} />
                    <span>{member.status}</span>
                  </span>
                </div>

                {/* Email details */}
                <div className="mt-4 flex items-center gap-2 text-slate-400 text-xs">
                  <Mail size={13} className="text-slate-500" />
                  <a href={`mailto:${member.email}`} className="hover:text-violet-400 transition-colors font-medium truncate">{member.email}</a>
                </div>

                {/* Assigned Workspaces — merged from manual assignments + workspace member lists */}
                <div className="mt-5 border-t border-slate-900 pt-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FolderOpen size={10} className="text-violet-400" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Assigned Workspaces</span>
                  </div>
                  {(() => {
                    const mergedIds = getMergedProjectIds(member);
                    const manualIds = new Set(member.assignedProjects || []);
                    return mergedIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {mergedIds.map(projId => {
                          const proj = projects.find(p => p.id === projId);
                          if (!proj) return null;
                          const isAutoDetected = !manualIds.has(projId);
                          return (
                            <span
                              key={projId}
                              title={isAutoDetected ? 'Added via workspace members list' : 'Manually assigned'}
                              className={`px-2 py-0.5 rounded border text-[10px] font-semibold flex items-center gap-1 ${
                                isAutoDetected
                                  ? 'bg-violet-500/10 border-violet-500/20 text-violet-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              {isAutoDetected && <span className="w-1 h-1 rounded-full bg-violet-400 inline-block" />}
                              {proj.name}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-600 italic">No assigned projects</span>
                    );
                  })()}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-900">
                <button
                  onClick={() => handleEditClick(member)}
                  className="flex-1 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={12} />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(member.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg border border-slate-900 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass-panel rounded-xl border border-slate-900 flex flex-col items-center justify-center text-slate-500 max-w-xl mx-auto">
          <Users size={40} className="mb-3 text-slate-700 animate-pulse" />
          <span className="text-sm font-bold block mb-1">No Members Registered</span>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm px-4 mb-6">
            Your Cascade Development Team roster is currently empty. Get started by registering your team members.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-xs font-bold rounded-lg text-white transition-all cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Add Your First Member</span>
          </button>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-[9999] p-4 pl-64 pt-20 animate-fade-in">
          <div className="glass-panel w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 p-6 shadow-2xl animate-fade-in-up relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-extrabold text-slate-100 mb-4">
              {editingId ? "Edit Team Member" : "Add Team Member"}
            </h3>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Developer Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Justine Salinas"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Role / Title</label>
                <select
                  required
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="">— Select Role —</option>
                  <optgroup label="Leadership">
                    <option value="Chief Executive Officer">Chief Executive Officer (CEO)</option>
                    <option value="Chief Technology Officer">Chief Technology Officer (CTO)</option>
                    <option value="Chief Operating Officer">Chief Operating Officer (COO)</option>
                    <option value="Project Director">Project Director</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Scrum Master">Scrum Master</option>
                  </optgroup>
                  <optgroup label="Development">
                    <option value="Lead Full-Stack Developer">Lead Full-Stack Developer</option>
                    <option value="Senior Full-Stack Developer">Senior Full-Stack Developer</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                    <option value="Lead Frontend Developer">Lead Frontend Developer</option>
                    <option value="Senior Frontend Developer">Senior Frontend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Lead Backend Developer">Lead Backend Developer</option>
                    <option value="Senior Backend Developer">Senior Backend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Mobile Developer (iOS)">Mobile Developer (iOS)</option>
                    <option value="Mobile Developer (Android)">Mobile Developer (Android)</option>
                    <option value="React Native Developer">React Native Developer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Cloud Infrastructure Engineer">Cloud Infrastructure Engineer</option>
                    <option value="Database Administrator">Database Administrator</option>
                    <option value="API Integration Specialist">API Integration Specialist</option>
                  </optgroup>
                  <optgroup label="Design">
                    <option value="Lead UI/UX Designer">Lead UI/UX Designer</option>
                    <option value="Senior UI/UX Designer">Senior UI/UX Designer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Graphic Designer">Graphic Designer</option>
                    <option value="Motion Designer">Motion Designer</option>
                    <option value="Brand Designer">Brand Designer</option>
                  </optgroup>
                  <optgroup label="Quality Assurance">
                    <option value="Lead QA Engineer">Lead QA Engineer</option>
                    <option value="Senior QA Engineer">Senior QA Engineer</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="Manual Tester">Manual Tester</option>
                    <option value="Automation Test Engineer">Automation Test Engineer</option>
                  </optgroup>
                  <optgroup label="Data & Analytics">
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Business Intelligence Analyst">Business Intelligence Analyst</option>
                    <option value="ML Engineer">ML Engineer</option>
                  </optgroup>
                  <optgroup label="Support & Operations">
                    <option value="Technical Support Engineer">Technical Support Engineer</option>
                    <option value="Systems Analyst">Systems Analyst</option>
                    <option value="Business Analyst">Business Analyst</option>
                    <option value="IT Administrator">IT Administrator</option>
                    <option value="Security Engineer">Security Engineer</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Intern / Trainee">Intern / Trainee</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="justine@cascade.dev"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Availability Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="active">Active / Available</option>
                    <option value="busy">Busy / In Sprint</option>
                    <option value="inactive">Inactive / On Leave</option>
                  </select>
                </div>
              </div>

              {/* Assign Workspaces checklist */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Assign Workspaces</label>
                <div className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-900 max-h-36 overflow-y-auto space-y-2">
                  {projects.length > 0 ? (
                    projects.map(p => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleProjectToggle(p.id)}
                        className={`w-full text-left p-1.5 rounded text-xs flex items-center justify-between border transition-all ${
                          formAssignedProjects.includes(p.id)
                            ? 'bg-violet-600/10 text-violet-400 border-violet-500/20'
                            : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-900'
                        }`}
                      >
                        <span>{p.name}</span>
                        {formAssignedProjects.includes(p.id) && <span className="text-[10px] font-bold">Assigned</span>}
                      </button>
                    ))
                  ) : (
                    <div className="text-slate-600 italic text-[11px] py-2">No active workspaces available. Create projects first.</div>
                  )}
                </div>
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
                  Save Profile
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
