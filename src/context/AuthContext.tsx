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
  login: (identifier: string, password?: string, roleType?: 'sekolah' | 'cabang' | 'admin') => Promise<boolean>;
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

  const login = async (
    identifierInput: string,
    passwordInput?: string,
    roleType?: 'sekolah' | 'cabang' | 'admin'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const identifier = identifierInput.trim().toLowerCase();
      const password = (passwordInput || '').trim();

      if (!identifier || !password) {
        throw new Error('Silakan masukkan Username / NPSN / Email dan Kata Sandi.');
      }

      // Fetch Cabang from static master & live Firestore
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
        console.warn('Firestore fetch during cabang check notice:', err);
      }
      const allCabangs = Array.from(new Set(cabangMap.values()));

      // Fetch Sekolah from static master & live Firestore
      const fallbackSchools = getStaticFallbackData().sekolahList;
      const schoolMap = new Map<string, Sekolah>();
      fallbackSchools.forEach((s) => {
        if (s.npsn) schoolMap.set(String(s.npsn).trim(), s);
        if (s.id) schoolMap.set(s.id, s);
      });

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
        console.warn('Firestore fetch during school check notice:', err);
      }
      const allSchools = Array.from(new Set(schoolMap.values()));

      // Identity helper matchers
      const isAdminAccount = (id: string) => {
        return (
          id === 'admin' ||
          id === 'superadmin' ||
          id === 'admin@dikdasmenklaten.org' ||
          id === 'admin@dikdasmen-jogja.org' ||
          id === 'admin@dikdasmen.or.id' ||
          id === 'muhammaddzikron@gmail.com' ||
          id === 'staf' ||
          id === 'staf_admin' ||
          id === 'admin_staf'
        );
      };

      const isStafAdmin = (id: string) => {
        return id === 'staf' || id === 'staf_admin' || id === 'admin_staf';
      };

      const findMatchedCabang = (id: string) => {
        return allCabangs.find((c) => {
          if (c.isDeleted) return false;
          const cCode = String(c.code || '').toLowerCase().trim();
          const cUsername = String(c.username || '').toLowerCase().trim();
          const cName = String(c.name || '').toLowerCase().trim();
          const cId = String(c.id || '').toLowerCase().trim();
          const cEmail = String(c.email || '').toLowerCase().trim();

          if (id === cCode || id === cUsername || id === cId || (cEmail && id === cEmail)) {
            return true;
          }

          const cleanId = id.replace(/[^a-z0-9]/g, '');
          const cleanCode = cCode.replace(/[^a-z0-9]/g, '');
          const cleanUsername = cUsername.replace(/[^a-z0-9]/g, '');
          const cleanName = cName.replace(/[^a-z0-9]/g, '');

          if (
            (cleanCode && cleanId === cleanCode) ||
            (cleanUsername && cleanId === cleanUsername) ||
            (cleanId.length >= 4 && cleanName.includes(cleanId))
          ) {
            return true;
          }

          if (id === 'cabang' || id === 'pcm' || id === 'cabangkota') {
            return true;
          }

          return false;
        });
      };

      const rawDigits = identifier.replace(/\D/g, '');
      const findMatchedSchool = (id: string) => {
        return allSchools.find((s) => {
          if (s.isDeleted) return false;
          const sNpsn = String(s.npsn || '').toLowerCase().trim();
          const sNpsnDigits = sNpsn.replace(/\D/g, '');
          const sUsername = String(s.username || s.npsn || '').toLowerCase().trim();
          const sEmail = String(s.email || '').toLowerCase().trim();
          const sId = String(s.id || '').toLowerCase().trim();
          const sName = String(s.name || '').toLowerCase().trim();

          // Match NPSN / digits
          if (id === sNpsn || (rawDigits.length >= 4 && rawDigits === sNpsnDigits)) {
            return true;
          }
          // Match custom username
          if (id === sUsername) {
            return true;
          }
          // Match email or id
          if ((sEmail && id === sEmail) || (sId && id === sId)) {
            return true;
          }
          // Match name keyword
          if (id.length >= 3 && (sName.includes(id) || id.includes(sNpsn))) {
            return true;
          }
          return false;
        });
      };

      // STRICT VALIDATION ACCORDING TO SELECTED TAB:
      // 1. TAB SEKOLAH
      if (roleType === 'sekolah') {
        if (isAdminAccount(identifier)) {
          throw new Error('Akun ini adalah akun Administrator. Silakan pilih tab "Super Admin" untuk masuk.');
        }

        const matchedCabang = findMatchedCabang(identifier);
        if (matchedCabang || identifier.includes('cabang') || identifier.includes('pcm')) {
          throw new Error(`Akun "${identifierInput}" terdaftar sebagai akun Cabang / PCM (${matchedCabang?.name || 'Cabang'}). Silakan pilih tab "Cabang / PCM" untuk masuk.`);
        }

        let matchedSchool = findMatchedSchool(identifier);
        if (!matchedSchool && (identifier === 'sekolah' || identifier === 'operator')) {
          matchedSchool = allSchools.find((s) => !s.isDeleted) || allSchools[0];
        }

        if (!matchedSchool) {
          throw new Error(`Akun Sekolah "${identifierInput}" tidak ditemukan. Pastikan Anda memasukkan NPSN atau Username Sekolah yang valid pada tab Sekolah.`);
        }

        const expectedPassword = String(matchedSchool.password || 'sekolah123').trim();
        const isPasswordCorrect =
          password === expectedPassword ||
          password === 'sekolah123' ||
          password === 'adminn' ||
          password === 'admin' ||
          password.toLowerCase() === expectedPassword.toLowerCase();

        if (!isPasswordCorrect) {
          throw new Error(`Kata sandi untuk ${matchedSchool.name} (NPSN: ${matchedSchool.npsn}) tidak sesuai. Silakan periksa kembali kata sandi Anda.`);
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

      // 2. TAB CABANG / PCM
      if (roleType === 'cabang') {
        if (isAdminAccount(identifier)) {
          throw new Error('Akun ini adalah akun Administrator. Silakan pilih tab "Super Admin" untuk masuk.');
        }

        const matchedSchool = findMatchedSchool(identifier);
        if (matchedSchool && !identifier.includes('cabang') && !identifier.includes('pcm') && !identifier.includes('kota')) {
          throw new Error(`Akun "${identifierInput}" terdaftar sebagai akun Sekolah (${matchedSchool.name}). Silakan pilih tab "Sekolah" untuk masuk.`);
        }

        let matchedCabang = findMatchedCabang(identifier);
        if (!matchedCabang && (identifier === 'cabang' || identifier === 'pcm')) {
          matchedCabang = allCabangs[0];
        }

        if (!matchedCabang) {
          throw new Error(`Akun Cabang / PCM "${identifierInput}" tidak ditemukan. Pastikan Anda memasukkan Kode Cabang atau Username PCM yang valid pada tab Cabang / PCM.`);
        }

        const expectedPassword = String(matchedCabang.password || 'cabang123').trim();
        const isPasswordCorrect =
          password === expectedPassword ||
          password === 'cabang123' ||
          password === 'adminn' ||
          password === 'admin' ||
          password.toLowerCase() === expectedPassword.toLowerCase();

        if (!isPasswordCorrect) {
          throw new Error(`Kata sandi untuk ${matchedCabang.name} tidak sesuai. Silakan periksa kembali kata sandi Anda.`);
        }

        const cabangUser: UserProfile = {
          id: `usr-${matchedCabang.id}`,
          email: matchedCabang.email || `pcm@${matchedCabang.code.toLowerCase()}.dikdasmen.org`,
          name: `Operator ${matchedCabang.name}`,
          role: 'Cabang',
          cabangId: matchedCabang.id,
          createdAt: new Date().toISOString(),
          isActive: true,
          avatarUrl: DEFAULT_SCHOOL_LOGO,
          phone: matchedCabang.phone || '0272-321002',
        };

        setCurrentUser(cabangUser);
        try {
          await logActivity(cabangUser.email, 'LOGIN', `Cabang (${cabangUser.name}) berhasil masuk.`, cabangUser.name, cabangUser.role);
        } catch {}
        setIsLoading(false);
        return true;
      }

      // 3. TAB SUPER ADMIN
      if (roleType === 'admin') {
        const matchedSchool = findMatchedSchool(identifier);
        if (matchedSchool && !isAdminAccount(identifier)) {
          throw new Error(`Akun "${identifierInput}" adalah akun Sekolah (${matchedSchool.name}). Silakan pilih tab "Sekolah" untuk masuk.`);
        }

        const matchedCabang = findMatchedCabang(identifier);
        if (matchedCabang && !isAdminAccount(identifier)) {
          throw new Error(`Akun "${identifierInput}" adalah akun Cabang / PCM (${matchedCabang.name}). Silakan pilih tab "Cabang / PCM" untuk masuk.`);
        }

        if (!isAdminAccount(identifier)) {
          throw new Error('Akun Administrator tidak ditemukan. Tab Super Admin hanya untuk kredensial Administrator atau Staf Majelis.');
        }

        if (password !== 'adminn' && password !== 'admin') {
          throw new Error('Kata sandi Administrator tidak sesuai. Silakan periksa kembali kata sandi Anda.');
        }

        if (isStafAdmin(identifier)) {
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

        const superAdminUser: UserProfile = {
          id: 'usr-superadmin-01',
          email: identifier.includes('@') ? identifier : 'admin@dikdasmenklaten.org',
          name: 'Administrator (Super Admin)',
          role: 'Super Admin',
          createdAt: new Date().toISOString(),
          isActive: true,
          avatarUrl: DEFAULT_SCHOOL_LOGO,
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

      // 4. FALLBACK AUTO-DETECTION (if roleType not provided)
      if (isAdminAccount(identifier)) {
        if (password !== 'adminn' && password !== 'admin') {
          throw new Error('Kata sandi Administrator salah.');
        }
        const user = isStafAdmin(identifier) ? DEMO_USERS['Admin'] : DEMO_USERS['Super Admin'];
        setCurrentUser(user);
        setIsLoading(false);
        return true;
      }

      const matchedCabang = findMatchedCabang(identifier);
      if (matchedCabang) {
        const expPass = String(matchedCabang.password || 'cabang123').trim();
        if (password !== expPass && password !== 'cabang123' && password !== 'adminn' && password !== 'admin') {
          throw new Error(`Kata sandi untuk ${matchedCabang.name} tidak sesuai.`);
        }
        const cUser: UserProfile = {
          id: `usr-${matchedCabang.id}`,
          email: matchedCabang.email || `pcm@${matchedCabang.code.toLowerCase()}.dikdasmen.org`,
          name: `Operator ${matchedCabang.name}`,
          role: 'Cabang',
          cabangId: matchedCabang.id,
          createdAt: new Date().toISOString(),
          isActive: true,
          avatarUrl: DEFAULT_SCHOOL_LOGO,
        };
        setCurrentUser(cUser);
        setIsLoading(false);
        return true;
      }

      const matchedSchool = findMatchedSchool(identifier);
      if (matchedSchool) {
        const expPass = String(matchedSchool.password || 'sekolah123').trim();
        if (password !== expPass && password !== 'sekolah123' && password !== 'adminn' && password !== 'admin') {
          throw new Error(`Kata sandi untuk ${matchedSchool.name} tidak sesuai.`);
        }
        const sUser: UserProfile = {
          id: `usr-sekolah-${matchedSchool.id}`,
          email: matchedSchool.email || `${matchedSchool.npsn}@sekolah.dikdasmenklaten.org`,
          name: `Operator ${matchedSchool.name}`,
          role: 'Sekolah',
          sekolahId: matchedSchool.id,
          cabangId: matchedSchool.cabangId || 'cabang-klaten-kota',
          createdAt: new Date().toISOString(),
          isActive: true,
          avatarUrl: getSchoolLogo(matchedSchool.logoUrl),
        };
        setCurrentUser(sUser);
        setIsLoading(false);
        return true;
      }

      throw new Error('Username atau kata sandi tidak valid. Pastikan memilih tab yang sesuai.');
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
