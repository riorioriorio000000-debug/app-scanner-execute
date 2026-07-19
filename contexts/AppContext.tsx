import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AppInfo {
  name: string;
  packageName: string;
  category: string;
}

export interface LogEntry {
  id: string;
  type: 'log' | 'error' | 'warn' | 'result';
  message: string;
  timestamp: number;
}

interface AppContextType {
  selectedApp: AppInfo | null;
  setSelectedApp: (app: AppInfo | null) => void;
  logs: LogEntry[];
  addLog: (message: string, type?: LogEntry['type']) => void;
  clearLogs: () => void;
  floatingVisible: boolean;
  setFloatingVisible: (v: boolean) => void;
  customApps: AppInfo[];
  addCustomApp: (app: AppInfo) => void;
  removeCustomApp: (packageName: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [floatingVisible, setFloatingVisible] = useState(true);
  const [customApps, setCustomApps] = useState<AppInfo[]>([]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'log') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      type,
      message,
      timestamp: Date.now(),
    };
    setLogs(prev => [entry, ...prev].slice(0, 200));
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const addCustomApp = useCallback((app: AppInfo) => {
    setCustomApps(prev => {
      if (prev.some(a => a.packageName === app.packageName)) return prev;
      return [...prev, app];
    });
  }, []);

  const removeCustomApp = useCallback((packageName: string) => {
    setCustomApps(prev => prev.filter(a => a.packageName !== packageName));
  }, []);

  return (
    <AppContext.Provider value={{
      selectedApp, setSelectedApp,
      logs, addLog, clearLogs,
      floatingVisible, setFloatingVisible,
      customApps, addCustomApp, removeCustomApp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
