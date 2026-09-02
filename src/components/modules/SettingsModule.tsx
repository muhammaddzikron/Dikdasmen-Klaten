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
  UserPlus,
  Users,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ShieldCheck,
  Sparkles,
  LogIn,
  Phone,
  Mail,
  Lock,
  UserCheck,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { seedInitialData } from '../../lib/firestoreService';
import { AdminPetugas } from '../../types';

export const SettingsModule: React.FC = () => {
  const { currentUser, updateUserProfile, quickLogin } = useAuth();
  const {
    sekolahList,
    guruList,
    tendikList,
    kepalaSekolahList,
    siswaList,
    allSkList,
    mutasiList,
    adminPetugasList,
    addAdminPetugas,
    updateAdminPetugas,
    deleteAdminPetugas,
    showToast,
    addToast,
  } = useData();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isResetting, setIsResetting] = useState(false);

  // Admin Petugas State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPetugas, setEditingPetugas] = useState<AdminPetugas | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    password: string;
    email: string;
    jabatan: string;
    phone: string;
    isActive: boolean;
  }>({
    name: '',
    username: '',
    password: '',
    email: '',
    jabatan: '',
    phone: '',
    isActive: true,
  });

  const activeAdminPetugas = adminPetugasList.filter((p) => !p.isDeleted);

  const handleOpenAdd = () => {
    setEditingPetugas(null);
    setFormData({
      name: '',
      username: '',
      password: 'admin123',
      email: '',
      jabatan: 'Staf Pelaksana Dikdasmen',
      phone: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: AdminPetugas) => {
    setEditingPetugas(p);
    setFormData({
      name: p.name || '',
      username: p.username || '',
      password: p.password || 'admin123',
      email: p.email || '',
      jabatan: p.jabatan || 'Staf Pelaksana Dikdasmen',
      phone: p.phone || '',
      isActive: p.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleTogglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCredentials = (p: AdminPetugas) => {
    const text = `Akun Admin Petugas SIM Dikdasmen\nNama: ${p.name}\nJabatan: ${p.jabatan || 'Staf'}\nUsername: ${p.username}\nPassword: ${p.password || 'admin'}\nLink Akses: Tab "Super Admin"`;
    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    showToast(`Kredensial login @${p.username} berhasil disalin!`, 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSubmitPetugas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Nama lengkap Admin Petugas wajib diisi.', 'warning');
      return;
    }
    if (!formData.username.trim()) {
      showToast('Username login wajib diisi.', 'warning');
      return;
    }
    if (!formData.password.trim()) {
      showToast('Password login wajib diisi.', 'warning');
      return;
    }

    const cleanUsername = formData.username.trim().toLowerCase().replace(/\s+/g, '_');

    // Check duplicate username if adding or changing
    const isDuplicate = activeAdminPetugas.some(
      (p) =>
        p.username?.toLowerCase() === cleanUsername &&
        (!editingPetugas || p.id !== editingPetugas.id)
    );
    if (isDuplicate) {
      showToast(`Username "${cleanUsername}" sudah digunakan oleh akun lain.`, 'error');
      return;
    }

    try {
      if (editingPetugas) {
        await updateAdminPetugas(editingPetugas.id, {
          name: formData.name.trim(),
          username: cleanUsername,
          password: formData.password.trim(),
          email: formData.email.trim() || `${cleanUsername}@dikdasmenklaten.org`,
          jabatan: formData.jabatan.trim() || 'Staf Pelaksana Dikdasmen',
          phone: formData.phone.trim(),
          isActive: formData.isActive,
        });
      } else {
        await addAdminPetugas({
          name: formData.name.trim(),
          username: cleanUsername,
          password: formData.password.trim(),
          email: formData.email.trim() || `${cleanUsername}@dikdasmenklaten.org`,
          role: 'Admin',
          jabatan: formData.jabatan.trim() || 'Staf Pelaksana Dikdasmen',
          phone: formData.phone.trim() || '081298765432',
          isActive: formData.isActive,
          createdAt: new Date().toISOString(),
          isDeleted: false,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving admin petugas:', err);
      showToast(`Gagal menyimpan akun: ${err.message || 'Terjadi kesalahan'}`, 'error');
    }
  };

  const handleDeletePetugas = async (p: AdminPetugas) => {
    if (confirm(`Apakah Anda yakin ingin menonaktifkan dan menghapus akun Admin Petugas "${p.name}" (@${p.username})?`)) {
      await deleteAdminPetugas(p.id, false);
    }
  };

  const handleToggleStatus = async (p: AdminPetugas) => {
    const newStatus = !(p.isActive ?? true);
    await updateAdminPetugas(p.id, { isActive: newStatus });
    showToast(`Status akun ${p.name} diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`, 'info');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updateUserProfile) {
      await updateUserProfile({ name });
    }
    showToast('Profil pengguna berhasil diperbarui.', 'success');
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
        showToast('Database demo berhasil di-reset dan dimuat ulang ke Cloud Firestore!', 'success');
      } catch (err: any) {
        showToast(`Gagal mereset database: ${err.message}`, 'error');
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
        adminPetugas: adminPetugasList,
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
    showToast('Backup JSON berhasil diunduh.', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pengaturan Sistem & Database</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pengaturan akun pengguna, otorisasi staf Admin Petugas, sinkronisasi Cloud Firestore, dan cadangan data
        </p>
      </div>

      {/* SECTION 1: Manajemen Akun Admin Petugas */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Manajemen Akun Admin Petugas</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {activeAdminPetugas.length} Akun
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Akun pembantu Super Admin yang berwenang mengelola seluruh modul operasional (Sekolah, Guru, Tendik, Siswa, SK, Mutasi, Cabang, Laporan, Recycle Bin), namun tidak dapat mengakses modul Pengaturan Sistem & Database.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Admin Petugas</span>
          </button>
        </div>

        {/* Info Box RBAC */}
        <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 flex items-start gap-3 text-xs text-sky-900 dark:text-sky-200">
          <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Ketentuan Hak Akses Peran Admin Petugas:</p>
            <p className="text-[11.5px] leading-relaxed text-sky-800/90 dark:text-sky-300/90">
              • <strong>Bisa Mengelola:</strong> Dashboard, Master Data Cabang/PCM, Sekolah & Madrasah, Guru, Tendik, Kepala Sekolah, Siswa, Pengajuan & Penerbitan SK, Mutasi, Laporan Mutu, Recycle Bin, dan Log Audit.
              <br />
              • <strong>Tidak Dapat Membuka:</strong> Modul <em>Pengaturan Sistem & Database</em> (Menu disembunyikan & diproteksi khusus Super Admin).
            </p>
          </div>
        </div>

        {/* List of Admin Petugas */}
        {activeAdminPetugas.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Belum ada akun Admin Petugas yang didaftarkan.
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Buat Akun Petugas Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAdminPetugas.map((petugas) => {
              const isCopied = copiedId === petugas.id;
              const showPass = showPasswords[petugas.id] || false;
              const isActive = petugas.isActive ?? true;

              return (
                <div
                  key={petugas.id}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden bg-slate-50/50 dark:bg-slate-800/40 ${
                    isActive
                      ? 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
                      : 'border-rose-200 dark:border-rose-900/50 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold flex items-center justify-center shadow-sm">
                        {petugas.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                            {petugas.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          {petugas.jabatan || 'Staf Pelaksana Dikdasmen'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(petugas)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Edit Data Admin Petugas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePetugas(petugas)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Hapus / Nonaktifkan Akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Account Details & Credentials */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 font-mono">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Key className="w-3.5 h-3.5 text-emerald-500" />
                        <span>user: <strong>{petugas.username}</strong></span>
                        <span className="text-slate-400">•</span>
                        <span>
                          pass:{' '}
                          <strong>
                            {showPass ? petugas.password || 'admin' : '••••••••'}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePassword(petugas.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md cursor-pointer"
                          title={showPass ? 'Sembunyikan password' : 'Lihat password'}
                        >
                          {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(petugas)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-sans text-[10px] font-bold transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                          title="Salin username dan password"
                        >
                          {isCopied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                          <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400 text-[10.5px]">
                      {petugas.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[180px]">{petugas.email}</span>
                        </span>
                      )}
                      {petugas.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{petugas.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Quick Test Login */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(petugas)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium underline cursor-pointer"
                    >
                      {isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                    </button>

                    <button
                      type="button"
                      onClick={() => quickLogin('Admin', petugas.name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                      title="Masuk langsung sebagai Admin Petugas ini untuk simulasi"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>Simulasi Login</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: User Profile Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span>Profil Pengguna Super Admin</span>
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
              <span>Role Otoritas: <strong className="text-slate-800 dark:text-slate-200">{currentUser?.role}</strong></span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: Database Management & Demo Seeding */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Pengelolaan Cloud Firestore & Data Demo</span>
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Fitur ini memungkinkan Anda memuat ulang sampel data master lengkap (Cabang PCM, Sekolah, Admin Petugas, Guru, Tendik, Siswa, dan SK) ke Firestore secara otomatis jika database kosong atau butuh reset demonstrasi.
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
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
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
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Tambah / Edit Admin Petugas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingPetugas ? 'Edit Akun Admin Petugas' : 'Tambah Akun Admin Petugas'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Otorisasi staf pengelola untuk membantu tugas Super Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPetugas} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Nama Lengkap Petugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bambang Triyono, S.Kom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Jabatan / Unit Kerja
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Staf Pelaksana / Operator SK"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    No. WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="petugas_bambang"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Password Akun <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="admin123"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                    <Lock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Email Akun (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="bambang@dikdasmenklaten.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Status Akun</div>
                  <div className="text-[11px] text-slate-500">Izinkan admin petugas ini untuk login ke sistem</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {editingPetugas ? 'Simpan Perubahan' : 'Daftarkan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

