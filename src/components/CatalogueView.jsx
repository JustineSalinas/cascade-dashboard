import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Search, 
  Trash2, 
  Plus, 
  Link2, 
  Code, 
  Sparkles,
  BookOpen,
  X
} from 'lucide-react';
import { dbService } from '../services/db';

export default function CatalogueView({ activeTab, refreshTrigger, triggerRefresh }) {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Clipboard copy tracker
  const [copiedId, setCopiedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('npm');
  const [formLink, setFormLink] = useState('');
  const [formCommand, setFormCommand] = useState('');

  useEffect(() => {
    setItems(dbService.getCatalogueItems());
  }, [refreshTrigger, activeTab]);

  const handleCopy = (id, command) => {
    navigator.clipboard.writeText(command)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1800);
      })
      .catch(err => {
        console.error("Failed to copy command: ", err);
      });
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formName || !formDesc || !formCommand) {
      alert("Please fill in name, description, and command/terminal line fields.");
      return;
    }

    const newItem = {
      name: formName,
      description: formDesc,
      type: formType,
      link: formLink || 'https://github.com/JustineSalinas/cascade-dashboard',
      command: formCommand
    };

    dbService.saveCatalogueItem(newItem);
    triggerRefresh();

    // Reset Form
    setFormName('');
    setFormDesc('');
    setFormType('npm');
    setFormLink('');
    setFormCommand('');
    setShowAddModal(false);
  };

  const handleDeleteItem = (id) => {
    if (confirm("Are you sure you want to delete this catalogue entry?")) {
      dbService.deleteCatalogueItem(id);
      triggerRefresh();
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'npm':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'template':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'api':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: '24px' }}>Catalogue Registry & Assets</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal shared library assets, boilerplate templates, and core API credentials directories.
          </p>
        </div>
        <button
          onClick={() => {
            setFormName('');
            setFormDesc('');
            setFormType('npm');
            setFormLink('');
            setFormCommand('');
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-xs font-bold rounded-lg text-white shadow-md shadow-violet-500/20 transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>Register Asset</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950/20 border border-slate-900 p-3 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search packages, templates, boilerplates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['all', 'npm', 'template', 'api'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                typeFilter === type
                  ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div 
              key={item.id}
              className="glass-card rounded-xl border border-slate-900 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${getBadgeStyle(item.type)}`}>
                    {item.type}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-900 border border-transparent rounded transition-all"
                    >
                      <Link2 size={13} />
                    </a>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 border border-transparent rounded transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-1">{item.name}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{item.description}</p>
              </div>

              {/* Console Trigger block */}
              <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-900 flex items-center justify-between gap-3 overflow-hidden">
                <span className="font-mono text-[10px] text-slate-300 truncate select-all">{item.command}</span>
                <button
                  onClick={() => handleCopy(item.id, item.command)}
                  className={`p-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 select-none active:scale-95 cursor-pointer ${
                    copiedId === item.id 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {copiedId === item.id ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-20 glass-panel rounded-xl border border-slate-900 flex flex-col items-center justify-center text-slate-500">
            <BookOpen size={32} className="mb-2 text-slate-600 animate-pulse" />
            <span className="text-xs">No registered packages or boilerplates match your filter queries.</span>
          </div>
        )}
      </div>

      {/* Add Catalog Item Modal */}
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
              <Sparkles size={16} className="text-violet-400" />
              <span>Register Shared Development Asset</span>
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. CDG UI Components"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Asset Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="npm">NPM Package (.tgz)</option>
                    <option value="template">Git Template Repo</option>
                    <option value="api">API Endpoint Spec</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  required
                  rows="2.5"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Provide brief details on what this template solves and instructions for engineers..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Documentation / Repository Link</label>
                <input
                  type="url"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="https://github.com/JustineSalinas/cascade-dashboard"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">CLI Trigger Command / Package URL</label>
                <input
                  type="text"
                  required
                  value={formCommand}
                  onChange={(e) => setFormCommand(e.target.value)}
                  placeholder="e.g. npm install @cdg-ui/react"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
