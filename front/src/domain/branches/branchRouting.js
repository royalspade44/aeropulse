const BRANCHES = [
  'Bulacan',
  'Cavite',
  'Laguna',
  'Bataan',
  'Pangasinan',
  'Ilocos',
];

const CITY_TO_BRANCH = {
  bulacan: 'Bulacan',
  plaridel: 'Bulacan',
  malolos: 'Bulacan',
  cavite: 'Cavite',
  dasmarinas: 'Cavite',
  'dasmariñas': 'Cavite',
  laguna: 'Laguna',
  cabuyao: 'Laguna',
  bataan: 'Bataan',
  balanga: 'Bataan',
  pangasinan: 'Pangasinan',
  dagupan: 'Pangasinan',
  ilocos: 'Ilocos',
  'la union': 'Ilocos',
  'san fernando': 'Ilocos',
};

const BRANCH_PRIORITY = {
  Bulacan: ['Bulacan', 'Bataan', 'Cavite', 'Laguna', 'Pangasinan', 'Ilocos'],
  Cavite: ['Cavite', 'Laguna', 'Bulacan', 'Bataan', 'Pangasinan', 'Ilocos'],
  Laguna: ['Laguna', 'Cavite', 'Bulacan', 'Bataan', 'Pangasinan', 'Ilocos'],
  Bataan: ['Bataan', 'Bulacan', 'Pangasinan', 'Cavite', 'Laguna', 'Ilocos'],
  Pangasinan: ['Pangasinan', 'Ilocos', 'Bataan', 'Bulacan', 'Laguna', 'Cavite'],
  Ilocos: ['Ilocos', 'Pangasinan', 'Bataan', 'Bulacan', 'Laguna', 'Cavite'],
};

const normalize = (value = '') => String(value).trim().toLowerCase();

export const resolvePreferredBranch = (address = {}) => {
  const cityKey = normalize(address.city);
  const streetKey = normalize(address.street);
  const cityBranch = CITY_TO_BRANCH[cityKey];
  if (cityBranch) return cityBranch;

  const streetMatch = Object.keys(CITY_TO_BRANCH).find((key) => streetKey.includes(key));
  if (streetMatch) return CITY_TO_BRANCH[streetMatch];

  return 'Bulacan';
};

export const getBranchSearchOrder = (preferredBranch) => {
  if (BRANCH_PRIORITY[preferredBranch]) {
    return BRANCH_PRIORITY[preferredBranch];
  }
  return BRANCHES;
};
