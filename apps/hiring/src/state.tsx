import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmployerProfileData, Language, getTranslation, translations } from '@kaamsetu/shared';
import { apiClient } from '@kaamsetu/api-client';

interface HiringStateContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  user: any;
  employer: EmployerProfileData | null;
  login: (token: string, user: any, employerProfile?: EmployerProfileData) => void;
  logout: () => void;
  updateEmployer: (e: EmployerProfileData) => void;
  refreshEmployer: () => Promise<void>;
}

const HiringStateContext = createContext<HiringStateContextType | null>(null);

export const HiringStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<any>(null);
  const [employer, setEmployer] = useState<EmployerProfileData | null>(null);

  const t = getTranslation(language);

  // Seed default employer for testing
  useEffect(() => {
    setEmployer({
      id: 'emp-1',
      userId: 'usr-e-1',
      fullName: 'Ananya Deshmukh',
      phoneNumber: '9911223344',
      companyName: 'Deshmukh Property & Home Solutions',
      businessType: 'Residential & Commercial Hiring',
      city: 'Noida',
      address: 'Tower 4, Sector 78, Noida',
      postedJobsCount: 4,
      totalHiresCount: 5,
      createdAt: '2026-01-01T08:00:00Z',
    });
    setUser({ userId: 'usr-e-1', phoneNumber: '9911223344', role: 'EMPLOYER' });
  }, []);

  const login = (token: string, userData: any, employerProfile?: EmployerProfileData) => {
    apiClient.setToken(token);
    setUser(userData);
    if (employerProfile) {
      setEmployer(employerProfile);
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
    setEmployer(null);
  };

  const updateEmployer = (e: EmployerProfileData) => {
    setEmployer(e);
  };

  const refreshEmployer = async () => {
    // refresh logic if needed
  };

  return (
    <HiringStateContext.Provider
      value={{
        language,
        setLanguage,
        t,
        user,
        employer,
        login,
        logout,
        updateEmployer,
        refreshEmployer,
      }}
    >
      {children}
    </HiringStateContext.Provider>
  );
};

export function useHiringState() {
  const ctx = useContext(HiringStateContext);
  if (!ctx) {
    throw new Error('useHiringState must be used within HiringStateProvider');
  }
  return ctx;
}
