import React, { createContext, useContext, useState, useEffect } from 'react';
import { WorkerProfileData, Language, getTranslation, translations } from '@kaamsetu/shared';
import { apiClient } from '@kaamsetu/api-client';

interface WorkerStateContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  user: any;
  worker: WorkerProfileData | null;
  isOnline: boolean;
  toggleOnline: () => Promise<void>;
  login: (token: string, user: any, workerProfile?: WorkerProfileData) => void;
  logout: () => void;
  updateWorker: (worker: WorkerProfileData) => void;
  refreshWorker: () => Promise<void>;
}

const WorkerStateContext = createContext<WorkerStateContextType | null>(null);

export const WorkerStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('hi'); // Default Hindi for Indian worker base
  const [user, setUser] = useState<any>(null);
  const [worker, setWorker] = useState<WorkerProfileData | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const t = getTranslation(language);

  // Initialize with seeded worker if not logged in
  useEffect(() => {
    async function init() {
      try {
        const res = await apiClient.getWorkerById('wrk-1');
        if (res.success && res.worker) {
          setWorker(res.worker);
          setUser({ userId: res.worker.userId, phoneNumber: res.worker.phoneNumber, role: 'WORKER' });
          setIsOnline(res.worker.isAvailable);
        }
      } catch (e) {
        console.log('[STATE] Working in offline/demo mode with seeded worker');
      }
    }
    init();
  }, []);

  const login = (token: string, userData: any, workerProfile?: WorkerProfileData) => {
    apiClient.setToken(token);
    setUser(userData);
    if (workerProfile) {
      setWorker(workerProfile);
      setIsOnline(workerProfile.isAvailable);
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
    setWorker(null);
  };

  const updateWorker = (w: WorkerProfileData) => {
    setWorker(w);
    setIsOnline(w.isAvailable);
  };

  const refreshWorker = async () => {
    if (!worker) return;
    try {
      const res = await apiClient.getWorkerById(worker.id);
      if (res.success && res.worker) {
        setWorker(res.worker);
        setIsOnline(res.worker.isAvailable);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleOnline = async () => {
    if (!worker) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await apiClient.updateWorkerAvailability(worker.id, newStatus);
    } catch (e) {
      console.warn('Failed to update availability on server, reverted locally');
    }
  };

  return (
    <WorkerStateContext.Provider
      value={{
        language,
        setLanguage,
        t,
        user,
        worker,
        isOnline,
        toggleOnline,
        login,
        logout,
        updateWorker,
        refreshWorker,
      }}
    >
      {children}
    </WorkerStateContext.Provider>
  );
};

export function useWorkerState() {
  const ctx = useContext(WorkerStateContext);
  if (!ctx) {
    throw new Error('useWorkerState must be used within WorkerStateProvider');
  }
  return ctx;
}
