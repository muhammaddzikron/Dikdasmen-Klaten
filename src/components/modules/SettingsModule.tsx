import React, { useState } from 'react';
import {
  Settings,
  Database,
  RotateCcw,
  Download,
  Shield,
  User,
  CheckCircle,
  HardDrive,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { seedInitialData } from '../../lib/firestoreService';

export const SettingsModule: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { sekolahList, guruList, tendikList, kepalaSekolahList, siswaList, allSkList, mutasiList, addToast } =
    useData();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ name });
    addToast('Profil pengguna berhasil diperbarui.', 'success');
  };

  const handleReseedDatabase = async () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengisi ulang (re-seed) database Firestore dengan sampel data master resmi Dikdasmen?'
      )
    ) {
      setIsResetting(true);
      try {
        await seedInitialData(true);
        addToast('Database demo berhasil di-reset dan dimuat ulang ke Cloud Firestore!', 'success');
      } catch (err: any) {
        addToast(`Gagal mereset database: ${err.message}`, 'error');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleExportBackupJSON = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      appName: 'SIM Dikdasmen Daerah',
      collections: {
        sekolah: sekolahList,
        guru: guruList,
        tendik: tendikList,
        kepalaSekolah: kepalaSekolahList,
        siswa: siswaList,
        suratKeputusan: allSkList,
        mutasi: mutasiList,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_SIM_Dikdasmen_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Backup JSON berhasil diunduh.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pengaturan Sistem & Database</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pengaturan akun pengguna, sinkronisasi Cloud Firestore, dan cadangan data offline
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span>Profil Pengguna Aktif</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Email Akun</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 opacity-75 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Role Otoritas: <strong>{currentUser?.role}</strong></span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* Database Management & Demo Seeding */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Pengelolaan Cloud Firestore & Data Demo</span>
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Fitur ini memungkinkan Anda memuat ulang sampel data master lengkap (Cabang PCM, Sekolah, Guru, Tendik, Siswa, dan SK) ke Firestore secara otomatis jika database kosong atau butuh reset demonstrasi.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
              <RotateCcw className="w-4 h-4 text-emerald-600" />
              <span>Isi Ulang Sampel Data (Re-seed)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Muat ulang seluruh dummy dataset resmi Dikdasmen Muhammadiyah ke Firestore.
            </p>
            <button
              onClick={handleReseedDatabase}
              disabled={isResetting}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              {isResetting ? 'Memproses Firestore...' : 'Reset & Seed Demo Data'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
              <HardDrive className="w-4 h-4 text-sky-600" />
              <span>Cadangan Basis Data (JSON)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Unduh seluruh koleksi data aplikasi dalam format JSON terstruktur untuk arsip offline.
            </p>
            <button
              onClick={handleExportBackupJSON}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
