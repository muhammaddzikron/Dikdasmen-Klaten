import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Upload,
  Sparkles,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Briefcase,
  Award,
  ChevronDown,
  UserPlus,
  Pencil,
  Building2,
  School,
  Check,
  Paperclip,
  ExternalLink,
  AlertCircle,
  FileCheck,
  CreditCard,
  BookOpen,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { SuratKeputusan, SkType, SkStatus } from '../../types';
import { printOfficialSK } from '../../lib/storageService';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportUtils';

interface RecipientCandidate {
  id: string;
  name: string;
  category: 'Guru' | 'Tendik' | 'Kepala Sekolah';
  status: string;
  details: string;
  nbm?: string;
  nipm?: string;
  nuptk?: string;
  schoolId: string;
}

export const SkModule: React.FC = () => {
  const {
    filteredSkList,
    sekolahList,
    activeSekolahList,
    guruList,
    tendikList,
    kepalaSekolahList,
    addSk,
    updateSk,
    deleteSk,
  } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SuratKeputusan | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Upload simulation state per slot
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  // Recipient Search & Selector state inside Modal
  const [recipientSearch, setRecipientSearch] = useState('');
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);
  const [recipientCategoryFilter, setRecipientCategoryFilter] = useState<'ALL' | 'Guru' | 'Tendik' | 'Kepala Sekolah'>('ALL');
  const [isManualInput, setIsManualInput] = useState(false);
  const recipientDropdownRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<SuratKeputusan>>({
    skNumber: '',
    title: '',
    schoolId: '',
    type: 'SK Guru',
    submissionType: 'Baru',
    status: 'Belum Terbit',
    targetName: '',
    targetId: '',
    skStartDate: new Date().toISOString().split('T')[0],
    skEndDate: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
    signerRole: 'Ketua Majelis Dikdasmen Daerah',
    documentUrl: '',
    fileNbmUrl: '',
    fileIjazahUrl: '',
    fileSkLamaUrl: '',
  });

  const availableSchools = useMemo(() => {
    if (currentUser?.role === 'Sekolah') {
      const userSchoolId = currentUser.sekolahId;
      const matched = sekolahList.filter(
        (s) => !s.isDeleted && (s.id === userSchoolId || s.npsn === userSchoolId)
      );
      if (matched.length > 0) return matched;
      return activeSekolahList.length > 0 ? [activeSekolahList[0]] : [];
    }
    if (currentUser?.role === 'Cabang') {
      const userCabangId = currentUser.cabangId;
      return sekolahList.filter((s) => !s.isDeleted && s.cabangId === userCabangId);
    }
    return sekolahList.filter((s) => !s.isDeleted);
  }, [sekolahList, currentUser, activeSekolahList]);

  // Close recipient dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        recipientDropdownRef.current &&
        !recipientDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRecipientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute school-specific candidate list for PTK (Guru, Tendik, Kepala Sekolah)
  const schoolCandidates = useMemo(() => {
    if (!formData.schoolId) return [];
    const list: RecipientCandidate[] = [];

    // 1. Guru
    const gurus = guruList.filter((g) => !g.isDeleted && g.schoolId === formData.schoolId);
    gurus.forEach((g) => {
      list.push({
        id: g.id,
        name: g.name,
        category: 'Guru',
        status: g.status || 'GTY',
        details: g.subject ? `Mapel: ${g.subject}` : (g.teacherType || 'Guru'),
        nbm: g.nbm,
        nipm: g.nipm,
        nuptk: g.nuptk,
        schoolId: g.schoolId,
      });
    });

    // 2. Tendik
    const tendiks = tendikList.filter((t) => !t.isDeleted && t.schoolId === formData.schoolId);
    tendiks.forEach((t) => {
      list.push({
        id: t.id,
        name: t.name,
        category: 'Tendik',
        status: t.status || 'KTY',
        details: t.position || 'Tenaga Kependidikan',
        nbm: t.nbm,
        nipm: t.nipm,
        schoolId: t.schoolId,
      });
    });

    // 3. Kepala Sekolah
    const keps = kepalaSekolahList.filter((k) => !k.isDeleted && k.schoolId === formData.schoolId);
    keps.forEach((k) => {
      list.push({
        id: k.id,
        name: k.name,
        category: 'Kepala Sekolah',
        status: k.employmentStatus || 'GTY',
        details: `Kepala Sekolah (Periode ke-${k.periodNumber || 1})`,
        nbm: k.nbm,
        nipm: k.nipm,
        nuptk: k.nuptk,
        schoolId: k.schoolId,
      });
    });

    return list;
  }, [formData.schoolId, guruList, tendikList, kepalaSekolahList]);

  // Candidates filtered by category tab and search query
  const filteredCandidates = useMemo(() => {
    return schoolCandidates.filter((c) => {
      const matchCategory =
        recipientCategoryFilter === 'ALL' || c.category === recipientCategoryFilter;
      const q = recipientSearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.nbm && c.nbm.toLowerCase().includes(q)) ||
        (c.nipm && c.nipm.toLowerCase().includes(q)) ||
        (c.nuptk && c.nuptk.toLowerCase().includes(q)) ||
        c.details.toLowerCase().includes(q);

      return matchCategory && matchQuery;
    });
  }, [schoolCandidates, recipientCategoryFilter, recipientSearch]);

  const selectedCandidateInfo = useMemo(() => {
    if (!formData.targetName) return null;
    return schoolCandidates.find(
      (c) =>
        (formData.targetId && c.id === formData.targetId) ||
        c.name.toLowerCase() === formData.targetName?.toLowerCase()
    );
  }, [formData.targetName, formData.targetId, schoolCandidates]);

  const activeSks = useMemo(() => filteredSkList.filter((s) => !s.isDeleted), [filteredSkList]);

  const filtered = useMemo(() => {
    return activeSks.filter((sk) => {
      const matchSearch =
        sk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sk.skNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sk.targetName && sk.targetName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = filterType === 'ALL' || sk.type === filterType;
      const matchStatus = filterStatus === 'ALL' || sk.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [activeSks, searchQuery, filterType, filterStatus]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    const defaultSchoolId =
      (currentUser?.role === 'Sekolah' ? (currentUser.sekolahId || availableSchools[0]?.id) : null) ||
      availableSchools[0]?.id ||
      activeSekolahList[0]?.id ||
      '';
    
    // Find initial candidate from that school
    const firstGuru = guruList.find((g) => !g.isDeleted && g.schoolId === defaultSchoolId);

    setFormData({
      skNumber: '',
      title: 'Pengangkatan Guru Tetap Yayasan',
      schoolId: defaultSchoolId,
      type: 'SK Guru',
      submissionType: 'Baru',
      status: currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' ? 'Terbit' : 'Belum Terbit',
      targetName: firstGuru?.name || '',
      targetId: firstGuru?.id || '',
      skStartDate: new Date().toISOString().split('T')[0],
      skEndDate: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
      signerRole: 'Ketua Majelis Dikdasmen Daerah',
      documentUrl: '',
      fileIjazahUrl: '',
      fileNbmUrl: '',
      fileSkLamaUrl: '',
    });
    setRecipientSearch('');
    setRecipientCategoryFilter('Guru');
    setIsManualInput(false);
    setIsRecipientDropdownOpen(false);
    setUploadProgress({});
    setUploadingSlot(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sk: SuratKeputusan) => {
    setSelectedItem(sk);
    setFormData({ ...sk });
    setRecipientSearch('');
    if (sk.type === 'SK Guru') setRecipientCategoryFilter('Guru');
    else if (sk.type === 'SK Tendik') setRecipientCategoryFilter('Tendik');
    else if (sk.type === 'SK Kepala Sekolah') setRecipientCategoryFilter('Kepala Sekolah');
    else setRecipientCategoryFilter('ALL');
    setIsManualInput(false);
    setIsRecipientDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleSelectCandidate = (candidate: RecipientCandidate) => {
    setFormData((prev) => {
      let updatedTitle = prev.title;
      // Auto-set title if still default or blank
      if (!updatedTitle || updatedTitle === 'Pengangkatan Guru Tetap Yayasan' || updatedTitle === 'Pengangkatan Tenaga Kependidikan' || updatedTitle === 'Penetapan Kepala Sekolah') {
        if (candidate.category === 'Guru') {
          updatedTitle = 'Pengangkatan Guru Tetap Yayasan';
        } else if (candidate.category === 'Tendik') {
          updatedTitle = 'Pengangkatan Tenaga Kependidikan';
        } else if (candidate.category === 'Kepala Sekolah') {
          updatedTitle = 'Penetapan Kepala Sekolah / Madrasah';
        }
      }
      return {
        ...prev,
        targetName: candidate.name,
        targetId: candidate.id,
        title: updatedTitle,
      };
    });
    setRecipientSearch('');
    setIsRecipientDropdownOpen(false);
  };

  const handleSchoolChange = (schoolId: string) => {
    setFormData((prev) => {
      // Find candidate in newly selected school matching current category
      const targetGurus = guruList.filter((g) => !g.isDeleted && g.schoolId === schoolId);
      const targetTendiks = tendikList.filter((t) => !t.isDeleted && t.schoolId === schoolId);
      const targetKeps = kepalaSekolahList.filter((k) => !k.isDeleted && k.schoolId === schoolId);

      let newTargetName = '';
      let newTargetId = '';
      if (prev.type === 'SK Guru' && targetGurus.length > 0) {
        newTargetName = targetGurus[0].name;
        newTargetId = targetGurus[0].id;
      } else if (prev.type === 'SK Tendik' && targetTendiks.length > 0) {
        newTargetName = targetTendiks[0].name;
        newTargetId = targetTendiks[0].id;
      } else if (prev.type === 'SK Kepala Sekolah' && targetKeps.length > 0) {
        newTargetName = targetKeps[0].name;
        newTargetId = targetKeps[0].id;
      }

      return {
        ...prev,
        schoolId,
        targetName: newTargetName,
        targetId: newTargetId,
      };
    });
    setRecipientSearch('');
  };

  const handleSkTypeChange = (type: SkType) => {
    let catFilter: 'ALL' | 'Guru' | 'Tendik' | 'Kepala Sekolah' = 'ALL';
    let defaultTitle = formData.title || '';

    if (type === 'SK Guru') {
      catFilter = 'Guru';
      defaultTitle = 'Pengangkatan Guru Tetap Yayasan';
    } else if (type === 'SK Tendik') {
      catFilter = 'Tendik';
      defaultTitle = 'Pengangkatan Tenaga Kependidikan';
    } else if (type === 'SK Kepala Sekolah') {
      catFilter = 'Kepala Sekolah';
      defaultTitle = 'Penetapan Kepala Sekolah / Madrasah';
    } else if (type === 'SK Pendirian') {
      catFilter = 'ALL';
      defaultTitle = 'Izin Operasional Satuan Pendidikan';
    }

    setRecipientCategoryFilter(catFilter);

    // Auto pick candidate in this category for current school if available
    let autoTargetName = formData.targetName;
    let autoTargetId = formData.targetId;

    if (formData.schoolId) {
      if (type === 'SK Guru') {
        const g = guruList.find((x) => !x.isDeleted && x.schoolId === formData.schoolId);
        if (g) {
          autoTargetName = g.name;
          autoTargetId = g.id;
        }
      } else if (type === 'SK Tendik') {
        const t = tendikList.find((x) => !x.isDeleted && x.schoolId === formData.schoolId);
        if (t) {
          autoTargetName = t.name;
          autoTargetId = t.id;
        }
      } else if (type === 'SK Kepala Sekolah') {
        const k = kepalaSekolahList.find((x) => !x.isDeleted && x.schoolId === formData.schoolId);
        if (k) {
          autoTargetName = k.name;
          autoTargetId = k.id;
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      type,
      title: defaultTitle,
      targetName: autoTargetName,
      targetId: autoTargetId,
    }));
  };

  const handleFileUploadSlot = (
    slotKey: 'fileIjazahUrl' | 'fileNbmUrl' | 'fileSkLamaUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlot(slotKey);
    setUploadProgress((prev) => ({ ...prev, [slotKey]: 20 }));

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const current = prev[slotKey] || 20;
        if (current >= 100) {
          clearInterval(interval);
          setUploadingSlot(null);
          setFormData((f) => ({
            ...f,
            [slotKey]: `https://storage.googleapis.com/sim-dikdasmen/${file.name}`,
            ...(slotKey === 'fileSkLamaUrl'
              ? { documentUrl: `https://storage.googleapis.com/sim-dikdasmen/${file.name}` }
              : {}),
          }));
          return { ...prev, [slotKey]: 100 };
        }
        return { ...prev, [slotKey]: current + 30 };
      });
    }, 150);
  };

  const handleRemoveAttachment = (slotKey: 'fileIjazahUrl' | 'fileNbmUrl' | 'fileSkLamaUrl') => {
    setFormData((f) => ({
      ...f,
      [slotKey]: '',
      ...(slotKey === 'fileSkLamaUrl' ? { documentUrl: '' } : {}),
    }));
    setUploadProgress((prev) => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const handleUseCandidateNbm = () => {
    if (selectedCandidateInfo?.nbm) {
      setFormData((f) => ({
        ...f,
        fileNbmUrl: `https://storage.googleapis.com/sim-dikdasmen/kartu_nbm_${selectedCandidateInfo.nbm}.pdf`,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.schoolId) return;

    const dataToSave = {
      ...formData,
      skNumber: formData.skNumber?.trim() || '',
    };

    if (selectedItem) {
      await updateSk(selectedItem.id, dataToSave);
    } else {
      await addSk(dataToSave as Omit<SuratKeputusan, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleApprove = async (sk: SuratKeputusan) => {
    const isAutoOrDraft =
      !sk.skNumber ||
      sk.skNumber.startsWith('DIKDASMEN') ||
      sk.skNumber.includes('Otomatis') ||
      sk.skNumber.includes('Menunggu');

    const officialSkNumber = isAutoOrDraft
      ? `${Math.floor(100 + Math.random() * 900)}/KEP/III.4/D/${new Date().getFullYear()}`
      : sk.skNumber;

    await updateSk(sk.id, {
      status: 'Terbit',
      skNumber: officialSkNumber,
    });
  };

  const handleOpenReject = (sk: SuratKeputusan) => {
    setSelectedItem(sk);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedItem) return;
    await updateSk(selectedItem.id, {
      status: 'Ditolak',
      notes: rejectReason || 'Persyaratan dokumen belum lengkap.',
    });
    setIsRejectModalOpen(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Pindahkan SK "${title}" ke Recycle Bin?`)) {
      await deleteSk(id);
    }
  };

  const handlePrint = (sk: SuratKeputusan) => {
    const school = sekolahList.find((s) => s.id === sk.schoolId);
    printOfficialSK(sk, school?.name);
  };

  const handleExportCSV = () => {
    const rows = filtered.map((sk) => {
      const school = sekolahList.find((s) => s.id === sk.schoolId);
      return {
        Nomor_SK: sk.skNumber,
        Judul: sk.title,
        Satuan_Pendidikan: school?.name || '',
        Penerima: sk.targetName || '',
        Jenis_SK: sk.type,
        Tipe_Pengajuan: sk.submissionType,
        Status: sk.status,
        Mulai: sk.skStartDate || '',
        Berakhir: sk.skEndDate || '',
      };
    });
    exportToCSV(`Data_SK_Dikdasmen_${Date.now()}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Manajemen & Pengajuan SK</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
              {filtered.length} Dokumen SK
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Alur verifikasi penerbitan Surat Keputusan (SK) Guru, SK Tendik, SK Kepala Sekolah, dan Izin Operasional
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          {currentUser?.role !== 'Cabang' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan SK Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari no SK, judul, penerima..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          aria-label="Filter Jenis SK"
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">Semua Jenis SK</option>
          <option value="SK Guru">SK Guru (Pendidik)</option>
          <option value="SK Tendik">SK Tenaga Kependidikan</option>
          <option value="SK Kepala Sekolah">SK Kepala Sekolah</option>
          <option value="SK Pendirian">SK Pendirian / Operasional</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter Status Penerbitan"
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">Semua Status Penerbitan</option>
          <option value="Terbit">✓ Terbit (Resmi)</option>
          <option value="Belum Terbit">⏳ Menunggu Verifikasi</option>
          <option value="Ditolak">✗ Ditolak</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Nomor & Judul SK</th>
                <th className="p-3.5">Satuan Pendidikan</th>
                <th className="p-3.5">Penerima SK</th>
                <th className="p-3.5">Jenis / Tipe</th>
                <th className="p-3.5">Masa Berlaku</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada berkas SK yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((sk) => {
                  const school = sekolahList.find((s) => s.id === sk.schoolId);
                  const canVerify = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';

                  return (
                    <tr key={sk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{sk.title}</div>
                        <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {sk.skNumber && !sk.skNumber.includes('Otomatis') && !sk.skNumber.includes('Menunggu') ? (
                            <span>{sk.skNumber}</span>
                          ) : (
                            <span className="text-amber-700 dark:text-amber-300 font-sans text-[10px] bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 inline-block font-medium">
                              (Otomatis disesuaikan Admin)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{school?.name || '-'}</td>
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{sk.targetName || '-'}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{sk.type}</div>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            sk.submissionType === 'Baru'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}>
                            {sk.submissionType}
                          </span>
                          {sk.submissionType === 'Baru' ? (
                            <>
                              {sk.fileIjazahUrl && (
                                <a
                                  href={sk.fileIjazahUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:text-emerald-700 dark:hover:text-emerald-300"
                                  title="Lihat Ijazah Terakhir"
                                >
                                  <GraduationCap className="w-2.5 h-2.5" />
                                  <span>Ijazah</span>
                                </a>
                              )}
                              {sk.fileNbmUrl && (
                                <a
                                  href={sk.fileNbmUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:text-emerald-700 dark:hover:text-emerald-300"
                                  title="Lihat Kartu NBM"
                                >
                                  <CreditCard className="w-2.5 h-2.5" />
                                  <span>NBM</span>
                                </a>
                              )}
                            </>
                          ) : (
                            (sk.fileSkLamaUrl || sk.documentUrl) && (
                              <a
                                href={sk.fileSkLamaUrl || sk.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:text-blue-700 dark:hover:text-blue-300"
                                title="Lihat SK Terakhir"
                              >
                                <FileText className="w-2.5 h-2.5" />
                                <span>SK Lama</span>
                              </a>
                            )
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        {sk.skStartDate && sk.skEndDate ? `${sk.skStartDate} s/d ${sk.skEndDate}` : '-'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            sk.status === 'Terbit'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : sk.status === 'Ditolak'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {sk.status === 'Terbit' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : sk.status === 'Ditolak' ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{sk.status}</span>
                        </span>
                        {sk.notes && <div className="text-[10px] text-rose-500 mt-0.5">{sk.notes}</div>}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Verifikasi jika status Belum Terbit & user adalah Admin/Super Admin */}
                          {canVerify && sk.status === 'Belum Terbit' && (
                            <>
                              <button
                                onClick={() => handleApprove(sk)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm"
                                title="Setujui & Terbitkan SK"
                              >
                                Terbitkan
                              </button>
                              <button
                                onClick={() => handleOpenReject(sk)}
                                className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px] font-bold"
                                title="Tolak Pengajuan"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {(currentUser?.role === 'Super Admin' ||
                            currentUser?.role === 'Admin' ||
                            (currentUser?.role === 'Sekolah' && currentUser.sekolahId === sk.schoolId)) && (
                            <button
                              onClick={() => handleOpenEdit(sk)}
                              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit Data SK"
                            >
                              <Pencil className="w-4 h-4 text-amber-600" />
                            </button>
                          )}

                          <button
                            onClick={() => handlePrint(sk)}
                            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Cetak Surat Keputusan Resmi (Kop Majelis Dikdasmen)"
                          >
                            <Printer className="w-4 h-4 text-emerald-600" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItem(sk);
                              setIsPreviewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Preview Digital"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
                            <button
                              onClick={() => handleDelete(sk.id, sk.title)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Hapus ke Recycle Bin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Pengajuan SK Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <span>Pengajuan & Penerbitan Surat Keputusan (SK)</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Judul Dokumen SK *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Pengangkatan Guru Tetap Yayasan"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Satuan Pendidikan Pemohon *</label>
                  {currentUser?.role === 'Sekolah' ? (
                    <div className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <School className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate text-xs">
                          {availableSchools.find((s) => s.id === formData.schoolId)?.name ||
                            availableSchools[0]?.name ||
                            'Satuan Pendidikan Anda'}{' '}
                          ({availableSchools.find((s) => s.id === formData.schoolId)?.level || availableSchools[0]?.level || ''}) -{' '}
                          {availableSchools.find((s) => s.id === formData.schoolId)?.npsn || availableSchools[0]?.npsn || ''}
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
                        Sekolah Anda
                      </span>
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.schoolId || ''}
                      onChange={(e) => handleSchoolChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="" disabled>-- Pilih Satuan Pendidikan --</option>
                      {availableSchools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.level}) - {s.npsn}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="font-semibold block mb-1">Jenis SK</label>
                  <select
                    value={formData.type || 'SK Guru'}
                    onChange={(e) => handleSkTypeChange(e.target.value as SkType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold text-emerald-700 dark:text-emerald-400"
                  >
                    <option value="SK Guru">SK Guru (Pendidik)</option>
                    <option value="SK Tendik">SK Tenaga Kependidikan</option>
                    <option value="SK Kepala Sekolah">SK Kepala Sekolah</option>
                    <option value="SK Pendirian">SK Pendirian / Operasional</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Tipe Pengajuan</label>
                  <select
                    value={formData.submissionType || 'Baru'}
                    onChange={(e) => setFormData({ ...formData, submissionType: e.target.value as 'Baru' | 'Perpanjangan' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="Baru">Pengajuan Baru (Pertama Kali)</option>
                    <option value="Perpanjangan">Perpanjangan Masa Berlaku</option>
                  </select>
                </div>

                {/* Recipient Picker / Searchable Candidate Field */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Nama Penerima SK (Guru / Tendik / KS) *</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {formData.schoolId && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                          {schoolCandidates.length} PTK terdaftar di sekolah ini
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualInput(!isManualInput);
                          setIsRecipientDropdownOpen(false);
                        }}
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold underline"
                      >
                        {isManualInput ? 'Pilih dari Database Sekolah' : 'Input Manual / Kustom'}
                      </button>
                    </div>
                  </div>

                  {!formData.schoolId ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                      <School className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Silakan pilih <strong>Satuan Pendidikan Pemohon</strong> terlebih dahulu untuk memilih nama Guru / Tendik / KS yang terdaftar.</span>
                    </div>
                  ) : isManualInput ? (
                    <div>
                      <input
                        type="text"
                        required
                        value={formData.targetName || ''}
                        onChange={(e) => setFormData({ ...formData, targetName: e.target.value, targetId: '' })}
                        placeholder="Ketik nama lengkap penerima SK..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Mode manual aktif. Masukkan nama lengkap penerima.</span>
                    </div>
                  ) : (
                    <div className="space-y-2 relative" ref={recipientDropdownRef}>
                      {/* Active Selection summary banner if selected */}
                      {formData.targetName && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {selectedCandidateInfo?.category === 'Guru' ? (
                                <GraduationCap className="w-4 h-4" />
                              ) : selectedCandidateInfo?.category === 'Tendik' ? (
                                <Briefcase className="w-4 h-4" />
                              ) : selectedCandidateInfo?.category === 'Kepala Sekolah' ? (
                                <Award className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                  {formData.targetName}
                                </span>
                                {selectedCandidateInfo && (
                                  <span className={`px-2 py-0.2 rounded-md text-[9px] font-bold ${
                                    selectedCandidateInfo.category === 'Guru'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                      : selectedCandidateInfo.category === 'Tendik'
                                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300'
                                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                                  }`}>
                                    {selectedCandidateInfo.category} • {selectedCandidateInfo.status}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-2 mt-0.5">
                                {selectedCandidateInfo?.details && <span>{selectedCandidateInfo.details}</span>}
                                {selectedCandidateInfo?.nbm && <span>NBM: {selectedCandidateInfo.nbm}</span>}
                                {selectedCandidateInfo?.nuptk && <span>NUPTK: {selectedCandidateInfo.nuptk}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsRecipientDropdownOpen(!isRecipientDropdownOpen);
                                setRecipientSearch('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] flex items-center gap-1 transition-colors"
                            >
                              <span>Ganti</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, targetName: '', targetId: '' }));
                                setIsRecipientDropdownOpen(true);
                                setRecipientSearch('');
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                              title="Hapus pilihan"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Search trigger & input box (shown if not selected or dropdown opened) */}
                      {(!formData.targetName || isRecipientDropdownOpen) && (
                        <div className="relative">
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                            <input
                              type="text"
                              value={recipientSearch}
                              onChange={(e) => {
                                setRecipientSearch(e.target.value);
                                if (!isRecipientDropdownOpen) setIsRecipientDropdownOpen(true);
                              }}
                              onFocus={() => setIsRecipientDropdownOpen(true)}
                              placeholder={
                                formData.targetName
                                  ? `Cari nama lain di ${sekolahList.find(s => s.id === formData.schoolId)?.name || 'sekolah'}...`
                                  : `Ketik untuk mencari nama Guru / Tendik / KS terdaftar...`
                              }
                              className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setIsRecipientDropdownOpen(!isRecipientDropdownOpen)}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform ${isRecipientDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          {/* Autocomplete / Candidate Dropdown Menu */}
                          {isRecipientDropdownOpen && (
                            <div className="absolute z-30 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 space-y-2">
                              {/* Category Filter Tabs */}
                              <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setRecipientCategoryFilter('ALL')}
                                  className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                                    recipientCategoryFilter === 'ALL'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                  }`}
                                >
                                  Semua ({schoolCandidates.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRecipientCategoryFilter('Guru')}
                                  className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                                    recipientCategoryFilter === 'Guru'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                  }`}
                                >
                                  Guru ({schoolCandidates.filter((c) => c.category === 'Guru').length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRecipientCategoryFilter('Tendik')}
                                  className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                                    recipientCategoryFilter === 'Tendik'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                  }`}
                                >
                                  Tendik ({schoolCandidates.filter((c) => c.category === 'Tendik').length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRecipientCategoryFilter('Kepala Sekolah')}
                                  className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                                    recipientCategoryFilter === 'Kepala Sekolah'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                  }`}
                                >
                                  KS ({schoolCandidates.filter((c) => c.category === 'Kepala Sekolah').length})
                                </button>
                              </div>

                              {/* Candidate options list */}
                              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-50 dark:divide-slate-800/60">
                                {filteredCandidates.length === 0 ? (
                                  <div className="p-4 text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Tidak ada data PTK yang sesuai dengan kata kunci di sekolah ini.
                                    </p>
                                    {recipientSearch && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormData((prev) => ({
                                            ...prev,
                                            targetName: recipientSearch.trim(),
                                            targetId: '',
                                          }));
                                          setIsRecipientDropdownOpen(false);
                                          setRecipientSearch('');
                                        }}
                                        className="mt-2 text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Gunakan "{recipientSearch.trim()}" sebagai nama penerima</span>
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  filteredCandidates.map((c) => {
                                    const isSelected = formData.targetName === c.name;
                                    return (
                                      <button
                                        key={`${c.category}-${c.id}`}
                                        type="button"
                                        onClick={() => handleSelectCandidate(c)}
                                        className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                                          isSelected
                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                            c.category === 'Guru'
                                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                                              : c.category === 'Tendik'
                                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300'
                                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                                          }`}>
                                            {c.category === 'Guru' ? (
                                              <GraduationCap className="w-3.5 h-3.5" />
                                            ) : c.category === 'Tendik' ? (
                                              <Briefcase className="w-3.5 h-3.5" />
                                            ) : (
                                              <Award className="w-3.5 h-3.5" />
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                                              {c.name}
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                                              <span className="font-semibold text-slate-700 dark:text-slate-300">{c.details}</span>
                                              <span>•</span>
                                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold">
                                                {c.status}
                                              </span>
                                              {c.nbm && <span>NBM: {c.nbm}</span>}
                                            </div>
                                          </div>
                                        </div>

                                        {isSelected && (
                                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3" />
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })
                                )}
                              </div>

                              {/* Footer quick action */}
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                                <span className="text-slate-400 text-[10px]">
                                  Klik nama untuk memilih penerima SK
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsManualInput(true);
                                    setIsRecipientDropdownOpen(false);
                                  }}
                                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline text-[10px]"
                                >
                                  + Tulis Nama Manual
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold block text-xs">Draft Nomor SK</label>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                      (Otomatis) Disesuaikan dari Admin
                    </span>
                  </div>
                  {currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' ? (
                    <div>
                      <input
                        type="text"
                        value={formData.skNumber || ''}
                        onChange={(e) => setFormData({ ...formData, skNumber: e.target.value })}
                        placeholder="(Otomatis disesuaikan dari Admin)"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Dapat dikosongi. Nomor SK resmi otomatis diterbitkan sistem saat verifikasi.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={formData.skNumber || ''}
                        placeholder="(Otomatis disesuaikan dari Admin)"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-500 cursor-not-allowed placeholder:text-slate-400"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                        Nomor SK dikosongi dan akan ditentukan serta diterbitkan resmi secara otomatis oleh Super Admin.
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold block mb-1">Tanggal Mulai Berlaku</label>
                  <input
                    type="date"
                    value={formData.skStartDate || ''}
                    onChange={(e) => setFormData({ ...formData, skStartDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Tanggal Berakhir Berlaku</label>
                  <input
                    type="date"
                    value={formData.skEndDate || ''}
                    onChange={(e) => setFormData({ ...formData, skEndDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              {/* Upload Documents Conditionally based on submissionType */}
              <div className="pt-2">
                {formData.submissionType === 'Baru' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                          Lampiran Berkas Persyaratan (Pengajuan Baru) *
                        </label>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Untuk pengajuan SK Baru, wajib melampirkan berkas scan <strong>Ijazah Terakhir</strong> dan <strong>Kartu Anggota NBM</strong>.
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                        SK Baru
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {/* 1. Ijazah Terakhir */}
                      <div className={`p-3.5 rounded-xl border transition-all ${
                        formData.fileIjazahUrl
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>1. Ijazah Terakhir *</span>
                          </div>
                          {formData.fileIjazahUrl && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Terlampir</span>
                            </span>
                          )}
                        </div>

                        {uploadingSlot === 'fileIjazahUrl' ? (
                          <div className="py-3">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-1.5 transition-all duration-300"
                                style={{ width: `${uploadProgress['fileIjazahUrl'] || 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1 block text-center">
                              Mengunggah Ijazah... {uploadProgress['fileIjazahUrl']}%
                            </span>
                          </div>
                        ) : formData.fileIjazahUrl ? (
                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between gap-2">
                            <div className="min-w-0 flex items-center gap-2">
                              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div className="truncate">
                                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {formData.fileIjazahUrl.split('/').pop() || 'ijazah_terakhir.pdf'}
                                </div>
                                <div className="text-[9px] text-slate-400">Scan Ijazah Terakhir</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={formData.fileIjazahUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                                title="Lihat Berkas"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment('fileIjazahUrl')}
                                className="p-1.5 rounded hover:bg-rose-50 text-rose-500"
                                title="Hapus / Ganti Berkas"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                              onChange={(e) => handleFileUploadSlot('fileIjazahUrl', e)}
                              className="hidden"
                              id="upload-ijazah-input"
                            />
                            <label
                              htmlFor="upload-ijazah-input"
                              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-500 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-400" />
                              <span>Unggah Ijazah Terakhir (PDF/Foto)</span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* 2. Kartu NBM */}
                      <div className={`p-3.5 rounded-xl border transition-all ${
                        formData.fileNbmUrl
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>2. Kartu Anggota NBM *</span>
                          </div>
                          {formData.fileNbmUrl && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Terlampir</span>
                            </span>
                          )}
                        </div>

                        {uploadingSlot === 'fileNbmUrl' ? (
                          <div className="py-3">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-1.5 transition-all duration-300"
                                style={{ width: `${uploadProgress['fileNbmUrl'] || 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1 block text-center">
                              Mengunggah NBM... {uploadProgress['fileNbmUrl']}%
                            </span>
                          </div>
                        ) : formData.fileNbmUrl ? (
                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between gap-2">
                            <div className="min-w-0 flex items-center gap-2">
                              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div className="truncate">
                                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {formData.fileNbmUrl.split('/').pop() || 'kartu_nbm.pdf'}
                                </div>
                                <div className="text-[9px] text-slate-400">Scan Kartu Anggota NBM</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={formData.fileNbmUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                                title="Lihat Berkas"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment('fileNbmUrl')}
                                className="p-1.5 rounded hover:bg-rose-50 text-rose-500"
                                title="Hapus / Ganti Berkas"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                              onChange={(e) => handleFileUploadSlot('fileNbmUrl', e)}
                              className="hidden"
                              id="upload-nbm-input"
                            />
                            <label
                              htmlFor="upload-nbm-input"
                              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-500 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-400" />
                              <span>Unggah Kartu NBM (PDF/Foto)</span>
                            </label>
                            {selectedCandidateInfo?.nbm && (
                              <button
                                type="button"
                                onClick={handleUseCandidateNbm}
                                className="w-full py-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center justify-center gap-1"
                              >
                                <Paperclip className="w-3 h-3" />
                                <span>Gunakan NBM dari Data PTK ({selectedCandidateInfo.nbm})</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                          Lampiran Berkas Persyaratan (Perpanjangan Masa Berlaku) *
                        </label>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Untuk perpanjangan masa berlaku, wajib melampirkan salinan dokumen <strong>SK Terakhir / SK Periode Sebelumnya</strong> yang akan diperpanjang.
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded-full border border-blue-200 dark:border-blue-800 shrink-0">
                        Perpanjangan SK
                      </span>
                    </div>

                    <div className={`p-4 rounded-xl border transition-all mt-2 ${
                      formData.fileSkLamaUrl || formData.documentUrl
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Dokumen SK Terakhir / SK Sebelumnya *</span>
                        </div>
                        {(formData.fileSkLamaUrl || formData.documentUrl) && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>SK Terakhir Terlampir</span>
                          </span>
                        )}
                      </div>

                      {uploadingSlot === 'fileSkLamaUrl' ? (
                        <div className="py-4">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-1.5 transition-all duration-300"
                              style={{ width: `${uploadProgress['fileSkLamaUrl'] || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 block text-center">
                            Mengunggah Dokumen SK Terakhir... {uploadProgress['fileSkLamaUrl']}%
                          </span>
                        </div>
                      ) : (formData.fileSkLamaUrl || formData.documentUrl) ? (
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {(formData.fileSkLamaUrl || formData.documentUrl || '').split('/').pop() || 'dokumen_sk_terakhir.pdf'}
                              </div>
                              <div className="text-[10px] text-slate-400">Salinan Dokumen SK Periode Sebelumnya</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={formData.fileSkLamaUrl || formData.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Lihat</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment('fileSkLamaUrl')}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                              title="Hapus / Ganti Berkas"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors bg-white dark:bg-slate-800/60">
                          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                          <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                            Pilih file SK Terakhir (PDF / Dokumen) atau drag & drop ke sini
                          </p>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileUploadSlot('fileSkLamaUrl', e)}
                            className="hidden"
                            id="upload-sk-lama-input"
                          />
                          <label
                            htmlFor="upload-sk-lama-input"
                            className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Telusuri File SK Terakhir</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Kirim Pengajuan SK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reject */}
      {isRejectModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Tolak Pengajuan SK</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Masukkan alasan penolakan agar sekolah pemohon dapat memperbaiki dokumen:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: File NBM belum terlampir, masa berlaku belum sesuai..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Digital */}
      {isPreviewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Pratinjau Surat Keputusan</span>
              </div>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 my-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="text-center border-b border-slate-300 dark:border-slate-700 pb-3">
                <div className="font-black text-sm text-slate-900 dark:text-white">SURAT KEPUTUSAN</div>
                <div className="font-mono text-emerald-600 font-bold">
                  {selectedItem.skNumber && !selectedItem.skNumber.includes('Otomatis') && !selectedItem.skNumber.includes('Menunggu')
                    ? selectedItem.skNumber
                    : '(Nomor SK Otomatis dari Super Admin saat Verifikasi)'}
                </div>
                <div className="text-slate-500 mt-1">Tentang: {selectedItem.title}</div>
              </div>

              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <div><strong>Penerima:</strong> {selectedItem.targetName || '-'}</div>
                <div><strong>Jenis SK:</strong> {selectedItem.type}</div>
                <div><strong>Tipe Pengajuan:</strong> {selectedItem.submissionType}</div>
                <div><strong>Masa Berlaku:</strong> {selectedItem.skStartDate} s/d {selectedItem.skEndDate}</div>
                <div><strong>Penandatangan:</strong> {selectedItem.signerName} ({selectedItem.signerRole})</div>
                <div><strong>Status:</strong> {selectedItem.status}</div>
              </div>

              {/* Lampiran Dokumen */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Berkas Dokumen Persyaratan ({selectedItem.submissionType}):</span>
                </div>

                {selectedItem.submissionType === 'Baru' ? (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-emerald-600" />
                        <span>Ijazah Terakhir</span>
                      </div>
                      {selectedItem.fileIjazahUrl ? (
                        <a
                          href={selectedItem.fileIjazahUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold hover:underline"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Lihat Berkas Ijazah</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 mt-1 block">Belum dilampirkan</span>
                      )}
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-emerald-600" />
                        <span>Kartu Anggota NBM</span>
                      </div>
                      {selectedItem.fileNbmUrl ? (
                        <a
                          href={selectedItem.fileNbmUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold hover:underline"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Lihat Kartu NBM</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 mt-1 block">Belum dilampirkan</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span>Dokumen SK Terakhir / Sebelumnya</span>
                    </div>
                    {(selectedItem.fileSkLamaUrl || selectedItem.documentUrl) ? (
                      <a
                        href={selectedItem.fileSkLamaUrl || selectedItem.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Lihat Dokumen SK Terakhir</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-1 block">Belum dilampirkan</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handlePrint(selectedItem)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Resmi</span>
              </button>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
