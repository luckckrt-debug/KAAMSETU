import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmployerProfileData, Language, getTranslation, translations } from '@kaamsetu/shared';
import { apiClient } from '@kaamsetu/api-client';

export interface MobileBooking {
  id: string;
  categoryName: string;
  categoryIcon: string;
  profession: string;
  workerName: string;
  workerPhone: string;
  workerAvatar?: string;
  status: 'REQUESTED' | 'ASSIGNED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID' | 'CANCELLED';
  address: string;
  city: string;
  estimatedHours: number;
  ratePerHour: number;
  totalAmount: number;
  startOtp: string;
  createdAt: string;
  scheduledTime: string;
  etaMinutes: number;
  paymentMode: 'CASH' | 'UPI' | 'ESCROW';
}

interface HiringStateContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  user: any;
  employer: EmployerProfileData | null;
  bookings: MobileBooking[];
  activeBookings: MobileBooking[];
  currentAddress: string;
  setCurrentAddress: (addr: string) => void;
  login: (token: string, user: any, employerProfile?: EmployerProfileData) => void;
  logout: () => void;
  updateEmployer: (e: EmployerProfileData) => void;
  refreshEmployer: () => Promise<void>;
  addBooking: (booking: Omit<MobileBooking, 'id' | 'createdAt' | 'startOtp'>) => MobileBooking;
  updateBookingStatus: (bookingId: string, status: MobileBooking['status']) => void;
}

const HiringStateContext = createContext<HiringStateContextType | null>(null);

export const HiringStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<any>(null);
  const [employer, setEmployer] = useState<EmployerProfileData | null>(null);
  const [currentAddress, setCurrentAddress] = useState('Sector 78, Noida, Uttar Pradesh');

  const [bookings, setBookings] = useState<MobileBooking[]>([
    {
      id: 'bk-101',
      categoryName: 'Electrical, Electronics & Energy',
      categoryIcon: '⚡',
      profession: 'Electrician',
      workerName: 'Ramesh Kumar Verma',
      workerPhone: '+91 98765 43210',
      status: 'EN_ROUTE',
      address: 'Tower 4, Sector 78, Noida',
      city: 'Noida',
      estimatedHours: 2,
      ratePerHour: 350,
      totalAmount: 700,
      startOtp: '4821',
      createdAt: new Date().toISOString(),
      scheduledTime: 'Immediate (15 min ETA)',
      etaMinutes: 12,
      paymentMode: 'UPI',
    },
    {
      id: 'bk-102',
      categoryName: 'Plumbing, HVAC & Maintenance',
      categoryIcon: '🔧',
      profession: 'Plumber',
      workerName: 'Suresh Mistri',
      workerPhone: '+91 98112 23344',
      status: 'COMPLETED',
      address: 'Flat 502, Sector 100, Noida',
      city: 'Noida',
      estimatedHours: 1,
      ratePerHour: 300,
      totalAmount: 300,
      startOtp: '1904',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      scheduledTime: 'Yesterday, 3:00 PM',
      etaMinutes: 0,
      paymentMode: 'UPI',
    },
  ]);

  const t = getTranslation(language);

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

    // Sync bookings from API if available
    apiClient.getBookings().then(res => {
      if (res && res.success && Array.isArray(res.bookings) && res.bookings.length > 0) {
        // Map backend bookings
        const mapped = res.bookings.map((b: any, idx: number) => ({
          id: b.id || `bk-api-${idx}`,
          categoryName: b.categoryName || 'General Service',
          categoryIcon: '🛠️',
          profession: b.profession || b.trade || 'Worker',
          workerName: b.workerName || 'Assigned Worker',
          workerPhone: b.workerPhone || '+91 99110 00000',
          status: (b.status || 'REQUESTED') as MobileBooking['status'],
          address: b.address || 'Service Location',
          city: b.city || 'Noida',
          estimatedHours: b.estimatedHours || 2,
          ratePerHour: b.ratePerHour || 300,
          totalAmount: b.totalAmount || 600,
          startOtp: b.startOtp || String(Math.floor(1000 + Math.random() * 9000)),
          createdAt: b.createdAt || new Date().toISOString(),
          scheduledTime: b.scheduledTime || 'Today',
          etaMinutes: b.etaMinutes || 15,
          paymentMode: (b.paymentMode || 'UPI') as MobileBooking['paymentMode'],
        }));
        setBookings(prev => [...mapped, ...prev.filter(p => !mapped.some((m: MobileBooking) => m.id === p.id))]);
      }
    }).catch(err => {
      console.log('Bookings API sync (offline fallback active):', err.message);
    });
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
    // refresh logic
  };

  const addBooking = (bookingData: Omit<MobileBooking, 'id' | 'createdAt' | 'startOtp'>): MobileBooking => {
    const newId = `bk-${Date.now().toString().slice(-4)}`;
    const randomOtp = String(Math.floor(1000 + Math.random() * 9000));
    const newBooking: MobileBooking = {
      ...bookingData,
      id: newId,
      createdAt: new Date().toISOString(),
      startOtp: randomOtp,
    };
    setBookings(prev => [newBooking, ...prev]);

    // Send to central backend async
    apiClient.createBooking({
      ...newBooking,
      customerId: user?.userId || 'usr-e-1',
      customerPhone: user?.phoneNumber || '9911223344',
    }).catch(e => console.warn('Booking create api sync note:', e.message));

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: MobileBooking['status']) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status } : b))
    );
    apiClient.updateBookingStatus(bookingId, status).catch(e =>
      console.warn('Booking status sync note:', e.message)
    );
  };

  const activeBookings = bookings.filter(
    b => b.status !== 'PAID' && b.status !== 'CANCELLED' && b.status !== 'COMPLETED'
  );

  return (
    <HiringStateContext.Provider
      value={{
        language,
        setLanguage,
        t,
        user,
        employer,
        bookings,
        activeBookings,
        currentAddress,
        setCurrentAddress,
        login,
        logout,
        updateEmployer,
        refreshEmployer,
        addBooking,
        updateBookingStatus,
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
