import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { logActivity } from '../lib/firestoreService';

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
    id: 'usr-cabang-gondomanan-03',
    email: 'pcm.klatenutara@dikdasmenklaten.org',
    name: 'Operator PCM Klaten Utara',
    role: 'Cabang',
    cabangId: 'cabang-gondomanan',
    createdAt: new Date().toISOString(),
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '0274-375521',
  },
  'Sekolah': {
    id: 'usr-operator-muhi-04',
    email: 'operator@smamuh1yogya.sch.id',
    name: 'Operator SMA Muhi Yogya',
    role: 'Sekolah',
    sekolahId: 'sch-muhi',
    createdAt: new Date().toISOString(),
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '0274-513454',
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
          cabangId: 'cabang-gondomanan',
        };

        setCurrentUser(cabangUser);
        try {
          await logActivity(cabangUser.email, 'LOGIN', `Cabang (${cabangUser.name}) berhasil masuk.`, cabangUser.name, cabangUser.role);
        } catch {}
        setIsLoading(false);
        return true;
      }

      // 4. Operator Sekolah Authentication
      if (identifier.includes('sekolah') || identifier.includes('muhi') || identifier.includes('operator')) {
        if (password !== 'adminn' && password !== 'admin') {
          throw new Error('Kata sandi salah. Gunakan password "adminn".');
        }

        const sekolahUser: UserProfile = {
          ...DEMO_USERS['Sekolah'],
          sekolahId: 'sch-muhi',
        };

        setCurrentUser(sekolahUser);
        try {
          await logActivity(sekolahUser.email, 'LOGIN', `Operator Sekolah (${sekolahUser.name}) berhasil masuk.`, sekolahUser.name, sekolahUser.role);
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
