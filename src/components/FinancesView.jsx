import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Trash2, 
  Check, 
  Clock, 
  AlertTriangle,
  DollarSign,
  TrendingUp,
  X,
  Database
} from 'lucide-react';
import { dbService } from '../services/db';

export default function FinancesView({ activeTab, refreshTrigger, triggerRefresh, formatAmount, currency }) {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [formNumber, setFormNumber] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formIssuedDate, setFormIssuedDate] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formProjectAssociation, setFormProjectAssociation] = useState('');
  const [formStatus, setFormStatus] = useState('pending');

  useEffect(() => {
    setInvoices(dbService.getInvoices());
    setProjects(dbService.getProjects());
    setExpenses(dbService.getExpenses());
    // Auto-generate invoice number based on date/index
    setFormNumber(`INV-2026-${String(dbService.getInvoices().length + 1).padStart(3, '0')}`);
  }, [refreshTrigger, activeTab]);

  const handleSaveInvoice = (e) => {
    e.preventDefault();
    if (!formClient || !formAmount || !formIssuedDate || !formDueDate) {
      alert("Please fill in client, amount, and date fields.");
      return;
    }

    let finalAmount = parseFloat(formAmount);
    if (currency === 'PHP') {
      finalAmount = finalAmount / 58;
    }

    const invoiceData = {
      invoiceNumber: formNumber,
      client: formClient,
      amount: finalAmount,
      issuedDate: formIssuedDate,
      dueDate: formDueDate,
      projectAssociation: formProjectAssociation,
      status: formStatus
    };

    dbService.saveInvoice(invoiceData);
    triggerRefresh();

    // Reset Form
    setFormClient('');
    setFormAmount('');
    setFormIssuedDate('');
    setFormDueDate('');
    setFormProjectAssociation('');
    setFormStatus('pending');
    setShowAddModal(false);
  };

  const handleToggleStatus = (id, currentStatus) => {
    const list = dbService.getInvoices();
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return;

    const nextStatusMap = {
      'pending': 'paid',
      'paid': 'overdue',
      'overdue': 'pending'
    };

    list[idx].status = nextStatusMap[currentStatus];
    dbService.saveInvoice(list[idx]);
    triggerRefresh();
  };

  const handleDeleteInvoice = (id) => {
    if (confirm("Are you sure you want to delete this invoice record?")) {
      dbService.deleteInvoice(id);
      triggerRefresh();
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'overdue':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <Check size={11} />;
      case 'pending':
        return <Clock size={11} />;
      case 'overdue':
        return <AlertTriangle size={11} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Ledger Console & Invoicing</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Issue billings to clients, manage payment receipts, and audit contract values.
          </p>
        </div>
        <button
          onClick={() => {
            setFormNumber(`INV-2026-${String(invoices.length + 1).padStart(3, '0')}`);
            setFormClient('');
            setFormAmount('');
            setFormIssuedDate(new Date().toISOString().split('T')[0]);
            setFormDueDate('');
            setFormProjectAssociation('');
            setFormStatus('pending');
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-xs font-bold rounded-lg text-white shadow-md shadow-violet-500/20 transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>Issue Invoice</span>
        </button>
      </div>

      {/* Stats Summary cards */}
      {(() => {
        const totalRevenue = invoices.reduce((a, b) => a + b.amount, 0);
        const totalCollected = invoices.filter(i => i.status === 'paid').reduce((a, b) => a + b.amount, 0);
        const totalPending = invoices.filter(i => i.status !== 'paid').reduce((a, b) => a + b.amount, 0);
        const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
        const cashFlow = totalCollected - totalExpenses;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue */}
            <div className="glass-card p-4 rounded-xl border border-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Revenue</span>
                <h3 className="text-base font-black text-slate-100 mt-1 block">
                  {formatAmount(totalRevenue)}
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <DollarSign size={16} />
              </div>
            </div>

            {/* Collected */}
            <div className="glass-card p-4 rounded-xl border border-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Collected</span>
                <h3 className="text-base font-black text-emerald-400 mt-1 block">
                  {formatAmount(totalCollected)}
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Check size={16} />
              </div>
            </div>

            {/* Pending */}
            <div className="glass-card p-4 rounded-xl border border-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending</span>
                <h3 className="text-base font-black text-amber-400 mt-1 block">
                  {formatAmount(totalPending)}
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Clock size={16} />
              </div>
            </div>

            {/* Cash Flow */}
            <div className="glass-card p-4 rounded-xl border border-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cash Flow</span>
                <h3 className={`text-base font-black mt-1 block ${cashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatAmount(cashFlow)}
                </h3>
              </div>
              <div className={`p-2 rounded-lg border ${cashFlow >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                <TrendingUp size={16} />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Filter and Table Section */}
      <div className="glass-panel rounded-xl border border-slate-900 overflow-hidden">
        {/* Table header menu */}
        <div className="p-4 bg-slate-950/20 border-b border-slate-900 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by client or invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {['all', 'paid', 'pending', 'overdue'].map((status) => (
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

        {/* Invoices Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/10">
                <th className="px-6 py-3.5">Invoice Number</th>
                <th className="px-6 py-3.5">Client</th>
                <th className="px-6 py-3.5">Linked Workspace</th>
                <th className="px-6 py-3.5">Issued Date</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const associatedProj = projects.find(p => p.id === inv.projectAssociation);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-200">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 font-semibold text-slate-300">{inv.client}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {associatedProj ? (
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-semibold border border-slate-800">
                            {associatedProj.name}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{inv.issuedDate}</td>
                      <td className="px-6 py-4 text-slate-500">{inv.dueDate}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-200">{formatAmount(inv.amount)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(inv.id, inv.status)}
                          title="Click to toggle status (paid -> overdue -> pending)"
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border cursor-pointer select-none active:scale-95 transition-all ${getStatusStyle(inv.status)}`}
                        >
                          {getStatusIcon(inv.status)}
                          <span>{inv.status}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteInvoice(inv.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    No matching invoices found in local storage database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal Form */}
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
              <Database size={16} className="text-violet-400" />
              <span>Create New Invoice</span>
            </h3>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Invoice Number</label>
                <input
                  type="text"
                  disabled
                  value={formNumber}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-900 rounded-lg text-xs text-slate-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Client Name</label>
                <input
                  type="text"
                  required
                  value={formClient}
                  onChange={(e) => setFormClient(e.target.value)}
                  placeholder="e.g. Abstergo Industries"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Amount to Bill ({currency === 'PHP' ? '₱' : '$'})</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Date Issued</label>
                  <input
                    type="date"
                    required
                    value={formIssuedDate}
                    onChange={(e) => setFormIssuedDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Link to Project</label>
                <select
                  value={formProjectAssociation}
                  onChange={(e) => setFormProjectAssociation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="">-- Optional: Choose Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
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
                  Save Invoice
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
