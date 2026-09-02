import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './errorHandler';
import {
  UserProfile,
  AdminPetugas,
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
  DEFAULT_SCHOOL_LOGO,
} from '../types';
import { MASTER_CABANG_KLATEN, getMasterCabangList } from '../data/masterCabangKlaten';
import { MASTER_SEKOLAH_KLATEN, getMasterSekolahList } from '../data/masterSekolahKlaten';
import { isPdmKlatenSchool } from '../utils/cabangMatcher';

// Generic CRUD functions
export async function addRecord<T extends object>(collectionName: string, data: T): Promise<string> {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
  }
}

export async function setRecord<T extends object>(collectionName: string, id: string, data: T): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, {
      ...data,
      createdAt: (data as any).createdAt || new Date().toISOString(),
      isDeleted: (data as any).isDeleted ?? false,
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${id}`);
  }
}

export async function updateRecord<T extends object>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
  }
}

export async function softDeleteRecord(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
  }
}

export async function restoreRecord(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      isDeleted: false,
      restoredAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
  }
}

export async function hardDeleteRecord(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

export async function batchAddRecords<T extends object>(collectionName: string, items: T[]): Promise<string[]> {
  if (!items || items.length === 0) return [];
  const ids: string[] = [];
  const chunkSize = 400; // Firebase batch write limit is 500
  try {
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const item of chunk) {
        const colRef = collection(db, collectionName);
        const newDocRef = doc(colRef);
        ids.push(newDocRef.id);
        batch.set(newDocRef, {
          ...item,
          createdAt: (item as any).createdAt || new Date().toISOString(),
          isDeleted: (item as any).isDeleted ?? false,
        });
      }
      await batch.commit();
    }
    return ids;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
    return ids;
  }
}

export async function getCollectionData<T>(collectionName: string): Promise<(T & { id: string })[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
  }
}

// Activity Logging
export async function logActivity(userEmail: string, action: string, details: string, userName?: string, userRole?: string): Promise<void> {
  try {
    const colRef = collection(db, 'logAktivitas');
    await addDoc(colRef, {
      userEmail,
      userName: userName || userEmail.split('@')[0],
      userRole: userRole || 'User',
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Logging activity silently skipped or errored:', err);
  }
}

// Notification Helper
export async function createNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
  try {
    const colRef = collection(db, 'notifikasi');
    await addDoc(colRef, {
      ...notif,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Notification create error:', err);
  }
}

// Sync or push all 26 Klaten Cabang / PCM master data to Firestore
export async function syncMasterCabangKlaten(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const existingSnap = await getDocs(collection(db, 'cabang'));
    const existingMap = new Map<string, any>();
    existingSnap.docs.forEach((d) => {
      const data = d.data();
      const nameKey = (data.name || '').toLowerCase().trim();
      const codeKey = (data.code || '').toLowerCase().trim();
      const usernameKey = (data.username || '').toLowerCase().trim();
      existingMap.set(d.id, d);
      if (nameKey) existingMap.set(nameKey, d);
      if (codeKey) existingMap.set(codeKey, d);
      if (usernameKey) existingMap.set(usernameKey, d);
    });

    const batch = writeBatch(db);
    let count = 0;

    for (const c of MASTER_CABANG_KLATEN) {
      const nameKey = (c.name || '').toLowerCase().trim();
      const codeKey = (c.code || '').toLowerCase().trim();
      const usernameKey = (c.username || '').toLowerCase().trim();
      const matchedDoc =
        (c.id && existingMap.get(c.id)) ||
        existingMap.get(nameKey) ||
        existingMap.get(codeKey) ||
        (usernameKey && existingMap.get(usernameKey));

      const targetId = matchedDoc ? matchedDoc.id : c.id || `cabang-${c.username}`;
      const docRef = doc(db, 'cabang', targetId);

      batch.set(
        docRef,
        {
          name: c.name,
          code: c.code,
          username: c.username,
          password: c.password,
          address: c.address,
          phone: c.phone,
          email: c.email,
          ketuaName: c.ketuaName,
          createdAt: c.createdAt || new Date().toISOString(),
          isDeleted: false,
        },
        { merge: true }
      );
      count++;
    }

    await batch.commit();

    return {
      success: true,
      message: `Berhasil menyinkronkan Data Master Cabang (PCM): ${count} data Majelis Cabang & PNF aktif.`,
      count,
    };
  } catch (err: any) {
    console.error('Error syncing master cabang:', err);
    return { success: false, message: err?.message || 'Gagal sinkron master cabang', count: 0 };
  }
}

// Seed Initial Comprehensive Demo Master Data
export async function seedInitialData(forceReload: boolean = false): Promise<boolean> {
  try {
    // 1. Cabang (PCM) - Using complete 26 PCM data (23 new + 3 existing Kota)
    const cabangData: Omit<Cabang, 'id'>[] = MASTER_CABANG_KLATEN.map((c) => ({
      name: c.name,
      code: c.code,
      username: c.username,
      password: c.password,
      address: c.address,
      phone: c.phone,
      email: c.email,
      ketuaName: c.ketuaName,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    }));

    // Check if cabang already exists in DB before adding
    const existingCabangSnap = await getDocs(collection(db, 'cabang'));
    const cabangIds: string[] = [];
    if (existingCabangSnap.docs.length > 0) {
      existingCabangSnap.docs.forEach((doc) => cabangIds.push(doc.id));
      // Also ensure any missing PCM is inserted
      await syncMasterCabangKlaten();
    } else {
      for (const c of MASTER_CABANG_KLATEN) {
        const targetId = c.id || `cabang-${c.username}`;
        const docRef = doc(db, 'cabang', targetId);
        await setDoc(docRef, {
          name: c.name,
          code: c.code,
          username: c.username,
          password: c.password,
          address: c.address,
          phone: c.phone,
          email: c.email,
          ketuaName: c.ketuaName,
          createdAt: new Date().toISOString(),
          isDeleted: false,
        });
        cabangIds.push(targetId);
      }
    }

    const cKota = cabangIds[0] || 'cabang-klaten-kota';

    // 2. Sekolah Master Data Klaten (Semua Sekolah & Madrasah se-Kabupaten Klaten)
    const schoolIds: string[] = [];
    const existingSekolahSnap = await getDocs(collection(db, 'sekolah'));
    if (existingSekolahSnap.docs.length === 0 || forceReload) {
      for (const s of MASTER_SEKOLAH_KLATEN) {
        const targetId = s.id || `sch-${s.npsn}`;
        const docRef = doc(db, 'sekolah', targetId);
        await setDoc(docRef, {
          name: s.name,
          npsn: s.npsn,
          username: s.username || s.npsn,
          password: s.password || 'sekolah123',
          cabangId: s.cabangId || cKota,
          address: s.address,
          status: s.status || 'Swasta',
          level: s.level,
          phone: s.phone,
          email: s.email,
          website: s.website,
          accreditation: s.accreditation || 'Unggul',
          categoryCapability: s.categoryCapability || 'SEHAT',
          skPendirianNumber: s.skPendirianNumber || '-',
          skIzinOperasional: s.skIzinOperasional || '-',
          jumlahKeseluruhanSiswa: s.jumlahKeseluruhanSiswa || 0,
          logoUrl: s.logoUrl || DEFAULT_SCHOOL_LOGO,
          bannerUrl: s.bannerUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
          vision: s.vision || 'Mewujudkan insan Islami, unggul dalam prestasi dan berakhlakul karimah.',
          mission: s.mission || 'Menyelenggarakan pendidikan holistik berbasis nilai Al-Islam Kemuhammadiyahan.',
          description: s.description || `${s.name} di bawah naungan Majelis Dikdasmen & PNF Klaten.`,
          isDeleted: false,
          createdAt: new Date().toISOString(),
        });
        schoolIds.push(targetId);
      }
    } else {
      existingSekolahSnap.docs.forEach((doc) => schoolIds.push(doc.id));
      await syncMasterSekolahKlaten();
    }

    // 3. Kepala Sekolah
    const kepalaSekolahData: Omit<KepalaSekolah, 'id'>[] = [
      {
        name: 'Drs. H. Herynugroho, M.Pd.',
        nip: '196805121994121002',
        nipm: 'M-19680512-001',
        nbm: '884920',
        schoolId: schoolIds[0],
        startDate: '2022-07-01',
        endDate: '2026-06-30',
        periodNumber: 1,
        status: 'Aktif',
        phone: '081227198899',
        email: 'herynugroho@dikdasmen.org',
        skNumber: '045/KEP/I.0/D/2022',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Naning Hidayati, S.Pd., M.Pd.',
        nip: '197411032000032001',
        nipm: 'M-19741103-014',
        nbm: '912304',
        schoolId: schoolIds[1],
        startDate: '2023-01-01',
        endDate: '2027-12-31',
        periodNumber: 1,
        status: 'Aktif',
        phone: '081392811440',
        email: 'naning.h@muchild.sch.id',
        skNumber: '012/KEP/I.0/D/2023',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Agung Rahmanto, S.H., M.Pd.',
        nip: '197008151998021003',
        nipm: 'M-19700815-098',
        nbm: '745612',
        schoolId: schoolIds[2],
        startDate: '2021-08-01',
        endDate: '2025-07-31',
        periodNumber: 2,
        status: 'Aktif',
        phone: '08112509812',
        email: 'agung.rahmanto@sdmuhsapen.sch.id',
        skNumber: '088/KEP/I.0/D/2021',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Drs. Supriyanto, M.Eng.',
        nip: '196504101990031005',
        nipm: 'M-19650410-044',
        nbm: '633819',
        schoolId: schoolIds[3],
        startDate: '2023-07-01',
        endDate: '2027-06-30',
        periodNumber: 1,
        status: 'Aktif',
        phone: '08122998314',
        email: 'supriyanto@smkmuh3yogya.sch.id',
        skNumber: '034/KEP/I.0/D/2023',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const ksIds: string[] = [];
    for (const ks of kepalaSekolahData) {
      const col = collection(db, 'kepalaSekolah');
      const d = await addDoc(col, ks);
      ksIds.push(d.id);
    }

    // 4. Guru (Pendidik)
    const guruData: Omit<Guru, 'id'>[] = [
      {
        name: 'Ahmad Fauzan, S.Pd., M.Si.',
        nip: '198204152008011012',
        nipm: 'M-19820415-081',
        nuptk: '8456760662200023',
        nbm: '1048821',
        schoolId: schoolIds[0],
        gender: 'Laki-laki',
        subject: 'Fisika & Robotika',
        status: 'GTY',
        education: 'S2 Pendidikan Fisika (UNY)',
        phone: '081328990145',
        email: 'ahmad.fauzan@smamuh1yogya.sch.id',
        address: 'Jl. Kaliurang KM 7, Sleman',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Siti Rahmawati, S.Pd.I., M.Pd.',
        nip: '198809202014022004',
        nipm: 'M-19880920-109',
        nuptk: '9948766668210034',
        nbm: '1190453',
        schoolId: schoolIds[0],
        gender: 'Perempuan',
        subject: 'Al-Islam & Kemuhammadiyahan (AIK)',
        status: 'GTY',
        education: 'S2 Magister Studi Islam (UII)',
        phone: '081298443120',
        email: 'siti.rahma@smamuh1yogya.sch.id',
        address: 'Wirobrajan, Yogyakarta',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Bambang Tri Atmojo, S.Kom.',
        nip: '199003112022031002',
        nipm: 'M-19900311-214',
        nuptk: '1245768670130089',
        nbm: '1289410',
        schoolId: schoolIds[1],
        gender: 'Laki-laki',
        subject: 'Informatika & Multimedia',
        status: 'GTY',
        education: 'S1 Teknik Informatika (UAD)',
        phone: '081744901233',
        email: 'bambang.tri@muchild.sch.id',
        address: 'Kotagede, Yogyakarta',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Dewi Lestari, S.Pd.',
        nuptk: '5538761663300092',
        nbm: '1340911',
        schoolId: schoolIds[2],
        gender: 'Perempuan',
        subject: 'Guru Kelas V Unggulan',
        status: 'GTY',
        education: 'S1 PGSD (Universitas Ahmad Dahlan)',
        phone: '085643198077',
        email: 'dewi.lestari@sdmuhsapen.sch.id',
        address: 'Banguntapan, Bantul',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Wahyu Hidayat, S.T., M.T.',
        nip: '198501092010011022',
        nipm: 'M-19850109-077',
        nuptk: '7729763665130045',
        nbm: '1102948',
        schoolId: schoolIds[3],
        gender: 'Laki-laki',
        subject: 'Teknik Otomotif Kendaraan Listrik',
        status: 'GTY',
        education: 'S2 Teknik Mesin Otomotif (UGM)',
        phone: '081226710499',
        email: 'wahyu.h@smkmuh3yogya.sch.id',
        address: 'Piyungan, Bantul',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Nurul Hidayah, S.Pd.I.',
        nbm: '1410293',
        schoolId: schoolIds[4],
        gender: 'Perempuan',
        subject: 'Bahasa Arab & Tahfidz',
        status: 'GTT',
        education: 'S1 Pendidikan Bahasa Arab (UIN Sunan Kalijaga)',
        phone: '087839110022',
        email: 'nurul.h@mimdanurejan.sch.id',
        address: 'Gondokusuman, Yogyakarta',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const guruIds: string[] = [];
    for (const g of guruData) {
      const col = collection(db, 'guru');
      const d = await addDoc(col, g);
      guruIds.push(d.id);
    }

    // 5. Tendik (Tenaga Kependidikan)
    const tendikData: Omit<Tendik, 'id'>[] = [
      {
        name: 'Tri Wahyudi, S.E.',
        nbm: '1198421',
        schoolId: schoolIds[0],
        gender: 'Laki-laki',
        position: 'Kepala Tata Usaha',
        status: 'KTY',
        education: 'S1 Manajemen Keuangan (UMY)',
        phone: '081392019922',
        email: 'tri.wahyudi@smamuh1yogya.sch.id',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Rina Maryati, A.Md.',
        nbm: '1240981',
        schoolId: schoolIds[0],
        gender: 'Perempuan',
        position: 'Pustakawan Digital',
        status: 'KTY',
        education: 'D3 Ilmu Perpustakaan',
        phone: '085729114002',
        email: 'rina.maryati@smamuh1yogya.sch.id',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Eko Prasetyo, S.Kom.',
        nbm: '1309812',
        schoolId: schoolIds[1],
        gender: 'Laki-laki',
        position: 'Operator Dapodik & IT Admin',
        status: 'KTY',
        education: 'S1 Sistem Informasi',
        phone: '081804192834',
        email: 'eko.prasetyo@muchild.sch.id',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Sri Handayani',
        nbm: '1389021',
        schoolId: schoolIds[2],
        gender: 'Perempuan',
        position: 'Bendahara Sekolah',
        status: 'KTY',
        education: 'D3 Akuntansi',
        phone: '081227189004',
        email: 'sri.handayani@sdmuhsapen.sch.id',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const tendikIds: string[] = [];
    for (const t of tendikData) {
      const col = collection(db, 'tendik');
      const d = await addDoc(col, t);
      tendikIds.push(d.id);
    }

    // 6. Siswa
    const siswaData: Omit<Siswa, 'id'>[] = [
      {
        name: 'Muhammad Raihan Pratama',
        nisn: '0071239845',
        schoolId: schoolIds[0],
        gender: 'Laki-laki',
        class: 'XII MIPA 1 (Olimpiade)',
        address: 'Jl. Veteran No. 15, Umbulharjo',
        status: 'Aktif',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Aisyah Zahra Khairunnisa',
        nisn: '0078921456',
        schoolId: schoolIds[0],
        gender: 'Perempuan',
        class: 'XI MIPA 2 (Bilingual)',
        address: 'Jl. Magelang KM 5, Mlati',
        status: 'Aktif',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Fadhil Ihsan Ramadhan',
        nisn: '0091245789',
        schoolId: schoolIds[1],
        gender: 'Laki-laki',
        class: 'VIII Tahfidz A',
        address: 'Jl. Mondorakan, Kotagede',
        status: 'Aktif',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Nabila Syifa Althafunnisa',
        nisn: '0129845612',
        schoolId: schoolIds[2],
        gender: 'Perempuan',
        class: 'IV Saintek Al-Khawarizmi',
        address: 'Jl. Kusumanegara No. 40',
        status: 'Aktif',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Bagas Aditya Nugraha',
        nisn: '0067823901',
        schoolId: schoolIds[3],
        gender: 'Laki-laki',
        class: 'XII Teknik Otomotif 1',
        address: 'Jl. Imogiri Timur KM 8',
        status: 'Aktif',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const s of siswaData) {
      const col = collection(db, 'siswa');
      await addDoc(col, s);
    }

    // 7. SK Documents (SK Guru, SK Tendik, SK KS)
    const skData: Omit<SkDocument, 'id'>[] = [
      {
        skNumber: '045/KEP/I.0/D/2022',
        skDate: '2022-07-01',
        skEndDate: '2026-06-30',
        title: 'Pengangkatan Kepala Sekolah SMA Muhammadiyah 1 Yogyakarta Periode 2022-2026',
        targetId: ksIds[0] || 'ks-1',
        targetName: 'Drs. H. Herynugroho, M.Pd.',
        targetType: 'KepalaSekolah',
        schoolId: schoolIds[0],
        status: 'Terbit',
        submissionType: 'Baru',
        fileUrl: '',
        fileName: 'SK_KepalaSekolah_SMA_Muh_1_Yogya_2022_2026.pdf',
        verifiedBy: 'Majelis Dikdasmen Daerah',
        verifiedAt: '2022-07-05T09:00:00Z',
        createdAt: '2022-07-01T08:00:00Z',
        isDeleted: false,
      },
      {
        skNumber: '112/SK.GTY/DIKDASMEN/2024',
        skDate: '2024-01-02',
        skEndDate: '2026-12-31',
        title: 'Penetapan Guru Tetap Yayasan (GTY) Bidang Studi Fisika SMA Muhammadiyah 1 Yogyakarta',
        targetId: guruIds[0] || 'guru-1',
        targetName: 'Ahmad Fauzan, S.Pd., M.Si.',
        targetType: 'Guru',
        schoolId: schoolIds[0],
        status: 'Terbit',
        submissionType: 'Perpanjangan',
        fileUrl: '',
        fileName: 'SK_GTY_Ahmad_Fauzan_2024.pdf',
        verifiedBy: 'Majelis Dikdasmen Daerah',
        verifiedAt: '2024-01-10T14:30:00Z',
        createdAt: '2024-01-02T10:00:00Z',
        isDeleted: false,
      },
      {
        skNumber: '189/SK.GTY/DIKDASMEN/2023',
        skDate: '2023-08-01',
        skEndDate: '2025-07-31', // Approaching expiration in demo
        title: 'Penetapan Guru Tetap Yayasan (GTY) Guru Kelas SD Muhammadiyah Sapen',
        targetId: guruIds[3] || 'guru-4',
        targetName: 'Dewi Lestari, S.Pd.',
        targetType: 'Guru',
        schoolId: schoolIds[2],
        status: 'Terbit',
        submissionType: 'Baru',
        fileUrl: '',
        fileName: 'SK_GTY_Dewi_Lestari_2023.pdf',
        verifiedBy: 'Majelis Dikdasmen Daerah',
        verifiedAt: '2023-08-05T11:00:00Z',
        createdAt: '2023-08-01T09:00:00Z',
        isDeleted: false,
      },
      {
        skNumber: 'DRAFT/SK-TDK/2025/08',
        skDate: '2025-08-15',
        skEndDate: '2027-08-14',
        title: 'Usulan Pengangkatan Karyawan Tetap Yayasan (KTY) Operator IT SMP Muhammadiyah 2 Yogyakarta',
        targetId: tendikIds[2] || 'tendik-3',
        targetName: 'Eko Prasetyo, S.Kom.',
        targetType: 'Tendik',
        schoolId: schoolIds[1],
        status: 'Belum Terbit',
        submissionType: 'Baru',
        fileUrl: '',
        fileName: 'Pengajuan_SK_KTY_Eko_Prasetyo.pdf',
        createdAt: new Date().toISOString(),
        isDeleted: false,
      },
    ];

    for (const sk of skData) {
      const colName = sk.targetType === 'Guru' ? 'skGuru' : sk.targetType === 'Tendik' ? 'skTendik' : 'skKepalaSekolah';
      const col = collection(db, colName);
      await addDoc(col, sk);
    }

    // 8. Mutasi Record
    const mutasiData: Omit<MutasiRecord, 'id'>[] = [
      {
        type: 'Guru',
        personId: guruIds[0] || 'guru-1',
        personName: 'Dra. Endang Sulistyowati, M.Pd.',
        fromSchoolId: schoolIds[1],
        fromSchoolName: 'SMP Muhammadiyah 2 Yogyakarta (Muchild)',
        toSchoolId: schoolIds[0],
        toSchoolName: 'SMA Muhammadiyah 1 Yogyakarta (Muhi)',
        reason: 'Pemerataan kompetensi pendidik olimpiade sains antarsekolah Muhammadiyah',
        date: '2024-06-25',
        skNumber: '028/MUTASI/DIKDASMEN/VI/2024',
        status: 'Disetujui',
        approvedBy: 'Ketua Majelis Dikdasmen PDM',
        createdAt: '2024-06-25T10:00:00Z',
      },
    ];

    for (const m of mutasiData) {
      const col = collection(db, 'mutasi');
      await addDoc(col, m);
    }

    // 9. Notifications
    const notifs: Omit<NotificationItem, 'id'>[] = [
      {
        title: 'Peringatan Masa Berlaku SK',
        message: 'SK GTY atas nama Dewi Lestari, S.Pd. (SD Muhammadiyah Sapen) akan berakhir dalam 30 hari ke depan. Harap ajukan perpanjangan.',
        type: 'warning',
        isRead: false,
        targetRole: 'All',
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Verifikasi Pengajuan SK Baru',
        message: 'Terdapat 1 berkas pengajuan SK KTY baru dari SMP Muhammadiyah 2 Yogyakarta menunggu persetujuan Admin Majelis.',
        type: 'info',
        isRead: false,
        targetRole: 'Admin',
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Sinkronisasi Data Mutu Sekolah Selesai',
        message: 'Kalkulasi pengelompokan mutu sekolah kategori UGD, Rawat Inap, Rawat Jalan, dan Sehat telah berhasil diperbarui.',
        type: 'success',
        isRead: true,
        targetRole: 'All',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const n of notifs) {
      const col = collection(db, 'notifikasi');
      await addDoc(col, n);
    }

    // 10. System Settings
    const defaultSettings: SystemSetting[] = [
      {
        id: 'setting-daerah',
        key: 'NAMA_DAERAH',
        value: 'Pimpinan Daerah Muhammadiyah Kabupaten Klaten',
        description: 'Nama Majelis Dikdasmen tingkat Daerah / Kabupaten / Kota',
      },
      {
        id: 'setting-tahun-ajaran',
        key: 'TAHUN_PELAJARAN_AKTIF',
        value: '2025/2026',
        description: 'Tahun pelajaran akademik aktif yang berlaku',
      },
      {
        id: 'setting-batas-sk-warning',
        key: 'BATAS_WARNING_SK_HARI',
        value: '90',
        description: 'Ambang batas waktu peringatan masa habis SK (hari)',
      },
      {
        id: 'setting-kop-surat',
        key: 'KOP_SURAT_RESMI',
        value: 'MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL PDM KLATEN',
        description: 'Header teks kop surat pada dokumen cetak PDF resmi',
      },
    ];

    for (const s of defaultSettings) {
      const docRef = doc(db, 'settings', s.id);
      await setDoc(docRef, s);
    }

    return true;
  } catch (error) {
    console.error('Error seeding data:', error);
    return false;
  }
}

// Function to synchronously reconcile/ensure all master schools are synced to Firestore
export async function syncMasterSekolahKlaten(): Promise<{ success: boolean; message: string }> {
  try {
    const cabangSnap = await getDocs(collection(db, 'cabang'));
    const cabangMap = new Map<string, string>(); // code or name to id
    if (!cabangSnap.empty) {
      cabangSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.code) cabangMap.set(data.code, d.id);
        if (data.name) cabangMap.set(data.name.toLowerCase().trim(), d.id);
        cabangMap.set(d.id, d.id);
      });
    }

    const existingSchoolsSnap = await getDocs(collection(db, 'sekolah'));
    const existingDocs = existingSchoolsSnap.docs;

    // Process in batches of 200 (Firestore allows up to 500 operations per batch)
    const BATCH_SIZE = 200;
    for (let i = 0; i < MASTER_SEKOLAH_KLATEN.length; i += BATCH_SIZE) {
      const chunk = MASTER_SEKOLAH_KLATEN.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      for (const item of chunk) {
        const matchDoc = existingDocs.find((d) => {
          const data = d.data();
          return (
            data.npsn === item.npsn ||
            d.id === item.id ||
            (data.name && data.name.toLowerCase().trim() === item.name.toLowerCase().trim())
          );
        });

        const targetId = matchDoc ? matchDoc.id : item.id || `sch-${item.npsn}`;
        const docRef = doc(db, 'sekolah', targetId);
        const resolvedCabangId = isPdmKlatenSchool(item) ? 'cabang-klaten-kota' : (item.cabangId || 'cabang-klaten-kota');

        batch.set(
          docRef,
          {
            name: item.name,
            npsn: item.npsn,
            cabangId: resolvedCabangId,
            address: item.address,
            kecamatan: item.kecamatan || '',
            kabupaten: item.kabupaten || 'Kabupaten Klaten',
            status: item.status || 'Swasta',
            level: item.level,
            username: item.username || item.npsn,
            password: item.password || 'sekolah123',
            phone: item.phone || '-',
            email: item.email || '-',
            website: item.website || '-',
            accreditation: item.accreditation || 'A',
            categoryCapability: item.categoryCapability || 'SEHAT',
            skPendirianNumber: item.skPendirianNumber || '-',
            skIzinOperasional: item.skIzinOperasional || '-',
            jumlahKeseluruhanSiswa: item.jumlahKeseluruhanSiswa || 0,
            logoUrl: item.logoUrl || DEFAULT_SCHOOL_LOGO,
            bannerUrl:
              item.bannerUrl ||
              'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
            vision: item.vision || 'Mewujudkan insan Islami, unggul dalam prestasi dan berakhlakul karimah.',
            mission:
              item.mission || 'Menyelenggarakan pendidikan holistik berbasis nilai Al-Islam Kemuhammadiyahan.',
            description: item.description || `${item.name} di bawah naungan Majelis Dikdasmen & PNF Klaten.`,
            isDeleted: false,
            createdAt: item.createdAt || new Date().toISOString(),
          },
          { merge: true }
        );
      }

      await batch.commit();
    }

    return {
      success: true,
      message: `Berhasil memasukkan dan menyinkronkan ${MASTER_SEKOLAH_KLATEN.length} data Sekolah & Madrasah ke database!`,
    };
  } catch (err: any) {
    console.error('Error syncing master sekolah:', err);
    return { success: false, message: err?.message || 'Gagal sinkron master sekolah' };
  }
}

export const DEFAULT_ADMIN_PETUGAS_LIST: AdminPetugas[] = [
  {
    id: 'adm-petugas-01',
    name: 'Ahmad Fauzi, S.Kom.',
    username: 'petugas_dikdasmen',
    password: 'admin',
    email: 'staf@dikdasmenklaten.org',
    phone: '081298765432',
    jabatan: 'Staf Verifikasi & Penerbitan SK',
    role: 'Admin',
    isActive: true,
    notes: 'Petugas verifikasi berkas SK & pendataan PTK Daerah',
    createdAt: '2024-01-01T00:00:00.000Z',
    isDeleted: false,
  },
  {
    id: 'adm-petugas-02',
    name: 'Nur Aisyah, S.Pd.',
    username: 'staf_admin',
    password: 'admin',
    email: 'aisyah.staf@dikdasmenklaten.org',
    phone: '085712345678',
    jabatan: 'Staf Sekretariat & Data Satuan Pendidikan',
    role: 'Admin',
    isActive: true,
    notes: 'Petugas pengelolaan data guru, tendik, dan cabang',
    createdAt: '2024-01-01T00:00:00.000Z',
    isDeleted: false,
  },
];

export function getMasterAdminPetugasList(): AdminPetugas[] {
  return DEFAULT_ADMIN_PETUGAS_LIST.map((p) => ({ ...p }));
}

// Function to synchronously reconcile/ensure all master admin petugas are synced to Firestore
export async function syncMasterAdminPetugas(): Promise<{ success: boolean; message: string }> {
  try {
    const snap = await getDocs(collection(db, 'adminPetugas'));
    const existing = snap.docs;
    const batch = writeBatch(db);

    for (const p of DEFAULT_ADMIN_PETUGAS_LIST) {
      const match = existing.find(
        (d) =>
          d.id === p.id ||
          d.data().username?.toLowerCase() === p.username.toLowerCase() ||
          d.data().email?.toLowerCase() === p.email.toLowerCase()
      );
      const targetId = match ? match.id : p.id;
      const docRef = doc(db, 'adminPetugas', targetId);
      batch.set(
        docRef,
        {
          name: p.name,
          username: p.username,
          password: p.password,
          email: p.email,
          phone: p.phone,
          jabatan: p.jabatan,
          role: 'Admin',
          isActive: p.isActive ?? true,
          notes: p.notes || '',
          isDeleted: false,
          createdAt: p.createdAt || new Date().toISOString(),
        },
        { merge: true }
      );
    }
    await batch.commit();
    return { success: true, message: 'Berhasil menyinkronkan data Admin Petugas ke Firestore' };
  } catch (err: any) {
    console.error('Error syncing master admin petugas:', err);
    return { success: false, message: err?.message || 'Gagal sinkron master admin petugas' };
  }
}

export function getStaticFallbackData() {
  const cabangList: Cabang[] = getMasterCabangList();
  const sekolahList: Sekolah[] = getMasterSekolahList();
  const adminPetugasList: AdminPetugas[] = getMasterAdminPetugasList();

  const kepalaSekolahList: KepalaSekolah[] = [
    {
      id: 'ks-1',
      name: 'Drs. H. Sukirman, M.Pd.',
      nip: '196805121994121002',
      nipm: 'M-19680512-001',
      nbm: '884920',
      schoolId: 'sch-smp-muh-1-klaten',
      startDate: '2022-07-01',
      endDate: '2026-06-30',
      periodNumber: 1,
      status: 'Aktif',
      phone: '081227198899',
      email: 'sukirman@dikdasmenklaten.org',
      skNumber: '045/KEP/I.0/D/2022',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'ks-2',
      name: 'Naning Hidayati, S.Pd., M.Pd.',
      nip: '197411032000032001',
      nipm: 'M-19741103-014',
      nbm: '912304',
      schoolId: 'sch-mts-muh-1-klaten',
      startDate: '2023-01-01',
      endDate: '2027-12-31',
      periodNumber: 1,
      status: 'Aktif',
      phone: '081392811440',
      email: 'naning.h@mtsmuh1klaten.sch.id',
      skNumber: '012/KEP/I.0/D/2023',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'ks-3',
      name: 'Drs. H. Arifin Pramono, M.Pd.',
      nip: '197008151998021003',
      nipm: 'M-19700815-098',
      nbm: '745612',
      schoolId: 'sch-sma-muh-1-klaten',
      startDate: '2021-08-01',
      endDate: '2025-07-31',
      periodNumber: 2,
      status: 'Aktif',
      phone: '08112509812',
      email: 'arifin.pramono@smamuh1klaten.sch.id',
      skNumber: '088/KEP/I.0/D/2021',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'ks-4',
      name: 'Drs. Supriyanto, M.Eng.',
      nip: '196504101990031005',
      nipm: 'M-19650410-044',
      nbm: '633819',
      schoolId: 'sch-smk-muh-1-klaten-utara',
      startDate: '2023-07-01',
      endDate: '2027-06-30',
      periodNumber: 1,
      status: 'Aktif',
      phone: '08122998314',
      email: 'supriyanto@smkmuh1klatenutara.sch.id',
      skNumber: '034/KEP/I.0/D/2023',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const guruList: Guru[] = [
    {
      id: 'guru-1',
      name: 'Ahmad Fauzan, S.Pd., M.Si.',
      nip: '198204152008011012',
      nipm: 'M-19820415-081',
      nuptk: '8456760662200023',
      nbm: '1048821',
      schoolId: 'sch-sma-muh-1-klaten',
      gender: 'Laki-laki',
      subject: 'Fisika & Robotika',
      status: 'GTY',
      education: 'S2 Pendidikan Fisika (UNY)',
      phone: '081328990145',
      email: 'ahmad.fauzan@smamuh1klaten.sch.id',
      address: 'Bramen, Klaten Utara',
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'guru-2',
      name: 'Siti Rahmawati, S.Pd.I., M.Pd.',
      nip: '198901232014022004',
      nipm: 'M-19890123-112',
      nuptk: '3345767668210045',
      nbm: '1189453',
      schoolId: 'sch-smp-muh-1-klaten',
      gender: 'Perempuan',
      subject: 'Al-Islam & Kemuhammadiyahan (AIK)',
      status: 'GTY',
      education: 'S2 PAI (UIN Sunan Kalijaga)',
      phone: '085743110982',
      email: 'siti.rahmawati@smpmuh1klaten.sch.id',
      address: 'Tonggalan, Klaten Tengah',
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'guru-3',
      name: 'Wahyu Hidayat, S.T., M.T.',
      nip: '198501092010011022',
      nipm: 'M-19850109-077',
      nuptk: '7729763665130045',
      nbm: '1102948',
      schoolId: 'sch-smk-muh-1-klaten-utara',
      gender: 'Laki-laki',
      subject: 'Teknik Kendaraan Ringan & Otomotif',
      status: 'GTY',
      education: 'S2 Teknik Mesin (UGM)',
      phone: '081226710499',
      email: 'wahyu.h@smkmuh1klatenutara.sch.id',
      address: 'Gergunung, Klaten Utara',
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'guru-4',
      name: 'Dewi Lestari, S.Pd.',
      nip: '',
      nipm: 'M-19940312-301',
      nuptk: '9045772673230012',
      nbm: '1245670',
      schoolId: 'sch-mts-muh-1-klaten',
      gender: 'Perempuan',
      subject: 'Bahasa Arab & Tahfidz',
      status: 'GTY',
      education: 'S1 Pendidikan Bahasa Arab',
      phone: '087839001124',
      email: 'dewi.lestari@mtsmuh1klaten.sch.id',
      address: 'Barenglor, Klaten Utara',
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const tendikList: Tendik[] = [
    {
      id: 'tendik-1',
      name: 'Bambang Sudarmono, S.Kom.',
      nipm: 'M-19860812-402',
      nbm: '1099234',
      schoolId: 'sch-smk-muh-1-klaten-utara',
      gender: 'Laki-laki',
      position: 'Kepala Tata Usaha & IT Operator',
      status: 'KTY',
      education: 'S1 Sistem Informasi',
      phone: '081227009412',
      email: 'bambang.tu@smkmuh1klatenutara.sch.id',
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'tendik-2',
      name: 'Nurul Hidayati, S.Ptk.',
      nipm: 'M-19920514-505',
      nbm: '1204891',
      schoolId: 'sch-smp-muh-1-klaten',
      gender: 'Perempuan',
      position: 'Pustakawan Digital',
      status: 'KTY',
      education: 'S1 Ilmu Perpustakaan',
      phone: '085643990012',
      email: 'nurul.perpus@smpmuh1klaten.sch.id',
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const siswaList: Siswa[] = [];

  const skGuruList: SkDocument[] = [
    {
      id: 'sk-g-1',
      skNumber: '048/SK-GTY/DIKDASMEN/2023',
      skDate: '2023-06-25',
      title: 'Pengangkatan Guru Tetap Yayasan (GTY)',
      targetType: 'Guru',
      targetId: 'guru-1',
      targetName: 'Ahmad Fauzan, S.Pd., M.Si.',
      schoolId: 'sch-sma-muh-1-klaten',
      submissionType: 'Baru',
      skEndDate: '2027-06-30',
      status: 'Terbit',
      createdAt: '2023-06-25T00:00:00.000Z',
      isDeleted: false,
    },
    {
      id: 'sk-g-2',
      skNumber: '091/SK-GTY/DIKDASMEN/2021',
      skDate: '2021-08-20',
      title: 'Perpanjangan Guru Tetap Yayasan (GTY)',
      targetType: 'Guru',
      targetId: 'guru-4',
      targetName: 'Dewi Lestari, S.Pd.',
      schoolId: 'sch-mts-muh-1-klaten',
      submissionType: 'Perpanjangan',
      skEndDate: '2025-08-31',
      status: 'Terbit',
      createdAt: '2021-08-20T00:00:00.000Z',
      isDeleted: false,
    },
  ];

  const skTendikList: SkDocument[] = [
    {
      id: 'sk-t-1',
      skNumber: '022/SK-PTY/DIKDASMEN/2023',
      skDate: '2023-06-20',
      title: 'Pengangkatan Pegawai Tetap Yayasan (KTY) IT Operator',
      targetType: 'Tendik',
      targetId: 'tendik-1',
      targetName: 'Bambang Sudarmono, S.Kom.',
      schoolId: 'sch-smk-muh-1-klaten-utara',
      submissionType: 'Baru',
      skEndDate: '2027-06-30',
      status: 'Terbit',
      isDeleted: false,
      createdAt: '2023-06-20T00:00:00.000Z',
    },
  ];

  const skKepalaSekolahList: SkDocument[] = [
    {
      id: 'sk-ks-1',
      skNumber: '045/KEP/I.0/D/2022',
      skDate: '2022-06-28',
      title: 'Pengangkatan Kepala SMP Muhammadiyah 1 Klaten Periode 2022-2026',
      targetType: 'KepalaSekolah',
      targetId: 'ks-1',
      targetName: 'Drs. H. Sukirman, M.Pd.',
      schoolId: 'sch-smp-muh-1-klaten',
      submissionType: 'Baru',
      skEndDate: '2026-06-30',
      status: 'Terbit',
      isDeleted: false,
      createdAt: '2022-06-28T00:00:00.000Z',
    },
  ];

  const mutasiList: MutasiRecord[] = [
    {
      id: 'mutasi-1',
      type: 'Guru',
      personId: 'guru-1',
      personName: 'Ahmad Fauzan, S.Pd., M.Si.',
      fromSchoolId: 'sch-smp-muh-1-klaten',
      fromSchoolName: 'SMP Muhammadiyah 1 Klaten',
      toSchoolId: 'sch-sma-muh-1-klaten',
      toSchoolName: 'SMA Muhammadiyah 1 Klaten',
      reason: 'Pemerataan kompetensi pendidik olimpiade sains antarsekolah Muhammadiyah Klaten',
      date: '2024-06-25',
      skNumber: '028/MUTASI/DIKDASMEN/VI/2024',
      status: 'Disetujui',
      approvedBy: 'Ketua Majelis Dikdasmen PDM Klaten',
      createdAt: '2024-06-25T10:00:00Z',
    },
  ];

  const notifikasiList: NotificationItem[] = [
    {
      id: 'notif-1',
      title: 'Peringatan Masa Berlaku SK',
      message: 'SK GTY atas nama Dewi Lestari, S.Pd. (MTs Muhammadiyah 1 Klaten) akan berakhir dalam waktu dekat. Harap ajukan perpanjangan.',
      type: 'warning',
      isRead: false,
      targetRole: 'All',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      title: 'Data Master 10 Sekolah Klaten Aktif',
      message: 'Master data 10 sekolah Muhammadiyah di Kabupaten Klaten telah tersinkronisasi.',
      type: 'success',
      isRead: true,
      targetRole: 'All',
      createdAt: new Date().toISOString(),
    },
  ];

  const logList: LogAktivitas[] = [
    {
      id: 'log-1',
      userEmail: 'admin@dikdasmenklaten.org',
      userName: 'Administrator Dikdasmen Klaten',
      userRole: 'Super Admin',
      action: 'LOGIN',
      details: 'Sesi sistem terhubung dengan sukses ke Cloud Firestore.',
      timestamp: new Date().toISOString(),
    },
  ];

  const settingsList: SystemSetting[] = [
    {
      id: 'setting-daerah',
      key: 'NAMA_DAERAH',
      value: 'Pimpinan Daerah Muhammadiyah Kabupaten Klaten',
      description: 'Nama Majelis Dikdasmen tingkat Daerah / Kabupaten / Kota',
    },
    {
      id: 'setting-tahun-ajaran',
      key: 'TAHUN_PELAJARAN_AKTIF',
      value: '2025/2026',
      description: 'Tahun pelajaran akademik aktif yang berlaku',
    },
    {
      id: 'setting-batas-sk-warning',
      key: 'BATAS_WARNING_SK_HARI',
      value: '90',
      description: 'Ambang batas waktu peringatan masa habis SK (hari)',
    },
    {
      id: 'setting-kop-surat',
      key: 'KOP_SURAT_RESMI',
      value: 'MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL PDM KLATEN',
      description: 'Header teks kop surat pada dokumen cetak PDF resmi',
    },
  ];

  return {
    cabangList,
    sekolahList,
    adminPetugasList,
    guruList,
    tendikList,
    kepalaSekolahList,
    siswaList,
    skGuruList,
    skTendikList,
    skKepalaSekolahList,
    mutasiList,
    notifikasiList,
    logList,
    settingsList,
  };
}

// Explicit helper to sync or push all 10 Klaten schools to Firestore directly
export async function seedKlatenSchoolsMaster(targetCabangId?: string): Promise<{ count: number; ids: string[] }> {
  try {
    // 1. Get existing cabangs from Firestore
    const cabangSnap = await getDocs(collection(db, 'cabang'));
    let pcmKotaId = targetCabangId || '';
    let pcmUtaraId = targetCabangId || '';
    let pcmTengahId = targetCabangId || '';

    if (cabangSnap.docs.length > 0) {
      cabangSnap.docs.forEach((d) => {
        const data = d.data();
        const name = (data.name || '').toLowerCase();
        if (name.includes('kota') || name.includes('tengah')) {
          pcmKotaId = pcmKotaId || d.id;
          pcmTengahId = pcmTengahId || d.id;
        } else if (name.includes('utara')) {
          pcmUtaraId = pcmUtaraId || d.id;
        }
      });
      // Fallback to first available cabang
      if (!pcmKotaId) pcmKotaId = cabangSnap.docs[0].id;
      if (!pcmUtaraId) pcmUtaraId = cabangSnap.docs[0].id;
      if (!pcmTengahId) pcmTengahId = cabangSnap.docs[0].id;
    } else {
      // Create default PCM Klaten Kota/Tengah if none exists
      const pcmRef = await addDoc(collection(db, 'cabang'), {
        name: 'PCM Klaten Tengah (Kota)',
        code: 'PCM-KLT-01',
        username: 'pcm_klatentengah',
        address: 'Jl. Pemuda No. 248, Klaten Tengah, Kab. Klaten',
        phone: '0272-321528',
        email: 'pcm.klatentengah@dikdasmenklaten.org',
        ketuaName: 'Drs. H. Sukirman, M.Pd.',
        createdAt: new Date().toISOString(),
      });
      pcmKotaId = pcmRef.id;
      pcmUtaraId = pcmRef.id;
      pcmTengahId = pcmRef.id;
    }

    const masterSchools: Omit<Sekolah, 'id'>[] = [
      {
        name: 'SMP Muhammadiyah 1 Klaten',
        npsn: '20309653',
        cabangId: pcmKotaId,
        address: 'Jl. Pemuda No. 248, Tonggalan, Kec. Klaten Tengah, Kab. Klaten, Jawa Tengah',
        status: 'Swasta',
        level: 'SMP',
        phone: '0272-321528',
        email: 'smpmuh1klaten@gmail.com',
        website: 'https://smpmuh1klaten.sch.id',
        accreditation: 'Unggul',
        categoryCapability: 'SEHAT',
        skPendirianNumber: '421.3/018/SMP/1978',
        skIzinOperasional: '503/042/DISDIK/2019',
        jumlahKeseluruhanSiswa: 680,
        logoUrl: DEFAULT_SCHOOL_LOGO,
        bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
        vision: 'Mewujudkan insan Islami, unggul dalam prestasi akademik dan berakhlakul karimah.',
        mission: 'Menyelenggarakan pendidikan holistik berbasis nilai Al-Islam Kemuhammadiyahan dan penguatan karakter.',
        description: 'SMP Muhammadiyah rujukan di Klaten dengan program kelas tahfidz, bilingual, dan riset sains.',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'MTs Muhammadiyah 1 Klaten',
        npsn: '20363271',
        cabangId: pcmKotaId,
        address: 'Jl. Veteran No. 72, Barenglor, Kec. Klaten Utara / Kota, Kab. Klaten, Jawa Tengah',
        status: 'Swasta',
        level: 'MTs',
        phone: '0272-322190',
        email: 'mtsmuh1klaten@gmail.com',
        website: 'https://mtsmuh1klaten.sch.id',
        accreditation: 'A',
        categoryCapability: 'RAWAT JALAN',
        skPendirianNumber: 'W.m/6.c/082/1980',
        skIzinOperasional: '14/MTS/KLT/2018',
        jumlahKeseluruhanSiswa: 420,
        logoUrl: DEFAULT_SCHOOL_LOGO,
        bannerUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80',
        vision: 'Unggul dalam Imtaq, berprestasi dalam Iptek, dan berwawasan lingkungan.',
        mission: 'Mengembangkan pembelajaran madrasah berbasis Al-Quran dan penguasaan sains teknologi.',
        description: 'Madrasah Tsanawiyah terakreditasi A dengan asrama pondok santri dan pembinaan da\'i muda.',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'SMA Muhammadiyah 1 Klaten',
        npsn: '20309695',
        cabangId: pcmUtaraId,
        address: 'Jl. Mayor Kusmanto, Bramen, Sekarsuli, Kec. Klaten Utara, Kab. Klaten, Jawa Tengah',
        status: 'Swasta',
        level: 'SMA',
        phone: '0272-322057',
        email: 'smamuh1klaten@yahoo.co.id',
        website: 'https://smamuh1klaten.sch.id',
        accreditation: 'Unggul',
        categoryCapability: 'SEHAT',
        skPendirianNumber: '421.3/089/DIKMEN/1965',
        skIzinOperasional: '188.4/1255/V.2/2020',
        jumlahKeseluruhanSiswa: 860,
        logoUrl: DEFAULT_SCHOOL_LOGO,
        bannerUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80',
        vision: 'Mencetak kader persyarikatan dan pemimpin umat yang cerdas, kompetitif, dan berakhlak mulia.',
        mission: 'Menyelenggarakan pembelajaran berkualitas tinggi, pembinaan olimpiade sains, dan pembiasaan ibadah.',
        description: 'SMA unggulan kader Muhammadiyah di Kabupaten Klaten dengan prestasi tingkat nasional.',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'SMK Muhammadiyah 1 Klaten Utara',
        npsn: '20309531',
        cabangId: pcmUtaraId,
        address: 'Jl. Ki Ageng Pengging, Gergunung, Kec. Klaten Utara, Kab. Klaten, Jawa Tengah',
        status: 'Swasta',
        level: 'SMK',
        phone: '0272-322890',
        email: 'smkmuh1klatenutara@gmail.com',
        website: 'https://smkmuh1klatenutara.sch.id',
        accreditation: 'Unggul',
        categoryCapability: 'SEHAT',
        skPendirianNumber: '421.5/112/1984',
        skIzinOperasional: '503/4412/DPMPTSP/2021',
        jumlahKeseluruhanSiswa: 920,
        logoUrl: DEFAULT_SCHOOL_LOGO,
        bannerUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&auto=format&fit=crop&q=80',
        vision: 'Menjadi SMK Pusat Keunggulan yang berakhlak mulia, kompeten, dan siap kerja di era industri 4.0.',
        mission: 'Menyelenggarakan Teaching Factory, sertifikasi profesi BNSP, dan kemitraan dunia usaha/industri.',
        description: 'SMK Pusat Keunggulan dengan jurusan Teknik Otomotif, Teknik Pemesinan, dan Teknik Komputer Jaringan.',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'SMK Muhammadiyah 2 Klaten Utara',
        npsn: '20309532',
        cabangId: pcmUtaraId,
        address: 'Jl. Mayor Kusmanto No. 88, Bramen, Kec. Klaten Utara, Kab. Klaten, Jawa Tengah',
        status: 'Swasta',
        level: 'SMK',
        phone: '0272-323451',
        email: 'smkmuh2klatenutara@gmail.com',
        website: 'https://smkmuh2klatenutara.sch.id',
        accreditation: 'A',
        categoryCapability: 'RAWAT JALAN',
        skPendirianNumber: '421.5/224/1990',
        skIzinOperasional: '503/3310/DISDIK/2020',
        jumlahKeseluruhanSiswa: 580,
        logoUrl: DEFAULT_SCHOOL_LOGO,
        bannerUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
        vision: 'Mewujudkan lulusan yang beriman, terampil, inovatif, dan mandiri.',
        mission: 'Meningkatkan mutu pembelajaran kejuruan terapan dan pembinaan kewirausahaan siswa.',
        description: 'Sekolah kejuruan bidang teknologi informasi, kelistrikan, dan rekayasa perangkat lunak.',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'SMK Muhammadiyah 3 Klaten Utara',
        npsn: '20309533',
        cabangId: pcmUtaraId,
        address: 'Jl. Ki Pandanaran, Jomboran, Kec. Klaten Utara, Kab. Klaten, Jawa Tengah',
        status: 'Swasta',
        level: 'SMK',
        phone: '0272-324102',
        email: 'smkmuh3klatenutara@gmail.com',
        website: 'https://smkmuh3klatenutara.sch.id',
        accreditation: 'A',
        categoryCapability: 'RAWAT JALAN',
        skPendirianNumber: '421.5/341/1995',
        skIzinOperasional: '503/1189/DPMPTSP/2019',
        jumlahKeseluruhanSiswa: 460,
        logoUrl: DEFAULT_SCHOOL_LOGO,
        bannerUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&auto=format&fit=crop&q=80',
        vision: 'Menghasilkan tenaga kerja terampil dan technopreneur berkarakter Islami.',
        mission: 'Menyelenggarakan pendidikan vokasi praktis sesuai kebutuhan pasar kerja daerah dan nasional.',
        description: 'SMK bidang manajemen bisnis, akuntansi, dan teknologi terapan.',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'SMK Muhammadiyah 1 Klaten Tengah',
        npsn: '20309534',
        cabangId: pcmTengahId,
        address: 'Jl. Pemuda Selatan No. 120, Tonggalan, Kec. Klaten Tengah, Kab. Klaten, Jawa Tengah',
        status: 'Swasta',
        level: 'SMK',
        phone: '0272-321774',
        email: 'smkmuh1klatentengah@gmail.com',
        website: 'https://smkmuh1klatentengah.sch.id',
        accreditation: 'A',
        categoryCapability: 'RAWAT JALAN',
        skPendirianNumber: '421.5/512/1988',
        skIzinOperasional: '503/2401/DISDIK/2021',
        jumlahKeseluruhanSiswa: 510,
        logoUrl: DEFAULT_SCHOOL_LOGO,
        bannerUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80',
        vision: 'Terdepan dalam mutu vokasi, berdaya saing global, berlandaskan nilai Islam.',
        mission: 'Mengembangkan kurikulum industri dan fasilitas laboratorium bengkel modern.',
        description: 'SMK kejuruan teknik dan bisnis di jantung kota Klaten.',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'SMK Muhammadiyah 3 Klaten Tengah',
        npsn: '20309535',
        cabangId: pcmTengahId,
        address: 'Jl. Kopral Sayuti, Bareng Kidul, Kec. Klaten Tengah, Kab. Klaten, Jawa Tengah',
        status: 'Swasta',
        level: 'SMK',
        phone: '0272-325601',
        email: 'smkmuh3klatentengah@gmail.com',
        website: 'https://smkmuh3klatentengah.sch.id',
        accreditation: 'A',
        categoryCapability: 'RAWAT INAP',
        skPendirianNumber: '421.5/778/2002',
        skIzinOperasional: '503/4412/DPMPTSP/2020',
        jumlahKeseluruhanSiswa: 340,
        logoUrl: DEFAULT_SCHOOL_LOGO,
        bannerUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&auto=format&fit=crop&q=80',
        vision: 'Membentuk generasi ahli madya terampil dan berjiwa wirausaha.',
        mission: 'Peningkatan intensif sarana praktik kejuruan dan program magang industri.',
        description: 'SMK bidang kejuruan teknik dan pariwisata/layanan usaha di Klaten.',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'SMK Muhammadiyah 4 Klaten Tengah',
        npsn: '20309536',
        cabangId: pcmTengahId,
        address: 'Jl. Veteran No. 15, Tegalkelaten, Kec. Klaten Tengah, Kab. Klaten, Jawa Tengah',
        status: 'Swasta',
        level: 'SMK',
        phone: '0272-326712',
        email: 'smkmuh4klatentengah@gmail.com',
        website: 'https://smkmuh4klatentengah.sch.id',
        accreditation: 'B',
        categoryCapability: 'RAWAT INAP',
        skPendirianNumber: '421.5/890/2005',
        skIzinOperasional: '503/1089/DISDIK/2019',
        jumlahKeseluruhanSiswa: 280,
        logoUrl: DEFAULT_SCHOOL_LOGO,
        bannerUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80',
        vision: 'Mencetak tenaga siap kerja yang mandiri dan berakhlakul karimah.',
        mission: 'Mengembangkan pendampingan intensif keterampilan siswa dan penguatan karakter.',
        description: 'SMK binaan Majelis Dikdasmen Klaten dengan fokus vokasi terapan.',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'MA Muhammadiyah Klaten',
        npsn: '20363290',
        cabangId: pcmKotaId,
        address: 'Jl. Merbabu No. 18, Gayamprit, Kec. Klaten Selatan / Kota, Kab. Klaten, Jawa Tengah',
        status: 'Swasta',
        level: 'MA',
        phone: '0272-322419',
        email: 'mamuhammadiyahklaten@gmail.com',
        website: 'https://mamuhklaten.sch.id',
        accreditation: 'A',
        categoryCapability: 'RAWAT INAP',
        skPendirianNumber: 'MA/KD.12.05/1985',
        skIzinOperasional: 'Kw.12.2/PP.00.4/198/2015',
        jumlahKeseluruhanSiswa: 210,
        logoUrl: DEFAULT_SCHOOL_LOGO,
        bannerUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&auto=format&fit=crop&q=80',
        vision: 'Mewujudkan lulusan madrasah aliyah yang berilmu amaliyah, beramal ilmiah, dan berakhlak mulia.',
        mission: 'Menyelenggarakan program keagamaan mendalam, tahfidz Al-Quran, dan sains terintegrasi.',
        description: 'Madrasah Aliyah Muhammadiyah Klaten dengan program studi Keagamaan, MIPA, dan IPS.',
        isDeleted: false,
        createdAt: new Date().toISOString(),
      },
    ];

    // Check existing schools in Firestore to avoid duplicate creation by name or NPSN
    const existingSchoolsSnap = await getDocs(collection(db, 'sekolah'));
    const existingNpsns = new Set(existingSchoolsSnap.docs.map(d => d.data().npsn));
    const existingNames = new Set(existingSchoolsSnap.docs.map(d => (d.data().name || '').toLowerCase()));

    const insertedIds: string[] = [];
    for (const sch of masterSchools) {
      if (!existingNpsns.has(sch.npsn) && !existingNames.has(sch.name.toLowerCase())) {
        const d = await addDoc(collection(db, 'sekolah'), sch);
        insertedIds.push(d.id);
      }
    }

    return { count: insertedIds.length, ids: insertedIds };
  } catch (error) {
    console.error('Error seeding master schools:', error);
    throw error;
  }
}


