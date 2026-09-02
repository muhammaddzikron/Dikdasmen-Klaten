import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Eye,
  Trash2,
  X,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Building2,
  School,
  Check,
  Paperclip,
  ExternalLink,
  AlertCircle,
  FileCheck,
  CreditCard,
  BookOpen,
  Filter,
  Layers,
  Calendar,
  ChevronRight,
  RefreshCw,
  Play,
  BadgeCheck,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { SuratKeputusan, SkMainType, SkStatus } from '../../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportUtils';
import { DynamicSkFormModal } from './sk/DynamicSkFormModal';
import { SkPrintPreviewModal } from './sk/SkPrintPreviewModal';
import { MasterSkManager } from './sk/MasterSkManager';

export const SkModule: React.FC = () => {
  const {
    allSkList,
    filteredSkList,
    sekolahList,
    activeSekolahList,
    masterJenisSkList,
    masterSubJenisSkList,
    updateSk,
    deleteSk,
    showToast,
  } = useData();

  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';

  // Navigation tab: SK List or Master Config
  const [activeMainTab, setActiveMainTab] = useState<'skList' | 'masterConfig'>('skList');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [selectedSk, setSelectedSk] = useState<SuratKeputusan | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Combined and filtered SK records
  const displaySkList = useMemo(() => {
    let list = currentUser?.role === 'Sekolah' ? filteredSkList : allSkList;

    // Filter by Type (Guru, Tendik, Kepala Sekolah)
    if (filterType !== 'ALL') {
      list = list.filter((item) => {
        const itemType = item.type || item.skTypeName || '';
        if (filterType === 'GURU') return itemType.includes('Guru') || itemType.includes('Pendidik');
        if (filterType === 'TENDIK') return itemType.includes('Tenaga Kependidikan') || itemType.includes('Tendik');
        if (filterType === 'KS') return itemType.includes('Kepala Sekolah');
        return itemType === filterType;
      });
    }

    // Filter by Status
    if (filterStatus !== 'ALL') {
      list = list.filter((item) => {
        if (filterStatus === 'Menunggu Verifikasi') {
          return item.status === 'Belum Terbit' || item.status === 'Menunggu Verifikasi' || !item.status;
        }
        if (filterStatus === 'Diproses') {
          return item.status === 'Diproses' || item.verification_status === 'Diproses';
        }
        if (filterStatus === 'Terverifikasi') {
          return item.status === 'Terverifikasi' || item.verification_status === 'Terverifikasi';
        }
        if (filterStatus === 'Terbit') {
          return item.status === 'Terbit' || item.status === 'Disetujui' || item.status === 'Aktif';
        }
        if (filterStatus === 'Ditolak') {
          return item.status === 'Ditolak';
        }
        return item.status === filterStatus;
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.skNumber?.toLowerCase().includes(q) ||
          item.targetName?.toLowerCase().includes(q) ||
          item.schoolName?.toLowerCase().includes(q) ||
          item.type?.toLowerCase().includes(q) ||
          item.subType?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allSkList, filteredSkList, currentUser?.role, filterType, filterStatus, searchQuery]);

  // Statistics counters
  const stats = useMemo(() => {
    const list = currentUser?.role === 'Sekolah' ? filteredSkList : allSkList;
    const total = list.length;
    const pending = list.filter((s) => s.status === 'Belum Terbit' || s.status === 'Menunggu Verifikasi' || !s.status).length;
    const processing = list.filter((s) => s.status === 'Diproses' || s.verification_status === 'Diproses').length;
    const verified = list.filter((s) => s.status === 'Terverifikasi' || s.verification_status === 'Terverifikasi').length;
    const approved = list.filter((s) => s.status === 'Terbit' || s.status === 'Disetujui' || s.status === 'Aktif').length;
    const rejected = list.filter((s) => s.status === 'Ditolak').length;

    const guruCount = list.filter((s) => (s.type || '').includes('Guru') || (s.type || '').includes('Pendidik')).length;
    const tendikCount = list.filter((s) => (s.type || '').includes('Tenaga Kependidikan') || (s.type || '').includes('Tendik')).length;
    const ksCount = list.filter((s) => (s.type || '').includes('Kepala Sekolah')).length;

    return { total, pending, processing, verified, approved, rejected, guruCount, tendikCount, ksCount };
  }, [allSkList, filteredSkList, currentUser?.role]);

  // Step 1: PROSES Handlers
  const handleProses = async (sk: SuratKeputusan) => {
    try {
      await updateSk(sk.id, {
        status: 'Diproses',
        verification_status: 'Diproses',
        processedAt: new Date().toISOString(),
        processedBy: currentUser?.name || 'Admin Dikdasmen',
      });
      showToast(`SK ${sk.title || sk.skNumber} sekarang berstatus DIPROSES.`, 'info');
    } catch (err) {
      showToast('Gagal memproses pengajuan SK.', 'error');
    }
  };

  // Step 2: VERIFIKASI Handlers
  const handleVerifikasi = async (sk: SuratKeputusan) => {
    try {
      await updateSk(sk.id, {
        status: 'Terverifikasi',
        verification_status: 'Terverifikasi',
        verifiedAt: new Date().toISOString(),
        verifiedBy: currentUser?.name || 'Admin Dikdasmen',
      });
      showToast(`Berkas SK ${sk.title || sk.skNumber} berhasil DIVERIFIKASI!`, 'success');
    } catch (err) {
      showToast('Gagal memverifikasi berkas SK.', 'error');
    }
  };

  // Step 3: APPROVE (Terbitkan SK) Handlers
  const handleApprove = async (sk: SuratKeputusan) => {
    try {
      await updateSk(sk.id, {
        status: 'Terbit',
        verification_status: 'Terverifikasi',
        approval_status: 'Disetujui',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser?.name || 'Admin Dikdasmen',
        publishedAt: new Date().toISOString(),
      });
      showToast(`SK ${sk.title || sk.skNumber} BERHASIL DISETUJUI & DITERBITKAN! SK baru siap diunduh.`, 'success');
    } catch (err) {
      showToast('Gagal memproses persetujuan SK.', 'error');
    }
  };

  const handleOpenReject = (sk: SuratKeputusan) => {
    setSelectedSk(sk);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedSk) return;
    if (!rejectReason.trim()) {
      showToast('Harap isi alasan/catatan penolakan SK.', 'warning');
      return;
    }

    try {
      await updateSk(selectedSk.id, {
        status: 'Ditolak',
        verification_status: 'Ditolak',
        approval_status: 'Ditolak',
        rejectionReason: rejectReason,
        rejectedAt: new Date().toISOString(),
        rejectedBy: currentUser?.name || 'Admin Dikdasmen',
      });
      showToast(`Pengajuan SK ${selectedSk.title} telah ditolak.`, 'info');
      setIsRejectModalOpen(false);
      setSelectedSk(null);
    } catch (err) {
      showToast('Gagal memproses penolakan SK.', 'error');
    }
  };

  const handleOpenPrintPreview = (sk: SuratKeputusan) => {
    setSelectedSk(sk);
    setIsPrintModalOpen(true);
  };

  const handleOpenDocViewer = (sk: SuratKeputusan) => {
    setSelectedSk(sk);
    setIsDocViewerOpen(true);
  };

  const handleDelete = async (sk: SuratKeputusan) => {
    if (window.confirm(`Yakin ingin menghapus SK "${sk.title || sk.skNumber}"?`)) {
      await deleteSk(sk.id);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const dataToExport = displaySkList.map((item, idx) => ({
      No: idx + 1,
      'Nomor SK': item.skNumber || '-',
      'Judul SK': item.title || '-',
      'Jenis SK': item.type || item.skTypeName || '-',
      'Sub-Jenis': item.subType || item.skSubTypeName || '-',
      'Jenis Pengajuan': item.submissionType || 'Baru',
      'Penerima SK': item.targetName || '-',
      'Satuan Pendidikan': item.schoolName || '-',
      'TMT Mulai': item.skStartDate || '-',
      'TMT Berakhir': item.skEndDate || '-',
      Status: item.status || 'Belum Terbit',
    }));
    exportToCSV('Daftar_Surat_Keputusan_Dikdasmen', dataToExport);
  };

  const handleExportExcel = () => {
    const dataToExport = displaySkList.map((item, idx) => ({
      No: idx + 1,
      'Nomor SK': item.skNumber || '-',
      'Judul SK': item.title || '-',
      'Jenis SK': item.type || item.skTypeName || '-',
      'Sub-Jenis': item.subType || item.skSubTypeName || '-',
      'Jenis Pengajuan': item.submissionType || 'Baru',
      'Penerima SK': item.targetName || '-',
      'Satuan Pendidikan': item.schoolName || '-',
      'TMT Mulai': item.skStartDate || '-',
      'TMT Berakhir': item.skEndDate || '-',
      Status: item.status || 'Belum Terbit',
    }));
    exportToExcel('Daftar_Surat_Keputusan_Dikdasmen', 'Data SK', dataToExport);
  };

  const handleExportPDF = () => {
    const headers = ['No', 'Nomor SK', 'Judul SK', 'Jenis SK', 'Penerima', 'Sekolah', 'Status'];
    const rows = displaySkList.map((item, idx) => [
      String(idx + 1),
      item.skNumber || '-',
      item.title || '-',
      item.type || '-',
      item.targetName || '-',
      item.schoolName || '-',
      item.status || 'Belum Terbit',
    ]);
    exportToPDF(
      'Laporan Daftar Surat Keputusan (SK) Majelis Dikdasmen & PNF Klaten',
      headers,
      rows,
      'Laporan_SK_Dikdasmen'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Manajemen Surat Keputusan (SK)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Alur Pengajuan, Verifikasi, dan Penerbitan SK Guru, Tendik, dan Kepala Sekolah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-lg">
              <button
                onClick={() => setActiveMainTab('skList')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  activeMainTab === 'skList'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Daftar Dokumen SK
              </button>
              <button
                onClick={() => setActiveMainTab('masterConfig')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  activeMainTab === 'masterConfig'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Master Jenis SK
              </button>
            </div>
          )}

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan SK Baru</span>
          </button>
        </div>
      </div>

      {/* RENDER MASTER SK MANAGER TAB */}
      {activeMainTab === 'masterConfig' ? (
        <MasterSkManager />
      ) : (
        /* RENDER SK LIST TAB */
        <div className="space-y-6">
          {/* STATS SUMMARY WIDGETS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pengajuan</span>
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <div className="mt-1 text-[11px] text-slate-500">Seluruh kategori SK</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Menunggu</span>
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
              <div className="mt-1 text-[11px] text-slate-500">Perlu diproses</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Diproses & Verif</span>
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.processing + stats.verified}</div>
              <div className="mt-1 text-[11px] text-slate-500">{stats.processing} proses, {stats.verified} verif</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">SK Terbit (Sah)</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</div>
              <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Siap diunduh</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ditolak</span>
                <div className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
              <div className="mt-1 text-[11px] text-slate-500">Perlu revisi pemohon</div>
            </div>
          </div>

          {/* FILTER TABS & SEARCH BAR */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            {/* Row 1: Category Filter Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    filterType === 'ALL'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Semua SK ({stats.total})
                </button>
                <button
                  onClick={() => setFilterType('GURU')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    filterType === 'GURU'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  SK Guru (Pendidik) ({stats.guruCount})
                </button>
                <button
                  onClick={() => setFilterType('TENDIK')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    filterType === 'TENDIK'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  SK Tenaga Kependidikan ({stats.tendikCount})
                </button>
                <button
                  onClick={() => setFilterType('KS')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    filterType === 'KS'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  SK Kepala Sekolah ({stats.ksCount})
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Status Workflow</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Diproses">Sedang Diproses</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Terbit">Terbit / Disetujui (Approve)</option>
                  <option value="Ditolak">Ditolak</option>
                </select>

                {/* Export Dropdown */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleExportExcel}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
                    title="Export Excel"
                  >
                    Excel
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
                    title="Export PDF"
                  >
                    PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Search input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan Nomor SK, Judul SK, Nama Penerima, NBM, atau Nama Sekolah..."
                className="w-full text-xs pl-9 pr-9 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Bersihkan pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* SK DATA TABLE */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center">No</th>
                    <th className="px-4 py-3.5">Nomor & Tgl SK</th>
                    <th className="px-4 py-3.5">Judul & Sub-Jenis SK</th>
                    <th className="px-4 py-3.5">Jenis & Pengajuan</th>
                    <th className="px-4 py-3.5">Penerima SK</th>
                    <th className="px-4 py-3.5">Satuan Pendidikan</th>
                    <th className="px-4 py-3.5">Masa Berlaku</th>
                    <th className="px-4 py-3.5 text-center">Berkas Syarat</th>
                    <th className="px-4 py-3.5 text-center">Status Workflow</th>
                    <th className="px-4 py-3.5 text-center">Aksi / Alur Persetujuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {displaySkList.length > 0 ? (
                    displaySkList.map((sk, idx) => {
                      const isApproved = sk.status === 'Terbit' || sk.status === 'Disetujui' || sk.status === 'Aktif';
                      const isVerified = sk.status === 'Terverifikasi' || sk.verification_status === 'Terverifikasi';
                      const isProcessing = sk.status === 'Diproses' || sk.verification_status === 'Diproses';
                      const isRejected = sk.status === 'Ditolak';
                      const isPending = !isApproved && !isVerified && !isProcessing && !isRejected;

                      const docsCount = sk.uploaded_documents?.length || 0;
                      const subTypeBadge = sk.submissionType || 'Baru';

                      return (
                        <tr key={sk.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                          <td className="px-4 py-3.5 text-center text-slate-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900 dark:text-white font-mono">
                              {sk.skNumber || sk.sk_number || '-'}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>{sk.skStartDate || sk.start_date || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 max-w-xs">
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {sk.title || 'SURAT KEPUTUSAN'}
                            </div>
                            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                              {sk.subType || sk.skSubTypeName || 'Standar Dikdasmen'}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="space-y-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                (sk.type || '').includes('Guru')
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : (sk.type || '').includes('Tenaga Kependidikan') || (sk.type || '').includes('Tendik')
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              }`}>
                                {sk.type || sk.skTypeName || 'SK Guru'}
                              </span>
                              <div>
                                <span className={`inline-block px-1.5 py-0.2 text-[9px] font-medium rounded ${
                                  subTypeBadge === 'Baru'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                }`}>
                                  {subTypeBadge === 'Baru' ? 'Pengajuan Baru' : 'Perpanjangan SK'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {sk.targetName || sk.recipient_data?.name || '-'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              NBM: {sk.recipient_data?.nbm || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                            {sk.schoolName || '-'}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                            <div>{sk.skStartDate || sk.start_date || '-'}</div>
                            <div className="text-[10px] text-slate-500">s/d {sk.skEndDate || sk.end_date || 'Permanen'}</div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {docsCount > 0 ? (
                              <button
                                onClick={() => handleOpenDocViewer(sk)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800 transition-colors"
                                title="Lihat Berkas Persyaratan (Ijazah, NBM, SK Lama, Rekomendasi Cabang)"
                              >
                                <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{docsCount} Berkas</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Belum Ada</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shadow-2xs">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Terbit (Sah)</span>
                              </span>
                            )}
                            {isVerified && !isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                <BadgeCheck className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Terverifikasi</span>
                              </span>
                            )}
                            {isProcessing && !isVerified && !isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                                <span>Diproses</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Menunggu Verifikasi</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                                <span>Ditolak</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* DOWNLOAD / PRINT SK BUTTON: Prominently available when Approved */}
                              {isApproved ? (
                                <button
                                  onClick={() => handleOpenPrintPreview(sk)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                                  title="Unduh & Cetak Surat Keputusan Resmi"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download SK</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenPrintPreview(sk)}
                                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                  title="Pratinjau Format Naskah SK"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}

                              {/* ADMIN WORKFLOW ACTIONS: PROSES -> VERIFIKASI -> APPROVE */}
                              {isAdmin && !isApproved && !isRejected && (
                                <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                  {/* Step 1: Proses */}
                                  {isPending && (
                                    <button
                                      onClick={() => handleProses(sk)}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-colors"
                                      title="Langkah 1: Mulai Proses Pengajuan SK"
                                    >
                                      <Play className="w-3 h-3 fill-current" />
                                      <span>Proses</span>
                                    </button>
                                  )}

                                  {/* Step 2: Verifikasi */}
                                  {(isPending || isProcessing) && (
                                    <button
                                      onClick={() => handleVerifikasi(sk)}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-colors"
                                      title="Langkah 2: Verifikasi Kelayakan & Berkas Dokumen"
                                    >
                                      <BadgeCheck className="w-3 h-3" />
                                      <span>Verifikasi</span>
                                    </button>
                                  )}

                                  {/* Step 3: Approve / Terbitkan */}
                                  <button
                                    onClick={() => handleApprove(sk)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors"
                                    title="Langkah 3: Setujui & Terbitkan SK Resmi (Approve)"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Approve</span>
                                  </button>

                                  {/* Reject Button */}
                                  <button
                                    onClick={() => handleOpenReject(sk)}
                                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                                    title="Tolak Pengajuan SK"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}

                              {/* Delete Button for Admin */}
                              {isAdmin && (
                                <button
                                  onClick={() => handleDelete(sk)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                  title="Hapus Dokumen SK"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-slate-400 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="w-8 h-8 text-slate-300" />
                          <p>Tidak ada dokumen pengajuan SK yang ditemukan.</p>
                          <button
                            onClick={() => setIsSubmitModalOpen(true)}
                            className="text-xs text-emerald-600 hover:underline font-semibold"
                          >
                            + Ajukan SK Baru Sekarang
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC SK SUBMISSION FORM MODAL */}
      <DynamicSkFormModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />

      {/* SK OFFICIAL PRINT & DOWNLOAD PREVIEW MODAL */}
      <SkPrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        sk={selectedSk}
        masterJenis={masterJenisSkList.find((j) => j.name === selectedSk?.type || j.name === selectedSk?.skTypeName)}
        masterSubJenis={masterSubJenisSkList.find((s) => s.id === selectedSk?.sk_sub_type_id || s.name === selectedSk?.subType)}
      />

      {/* DOCUMENT VIEWER MODAL */}
      {isDocViewerOpen && selectedSk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600">
                <Paperclip className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Berkas Persyaratan SK
                </h3>
              </div>
              <button
                onClick={() => setIsDocViewerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {selectedSk.title || selectedSk.skNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                Penerima: {selectedSk.targetName} | {selectedSk.schoolName}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold">
                Jenis Pengajuan: {selectedSk.submissionType === 'Baru' ? 'Pengajuan Baru (Ijazah Terakhir, NBM & Rekomendasi Cabang)' : 'Perpanjangan SK (SK Lama & Rekomendasi Cabang)'}
              </p>
            </div>

            <div className="space-y-2.5">
              {selectedSk.uploaded_documents && selectedSk.uploaded_documents.length > 0 ? (
                selectedSk.uploaded_documents.map((doc, i) => (
                  <div
                    key={doc.requirementId || i}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg flex-shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {doc.name || doc.requirementName || 'Berkas Dokumen'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {doc.fileName} {doc.fileSize ? `(${Math.round(doc.fileSize / 1024)} KB)` : ''}
                        </p>
                      </div>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka File</span>
                    </a>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 text-center rounded-lg text-xs text-slate-400">
                  Tidak ada berkas yang diunggah untuk pengajuan ini.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDocViewerOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tolak Pengajuan SK
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Berikan alasan penolakan atau catatan revisi untuk pemohon SK:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Berkas ijazah belum terlampir / Nomor NBM tidak sesuai..."
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
