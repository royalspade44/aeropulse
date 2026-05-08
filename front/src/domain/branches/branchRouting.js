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
  bacoor: 'Cavite',
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

const PROVINCE_TO_BRANCH = {
  bulacan: 'Bulacan',
  cavite: 'Cavite',
  laguna: 'Laguna',
  bataan: 'Bataan',
  pangasinan: 'Pangasinan',
  ilocos: 'Ilocos',
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

const getAddressLookupKeys = (address = {}) => [
  normalize(address.city),
  normalize(address.province),
  normalize(address.region),
  normalize(address.barangay),
  normalize(address.street),
].filter(Boolean);

export const resolvePreferredBranch = (address = {}) => {
  const lookupKeys = getAddressLookupKeys(address);

  for (const key of lookupKeys) {
    const exactCityBranch = CITY_TO_BRANCH[key];
    if (exactCityBranch) return exactCityBranch;

    const exactProvinceBranch = PROVINCE_TO_BRANCH[key];
    if (exactProvinceBranch) return exactProvinceBranch;
  }

  for (const key of lookupKeys) {
    const fuzzyCityBranch = Object.keys(CITY_TO_BRANCH).find((cityKey) => key.includes(cityKey));
    if (fuzzyCityBranch) return CITY_TO_BRANCH[fuzzyCityBranch];

    const fuzzyProvinceBranch = Object.keys(PROVINCE_TO_BRANCH).find((provinceKey) => key.includes(provinceKey));
    if (fuzzyProvinceBranch) return PROVINCE_TO_BRANCH[fuzzyProvinceBranch];
  }

  return 'Bulacan';
};

export const getBranchSearchOrder = (preferredBranch) => {
  if (BRANCH_PRIORITY[preferredBranch]) {
    return BRANCH_PRIORITY[preferredBranch];
  }
  return BRANCHES;
};
