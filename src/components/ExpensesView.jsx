import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Trash2, 
  Receipt,
  Server,
  Layers,
  FileCode,
  Briefcase,
  X,
  Globe
} from 'lucide-react';
import { dbService } from '../services/db';

export default function ExpensesView({ activeTab, refreshTrigger, triggerRefresh, formatAmount }) {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('domains');
  const [formDate, setFormDate] = useState('');
  const [formProjectAssociation, setFormProjectAssociation] = useState('Global / Shared');

  useEffect(() => {
    setExpenses(dbService.getExpenses());
    setProjects(dbService.getProjects());
  }, [refreshTrigger, activeTab]);

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!formDescription || !formAmount || !formDate) {
      alert("Please fill in description, amount, and date fields.");
      return;
    }

    const expenseData = {
      description: formDescription,
      amount: parseFloat(formAmount),
      category: formCategory,
      date: formDate,
      projectAssociation: formProjectAssociation
    };

    dbService.saveExpense(expenseData);
    triggerRefresh();

    // Reset Form
    setFormDescription('');
    setFormAmount('');
    setFormCategory('domains');
    setFormDate('');
    setFormProjectAssociation('Global / Shared');
    setShowAddModal(false);
  };

  const handleDeleteExpense = (id) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      dbService.deleteExpense(id);
      triggerRefresh();
    }
  };

  // Get dynamic breakdown by category
  const getCategoryStats = () => {
    const categories = {
      domains: 0,
      hosting: 0,
      tooling: 0,
    };
    
    expenses.forEach(e => {
      let cat = e.category;
      if (cat === 'infrastructure') cat = 'hosting';
      if (cat === 'licenses') cat = 'tooling';
      if (cat === 'operations') cat = 'domains';

      if (categories[cat] !== undefined) {
        categories[cat] += e.amount;
      } else {
        categories.tooling += e.amount;
      }
    });

    return categories;
  };

  const categoryStats = getCategoryStats();
  const totalExpenses = Object.values(categoryStats).reduce((a, b) => a + b, 0);

  // Filters
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.projectAssociation.toLowerCase().includes(searchQuery.toLowerCase());
    
    let cat = e.category;
    if (cat === 'infrastructure') cat = 'hosting';
    if (cat === 'licenses') cat = 'tooling';
    if (cat === 'operations') cat = 'domains';

    const matchesCategory = categoryFilter === 'all' || cat === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    let cat = category;
    if (cat === 'infrastructure') cat = 'hosting';
    if (cat === 'licenses') cat = 'tooling';
    if (cat === 'operations') cat = 'domains';

    switch (cat) {
      case 'domains': return <Globe size={14} className="text-amber-400" />;
      case 'hosting': return <Server size={14} className="text-blue-400" />;
      case 'tooling': return <Layers size={14} className="text-violet-400" />;
      default: return <Briefcase size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Operating Expenditure (OpEx)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
          Log domains, cloud hosting, and software tools used to develop your listed projects.
          </p>
        </div>
        <button
          onClick={() => {
            setFormDescription('');
            setFormAmount('');
            setFormCategory('domains');
            setFormDate(new Date().toISOString().split('T')[0]);
            setFormProjectAssociation('Global / Shared');
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-xs font-bold rounded-lg text-white shadow-md shadow-violet-500/20 transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>Log Expense</span>
        </button>
      </div>

      {/* Grid: Ledger Table and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expenses List */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-slate-900 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-slate-950/20 border-b border-slate-900 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by description or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {['all', 'domains', 'hosting', 'tooling'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                        : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/10">
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Associated Project</th>
                    <th className="px-5 py-3">Cost Value</th>
                    <th className="px-5 py-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-xs">
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-200">{exp.description}</td>
                        <td className="px-5 py-3.5 capitalize">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            {getCategoryIcon(exp.category)}
                            <span>{(() => {
                              let cat = exp.category;
                              if (cat === 'infrastructure') return 'hosting';
                              if (cat === 'licenses') return 'tooling';
                              if (cat === 'operations') return 'domains';
                              return cat;
                            })()}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{exp.date}</td>
                        <td className="px-5 py-3.5 text-slate-400">{exp.projectAssociation}</td>
                        <td className="px-5 py-3.5 font-extrabold text-slate-200">{formatAmount(exp.amount)}</td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                        No expenses match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Category breakdown visual charts */}
        <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col justify-between min-h-[350px]">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Audit Center</span>
            <h4 className="text-sm font-bold text-slate-200">Category Cost Breakdowns</h4>
          </div>

          <div className="space-y-4 my-auto">
            {/* Total */}
            <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Gross Expenses</span>
                <span className="text-lg font-black text-rose-400 mt-1 block">{formatAmount(totalExpenses)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Receipt size={18} />
              </div>
            </div>

            {/* Progress Bars for Categories */}
            <div className="space-y-3">
              {Object.keys(categoryStats).map((cat) => {
                const amount = categoryStats[cat];
                const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                
                const barColors = {
                  domains: 'bg-amber-500',
                  hosting: 'bg-blue-500',
                  tooling: 'bg-violet-500',
                };

                return (
                  <div key={cat}>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                      <span className="capitalize">{cat}</span>
                      <span className="text-slate-300 font-bold">{formatAmount(amount)} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${barColors[cat] || 'bg-slate-500'} transition-all`} 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[9.5px] text-slate-500 font-semibold border-t border-slate-900 pt-3 mt-4 leading-relaxed">
            All OpEx allocations directly decrement net cash calculations on the main executive dashboard view.
          </div>
        </div>
      </div>

      {/* Expense Modal Form */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-[9999] p-4 pl-64 pt-20 animate-fade-in">
          <div className="glass-panel w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 p-6 shadow-2xl animate-fade-in-up relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-extrabold text-slate-100 mb-4 flex items-center gap-2">
              <Receipt size={16} className="text-violet-400" />
              <span>Log Developer OpEx</span>
            </h3>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Description</label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. AWS Production Nodes"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Cost Value ($)</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="e.g. 750"
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
                    <option value="domains">Domains / Registry</option>
                    <option value="hosting">Hosting / Cloud Hosting</option>
                    <option value="tooling">Tooling / API Seats</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Linked Project</label>
                  <select
                    value={formProjectAssociation}
                    onChange={(e) => setFormProjectAssociation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Global / Shared">Global / Shared</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
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
                  Confirm Log
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
