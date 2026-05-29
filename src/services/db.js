// Database Service Layer for LocalStorage

const STORAGE_KEYS = {
  PROJECTS: 'cdg_dashboard_projects',
  INVOICES: 'cdg_dashboard_invoices',
  EXPENSES: 'cdg_dashboard_expenses',
  CATALOGUE: 'cdg_dashboard_catalogue',
  EVENTS: 'cdg_dashboard_events',
  INITIALIZED: 'cdg_dashboard_initialized'
};

// Realistic seed data that is fully editable
const SEED_DATA = {
  PROJECTS: [
    {
      id: 'proj-1',
      name: 'Abstergo Portal 2026',
      client: 'Abstergo Industries',
      manager: 'Sarah Jenkins',
      status: 'active',
      progress: 68,
      docsCount: 14,
      category: 'Enterprise Tech',
      dueDate: '2026-06-15',
      tasks: [
        { id: 't1', text: 'Define system architecture', completed: true },
        { id: 't2', text: 'Set up database schema & seed scripts', completed: true },
        { id: 't3', text: 'Implement authentication & authorization flow', completed: true },
        { id: 't4', text: 'Build client-facing widgets and custom grids', completed: false },
        { id: 't5', text: 'Perform security penetration testing & audit', completed: false }
      ]
    },
    {
      id: 'proj-2',
      name: 'Solaria Energy Platform',
      client: 'Solaria Solar Inc',
      manager: 'David Miller',
      status: 'review',
      progress: 90,
      docsCount: 8,
      category: 'Green Tech',
      dueDate: '2026-06-05',
      tasks: [
        { id: 't6', text: 'Integrate real-time grid API telemetry', completed: true },
        { id: 't7', text: 'Optimize charting render performance', completed: true },
        { id: 't8', text: 'User Acceptance Testing feedback run', completed: true },
        { id: 't9', text: 'Prepare documentation & transition manuals', completed: false }
      ]
    },
    {
      id: 'proj-3',
      name: 'Aether CMS SDK',
      client: 'Cascade Dev Group Internal',
      manager: 'Alex Thorne',
      status: 'completed',
      progress: 100,
      docsCount: 22,
      category: 'Developer Tools',
      dueDate: '2026-05-20',
      tasks: [
        { id: 't10', text: 'Write package specifications', completed: true },
        { id: 't11', text: 'Implement caching engine', completed: true },
        { id: 't12', text: 'Push package to private npm registry', completed: true }
      ]
    },
    {
      id: 'proj-4',
      name: 'Starlight Native App',
      client: 'Starlight Holdings',
      manager: 'Elena Rostova',
      status: 'pipeline',
      progress: 15,
      docsCount: 4,
      category: 'Mobile Finance',
      dueDate: '2026-08-30',
      tasks: [
        { id: 't13', text: 'Finalize mobile wireframes', completed: true },
        { id: 't14', text: 'Set up cross-platform workspaces', completed: false },
        { id: 't15', text: 'Determine payment gateway vendor options', completed: false }
      ]
    }
  ],
  INVOICES: [
    { id: 'inv-1', invoiceNumber: 'INV-2026-001', client: 'Abstergo Industries', amount: 48000, status: 'paid', issuedDate: '2026-05-01', dueDate: '2026-05-15', projectAssociation: 'proj-1' },
    { id: 'inv-2', invoiceNumber: 'INV-2026-002', client: 'Solaria Solar Inc', amount: 32000, status: 'pending', issuedDate: '2026-05-10', dueDate: '2026-06-10', projectAssociation: 'proj-2' },
    { id: 'inv-3', invoiceNumber: 'INV-2026-003', client: 'Starlight Holdings', amount: 15000, status: 'pending', issuedDate: '2026-05-25', dueDate: '2026-06-25', projectAssociation: 'proj-4' },
    { id: 'inv-4', invoiceNumber: 'INV-2026-004', client: 'Aether Team Internal', amount: 0, status: 'paid', issuedDate: '2026-05-05', dueDate: '2026-05-05', projectAssociation: 'proj-3' }
  ],
  EXPENSES: [
    { id: 'exp-1', description: 'AWS Production Cluster Hosting', amount: 1450, category: 'infrastructure', date: '2026-05-01', projectAssociation: 'Abstergo Portal 2026' },
    { id: 'exp-2', description: 'GitHub Enterprise Suite Licenses', amount: 720, category: 'licenses', date: '2026-05-03', projectAssociation: 'All Projects' },
    { id: 'exp-3', description: 'Vercel Deployment Server Pro', amount: 180, category: 'infrastructure', date: '2026-05-05', projectAssociation: 'Solaria Energy Platform' },
    { id: 'exp-4', description: 'UX Designer Contractor Retainer', amount: 4500, category: 'contractors', date: '2026-05-15', projectAssociation: 'Starlight Native App' },
    { id: 'exp-5', description: 'Figma Dev-Seat Workspace', amount: 240, category: 'licenses', date: '2026-05-12', projectAssociation: 'All Projects' }
  ],
  CATALOGUE: [
    { id: 'cat-1', name: 'CDG Web UI Components', description: 'Modular, premium design component library containing buttons, grids, input tags and cards tailored for fast React dashboard development.', type: 'npm', link: 'https://github.com/JustineSalinas/cascade-dashboard', command: 'npm install @cdg-ui/react' },
    { id: 'cat-2', name: 'NextJS Boilerplate Pack', description: 'Corporate workspace preset using Next.js 15, pre-integrated with Framer-motion, Tailwind, authentication endpoints, and dark-theme configurations.', type: 'template', link: 'https://github.com/JustineSalinas/cascade-dashboard', command: 'npx create-cdg-app@latest ./my-app' },
    { id: 'cat-3', name: 'Vite React Tailwind Boilerplate', description: 'Standard quick-scaffolding template workspace utilizing Vite bundlers, React 19, and Tailwind CSS v4.', type: 'template', link: 'https://github.com/JustineSalinas/cascade-dashboard', command: 'git clone https://github.com/JustineSalinas/cascade-dashboard' },
    { id: 'cat-4', name: 'CDG Web Hook Webhook Gateway', description: 'Secured serverless gateway routing event notifications with cryptographic signatures to target customer listener endpoints.', type: 'api', link: 'https://api.cascade.dev/docs', command: 'curl -X POST https://api.cascade.dev/hooks' }
  ],
  EVENTS: [
    { id: 'evt-1', title: 'Sprint Sync & Demo Walkthrough', date: '2026-05-29', type: 'meeting', description: 'Developers sprint review meeting showing off current features. Starts at 14:00 PM.' },
    { id: 'evt-2', title: 'Solaria Energy Client Signoff', date: '2026-06-05', type: 'milestone', description: 'Final project milestone verification and signoff for hand-over.' },
    { id: 'evt-3', title: 'AWS Recurring Billing Date', date: '2026-06-01', type: 'payroll', description: 'Production instances automatic debit billing cycles.' },
    { id: 'evt-4', title: 'Aether SDK Release Launch', date: '2026-05-20', type: 'launch', description: 'Internal tool packaging v1.0.0 publishment.' }
  ]
};

// Database utility helper methods
const getStorageItem = (key, fallback) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const initializeDatabase = (force = false) => {
  if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED) || force) {
    setStorageItem(STORAGE_KEYS.PROJECTS, SEED_DATA.PROJECTS);
    setStorageItem(STORAGE_KEYS.INVOICES, SEED_DATA.INVOICES);
    setStorageItem(STORAGE_KEYS.EXPENSES, SEED_DATA.EXPENSES);
    setStorageItem(STORAGE_KEYS.CATALOGUE, SEED_DATA.CATALOGUE);
    setStorageItem(STORAGE_KEYS.EVENTS, SEED_DATA.EVENTS);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
};

// Auto initialize on import
initializeDatabase();

export const dbService = {
  // Reset database completely or seed it
  resetDatabase: (seed = true) => {
    if (seed) {
      initializeDatabase(true);
    } else {
      setStorageItem(STORAGE_KEYS.PROJECTS, []);
      setStorageItem(STORAGE_KEYS.INVOICES, []);
      setStorageItem(STORAGE_KEYS.EXPENSES, []);
      setStorageItem(STORAGE_KEYS.CATALOGUE, []);
      setStorageItem(STORAGE_KEYS.EVENTS, []);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
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
  }
};
