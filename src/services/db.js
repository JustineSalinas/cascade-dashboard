// Database Service Layer — JSONBin.io Cloud Storage
// All reads are synchronous (from in-memory cache).
// All writes update cache immediately and push to JSONBin async.
// Polls JSONBin every 5 s; fires onDataChange() when remote data differs.

const BIN_ID  = '6a19897b21f9ee59d29999a5';
const API_KEY = '$2a$10$Rm.TrsK8f8QaKdjjQfi9tu6ad9Mpb6OrbJt4zfVMBeDbj7PEiMd66';
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY,
  'X-Bin-Versioning': 'false',
};

// ─── In-memory cache ────────────────────────────────────────────────────────
let cache = {
  projects: [],
  invoices: [],
  expenses: [],
  catalogue: [],
  events: [],
  team: [],
  personal_projects: [],
};

// ─── Change listeners (used by App.jsx to trigger re-renders) ────────────────
let changeListeners = [];
export const onDataChange = (cb) => {
  changeListeners.push(cb);
  // Returns unsubscribe function
  return () => { changeListeners = changeListeners.filter(c => c !== cb); };
};
const notifyChange = () => changeListeners.forEach(cb => cb());

// ─── JSONBin helpers ─────────────────────────────────────────────────────────
const fetchBin = async () => {
  try {
    const res = await fetch(`${BASE_URL}/latest`, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.record ?? json;
  } catch (e) {
    console.warn('[db] fetchBin error:', e.message);
    return null;
  }
};

const pushBin = async () => {
  try {
    const res = await fetch(BASE_URL, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(cache),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.warn('[db] pushBin error:', e.message);
  }
};

// ─── Initialise: load remote data into cache ─────────────────────────────────
let lastSnapshot = '';

export const initializeDatabase = async (force = false) => {
  const remote = await fetchBin();
  if (remote) {
    cache = { ...cache, ...remote };
    lastSnapshot = JSON.stringify(cache);
    notifyChange();
  }
};

// ─── Polling: detect remote changes from other users ─────────────────────────
const startPolling = () => {
  setInterval(async () => {
    const remote = await fetchBin();
    if (!remote) return;
    const snap = JSON.stringify(remote);
    if (snap !== lastSnapshot) {
      lastSnapshot = snap;
      cache = { ...cache, ...remote };
      notifyChange();
    }
  }, 5000); // every 5 seconds
};

// Auto-init on import
initializeDatabase().then(() => {
  lastSnapshot = JSON.stringify(cache);
  startPolling();
});

// ─── Public dbService API (same surface as before) ───────────────────────────
export const dbService = {

  resetDatabase: async () => {
    cache = { projects: [], invoices: [], expenses: [], catalogue: [], events: [], team: [], personal_projects: [] };
    await pushBin();
    notifyChange();
  },

  // 1. Projects
  getProjects: () => cache.projects,
  saveProject: (project) => {
    const list = [...cache.projects];
    if (project.id) {
      const idx = list.findIndex(p => p.id === project.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...project };
      else list.push(project);
    } else {
      project.id = `proj-${Date.now()}`;
      list.push(project);
    }
    cache.projects = list;
    pushBin();
    return project;
  },
  deleteProject: (id) => {
    cache.projects = cache.projects.filter(p => p.id !== id);
    pushBin();
  },

  // 2. Invoices
  getInvoices: () => cache.invoices,
  saveInvoice: (invoice) => {
    const list = [...cache.invoices];
    if (invoice.id) {
      const idx = list.findIndex(i => i.id === invoice.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...invoice };
      else list.push(invoice);
    } else {
      invoice.id = `inv-${Date.now()}`;
      list.push(invoice);
    }
    cache.invoices = list;
    pushBin();
    return invoice;
  },
  deleteInvoice: (id) => {
    cache.invoices = cache.invoices.filter(i => i.id !== id);
    pushBin();
  },

  // 3. Expenses
  getExpenses: () => cache.expenses,
  saveExpense: (expense) => {
    const list = [...cache.expenses];
    if (expense.id) {
      const idx = list.findIndex(e => e.id === expense.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...expense };
      else list.push(expense);
    } else {
      expense.id = `exp-${Date.now()}`;
      list.push(expense);
    }
    cache.expenses = list;
    pushBin();
    return expense;
  },
  deleteExpense: (id) => {
    cache.expenses = cache.expenses.filter(e => e.id !== id);
    pushBin();
  },

  // 4. Catalogue
  getCatalogueItems: () => cache.catalogue,
  saveCatalogueItem: (item) => {
    const list = [...cache.catalogue];
    if (item.id) {
      const idx = list.findIndex(i => i.id === item.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...item };
      else list.push(item);
    } else {
      item.id = `cat-${Date.now()}`;
      list.push(item);
    }
    cache.catalogue = list;
    pushBin();
    return item;
  },
  deleteCatalogueItem: (id) => {
    cache.catalogue = cache.catalogue.filter(i => i.id !== id);
    pushBin();
  },

  // 5. Events
  getEvents: () => cache.events,
  saveEvent: (event) => {
    const list = [...cache.events];
    if (event.id) {
      const idx = list.findIndex(e => e.id === event.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...event };
      else list.push(event);
    } else {
      event.id = `evt-${Date.now()}`;
      list.push(event);
    }
    cache.events = list;
    pushBin();
    return event;
  },
  deleteEvent: (id) => {
    cache.events = cache.events.filter(e => e.id !== id);
    pushBin();
  },

  // 6. Team
  getTeam: () => cache.team,
  saveTeamMember: (member) => {
    const list = [...cache.team];
    if (member.id) {
      const idx = list.findIndex(m => m.id === member.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...member };
      else list.push(member);
    } else {
      member.id = `member-${Date.now()}`;
      list.push(member);
    }
    cache.team = list;
    pushBin();
    return member;
  },
  deleteTeamMember: (id) => {
    cache.team = cache.team.filter(m => m.id !== id);
    pushBin();
  },

  // 7. Personal Projects
  getPersonalProjects: () => cache.personal_projects,
  savePersonalProject: (project) => {
    const list = [...cache.personal_projects];
    if (project.id) {
      const idx = list.findIndex(p => p.id === project.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...project };
      else list.push(project);
    } else {
      project.id = `pproj-${Date.now()}`;
      list.push(project);
    }
    cache.personal_projects = list;
    pushBin();
    return project;
  },
  deletePersonalProject: (id) => {
    cache.personal_projects = cache.personal_projects.filter(p => p.id !== id);
    pushBin();
  },
};
