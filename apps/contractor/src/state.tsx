import React, { createContext, useContext, useState, useEffect } from 'react';
import { ContractorProfileData, Language, getTranslation, translations } from '@kaamsetu/shared';
import { apiClient } from '@kaamsetu/api-client';

interface ContractorStateContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  user: any;
  contractor: ContractorProfileData | null;
  login: (token: string, user: any, contractorProfile?: ContractorProfileData) => void;
  logout: () => void;
  updateContractor: (c: ContractorProfileData) => void;
}

const ContractorStateContext = createContext<ContractorStateContextType | null>(null);

export const ContractorStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<any>(null);
  const [contractor, setContractor] = useState<ContractorProfileData | null>(null);

  const t = getTranslation(language);

  // Pre-seed sample contractor
  useEffect(() => {
    setContractor({
      id: 'cnt-1',
      userId: 'usr-c-1',
      fullName: 'Vikram Singh',
      phoneNumber: '9811002233',
      companyName: 'Shri Ram Infra & Civil Projects Pvt Ltd',
      gstNumber: '07AAACS1429B1Z8',
      licenseNumber: 'LIC-UP-2024-904',
      city: 'Noida',
      activeProjectsCount: 2,
      totalWorkforceCount: 42,
      createdAt: '2026-01-05T08:00:00Z',
    });
    setUser({ userId: 'usr-c-1', phoneNumber: '9811002233', role: 'CONTRACTOR' });
  }, []);

  const login = (token: string, userData: any, contractorProfile?: ContractorProfileData) => {
    apiClient.setToken(token);
    setUser(userData);
    if (contractorProfile) {
      setContractor(contractorProfile);
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
    setContractor(null);
  };

  const updateContractor = (c: ContractorProfileData) => {
    setContractor(c);
  };

  return (
    <ContractorStateContext.Provider
      value={{
        language,
        setLanguage,
        t,
        user,
        contractor,
        login,
        logout,
        updateContractor,
      }}
    >
      {children}
    </ContractorStateContext.Provider>
  );
};

export function useContractorState() {
  const ctx = useContext(ContractorStateContext);
  if (!ctx) {
    throw new Error('useContractorState must be used within ContractorStateProvider');
  }
  return ctx;
}
