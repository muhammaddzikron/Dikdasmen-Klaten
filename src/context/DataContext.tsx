import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandler';
import {
  Cabang,
  Sekolah,
  Guru,
  Tendik,
  KepalaSekolah,
  Siswa,
  SkDocument,
  MutasiRecord,
  NotificationItem,
  LogAktivitas,
  SystemSetting,
  CapabilityCategory,
} from '../types';
import {
  addRecord,
  batchAddRecords,
  updateRecord,
  softDeleteRecord,
  restoreRecord,
  hardDeleteRecord,
  logActivity,
  createNotification,
  seedInitialData,
  syncMasterSekolahKlaten,
  getStaticFallbackData,
} from '../lib/firestoreService';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface DataContextType {
  // Collections
  cabangList: Cabang[];
  sekolahList: Sekolah[];
  guruList: Guru[];
  tendikList: Tendik[];
  kepalaSekolahList: KepalaSekolah[];
  siswaList: Siswa[];
  skGuruList: SkDocument[];
  skTendikList: SkDocument[];
  skKepalaSekolahList: SkDocument[];
  allSkList: SkDocument[];
  mutasiList: MutasiRecord[];
  notifikasiList: NotificationItem[];
  logList: LogAktivitas[];
  settingsList: SystemSetting[];

  // Filtered views based on RBAC & Active School selector
  filteredSekolahList: Sekolah[];
  filteredGuruList: Guru[];
  filteredTendikList: Tendik[];
  filteredKepalaSekolahList: KepalaSekolah[];
  filteredSiswaList: Siswa[];
  filteredSkList: SkDocument[];
  filteredMutasiList: MutasiRecord[];

  // All active (non-deleted) schools sorted by Cabang + Alphabetical
  activeSekolahList: Sekolah[];

  // Global School & Branch Filter
  selectedCabangId: string;
  setSelectedCabangId: (id: string) => void;
  selectedSekolahId: string;
  setSelectedSekolahId: (id: string) => void;

  // Active School Object for School Dashboard
  activeSekolah: Sekolah | null;

  // Quota & Offline state
  isQuotaExceeded: boolean;

  // CRUD Operations
  addSekolah: (data: Omit<Sekolah, 'id'>) => Promise<string>;
  updateSekolah: (id: string, data: Partial<Sekolah>) => Promise<void>;
  deleteSekolah: (id: string, isPermanent?: boolean) => Promise<void>;
  restoreSekolah: (id: string) => Promise<void>;

  addCabang: (data: Omit<Cabang, 'id'>) => Promise<string>;
  updateCabang: (id: string, data: Partial<Cabang>) => Promise<void>;
  deleteCabang: (id: string, isPermanent?: boolean) => Promise<void>;
  restoreCabang: (id: string) => Promise<void>;
  importCabangBatch: (items: Omit<Cabang, 'id'>[]) => Promise<number>;

  addGuru: (data: Omit<Guru, 'id'>) => Promise<string>;
  updateGuru: (id: string, data: Partial<Guru>) => Promise<void>;
  deleteGuru: (id: string, isPermanent?: boolean) => Promise<void>;
  restoreGuru: (id: string) => Promise<void>;
  importGuruBatch: (items: Omit<Guru, 'id'>[]) => Promise<number>;

  addTendik: (data: Omit<Tendik, 'id'>) => Promise<string>;
  updateTendik: (id: string, data: Partial<Tendik>) => Promise<void>;
  deleteTendik: (id: string, isPermanent?: boolean) => Promise<void>;
  restoreTendik: (id: string) => Promise<void>;
  importTendikBatch: (items: Omit<Tendik, 'id'>[]) => Promise<number>;

  addKepalaSekolah: (data: Omit<KepalaSekolah, 'id'>) => Promise<string>;
  updateKepalaSekolah: (id: string, data: Partial<KepalaSekolah>) => Promise<void>;
  deleteKepalaSekolah: (id: string, isPermanent?: boolean) => Promise<void>;
  restoreKepalaSekolah: (id: string) => Promise<void>;

  addSiswa: (data: Omit<Siswa, 'id'>) => Promise<string>;
  updateSiswa: (id: string, data: Partial<Siswa>) => Promise<void>;
  deleteSiswa: (id: string, isPermanent?: boolean) => Promise<void>;
  restoreSiswa: (id: string) => Promise<void>;
  importSiswaBatch: (items: Omit<Siswa, 'id'>[]) => Promise<number>;

  submitSk: (data: Omit<SkDocument, 'id'>) => Promise<string>;
  addSk: (data: any) => Promise<string>;
  updateSk: (id: string, data: Partial<SkDocument>, collectionName?: string) => Promise<void>;
  deleteSk: (id: string, collectionNameOrPermanent?: string | boolean, isPermanent?: boolean) => Promise<void>;

  submitMutasi: (data: Omit<MutasiRecord, 'id' | 'createdAt'>) => Promise<void>;
  addMutasi: (data: any) => Promise<void>;
  updateMutasi: (id: string, data: any) => Promise<void>;
  updateMutasiStatus: (id: string, status: 'Disetujui' | 'Ditolak') => Promise<void>;

  restoreData: (collectionName: string, id: string) => Promise<void>;
  permanentDelete: (collectionName: string, id: string) => Promise<void>;

  markNotifAsRead: (id: string) => Promise<void>;
  seedDatabase: () => Promise<void>;
  syncMasterSekolah: () => Promise<void>;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [sekolahList, setSekolahList] = useState<Sekolah[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [tendikList, setTendikList] = useState<Tendik[]>([]);
  const [kepalaSekolahList, setKepalaSekolahList] = useState<KepalaSekolah[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [skGuruList, setSkGuruList] = useState<SkDocument[]>([]);
  const [skTendikList, setSkTendikList] = useState<SkDocument[]>([]);
  const [skKepalaSekolahList, setSkKepalaSekolahList] = useState<SkDocument[]>([]);
  const [mutasiList, setMutasiList] = useState<MutasiRecord[]>([]);
  const [notifikasiList, setNotifikasiList] = useState<NotificationItem[]>([]);
  const [logList, setLogList] = useState<LogAktivitas[]>([]);
  const [settingsList, setSettingsList] = useState<SystemSetting[]>([]);

  const [selectedCabangId, setSelectedCabangId] = useState<string>('ALL');
  const [selectedSekolahId, setSelectedSekolahId] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Hydrate with static fallback data when quota limit or read error occurs
  const applyFallbackData = useCallback(() => {
    const fallback = getStaticFallbackData();
    setCabangList(fallback.cabangList);
    setSekolahList(fallback.sekolahList);
    setGuruList(fallback.guruList);
    setTendikList(fallback.tendikList);
    setKepalaSekolahList(fallback.kepalaSekolahList);
    setSiswaList(fallback.siswaList);
    setSkGuruList(fallback.skGuruList);
    setSkTendikList(fallback.skTendikList);
    setSkKepalaSekolahList(fallback.skKepalaSekolahList);
    setMutasiList(fallback.mutasiList);
    setNotifikasiList(fallback.notifikasiList);
    setLogList(fallback.logList);
    setSettingsList(fallback.settingsList);
    setIsLoading(false);
  }, []);

  // Listen to Firestore in Real-Time
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    try {
      const subscribeCollection = <T,>(name: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
        const colRef = collection(db, name);
        const unsub = onSnapshot(
          colRef,
          (snapshot) => {
            const items = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as T[];
            setter(items);
            setIsLoading(false);
          },
          (error) => {
            const errStr = error instanceof Error ? error.message : String(error);
            if (
              errStr.includes('Quota exceeded') ||
              errStr.includes('Quota limit exceeded') ||
              errStr.includes('RESOURCE_EXHAUSTED') ||
              errStr.includes('quota')
            ) {
              setIsQuotaExceeded(true);
              applyFallbackData();
            }
            try {
              handleFirestoreError(error, OperationType.GET, name);
            } catch (loggedErr) {
              // Expected error logging from handleFirestoreError
            }
          }
        );
        unsubs.push(unsub);
      };

      subscribeCollection<Cabang>('cabang', setCabangList);
      subscribeCollection<Sekolah>('sekolah', setSekolahList);
      subscribeCollection<Guru>('guru', setGuruList);
      subscribeCollection<Tendik>('tendik', setTendikList);
      subscribeCollection<KepalaSekolah>('kepalaSekolah', setKepalaSekolahList);
      subscribeCollection<Siswa>('siswa', setSiswaList);
      subscribeCollection<SkDocument>('skGuru', setSkGuruList);
      subscribeCollection<SkDocument>('skTendik', setSkTendikList);
      subscribeCollection<SkDocument>('skKepalaSekolah', setSkKepalaSekolahList);
      subscribeCollection<MutasiRecord>('mutasi', setMutasiList);
      subscribeCollection<NotificationItem>('notifikasi', setNotifikasiList);
      subscribeCollection<LogAktivitas>('logAktivitas', setLogList);
      subscribeCollection<SystemSetting>('settings', setSettingsList);
    } catch (err) {
      console.warn('Real-time subscription notice:', err);
      setIsLoading(false);
      applyFallbackData();
    }

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [applyFallbackData]);

  // Auto seed if completely blank after initial load (only when not in quota limit)
  useEffect(() => {
    if (isQuotaExceeded) return;
    const timer = setTimeout(async () => {
      if (!isLoading && sekolahList.length === 0) {
        console.log('Database appears empty, initiating automatic initial seed...');
        try {
          await seedInitialData();
          showToast('Data awal Dikdasmen berhasil diinisialisasi otomatis ke Cloud Firestore!', 'info');
        } catch (e) {
          applyFallbackData();
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isLoading, isQuotaExceeded, sekolahList.length, showToast, applyFallbackData]);

  // Combine all SKs
  const allSkList = useMemo(() => {
    return [...skGuruList, ...skTendikList, ...skKepalaSekolahList].sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );
  }, [skGuruList, skTendikList, skKepalaSekolahList]);

  // Helper for computing categoryCapability based on student count
  const computeCapabilityCategory = (studentCount: number): CapabilityCategory => {
    if (studentCount < 100) return 'UGD';
    if (studentCount <= 400) return 'RAWAT INAP';
    if (studentCount <= 600) return 'RAWAT JALAN';
    return 'SEHAT';
  };

  // RBAC Filtered School List
  const filteredSekolahList = useMemo(() => {
    if (!currentUser) return [];

    let list = sekolahList.filter((s) => !s.isDeleted);

    if (currentUser.role === 'Sekolah') {
      const targetSchoolId =
        selectedSekolahId !== 'ALL'
          ? selectedSekolahId
          : currentUser.sekolahId || (list[0] ? list[0].id : '');
      const matched = list.filter((s) => s.id === targetSchoolId);
      list = matched.length > 0 ? matched : (list[0] ? [list[0]] : []);
    } else if (currentUser.role === 'Cabang') {
      const targetCabangId =
        selectedCabangId !== 'ALL'
          ? selectedCabangId
          : currentUser.cabangId || (cabangList[0] ? cabangList[0].id : '');
      list = list.filter((s) => s.cabangId === targetCabangId);
      if (selectedSekolahId !== 'ALL') {
        list = list.filter((s) => s.id === selectedSekolahId);
      }
    } else {
      // Super Admin or Admin
      if (selectedCabangId !== 'ALL') {
        list = list.filter((s) => s.cabangId === selectedCabangId);
      }
      if (selectedSekolahId !== 'ALL') {
        list = list.filter((s) => s.id === selectedSekolahId);
      }
    }

    const cabangMap = new Map(cabangList.map((c) => [c.id, c.name]));

    return list.sort((a, b) => {
      const cabangA = cabangMap.get(a.cabangId) || a.cabangId || '';
      const cabangB = cabangMap.get(b.cabangId) || b.cabangId || '';
      const compareCabang = cabangA.localeCompare(cabangB, 'id', { sensitivity: 'base' });
      if (compareCabang !== 0) {
        return compareCabang;
      }
      return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
    });
  }, [currentUser, sekolahList, cabangList, selectedCabangId, selectedSekolahId]);

  // All active (non-deleted) schools sorted by Cabang + Alphabetical A-Z
  const activeSekolahList = useMemo(() => {
    const list = sekolahList.filter((s) => !s.isDeleted);
    const cabangMap = new Map(cabangList.map((c) => [c.id, c.name]));
    return list.sort((a, b) => {
      const cabangA = cabangMap.get(a.cabangId) || a.cabangId || '';
      const cabangB = cabangMap.get(b.cabangId) || b.cabangId || '';
      const compareCabang = cabangA.localeCompare(cabangB, 'id', { sensitivity: 'base' });
      if (compareCabang !== 0) {
        return compareCabang;
      }
      return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
    });
  }, [sekolahList, cabangList]);

  const accessibleSchoolIds = useMemo(() => {
    return new Set((filteredSekolahList || []).map((s) => s.id));
  }, [filteredSekolahList]);

  // Filtered Persons & SKs
  const filteredGuruList = useMemo(() => {
    return (guruList || []).filter((g) => accessibleSchoolIds.has(g.schoolId));
  }, [guruList, accessibleSchoolIds]);

  const filteredTendikList = useMemo(() => {
    return (tendikList || []).filter((t) => accessibleSchoolIds.has(t.schoolId));
  }, [tendikList, accessibleSchoolIds]);

  const filteredKepalaSekolahList = useMemo(() => {
    return (kepalaSekolahList || []).filter((ks) => accessibleSchoolIds.has(ks.schoolId));
  }, [kepalaSekolahList, accessibleSchoolIds]);

  const filteredSiswaList = useMemo(() => {
    return (siswaList || []).filter((s) => accessibleSchoolIds.has(s.schoolId));
  }, [siswaList, accessibleSchoolIds]);

  const filteredSkList = useMemo(() => {
    return (allSkList || []).filter((sk) => accessibleSchoolIds.has(sk.schoolId));
  }, [allSkList, accessibleSchoolIds]);

  const filteredMutasiList = useMemo(() => {
    return (mutasiList || []).filter(
      (m) =>
        accessibleSchoolIds.has(m.fromSchoolId) ||
        accessibleSchoolIds.has(m.toSchoolId) ||
        !m.fromSchoolId
    );
  }, [mutasiList, accessibleSchoolIds]);

  // Active School for Single School Profile mode
  const activeSekolah = useMemo(() => {
    const nonDeleted = sekolahList.filter((s) => !s.isDeleted);
    if (nonDeleted.length === 0) return null;

    if (currentUser?.role === 'Sekolah') {
      if (selectedSekolahId !== 'ALL') {
        const found = nonDeleted.find((s) => s.id === selectedSekolahId);
        if (found) return found;
      }
      const userSchoolId = currentUser.sekolahId;
      if (userSchoolId) {
        const found = nonDeleted.find((s) => s.id === userSchoolId);
        if (found) return found;
      }
      return nonDeleted[0] || null;
    }

    if (selectedSekolahId !== 'ALL') {
      return nonDeleted.find((s) => s.id === selectedSekolahId) || nonDeleted[0] || null;
    }

    return filteredSekolahList[0] || nonDeleted[0] || null;
  }, [currentUser, sekolahList, selectedSekolahId, filteredSekolahList]);

  // Operations: Sekolah
  const addSekolah = async (data: Omit<Sekolah, 'id'>) => {
    const category = computeCapabilityCategory(data.jumlahKeseluruhanSiswa || 0);
    const id = await addRecord('sekolah', { ...data, categoryCapability: category, isDeleted: false });
    await logActivity(currentUser?.email || 'System', 'TAMBAH_SEKOLAH', `Menambahkan sekolah baru: ${data.name} (NPSN: ${data.npsn})`, currentUser?.name, currentUser?.role);
    showToast(`Sekolah ${data.name} berhasil ditambahkan!`, 'success');
    return id;
  };

  const updateSekolah = async (id: string, data: Partial<Sekolah>) => {
    const updatePayload: Partial<Sekolah> = { ...data };
    if (data.jumlahKeseluruhanSiswa !== undefined) {
      updatePayload.categoryCapability = computeCapabilityCategory(data.jumlahKeseluruhanSiswa);
    }
    await updateRecord('sekolah', id, updatePayload);
    await logActivity(currentUser?.email || 'System', 'UPDATE_SEKOLAH', `Memperbarui data sekolah ID: ${id}`, currentUser?.name, currentUser?.role);
    showToast('Data sekolah berhasil diperbarui!', 'success');
  };

  const deleteSekolah = async (id: string, isPermanent: boolean = false) => {
    if (isPermanent) {
      await hardDeleteRecord('sekolah', id);
      showToast('Sekolah berhasil dihapus permanen!', 'warning');
    } else {
      await softDeleteRecord('sekolah', id);
      showToast('Sekolah dipindahkan ke Recycle Bin.', 'info');
    }
    await logActivity(currentUser?.email || 'System', 'HAPUS_SEKOLAH', `Menghapus sekolah ID: ${id} (${isPermanent ? 'Permanen' : 'Soft-delete'})`, currentUser?.name, currentUser?.role);
  };

  const restoreSekolah = async (id: string) => {
    await restoreRecord('sekolah', id);
    await logActivity(currentUser?.email || 'System', 'RESTORE_SEKOLAH', `Memulihkan data sekolah ID: ${id}`, currentUser?.name, currentUser?.role);
    showToast('Data sekolah berhasil dipulihkan!', 'success');
  };

  // Operations: Cabang
  const addCabang = async (data: Omit<Cabang, 'id'>) => {
    const id = await addRecord('cabang', { ...data, isDeleted: false });
    await logActivity(currentUser?.email || 'System', 'TAMBAH_CABANG', `Menambahkan Cabang/PCM: ${data.name} (${data.code})`, currentUser?.name, currentUser?.role);
    showToast(`Cabang ${data.name} berhasil didaftarkan!`, 'success');
    return id;
  };

  const updateCabang = async (id: string, data: Partial<Cabang>) => {
    await updateRecord('cabang', id, data);
    await logActivity(currentUser?.email || 'System', 'UPDATE_CABANG', `Memperbarui data Cabang ID: ${id}`, currentUser?.name, currentUser?.role);
    showToast('Data Cabang berhasil diperbarui!', 'success');
  };

  const deleteCabang = async (id: string, isPermanent: boolean = false) => {
    if (isPermanent) {
      await hardDeleteRecord('cabang', id);
      showToast('Cabang dihapus permanen!', 'warning');
    } else {
      await softDeleteRecord('cabang', id);
      showToast('Cabang dipindahkan ke Recycle Bin.', 'info');
    }
    await logActivity(currentUser?.email || 'System', 'HAPUS_CABANG', `Menghapus cabang ID: ${id}`, currentUser?.name, currentUser?.role);
  };

  const restoreCabang = async (id: string) => {
    await restoreRecord('cabang', id);
    showToast('Data Cabang berhasil dipulihkan!', 'success');
  };

  const importCabangBatch = async (items: Omit<Cabang, 'id'>[]): Promise<number> => {
    if (!items || items.length === 0) return 0;
    const ids = await batchAddRecords('cabang', items);
    await logActivity(
      currentUser?.email || 'System',
      'IMPORT_EXCEL_CABANG',
      `Import massal ${ids.length} data Cabang/PCM via Excel/CSV`,
      currentUser?.name,
      currentUser?.role
    );
    showToast(`Berhasil mengimpor ${ids.length} data Cabang (PCM)!`, 'success');
    return ids.length;
  };

  // Operations: Guru
  const addGuru = async (data: Omit<Guru, 'id'>) => {
    const id = await addRecord('guru', { ...data, isDeleted: false });
    await logActivity(currentUser?.email || 'System', 'TAMBAH_GURU', `Menambahkan guru: ${data.name} (${data.subject})`, currentUser?.name, currentUser?.role);
    showToast(`Data Guru ${data.name} berhasil ditambahkan!`, 'success');
    return id;
  };

  const updateGuru = async (id: string, data: Partial<Guru>) => {
    await updateRecord('guru', id, data);
    await logActivity(currentUser?.email || 'System', 'UPDATE_GURU', `Memperbarui data guru ID: ${id}`, currentUser?.name, currentUser?.role);
    showToast('Data Guru berhasil diperbarui!', 'success');
  };

  const deleteGuru = async (id: string, isPermanent: boolean = false) => {
    if (isPermanent) {
      await hardDeleteRecord('guru', id);
      showToast('Data Guru dihapus permanen!', 'warning');
    } else {
      await softDeleteRecord('guru', id);
      showToast('Data Guru dipindahkan ke Recycle Bin.', 'info');
    }
  };

  const restoreGuru = async (id: string) => {
    await restoreRecord('guru', id);
    showToast('Data Guru berhasil dipulihkan!', 'success');
  };

  const importGuruBatch = async (items: Omit<Guru, 'id'>[]): Promise<number> => {
    if (!items || items.length === 0) return 0;
    const ids = await batchAddRecords('guru', items);
    await logActivity(
      currentUser?.email || 'System',
      'IMPORT_EXCEL_GURU',
      `Import massal ${ids.length} data Guru via Excel`,
      currentUser?.name,
      currentUser?.role
    );
    showToast(`Berhasil mengimpor ${ids.length} data Guru dari Excel!`, 'success');
    return ids.length;
  };

  // Operations: Tendik
  const addTendik = async (data: Omit<Tendik, 'id'>) => {
    const id = await addRecord('tendik', { ...data, isDeleted: false });
    await logActivity(currentUser?.email || 'System', 'TAMBAH_TENDIK', `Menambahkan tendik: ${data.name} (${data.position})`, currentUser?.name, currentUser?.role);
    showToast(`Data Tendik ${data.name} berhasil ditambahkan!`, 'success');
    return id;
  };

  const updateTendik = async (id: string, data: Partial<Tendik>) => {
    await updateRecord('tendik', id, data);
    showToast('Data Tendik berhasil diperbarui!', 'success');
  };

  const deleteTendik = async (id: string, isPermanent: boolean = false) => {
    if (isPermanent) {
      await hardDeleteRecord('tendik', id);
      showToast('Data Tendik dihapus permanen!', 'warning');
    } else {
      await softDeleteRecord('tendik', id);
      showToast('Data Tendik dipindahkan ke Recycle Bin.', 'info');
    }
  };

  const restoreTendik = async (id: string) => {
    await restoreRecord('tendik', id);
    showToast('Data Tendik berhasil dipulihkan!', 'success');
  };

  const importTendikBatch = async (items: Omit<Tendik, 'id'>[]): Promise<number> => {
    if (!items || items.length === 0) return 0;
    const ids = await batchAddRecords('tendik', items);
    await logActivity(
      currentUser?.email || 'System',
      'IMPORT_EXCEL_TENDIK',
      `Import massal ${ids.length} data Tenaga Kependidikan via Excel`,
      currentUser?.name,
      currentUser?.role
    );
    showToast(`Berhasil mengimpor ${ids.length} data Tendik dari Excel!`, 'success');
    return ids.length;
  };

  // Operations: Kepala Sekolah
  const addKepalaSekolah = async (data: Omit<KepalaSekolah, 'id'>) => {
    const id = await addRecord('kepalaSekolah', { ...data, isDeleted: false });
    await logActivity(currentUser?.email || 'System', 'TAMBAH_KS', `Menambahkan Kepala Sekolah: ${data.name}`, currentUser?.name, currentUser?.role);
    showToast(`Kepala Sekolah ${data.name} berhasil didaftarkan!`, 'success');
    return id;
  };

  const updateKepalaSekolah = async (id: string, data: Partial<KepalaSekolah>) => {
    await updateRecord('kepalaSekolah', id, data);
    showToast('Data Kepala Sekolah berhasil diperbarui!', 'success');
  };

  const deleteKepalaSekolah = async (id: string, isPermanent: boolean = false) => {
    if (isPermanent) {
      await hardDeleteRecord('kepalaSekolah', id);
      showToast('Data Kepala Sekolah dihapus permanen!', 'warning');
    } else {
      await softDeleteRecord('kepalaSekolah', id);
      showToast('Data Kepala Sekolah dipindahkan ke Recycle Bin.', 'info');
    }
  };

  const restoreKepalaSekolah = async (id: string) => {
    await restoreRecord('kepalaSekolah', id);
    showToast('Data Kepala Sekolah berhasil dipulihkan!', 'success');
  };

  // Operations: Siswa
  const addSiswa = async (data: Omit<Siswa, 'id'>) => {
    const id = await addRecord('siswa', { ...data, isDeleted: false });
    showToast(`Siswa ${data.name} berhasil ditambahkan!`, 'success');
    return id;
  };

  const updateSiswa = async (id: string, data: Partial<Siswa>) => {
    await updateRecord('siswa', id, data);
    showToast('Data Siswa berhasil diperbarui!', 'success');
  };

  const deleteSiswa = async (id: string, isPermanent: boolean = false) => {
    if (isPermanent) {
      await hardDeleteRecord('siswa', id);
      showToast('Data Siswa dihapus permanen!', 'warning');
    } else {
      await softDeleteRecord('siswa', id);
      showToast('Data Siswa dipindahkan ke Recycle Bin.', 'info');
    }
  };

  const restoreSiswa = async (id: string) => {
    await restoreRecord('siswa', id);
    showToast('Data Siswa berhasil dipulihkan!', 'success');
  };

  const importSiswaBatch = async (items: Omit<Siswa, 'id'>[]): Promise<number> => {
    if (!items || items.length === 0) return 0;
    const ids = await batchAddRecords('siswa', items);
    await logActivity(
      currentUser?.email || 'System',
      'IMPORT_EXCEL_SISWA',
      `Import massal ${ids.length} data Peserta Didik (Siswa) via Excel`,
      currentUser?.name,
      currentUser?.role
    );
    showToast(`Berhasil mengimpor ${ids.length} data Siswa dari Excel!`, 'success');
    return ids.length;
  };

  // Operations: SK (Surat Keputusan)
  const submitSk = async (data: any) => {
    const colName = data.targetType === 'Guru' || data.type === 'SK Guru' ? 'skGuru' : data.targetType === 'Tendik' || data.type === 'SK Tendik' ? 'skTendik' : 'skKepalaSekolah';
    const id = await addRecord(colName, { ...data, isDeleted: false });
    await logActivity(currentUser?.email || 'System', 'PENGAJUAN_SK', `Pengajuan SK: ${data.title}`, currentUser?.name, currentUser?.role);
    await createNotification({
      title: 'Pengajuan SK Baru Masuk',
      message: `Terdapat pengajuan SK baru (${data.title}) yang membutuhkan verifikasi Admin Dikdasmen.`,
      type: 'info',
      targetRole: 'Admin',
    });
    showToast('Pengajuan SK berhasil dikirim dan tersimpan di Cloud Firestore!', 'success');
    return id;
  };

  const addSk = async (data: any) => {
    return submitSk(data);
  };

  const updateSk = async (id: string, data: Partial<SkDocument>, collectionName?: string) => {
    const targetCol = collectionName || (skGuruList.some(s => s.id === id) ? 'skGuru' : skTendikList.some(s => s.id === id) ? 'skTendik' : 'skKepalaSekolah');
    await updateRecord(targetCol, id, data);
    await logActivity(currentUser?.email || 'System', 'UPDATE_SK', `Status/data SK ID ${id} diperbarui: ${data.status || 'Data Update'}`, currentUser?.name, currentUser?.role);
    showToast('Data SK berhasil diperbarui!', 'success');
  };

  const deleteSk = async (id: string, collectionNameOrPermanent?: string | boolean, isPermanent?: boolean) => {
    const perm = typeof collectionNameOrPermanent === 'boolean' ? collectionNameOrPermanent : (isPermanent || false);
    const colName = typeof collectionNameOrPermanent === 'string' ? collectionNameOrPermanent : (skGuruList.some(s => s.id === id) ? 'skGuru' : skTendikList.some(s => s.id === id) ? 'skTendik' : 'skKepalaSekolah');

    if (perm) {
      await hardDeleteRecord(colName, id);
      showToast('Dokumen SK dihapus permanen!', 'warning');
    } else {
      await softDeleteRecord(colName, id);
      showToast('Dokumen SK dipindahkan ke Recycle Bin.', 'info');
    }
  };

  // Operations: Mutasi
  const submitMutasi = async (data: any) => {
    const colRef = collection(db, 'mutasi');
    const mutationType = data.type || data.personelType || 'Guru';
    const targetPersonId = data.personId || data.targetId || '';
    const toSchId = data.toSchoolId || '';

    await addRecord('mutasi', {
      ...data,
      status: 'Disetujui',
      createdAt: new Date().toISOString(),
    });

    // Automatically update schoolId on the target entity
    if (targetPersonId && toSchId) {
      if (mutationType === 'Guru') {
        await updateRecord('guru', targetPersonId, { schoolId: toSchId });
      } else if (mutationType === 'Tendik') {
        await updateRecord('tendik', targetPersonId, { schoolId: toSchId });
      } else if (mutationType === 'KepalaSekolah' || mutationType === 'Kepala Sekolah') {
        await updateRecord('kepalaSekolah', targetPersonId, { schoolId: toSchId });
      } else if (mutationType === 'Siswa') {
        await updateRecord('siswa', targetPersonId, { schoolId: toSchId });
      }
    }

    await logActivity(
      currentUser?.email || 'System',
      'MUTASI_PERSONEL',
      `Mutasi ${mutationType} ${data.personName || data.personelName} ke sekolah tujuan`,
      currentUser?.name,
      currentUser?.role
    );

    showToast(`Mutasi ${data.personName || data.personelName || 'personel'} berhasil diproses dan data sekolah otomatis diperbarui!`, 'success');
  };

  const addMutasi = async (data: any) => {
    await submitMutasi(data);
  };

  const updateMutasi = async (id: string, data: any) => {
    await updateRecord('mutasi', id, data);
    showToast('Data mutasi berhasil diperbarui!', 'success');
  };

  const restoreData = async (collectionName: string, id: string) => {
    await restoreRecord(collectionName, id);
    showToast(`Data pada koleksi ${collectionName} berhasil dipulihkan!`, 'success');
  };

  const permanentDelete = async (collectionName: string, id: string) => {
    await hardDeleteRecord(collectionName, id);
    showToast(`Data pada koleksi ${collectionName} berhasil dihapus permanen!`, 'warning');
  };

  const addToast = (message: string, type?: 'success' | 'error' | 'info' | 'warning') => {
    showToast(message, type);
  };

  const updateMutasiStatus = async (id: string, status: 'Disetujui' | 'Ditolak') => {
    await updateRecord('mutasi', id, { status, approvedBy: currentUser?.name || 'Admin Dikdasmen' });
    showToast(`Status mutasi diubah menjadi ${status}.`, 'info');
  };

  const markNotifAsRead = async (id: string) => {
    await updateRecord('notifikasi', id, { isRead: true });
  };

  const seedDatabase = async () => {
    setIsLoading(true);
    const res = await seedInitialData();
    setIsLoading(false);
    if (res) {
      showToast('Database berhasil diisi ulang dengan data master Dikdasmen lengkap!', 'success');
    } else {
      showToast('Gagal mengisi data seed.', 'error');
    }
  };

  const syncMasterSekolah = async () => {
    setIsLoading(true);
    const res = await syncMasterSekolahKlaten();
    setIsLoading(false);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <DataContext.Provider
      value={{
        cabangList,
        sekolahList,
        guruList,
        tendikList,
        kepalaSekolahList,
        siswaList,
        skGuruList,
        skTendikList,
        skKepalaSekolahList,
        allSkList,
        mutasiList,
        notifikasiList,
        logList,
        settingsList,
        activeSekolahList,
        filteredSekolahList,
        filteredGuruList,
        filteredTendikList,
        filteredKepalaSekolahList,
        filteredSiswaList,
        filteredSkList,
        filteredMutasiList,
        selectedCabangId,
        setSelectedCabangId,
        selectedSekolahId,
        setSelectedSekolahId,
        activeSekolah,
        addSekolah,
        updateSekolah,
        deleteSekolah,
        restoreSekolah,
        addCabang,
        updateCabang,
        deleteCabang,
        restoreCabang,
        importCabangBatch,
        addGuru,
        updateGuru,
        deleteGuru,
        restoreGuru,
        importGuruBatch,
        addTendik,
        updateTendik,
        deleteTendik,
        restoreTendik,
        importTendikBatch,
        addKepalaSekolah,
        updateKepalaSekolah,
        deleteKepalaSekolah,
        restoreKepalaSekolah,
        addSiswa,
        updateSiswa,
        deleteSiswa,
        restoreSiswa,
        importSiswaBatch,
        submitSk,
        addSk,
        updateSk,
        deleteSk,
        submitMutasi,
        addMutasi,
        updateMutasi,
        updateMutasiStatus,
        restoreData,
        permanentDelete,
        markNotifAsRead,
        seedDatabase,
        syncMasterSekolah,
        isQuotaExceeded,
        toasts,
        showToast,
        addToast,
        removeToast,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
