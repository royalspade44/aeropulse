import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'aeropulse_admin_settings_v1';

const defaultSettings = {
  general: {
    storeName: 'AeroPulse',
    address: '',
    taxRate: 0,
    currency: 'PHP',
  },
  notifications: {
    lowStockThreshold: 5,
  },
  roles: {
    adminMode: 'full', // 'full' | 'view'
  },
};

const safeParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (_e) {
    return null;
  }
};

const AdminSettingsContext = createContext(null);

export const useAdminSettings = () => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) throw new Error('useAdminSettings must be used within AdminSettingsProvider');
  return ctx;
};

export const AdminSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
    return parsed ? { ...defaultSettings, ...parsed } : defaultSettings;
  });

  const saveSettings = (next) => {
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo(() => ({ settings, saveSettings }), [settings]);

  return <AdminSettingsContext.Provider value={value}>{children}</AdminSettingsContext.Provider>;
};

