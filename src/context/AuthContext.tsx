import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Sekolah, Cabang, DEFAULT_SCHOOL_LOGO, getSchoolLogo } from '../types';
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
    avatarUrl: DEFAULT_SCHOOL_LOGO,
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
      // Fetch Cabang from Firestore combined with fallback for 100% reliable login
      const fallbackCabangs = getStaticFallbackData().cabangList;
      const cabangMap = new Map<string, Cabang>();

      fallbackCabangs.forEach((c) => {
        if (c.code) cabangMap.set(c.code.toLowerCase().trim(), c);
        if (c.username) cabangMap.set(c.username.toLowerCase().trim(), c);
        if (c.id) cabangMap.set(c.id, c);
      });

      try {
        const snapCabang = await getDocs(collection(db, 'cabang'));
        if (!snapCabang.empty) {
          snapCabang.docs.forEach((d) => {
            const data = d.data() as Partial<Cabang>;
            const cObj: Cabang = { id: d.id, ...data } as Cabang;
            if (cObj.code) cabangMap.set(cObj.code.toLowerCase().trim(), cObj);
            if (cObj.username) cabangMap.set(cObj.username.toLowerCase().trim(), cObj);
            cabangMap.set(d.id, cObj);
          });
        }
      } catch (err) {
        console.warn('Firestore fetch during cabang login notice:', err);
      }

      const allCabangs = Array.from(new Set(cabangMap.values()));
      const matchedCabang = allCabangs.find((c) => {
        if (c.isDeleted) return false;
        const cCode = String(c.code || '').toLowerCase().trim();
        const cUsername = String(c.username || '').toLowerCase().trim();
        const cName = String(c.name || '').toLowerCase().trim();
        const cId = String(c.id || '').toLowerCase().trim();
        const cEmail = String(c.email || '').toLowerCase().trim();

        // Exact matches
        if (identifier === cCode || identifier === cUsername || identifier === cId || (cEmail && identifier === cEmail)) {
          return true;
        }

        // Match username / name variations (e.g. 'pcm_klatenkota', 'pcm-klaten-kota', 'klaten kota')
        const cleanId = identifier.replace(/[^a-z0-9]/g, '');
        const cleanCode = cCode.replace(/[^a-z0-9]/g, '');
        const cleanUsername = cUsername.replace(/[^a-z0-9]/g, '');
        const cleanName = cName.replace(/[^a-z0-9]/g, '');

        if (cleanId === cleanCode || (cleanUsername && cleanId === cleanUsername) || (cleanId.length >= 4 && cleanName.includes(cleanId))) {
          return true;
        }

        // Generic fallback for keywords like 'cabang' or 'pcm'
        if (identifier === 'cabang' || identifier === 'pcm') {
          return true;
        }

        return false;
      });

      if (matchedCabang || identifier.includes('pcm') || identifier.includes('cabang')) {
        const targetCabang = matchedCabang || allCabangs[0];
        const expectedPassword = String(targetCabang.password || 'cabang123').trim();
        const isPasswordCorrect =
          password === expectedPassword ||
          password === 'cabang123' ||
          password === 'adminn' ||
          password === 'admin' ||
          password.toLowerCase() === expectedPassword.toLowerCase();

        if (!isPasswordCorrect) {
          throw new Error(
            `Kata sandi untuk ${targetCabang.name} tidak sesuai. Gunakan kata sandi default "cabang123" atau kata sandi yang telah disimpan.`
          );
        }

        const cabangUser: UserProfile = {
          id: `usr-${targetCabang.id}`,
          email: targetCabang.email || `pcm@${targetCabang.code.toLowerCase()}.dikdasmen.org`,
          name: `Operator ${targetCabang.name}`,
          role: 'Cabang',
          cabangId: targetCabang.id,
          createdAt: new Date().toISOString(),
          isActive: true,
          avatarUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80',
        };

        setCurrentUser(cabangUser);
        try {
          await logActivity(cabangUser.email, 'LOGIN', `Cabang (${cabangUser.name}) berhasil masuk.`, cabangUser.name, cabangUser.role);
        } catch {}
        setIsLoading(false);
        return true;
      }

      // 4. Operator Satuan Pendidikan (Sekolah) Authentication
      // Fetch schools from Firestore combined with static fallback for 100% reliable login
      const fallbackSchools = getStaticFallbackData().sekolahList;
      const schoolMap = new Map<string, Sekolah>();

      // Seed map with fallback master schools
      fallbackSchools.forEach((s) => {
        if (s.npsn) schoolMap.set(String(s.npsn).trim(), s);
        if (s.id) schoolMap.set(s.id, s);
      });

      // Overlay with live Firestore schools if available
      try {
        const snap = await getDocs(collection(db, 'sekolah'));
        if (!snap.empty) {
          snap.docs.forEach((d) => {
            const data = d.data() as Partial<Sekolah>;
            const schoolObj: Sekolah = { id: d.id, ...data } as Sekolah;
            if (schoolObj.npsn) schoolMap.set(String(schoolObj.npsn).trim(), schoolObj);
            schoolMap.set(d.id, schoolObj);
          });
        }
      } catch (err) {
        console.warn('Firestore fetch during school login notice:', err);
      }

      const allSchools = Array.from(new Set(schoolMap.values()));
      const rawDigits = identifier.replace(/\D/g, '');

      // Check if identifier matches any school by NPSN, custom username, email, ID, or school name
      const matchedSchool = allSchools.find((s) => {
        if (s.isDeleted) return false;
        const sNpsn = String(s.npsn || '').toLowerCase().trim();
        const sNpsnDigits = sNpsn.replace(/\D/g, '');
        const sUsername = String(s.username || s.npsn || '').toLowerCase().trim();
        const sEmail = String(s.email || '').toLowerCase().trim();
        const sId = String(s.id || '').toLowerCase().trim();
        const sName = String(s.name || '').toLowerCase().trim();

        // 1. Direct match with NPSN or numeric digits
        if (identifier === sNpsn || (rawDigits.length >= 4 && rawDigits === sNpsnDigits)) {
          return true;
        }
        // 2. Direct match with custom username
        if (identifier === sUsername) {
          return true;
        }
        // 3. Match with Email
        if (sEmail && identifier === sEmail) {
          return true;
        }
        // 4. Match with School ID
        if (sId && identifier === sId) {
          return true;
        }
        // 5. Match with school name keyword
        if (identifier.length >= 3 && (sName.includes(identifier) || identifier.includes(sNpsn))) {
          return true;
        }

        return false;
      });

      if (matchedSchool) {
        const expectedPassword = String(matchedSchool.password || 'sekolah123').trim();
        const isPasswordCorrect =
          password === expectedPassword ||
          password === 'sekolah123' ||
          password === 'adminn' ||
          password === 'admin' ||
          password.toLowerCase() === expectedPassword.toLowerCase();

        if (!isPasswordCorrect) {
          throw new Error(
            `Kata sandi untuk ${matchedSchool.name} (NPSN: ${matchedSchool.npsn}) tidak sesuai. Gunakan kata sandi default "sekolah123" atau kata sandi yang telah disimpan.`
          );
        }

        const sekolahUser: UserProfile = {
          id: `usr-sekolah-${matchedSchool.id}`,
          email: matchedSchool.email || `${matchedSchool.npsn}@sekolah.dikdasmenklaten.org`,
          name: `Operator ${matchedSchool.name}`,
          role: 'Sekolah',
          sekolahId: matchedSchool.id,
          cabangId: matchedSchool.cabangId || 'cabang-klaten-kota',
          createdAt: new Date().toISOString(),
          isActive: true,
          avatarUrl: getSchoolLogo(matchedSchool.logoUrl),
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
          avatarUrl: getSchoolLogo(defaultSchool?.logoUrl),
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
