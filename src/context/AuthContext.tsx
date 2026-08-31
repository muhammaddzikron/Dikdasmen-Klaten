import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Sekolah } from '../types';
import { logActivity, getStaticFallbackData } from '../lib/firestoreService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  login: (identifier: string, password?: string) => Promise<boolean>;
  quickLogin: (role: UserRole, customName?: string, cabangId?: string, sekolahId?: string) => void;
  logout: () => void;
  updateCurrentUserProfile: (data: Partial<UserProfile>) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, UserProfile> = {
  'Super Admin': {
    id: 'usr-superadmin-01',
    email: 'admin@dikdasmenklaten.org',
    name: 'Administrator (Super Admin)',
    role: 'Super Admin',
    createdAt: new Date().toISOString(),
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '081234567890',
  },
  'Admin': {
    id: 'usr-admin-dikdasmen-02',
    email: 'staf@dikdasmenklaten.org',
    name: 'Staf Sekretariat Majelis',
    role: 'Admin',
    createdAt: new Date().toISOString(),
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '081298765432',
  },
  'Cabang': {
    id: 'usr-cabang-default',
    email: 'pcm@dikdasmenklaten.org',
    name: 'Operator Cabang / PCM',
    role: 'Cabang',
    createdAt: new Date().toISOString(),
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '0272-321000',
  },
  'Sekolah': {
    id: 'usr-sekolah-default',
    email: 'operator@sekolah.dikdasmenklaten.org',
    name: 'Operator Satuan Pendidikan',
    role: 'Sekolah',
    createdAt: new Date().toISOString(),
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '0272-321001',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sim_dikdasmen_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USERS['Super Admin'];
      }
    }
    return DEMO_USERS['Super Admin'];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('sim_dikdasmen_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sim_dikdasmen_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sim_dikdasmen_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sim_dikdasmen_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = async (identifierInput: string, passwordInput?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const identifier = identifierInput.trim().toLowerCase();
      const password = (passwordInput || '').trim();

      if (!identifier || !password) {
        throw new Error('Silakan masukkan Username / Email dan Kata Sandi.');
      }

      // 1. Super Admin Authentication (user: admin / password: adminn)
      if (
        identifier === 'admin' ||
        identifier === 'admin@dikdasmenklaten.org' ||
        identifier === 'admin@dikdasmen-jogja.org' ||
        identifier === 'admin@dikdasmen.or.id' ||
        identifier === 'muhammaddzikron@gmail.com'
      ) {
        if (password !== 'adminn' && password !== 'admin') {
          throw new Error('Kata sandi salah. Gunakan password "adminn".');
        }

        const superAdminUser: UserProfile = {
          id: 'usr-superadmin-01',
          email: 'admin@dikdasmenklaten.org',
          name: 'Administrator (Super Admin)',
          role: 'Super Admin',
          createdAt: new Date().toISOString(),
          isActive: true,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          phone: '081234567890',
        };

        setCurrentUser(superAdminUser);
        try {
          await logActivity(
            superAdminUser.email,
            'LOGIN',
            `Super Admin (${superAdminUser.name}) berhasil masuk ke sistem SIM Dikdasmen.`,
            superAdminUser.name,
            superAdminUser.role
          );
        } catch {}
        setIsLoading(false);
        return true;
      }

      // 2. Staf Admin Authentication
      if (identifier === 'staf' || identifier === 'staf_admin' || identifier.includes('staf')) {
        if (password !== 'adminn' && password !== 'admin') {
          throw new Error('Kata sandi salah. Gunakan password "adminn".');
        }

        const adminUser: UserProfile = {
          ...DEMO_USERS['Admin'],
          name: 'Staf Sekretariat Majelis',
        };

        setCurrentUser(adminUser);
        try {
          await logActivity(adminUser.email, 'LOGIN', `Admin (${adminUser.name}) berhasil masuk.`, adminUser.name, adminUser.role);
        } catch {}
        setIsLoading(false);
        return true;
      }

      // 3. Cabang PCM Authentication
      if (identifier.includes('pcm') || identifier.includes('cabang')) {
        if (password !== 'adminn' && password !== 'admin') {
          throw new Error('Kata sandi salah. Gunakan password "adminn".');
        }

        const cabangUser: UserProfile = {
          ...DEMO_USERS['Cabang'],
        };

        setCurrentUser(cabangUser);
        try {
          await logActivity(cabangUser.email, 'LOGIN', `Cabang (${cabangUser.name}) berhasil masuk.`, cabangUser.name, cabangUser.role);
        } catch {}
        setIsLoading(false);
        return true;
      }

      // 4. Operator Satuan Pendidikan (Sekolah) Authentication
      // Fetch schools from Firestore or local fallback
      let allSchools: Sekolah[] = [];
      try {
        const snap = await getDocs(collection(db, 'sekolah'));
        allSchools = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Sekolah[];
      } catch {
        allSchools = getStaticFallbackData().sekolahList;
      }
      if (!allSchools || allSchools.length === 0) {
        allSchools = getStaticFallbackData().sekolahList;
      }

      // Check if identifier matches any school by NPSN, custom username, email, or school name substring
      const matchedSchool = allSchools.find((s) => {
        if (s.isDeleted) return false;
        const sNpsn = (s.npsn || '').toLowerCase().trim();
        const sUsername = (s.username || s.npsn || '').toLowerCase().trim();
        const sEmail = (s.email || '').toLowerCase().trim();
        return identifier === sNpsn || identifier === sUsername || (sEmail && identifier === sEmail);
      });

      if (matchedSchool) {
        const expectedPassword = (matchedSchool.password || 'sekolah123').trim();
        const isPasswordCorrect = password === expectedPassword || password === 'adminn' || password === 'admin';

        if (!isPasswordCorrect) {
          throw new Error(
            `Kata sandi untuk ${matchedSchool.name} (NPSN: ${matchedSchool.npsn}) salah. Password default awal adalah "sekolah123".`
          );
        }

        const sekolahUser: UserProfile = {
          id: `usr-sekolah-${matchedSchool.id}`,
          email: matchedSchool.email || `${matchedSchool.npsn}@sekolah.dikdasmenklaten.org`,
          name: `Operator ${matchedSchool.name}`,
          role: 'Sekolah',
          sekolahId: matchedSchool.id,
          cabangId: matchedSchool.cabangId,
          createdAt: new Date().toISOString(),
          isActive: true,
          avatarUrl:
            matchedSchool.logoUrl ||
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          phone: matchedSchool.operatorPhone || matchedSchool.phone || '0272-321001',
        };

        setCurrentUser(sekolahUser);
        try {
          await logActivity(
            sekolahUser.email,
            'LOGIN',
            `Operator Sekolah (${matchedSchool.name} - NPSN ${matchedSchool.npsn}) berhasil masuk.`,
            sekolahUser.name,
            sekolahUser.role
          );
        } catch {}
        setIsLoading(false);
        return true;
      }

      // Generic Operator Sekolah keyword (e.g. 'sekolah' or 'operator')
      if (identifier === 'sekolah' || identifier === 'operator') {
        const isPasswordCorrect = password === 'sekolah123' || password === 'adminn' || password === 'admin';
        if (!isPasswordCorrect) {
          throw new Error('Kata sandi salah. Gunakan password default "sekolah123" atau "adminn".');
        }

        const defaultSchool = allSchools.find((s) => !s.isDeleted) || allSchools[0];
        const sekolahUser: UserProfile = {
          id: defaultSchool ? `usr-sekolah-${defaultSchool.id}` : DEMO_USERS['Sekolah'].id,
          email: defaultSchool?.email || DEMO_USERS['Sekolah'].email,
          name: defaultSchool ? `Operator ${defaultSchool.name}` : DEMO_USERS['Sekolah'].name,
          role: 'Sekolah',
          sekolahId: defaultSchool?.id,
          cabangId: defaultSchool?.cabangId,
          createdAt: new Date().toISOString(),
          isActive: true,
          avatarUrl: defaultSchool?.logoUrl || DEMO_USERS['Sekolah'].avatarUrl,
          phone: defaultSchool?.operatorPhone || defaultSchool?.phone || DEMO_USERS['Sekolah'].phone,
        };

        setCurrentUser(sekolahUser);
        try {
          await logActivity(
            sekolahUser.email,
            'LOGIN',
            `Operator Sekolah (${sekolahUser.name}) berhasil masuk.`,
            sekolahUser.name,
            sekolahUser.role
          );
        } catch {}
        setIsLoading(false);
        return true;
      }

      // Generic authentication with correct password
      if (password === 'adminn' || password === 'admin') {
        const user: UserProfile = {
          id: 'usr-' + Date.now(),
          email: identifier.includes('@') ? identifier : `${identifier}@dikdasmen.or.id`,
          name: identifier.toUpperCase(),
          role: 'Super Admin',
          createdAt: new Date().toISOString(),
          isActive: true,
          phone: '081234567890',
        };
        setCurrentUser(user);
        try {
          await logActivity(user.email, 'LOGIN', `Pengguna ${user.name} berhasil masuk.`, user.name, user.role);
        } catch {}
        setIsLoading(false);
        return true;
      }

      throw new Error('Username atau kata sandi tidak valid. Pastikan username dan kata sandi benar.');
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  };

  const quickLogin = (role: UserRole, customName?: string, cabangId?: string, sekolahId?: string) => {
    const base = { ...DEMO_USERS[role] };
    if (customName) base.name = customName;
    if (cabangId) base.cabangId = cabangId;
    if (sekolahId) base.sekolahId = sekolahId;
    setCurrentUser(base);
    logActivity(base.email, 'SWITCH_ROLE', `Beralih peran sebagai ${role}.`, base.name, base.role);
  };

  const logout = () => {
    if (currentUser) {
      try {
        logActivity(currentUser.email, 'LOGOUT', `Pengguna ${currentUser.name} keluar dari sistem.`, currentUser.name, currentUser.role);
      } catch {}
    }
    setCurrentUser(null);
    localStorage.removeItem('sim_dikdasmen_user');
  };

  const updateCurrentUserProfile = (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    try {
      logActivity(updated.email, 'UPDATE_PROFILE', 'Memperbarui informasi profil pengguna.', updated.name, updated.role);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        loading: isLoading,
        login,
        quickLogin,
        logout,
        updateCurrentUserProfile,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
