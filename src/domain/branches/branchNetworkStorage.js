const BRANCH_STORAGE_KEY = 'aeropulse_branch_network';

const defaultBranches = [
  {
    id: 'north-hub',
    name: 'North Hub',
    location: 'Quezon City',
    manager: 'Ana Dela Cruz',
    branchAdmin: 'north.admin@aeropulse.com',
    storeStatus: 'open',
    serverStatus: 'online',
    networkHealth: 'stable',
    needs: ['2 inverter units for demo floor'],
    requests: ['Approve weekend maintenance overtime']
  },
  {
    id: 'south-hub',
    name: 'South Hub',
    location: 'Makati',
    manager: 'Paolo Reyes',
    branchAdmin: 'south.admin@aeropulse.com',
    storeStatus: 'open',
    serverStatus: 'online',
    networkHealth: 'stable',
    needs: ['Replace POS receipt printer'],
    requests: ['Request backup LTE modem']
  }
];

const parse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
};

export const loadBranchNetwork = () => {
  const cached = parse(localStorage.getItem(BRANCH_STORAGE_KEY));
  if (!Array.isArray(cached) || cached.length === 0) {
    localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(defaultBranches));
    return defaultBranches;
  }
  return cached;
};

export const saveBranchNetwork = (branches) => {
  localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(branches));
};

export const upsertBranch = (branch) => {
  const all = loadBranchNetwork();
  const index = all.findIndex((item) => item.id === branch.id);
  if (index >= 0) {
    all[index] = { ...all[index], ...branch };
  } else {
    all.push(branch);
  }
  saveBranchNetwork(all);
  return all;
};

export const updateBranchOps = (branchId, updates) => {
  const all = loadBranchNetwork();
  const next = all.map((branch) => (
    branch.id === branchId
      ? { ...branch, ...updates, updatedAt: new Date().toISOString() }
      : branch
  ));
  saveBranchNetwork(next);
  return next.find((branch) => branch.id === branchId) || null;
};
