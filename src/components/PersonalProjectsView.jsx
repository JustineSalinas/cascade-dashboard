import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Trash2, 
  Globe, 
  X, 
  Sparkles
} from 'lucide-react';
import { dbService } from '../services/db';

export default function PersonalProjectsView({ activeTab, refreshTrigger, triggerRefresh }) {
  const [personalProjects, setPersonalProjects] = useState([]);
  const [showPersonalModal, setShowPersonalModal] = useState(false);

  // Form fields
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pStatus, setPStatus] = useState('idea');
  const [pLink, setPLink] = useState('');
  const [pTech, setPTech] = useState('');

  useEffect(() => {
    setPersonalProjects(dbService.getPersonalProjects());
  }, [refreshTrigger, activeTab]);

  const handleSavePersonalProject = (e) => {
    e.preventDefault();
    if (!pName || !pDesc) {
      alert("Please fill in project name and description.");
      return;
    }

    const newProj = {
      name: pName,
      description: pDesc,
      status: pStatus,
      link: pLink || 'https://github.com/JustineSalinas/cascade-dashboard',
      tech: pTech
    };

    dbService.savePersonalProject(newProj);
    triggerRefresh();

    // Reset Form
    setPName('');
    setPDesc('');
    setPStatus('idea');
    setPLink('');
    setPTech('');
    setShowPersonalModal(false);
  };

  const handleDeletePersonalProject = (id) => {
    if (confirm("Are you sure you want to delete this personal project record?")) {
      dbService.deletePersonalProject(id);
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Personal & Side Projects</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Experimental products, utilities, sandbox code repositories, and hobby projects.
          </p>
        </div>
        <button
          onClick={() => {
            setPName('');
            setPDesc('');
            setPStatus('idea');
            setPLink('');
            setPTech('');
            setShowPersonalModal(true);
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-xs font-bold rounded-lg text-white shadow-md shadow-violet-500/20 transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>New Side Project</span>
        </button>
      </div>

      {/* Grid List for Personal Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personalProjects.length > 0 ? (
          personalProjects.map((project) => (
            <div 
              key={project.id}
              className="glass-card rounded-xl border border-slate-900 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {/* Status Badge */}
                  <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${
                    project.status === 'live'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : project.status === 'development'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                  }`}>
                    {project.status === 'live' ? 'Live' : project.status === 'development' ? 'In Development' : 'Idea'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {project.link && (
                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-900 border border-transparent rounded transition-all"
                      >
                        <Globe size={13} />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeletePersonalProject(project.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 border border-transparent rounded transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-1">{project.name}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{project.description}</p>
              </div>

              {/* Tech tags list */}
              {project.tech && (
                <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-slate-800/40">
                  {project.tech.split(',').map((t, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800/60 text-[9px] text-slate-400 font-semibold uppercase tracking-wider"
                    >
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-16 glass-panel rounded-xl border border-slate-900 flex flex-col items-center justify-center text-slate-500">
            <Globe size={32} className="mb-2 text-slate-600 animate-pulse" />
            <span className="text-xs">No registered personal or side projects yet. Click above to log your first sandbox project.</span>
          </div>
        )}
      </div>

      {/* Add Personal Project Modal */}
      {showPersonalModal && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 pl-64 animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl animate-fade-in-up relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPersonalModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-extrabold text-slate-100 mb-4 flex items-center gap-2">
              <Globe size={16} className="text-violet-400" />
              <span>Log New Personal Project</span>
            </h3>

            <form onSubmit={handleSavePersonalProject} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Project Name</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Markdown Sync Daemon"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Development Status</label>
                  <select
                    value={pStatus}
                    onChange={(e) => setPStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="idea">Idea Box</option>
                    <option value="development">In Development</option>
                    <option value="live">Live / Production</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    value={pTech}
                    onChange={(e) => setPTech(e.target.value)}
                    placeholder="e.g. React, Rust, Tailwind"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Project Description</label>
                <textarea
                  required
                  rows="3"
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="What does this project do? Write a short, single-sentence summary..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Repository / Live URL</label>
                <input
                  type="url"
                  value={pLink}
                  onChange={(e) => setPLink(e.target.value)}
                  placeholder="https://github.com/JustineSalinas/..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowPersonalModal(false)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-400 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white rounded-lg transition-all"
                >
                  Save Project
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
