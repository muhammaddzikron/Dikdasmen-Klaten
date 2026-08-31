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
  const [selectedSk, setSelectedSk] = useState<SuratKeputusan | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Combined and filtered SK records
  const displaySkList = useMemo(() => {
    let list = currentUser?.role === 'Sekolah' ? filteredSkList : allSkList;

    // Filter by Type
    if (filterType !== 'ALL') {
      list = list.filter((item) => {
        const itemType = item.type || item.skTypeName || '';
        if (filterType === 'GURU') return itemType.includes('Guru') || itemType.includes('Pendidik');
        if (filterType === 'TENDIK') return itemType.includes('Tenaga Kependidikan') || itemType.includes('Tendik');
        if (filterType === 'KS') return itemType.includes('Kepala Sekolah');
        if (filterType === 'OPS') return itemType.includes('Pendirian') || itemType.includes('Operasional');
        return itemType === filterType;
      });
    }

    // Filter by Status
    if (filterStatus !== 'ALL') {
      list = list.filter((item) => {
        if (filterStatus === 'Menunggu Verifikasi' || filterStatus === 'Belum Terbit') {
          return item.status === 'Belum Terbit' || item.status === 'Menunggu Verifikasi' || !item.status;
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
          item.type?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allSkList, filteredSkList, currentUser?.role, filterType, filterStatus, searchQuery]);

  // Statistics counters
  const stats = useMemo(() => {
    const list = currentUser?.role === 'Sekolah' ? filteredSkList : allSkList;
    const total = list.length;
    const pending = list.filter((s) => s.status === 'Belum Terbit' || s.status === 'Menunggu Verifikasi' || !s.status).length;
    const approved = list.filter((s) => s.status === 'Terbit' || s.status === 'Disetujui' || s.status === 'Aktif').length;
    const rejected = list.filter((s) => s.status === 'Ditolak').length;

    const guruCount = list.filter((s) => (s.type || '').includes('Guru') || (s.type || '').includes('Pendidik')).length;
    const tendikCount = list.filter((s) => (s.type || '').includes('Tenaga Kependidikan') || (s.type || '').includes('Tendik')).length;
    const ksCount = list.filter((s) => (s.type || '').includes('Kepala Sekolah')).length;
    const opsCount = list.filter((s) => (s.type || '').includes('Pendirian') || (s.type || '').includes('Operasional')).length;

    return { total, pending, approved, rejected, guruCount, tendikCount, ksCount, opsCount };
  }, [allSkList, filteredSkList, currentUser?.role]);

  // Approval Workflow Handlers
  const handleApprove = async (sk: SuratKeputusan) => {
    try {
      await updateSk(sk.id, {
        status: 'Terbit',
        verification_status: 'Terverifikasi',
        approval_status: 'Disetujui',
        verifiedAt: new Date().toISOString(),
        verifiedBy: currentUser?.name || 'Admin Dikdasmen',
      });
      showToast(`SK ${sk.title || sk.skNumber} berhasil diverifikasi dan diterbitkan!`, 'success');
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
              Pengelolaan & Penerbitan SK Guru, Tendik, Kepala Sekolah, dan Izin Pendirian / Operasional
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pengajuan SK</span>
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <div className="mt-1 text-[11px] text-slate-500">Seluruh kategori SK</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Menunggu Verifikasi</span>
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
              <div className="mt-1 text-[11px] text-slate-500">Perlu ditindaklanjuti</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">SK Terbit & Sah</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</div>
              <div className="mt-1 text-[11px] text-slate-500">Aktif beroperasi/tugas</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ditolak / Revisi</span>
                <div className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
              <div className="mt-1 text-[11px] text-slate-500">Berkas perlu diperbaiki</div>
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
                <button
                  onClick={() => setFilterType('OPS')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    filterType === 'OPS'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  SK Pendirian / Operasional ({stats.opsCount})
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi / Belum Terbit</option>
                  <option value="Terbit">Terbit / Disetujui</option>
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
                placeholder="Cari berdasarkan Nomor SK, Judul SK, Nama Penerima, atau Nama Sekolah..."
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
                    <th className="px-4 py-3.5">Nomor & Tanggal SK</th>
                    <th className="px-4 py-3.5">Judul & Sub-Jenis SK</th>
                    <th className="px-4 py-3.5">Jenis SK</th>
                    <th className="px-4 py-3.5">Penerima SK</th>
                    <th className="px-4 py-3.5">Satuan Pendidikan</th>
                    <th className="px-4 py-3.5">Masa Berlaku (TMT)</th>
                    <th className="px-4 py-3.5">Berkas Persyaratan</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {displaySkList.length > 0 ? (
                    displaySkList.map((sk, idx) => {
                      const isApproved = sk.status === 'Terbit' || sk.status === 'Disetujui' || sk.status === 'Aktif';
                      const isRejected = sk.status === 'Ditolak';
                      const isPending = !isApproved && !isRejected;

                      const docsCount = sk.uploaded_documents?.length || 0;
                      const isSchoolTarget = sk.recipient_type === 'SATUAN PENDIDIKAN' || sk.type?.includes('Pendirian');

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
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {sk.subType || sk.skSubTypeName || 'Standar Dikdasmen'}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              (sk.type || '').includes('Guru')
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : (sk.type || '').includes('Tenaga Kependidikan') || (sk.type || '').includes('Tendik')
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : (sk.type || '').includes('Kepala Sekolah')
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {sk.type || sk.skTypeName || 'SK Guru'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {sk.targetName || '-'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {isSchoolTarget ? 'Satuan Pendidikan' : `NBM: ${sk.recipient_data?.nbm || '-'}`}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                            {sk.schoolName || '-'}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                            <div>{sk.skStartDate || sk.start_date || '-'}</div>
                            <div className="text-[10px] text-slate-500">s/d {sk.skEndDate || sk.end_date || 'Permanen'}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            {docsCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                                <Paperclip className="w-3 h-3 text-emerald-600" />
                                <span>{docsCount} Berkas</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Belum Ada</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle className="w-3 h-3" />
                                <span>Terbit</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <Clock className="w-3 h-3" />
                                <span>Menunggu Verifikasi</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                <XCircle className="w-3 h-3" />
                                <span>Ditolak</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Print / Preview Button */}
                              <button
                                onClick={() => handleOpenPrintPreview(sk)}
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Pratinjau Naskah SK Resmi & Cetak PDF"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* Approval Buttons for Admin */}
                              {isAdmin && isPending && (
                                <>
                                  <button
                                    onClick={() => handleApprove(sk)}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors"
                                    title="Setujui & Terbitkan SK"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenReject(sk)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                                    title="Tolak Pengajuan SK"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {/* Delete Button */}
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

      {/* SK OFFICIAL PRINT PREVIEW MODAL */}
      <SkPrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        sk={selectedSk}
        masterJenis={masterJenisSkList.find((j) => j.name === selectedSk?.type || j.name === selectedSk?.skTypeName)}
        masterSubJenis={masterSubJenisSkList.find((s) => s.id === selectedSk?.sk_sub_type_id || s.name === selectedSk?.subType)}
      />

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
              placeholder="Contoh: Berkas ijazah belum dilegalisir / data NBM tidak sesuai..."
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
