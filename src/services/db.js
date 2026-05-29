// Database Service Layer for LocalStorage

const STORAGE_KEYS = {
  PROJECTS: 'cdg_dashboard_projects',
  INVOICES: 'cdg_dashboard_invoices',
  EXPENSES: 'cdg_dashboard_expenses',
  CATALOGUE: 'cdg_dashboard_catalogue',
  EVENTS: 'cdg_dashboard_events',
  TEAM: 'cdg_dashboard_team',
  PERSONAL_PROJECTS: 'cdg_dashboard_personal_projects',
  INITIALIZED: 'cdg_dashboard_initialized'
};

const DB_VERSION_KEY = 'cdg_dashboard_db_version_v3';

// Database utility helper methods
const getStorageItem = (key, fallback) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const initializeDatabase = (force = false) => {
  if (!localStorage.getItem(DB_VERSION_KEY) || force) {
    setStorageItem(STORAGE_KEYS.PROJECTS, getStorageItem(STORAGE_KEYS.PROJECTS, []));
    setStorageItem(STORAGE_KEYS.INVOICES, getStorageItem(STORAGE_KEYS.INVOICES, []));
    setStorageItem(STORAGE_KEYS.EXPENSES, getStorageItem(STORAGE_KEYS.EXPENSES, []));
    setStorageItem(STORAGE_KEYS.CATALOGUE, getStorageItem(STORAGE_KEYS.CATALOGUE, []));
    setStorageItem(STORAGE_KEYS.EVENTS, getStorageItem(STORAGE_KEYS.EVENTS, []));
    setStorageItem(STORAGE_KEYS.TEAM, getStorageItem(STORAGE_KEYS.TEAM, []));
    
    // Add default personal projects
    setStorageItem(STORAGE_KEYS.PERSONAL_PROJECTS, [
      {
        id: 'pproj-1',
        name: 'Obsidian Note Sync Daemon',
        description: 'Lightweight daemon syncing local markdown vault directories to private cloud buckets with conflict-free replication.',
        status: 'live',
        link: 'https://github.com/JustineSalinas/obsidian-sync-daemon',
        tech: 'Rust, AWS S3, SQLite'
      },
      {
        id: 'pproj-2',
        name: 'Vite Component Archetype',
        description: 'Opinionated boilerplate for publishing standard library components with React, Tailwind v4, and automatic TypeScript packaging.',
        status: 'development',
        link: 'https://github.com/JustineSalinas/vite-react-archetype',
        tech: 'React, TypeScript, Rollup'
      }
    ]);
    
    localStorage.setItem(DB_VERSION_KEY, 'v3');
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
};

// Auto initialize on import
initializeDatabase();

export const dbService = {
  // Clear database completely
  resetDatabase: () => {
    initializeDatabase(true);
  },

  // 1. Projects API
  getProjects: () => getStorageItem(STORAGE_KEYS.PROJECTS, []),
  saveProject: (project) => {
    const list = dbService.getProjects();
    if (project.id) {
      const idx = list.findIndex(p => p.id === project.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...project };
    } else {
      project.id = `proj-${Date.now()}`;
      list.push(project);
    }
    setStorageItem(STORAGE_KEYS.PROJECTS, list);
    return project;
  },
  deleteProject: (id) => {
    const list = dbService.getProjects();
    const updated = list.filter(p => p.id !== id);
    setStorageItem(STORAGE_KEYS.PROJECTS, updated);
  },

  // 2. Invoices API
  getInvoices: () => getStorageItem(STORAGE_KEYS.INVOICES, []),
  saveInvoice: (invoice) => {
    const list = dbService.getInvoices();
    if (invoice.id) {
      const idx = list.findIndex(i => i.id === invoice.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...invoice };
    } else {
      invoice.id = `inv-${Date.now()}`;
      list.push(invoice);
    }
    setStorageItem(STORAGE_KEYS.INVOICES, list);
    return invoice;
  },
  deleteInvoice: (id) => {
    const list = dbService.getInvoices();
    const updated = list.filter(i => i.id !== id);
    setStorageItem(STORAGE_KEYS.INVOICES, updated);
  },

  // 3. Expenses API
  getExpenses: () => getStorageItem(STORAGE_KEYS.EXPENSES, []),
  saveExpense: (expense) => {
    const list = dbService.getExpenses();
    if (expense.id) {
      const idx = list.findIndex(e => e.id === expense.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...expense };
    } else {
      expense.id = `exp-${Date.now()}`;
      list.push(expense);
    }
    setStorageItem(STORAGE_KEYS.EXPENSES, list);
    return expense;
  },
  deleteExpense: (id) => {
    const list = dbService.getExpenses();
    const updated = list.filter(e => e.id !== id);
    setStorageItem(STORAGE_KEYS.EXPENSES, updated);
  },

  // 4. Catalogue API
  getCatalogueItems: () => getStorageItem(STORAGE_KEYS.CATALOGUE, []),
  saveCatalogueItem: (item) => {
    const list = dbService.getCatalogueItems();
    if (item.id) {
      const idx = list.findIndex(i => i.id === item.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...item };
    } else {
      item.id = `cat-${Date.now()}`;
      list.push(item);
    }
    setStorageItem(STORAGE_KEYS.CATALOGUE, list);
    return item;
  },
  deleteCatalogueItem: (id) => {
    const list = dbService.getCatalogueItems();
    const updated = list.filter(i => i.id !== id);
    setStorageItem(STORAGE_KEYS.CATALOGUE, updated);
  },

  // 5. Events API
  getEvents: () => getStorageItem(STORAGE_KEYS.EVENTS, []),
  saveEvent: (event) => {
    const list = dbService.getEvents();
    if (event.id) {
      const idx = list.findIndex(e => e.id === event.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...event };
    } else {
      event.id = `evt-${Date.now()}`;
      list.push(event);
    }
    setStorageItem(STORAGE_KEYS.EVENTS, list);
    return event;
  },
  deleteEvent: (id) => {
    const list = dbService.getEvents();
    const updated = list.filter(e => e.id !== id);
    setStorageItem(STORAGE_KEYS.EVENTS, updated);
  },

  // 6. Team API
  getTeam: () => getStorageItem(STORAGE_KEYS.TEAM, []),
  saveTeamMember: (member) => {
    const list = dbService.getTeam();
    if (member.id) {
      const idx = list.findIndex(m => m.id === member.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...member };
    } else {
      member.id = `member-${Date.now()}`;
      list.push(member);
    }
    setStorageItem(STORAGE_KEYS.TEAM, list);
    return member;
  },
  deleteTeamMember: (id) => {
    const list = dbService.getTeam();
    const updated = list.filter(m => m.id !== id);
    setStorageItem(STORAGE_KEYS.TEAM, updated);
  },

  // 7. Personal Projects API
  getPersonalProjects: () => getStorageItem(STORAGE_KEYS.PERSONAL_PROJECTS, []),
  savePersonalProject: (project) => {
    const list = dbService.getPersonalProjects();
    if (project.id) {
      const idx = list.findIndex(p => p.id === project.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...project };
    } else {
      project.id = `pproj-${Date.now()}`;
      list.push(project);
    }
    setStorageItem(STORAGE_KEYS.PERSONAL_PROJECTS, list);
    return project;
  },
  deletePersonalProject: (id) => {
    const list = dbService.getPersonalProjects();
    const updated = list.filter(p => p.id !== id);
    setStorageItem(STORAGE_KEYS.PERSONAL_PROJECTS, updated);
  }
};
