import React, { useState, useMemo } from 'react';
import {
  School,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  MapPin,
  Phone,
  Mail,
  X,
  Sparkles,
  Users,
  GraduationCap,
  Briefcase,
  Award,
  Globe,
  FileCheck,
  Building2,
  Calendar,
  Share2,
  UserCheck,
  RefreshCw,
  Lock,
  Key,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sekolah,
  SchoolLevel,
  SchoolStatus,
  SchoolAccreditation,
  CapabilityCategory,
  DEFAULT_SCHOOL_LOGO,
  getSchoolLogo,
} from '../../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportUtils';
import { isSchoolUnderCabangId } from '../../utils/cabangMatcher';

export const SekolahModule: React.FC = () => {
  const {
    sekolahList,
    filteredSekolahList,
    cabangList,
    guruList,
    tendikList,
    siswaList,
    addSekolah,
    updateSekolah,
    deleteSekolah,
    syncMasterSekolah,
    selectedCabangId,
    isLoading,
  } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCabang, setFilterCabang] = useState('ALL');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterAccreditation, setFilterAccreditation] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Sekolah | null>(null);

  // Credential Visibility & Copy State
  const [showPassword, setShowPassword] = useState(false);
  const [showDetailPassword, setShowDetailPassword] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Sekolah>>({
    name: '',
    npsn: '',
    username: '',
    password: 'sekolah123',
    cabangId: '',
    rtRw: '',
    kodePos: '57411',
    kelurahan: '',
    kecamatan: '',
    kabupaten: 'Kabupaten Klaten',
    address: '',
    vision: '',
    mission: '',
    hasNib: 'Ya',
    nib: '',
    email: '',
    website: '',
    phone: '',
    status: 'Swasta',
    level: 'SMA',
    accreditation: 'A',
    accreditationExpiryDate: '2028-12-31',
    skPendirianNumber: '',
    skPendirianDate: '1985-08-01',
    skIzinOperasional: '',
    skIzinOperasionalDate: '2020-01-15',
    categoryCapability: 'SEHAT',
    jumlahKeseluruhanSiswa: 0,
    sosmed: '',
    operatorName: '',
    operatorPhone: '',
    logoUrl: DEFAULT_SCHOOL_LOGO,
    bannerUrl: '',
    description: '',
  });

  const activeSchools = useMemo(() => {
    return filteredSekolahList.filter((s) => !s.isDeleted);
  }, [filteredSekolahList]);

  // Helper for computing live automatic recap for any school
  const getSchoolRecap = (schoolId: string) => {
    const schoolSiswas = siswaList.filter((s) => s.schoolId === schoolId && !s.isDeleted && s.status === 'Aktif');
    const schoolGurus = guruList.filter((g) => g.schoolId === schoolId && !g.isDeleted);
    const schoolTendiks = tendikList.filter((t) => t.schoolId === schoolId && !t.isDeleted);

    // Siswa per kelas
    const classMap: Record<string, number> = {};
    schoolSiswas.forEach((s) => {
      const cls = s.class || s.classGrade || 'Belum Ditentukan';
      classMap[cls] = (classMap[cls] || 0) + 1;
    });

    const targetSchool = sekolahList.find((s) => s.id === schoolId);
    const totalSiswa = schoolSiswas.length;
    const gtp = schoolGurus.filter((g) => g.status === 'GTP' || g.status === 'GTY').length;
    const gttp = schoolGurus.filter((g) => g.status === 'GTTP' || g.status === 'GTT').length;
    const guruPns = schoolGurus.filter((g) => g.status === 'PNS' || g.status === 'PPPK').length;
    const totalGuru = schoolGurus.length;

    const ktp = schoolTendiks.filter((t) => t.status === 'KTP' || t.status === 'KTY').length;
    const kttp = schoolTendiks.filter((t) => t.status === 'KTTP' || t.status === 'KTT').length;
    const tendikPns = schoolTendiks.filter((t) => t.status === 'PNS').length;
    const totalTendik = schoolTendiks.length;

    const guruSertifikasi = schoolGurus.filter(
      (g) => g.hasPpg === 'Sudah' || g.hasPpg === true || g.isCertified === true
    ).length;

    const guruInpassing = schoolGurus.filter(
      (g) => g.isInpassing === true || g.isInpassing === 'Sudah'
    ).length;

    const totalPnsDpk = guruPns + tendikPns;

    return {
      classMap,
      totalSiswa,
      gtp,
      gttp,
      totalGuru,
      ktp,
      kttp,
      totalTendik,
      guruSertifikasi,
      guruInpassing,
      totalPnsDpk,
    };
  };

  const filteredSchools = useMemo(() => {
    const list = activeSchools.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.npsn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.kecamatan && s.kecamatan.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCabang = filterCabang === 'ALL' || isSchoolUnderCabangId(s, filterCabang, cabangList);
      const matchLevel = filterLevel === 'ALL' || s.level === filterLevel;
      const matchAcc = filterAccreditation === 'ALL' || s.accreditation === filterAccreditation;
      const matchCat = filterCategory === 'ALL' || s.categoryCapability === filterCategory;

      return matchSearch && matchCabang && matchLevel && matchAcc && matchCat;
    });

    const cabangMap = new Map(cabangList.map((c) => [c.id, c.name]));

    // Urutkan: 1. Cabang yang sama, 2. Huruf abjad nama sekolah
    return list.sort((a, b) => {
      const cabangA = cabangMap.get(a.cabangId) || a.cabangId || '';
      const cabangB = cabangMap.get(b.cabangId) || b.cabangId || '';
      const compareCabang = cabangA.localeCompare(cabangB, 'id', { sensitivity: 'base' });
      if (compareCabang !== 0) {
        return compareCabang;
      }
      return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
    });
  }, [activeSchools, searchQuery, filterCabang, filterLevel, filterAccreditation, filterCategory, cabangList]);

  const handleOpenAddModal = () => {
    setSelectedItem(null);
    const defaultCabangId =
      (currentUser?.role === 'Cabang' && currentUser.cabangId) ||
      (selectedCabangId && selectedCabangId !== 'ALL' ? selectedCabangId : '') ||
      cabangList.find((c) => !c.isDeleted)?.id ||
      '';

    setFormData({
      name: '',
      npsn: '',
      username: '',
      password: 'sekolah123',
      cabangId: defaultCabangId,
      rtRw: '01/02',
      kodePos: '57411',
      kelurahan: '',
      kecamatan: '',
      kabupaten: 'Kabupaten Klaten',
      address: '',
      vision: 'Menjadi Sekolah Unggul Berkarakter Islami dan Berdaya Saing Global.',
      mission: '1. Mengembangkan potensi peserta didik secara holistik.\n2. Menanamkan nilai-nilai Al-Islam dan Kemuhammadiyahan.',
      hasNib: 'Ya',
      nib: '9120001234567',
      email: '',
      website: '',
      phone: '',
      status: 'Swasta',
      level: 'SMP',
      accreditation: 'A',
      accreditationExpiryDate: '2028-12-31',
      skPendirianNumber: '421.2/100/SK/1985',
      skPendirianDate: '1985-08-01',
      skIzinOperasional: '503/012/Dikdas/2020',
      skIzinOperasionalDate: '2020-01-15',
      categoryCapability: 'SEHAT',
      jumlahKeseluruhanSiswa: 0,
      sosmed: '@dikdasmen_klaten',
      operatorName: '',
      operatorPhone: '',
      logoUrl: DEFAULT_SCHOOL_LOGO,
      bannerUrl: '',
      description: '',
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Sekolah) => {
    setSelectedItem(item);
    setFormData({
      ...item,
      username: item.username || item.npsn || '',
      password: item.password || 'sekolah123',
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenDetail = (item: Sekolah) => {
    setSelectedItem(item);
    setShowDetailPassword(false);
    setIsDetailModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.npsn) return;

    // Construct unified address if needed
    const fullAddress =
      formData.address ||
      `${formData.rtRw ? `RT/RW ${formData.rtRw}, ` : ''}${formData.kelurahan ? `Kel. ${formData.kelurahan}, ` : ''}${
        formData.kecamatan ? `Kec. ${formData.kecamatan}, ` : ''
      }${formData.kabupaten || 'Kabupaten Klaten'} ${formData.kodePos || ''}`.trim();

    const assignedCabangId =
      currentUser?.role === 'Cabang' && currentUser.cabangId
        ? currentUser.cabangId
        : formData.cabangId || cabangList.find((c) => !c.isDeleted)?.id || '';

    const finalUsername = (formData.username || formData.npsn || '').trim();
    const finalPassword = (formData.password || 'sekolah123').trim();

    const payload = {
      ...formData,
      cabangId: assignedCabangId,
      username: finalUsername,
      password: finalPassword,
      passwordUpdatedAt: new Date().toISOString(),
      address: fullAddress,
    };

    if (selectedItem) {
      await updateSekolah(selectedItem.id, payload);
    } else {
      await addSekolah(payload as Omit<Sekolah, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Pindahkan sekolah "${name}" ke Recycle Bin? Data masih dapat dipulihkan kapan saja.`)) {
      await deleteSekolah(id);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const rows = filteredSchools.map((s) => {
      const recap = getSchoolRecap(s.id);
      return {
        NPSN: s.npsn,
        Nama_Sekolah: s.name,
        Jenjang: s.level,
        Status: s.status,
        NIB: s.nib || '-',
        Akreditasi: s.accreditation,
        Tgl_Akhir_Akreditasi: s.accreditationExpiryDate || '-',
        SK_Pendirian: s.skPendirianNumber || '-',
        SK_Operasional: s.skIzinOperasional || '-',
        Total_Siswa: recap.totalSiswa,
        GTP: recap.gtp,
        GTTP: recap.gttp,
        Total_Guru: recap.totalGuru,
        KTP: recap.ktp,
        KTTP: recap.kttp,
        Total_Tendik: recap.totalTendik,
        Guru_Sertifikasi: recap.guruSertifikasi,
        Guru_Inpassing: recap.guruInpassing,
        Guru_Tendik_PNS_DPK: recap.totalPnsDpk,
        Alamat: s.address,
        Kecamatan: s.kecamatan || '',
        Kabupaten: s.kabupaten || 'Klaten',
        Telepon: s.phone || '',
        Email: s.email || '',
        Web: s.website || '',
        Operator: s.operatorName || '',
        No_HP_Operator: s.operatorPhone || '',
      };
    });
    exportToCSV(`Data_Profil_Sekolah_Klaten_${Date.now()}`, rows);
  };

  const handleExportExcel = () => {
    const rows = filteredSchools.map((s) => {
      const recap = getSchoolRecap(s.id);
      return {
        NPSN: s.npsn,
        'Nama Satuan Pendidikan': s.name,
        Jenjang: s.level,
        Status: s.status,
        'Sudah NIB': s.hasNib === 'Ya' || s.hasNib === true ? 'Ya' : 'Tidak',
        'Nomor NIB': s.nib || '-',
        Akreditasi: s.accreditation,
        'Tgl Berakhir Akreditasi': s.accreditationExpiryDate || '-',
        'SK Pendirian': s.skPendirianNumber || '-',
        'Tgl SK Pendirian': s.skPendirianDate || '-',
        'SK Izin Operasional': s.skIzinOperasional || '-',
        'Tgl SK Operasional': s.skIzinOperasionalDate || '-',
        'Jumlah Siswa': recap.totalSiswa,
        'Jumlah GTP': recap.gtp,
        'Jumlah GTTP': recap.gttp,
        'Total Guru': recap.totalGuru,
        'Jumlah KTP': recap.ktp,
        'Jumlah KTTP': recap.kttp,
        'Total Tendik': recap.totalTendik,
        'Guru Sertifikasi': recap.guruSertifikasi,
        'Guru Inpassing': recap.guruInpassing,
        'PNS / DPK': recap.totalPnsDpk,
        Alamat: s.address,
        Kecamatan: s.kecamatan || '',
        Kabupaten: s.kabupaten || 'Klaten',
        Telepon: s.phone || '',
        Email: s.email || '',
        Website: s.website || '',
        'Nama Operator': s.operatorName || '',
        'HP Operator': s.operatorPhone || '',
      };
    });
    exportToExcel(`Data_Profil_Sekolah_Klaten_${Date.now()}`, 'Profil Sekolah', rows);
  };

  const handleExportPDF = () => {
    const headers = ['No', 'NPSN', 'Nama Satuan Pendidikan', 'Jenjang', 'Akreditasi', 'Siswa', 'Guru', 'Tendik', 'Kecamatan'];
    const rows = filteredSchools.map((s, idx) => {
      const recap = getSchoolRecap(s.id);
      return [
        String(idx + 1),
        s.npsn,
        s.name,
        s.level,
        s.accreditation,
        String(recap.totalSiswa || s.jumlahKeseluruhanSiswa || 0),
        String(recap.totalGuru),
        String(recap.totalTendik),
        s.kecamatan || 'Klaten',
      ];
    });
    exportToPDF('Laporan Rekap Data Profil Satuan Pendidikan', headers, rows, `Laporan_Sekolah_${Date.now()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Master Profil Sekolah & Madrasah</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {filteredSchools.length} Satuan Pendidikan
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rekap lengkap profil satuan pendidikan Kemendikdasmen, izin operasional, NIB, sarpras, dan kalkulasi otomatis PTK & Siswa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
            <button
              onClick={syncMasterSekolah}
              disabled={isLoading}
              title="Sinkronkan Data Master Sekolah & Madrasah se-Kabupaten Klaten ke Majelis Cabang & PNF"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sinkron Master Sekolah</span>
            </button>
          )}
          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Cabang') && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Profil Sekolah</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NPSN, kecamatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
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

        {/* Filter Cabang */}
        {currentUser?.role === 'Cabang' ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-xl px-3 py-2 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">Wilayah: {cabangList.find((c) => c.id === currentUser.cabangId)?.name || 'Majelis Cabang Anda'}</span>
          </div>
        ) : (
          <select
            value={filterCabang}
            onChange={(e) => setFilterCabang(e.target.value)}
            aria-label="Filter Majelis Cabang"
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
          >
            <option value="ALL">Semua Majelis Cabang</option>
            {cabangList
              .filter((c) => !c.isDeleted)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        )}

        {/* Filter Jenjang */}
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          aria-label="Filter Jenjang"
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">Semua Jenjang (SD - SMA)</option>
          {(['SD', 'SMP', 'SMA', 'SMK', 'MI', 'MTs', 'MA'] as SchoolLevel[]).map((lvl) => (
            <option key={lvl} value={lvl}>
              Jenjang {lvl}
            </option>
          ))}
        </select>

        {/* Filter Akreditasi */}
        <select
          value={filterAccreditation}
          onChange={(e) => setFilterAccreditation(e.target.value)}
          aria-label="Filter Akreditasi"
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">Semua Akreditasi</option>
          {['Unggul', 'A', 'Baik Sekali', 'B', 'C', 'Belum Terakreditasi'].map((acc) => (
            <option key={acc} value={acc}>
              Akreditasi {acc}
            </option>
          ))}
        </select>

        {/* Filter Kategori Mutu */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          aria-label="Filter Kategori Mutu"
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">Semua Kategori Mutu</option>
          <option value="UGD">1. UGD (&lt;100)</option>
          <option value="RAWAT INAP">2. RAWAT INAP (100-400)</option>
          <option value="RAWAT JALAN">3. RAWAT JALAN (400-600)</option>
          <option value="SEHAT">4. SEHAT (&gt;600)</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Satuan Pendidikan</th>
                <th className="p-3.5">NPSN / NIB</th>
                <th className="p-3.5">Majelis Cabang</th>
                <th className="p-3.5">Jenjang</th>
                <th className="p-3.5">Akreditasi</th>
                <th className="p-3.5 text-center">Rekap Siswa</th>
                <th className="p-3.5 text-center">Guru (GTP/GTTP)</th>
                <th className="p-3.5 text-center">Tendik (KTP/KTTP)</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Tidak ada data sekolah yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => {
                  const cabang = cabangList.find((c) => c.id === school.cabangId);
                  const recap = getSchoolRecap(school.id);
                  return (
                    <tr key={school.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getSchoolLogo(school.logoUrl)}
                            alt={school.name}
                            className="w-8 h-8 rounded-lg object-contain bg-white ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0 p-0.5"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{school.name}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              <span>{school.kecamatan ? `Kec. ${school.kecamatan}` : school.address}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{school.npsn}</div>
                        <div className="text-[10px] text-slate-500">NIB: {school.nib || 'Belum'}</div>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{cabang?.name || '-'}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{school.level}</span>
                        <span className="text-slate-400 ml-1">({school.status})</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {school.accreditation}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                          {recap.totalSiswa}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{recap.totalGuru} Guru</div>
                        <div className="text-[10px] text-slate-400">
                          GTP: {recap.gtp} | GTTP: {recap.gttp}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{recap.totalTendik} Tendik</div>
                        <div className="text-[10px] text-slate-400">
                          KTP: {recap.ktp} | KTTP: {recap.kttp}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(school)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900"
                            title="Lihat Detail Profil & Rekap Otomatis"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(currentUser?.role === 'Super Admin' ||
                            currentUser?.role === 'Admin' ||
                            (currentUser?.role === 'Cabang' && (!currentUser.cabangId || isSchoolUnderCabangId(school, currentUser.cabangId, cabangList))) ||
                            (currentUser?.role === 'Sekolah' && currentUser.sekolahId === school.id)) && (
                            <button
                              onClick={() => handleOpenEditModal(school)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              title="Edit Data Profil Sekolah"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
                            <button
                              onClick={() => handleDelete(school.id, school.name)}
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

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-600" />
                <span>{selectedItem ? 'Edit Formulir Profil Sekolah/Madrasah' : 'Tambah Profil Sekolah/Madrasah Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 mt-4 text-xs">
              {/* Section 1: Identitas Sekolah Kemendikdasmen */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>1. Identitas Satuan Pendidikan Sesuai Kemendikdasmen</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Nama Sekolah/Madrasah sesuai Referensi Data Kemendikdasmen *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: SMP Muhammadiyah 1 Klaten"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">NPSN Resmi *</label>
                    <input
                      type="text"
                      required
                      value={formData.npsn || ''}
                      onChange={(e) => {
                        const newNpsn = e.target.value;
                        const shouldUpdateUsername = !formData.username || formData.username === formData.npsn;
                        setFormData({
                          ...formData,
                          npsn: newNpsn,
                          username: shouldUpdateUsername ? newNpsn : formData.username,
                        });
                      }}
                      placeholder="Contoh: 20309876"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
                      NPSN otomatis dijadikan username akun login sekolah.
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Majelis Cabang Naungan {currentUser?.role === 'Cabang' && <span className="text-xs text-emerald-600 font-normal">(Wilayah Binaan Anda)</span>}
                    </label>
                    <select
                      value={formData.cabangId || ''}
                      onChange={(e) => setFormData({ ...formData, cabangId: e.target.value })}
                      disabled={currentUser?.role === 'Cabang' && !!currentUser.cabangId}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                    >
                      {cabangList
                        .filter((c) => !c.isDeleted)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Jenjang Pendidikan</label>
                    <select
                      value={formData.level || 'SMP'}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as SchoolLevel })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      {(['SD', 'SMP', 'SMA', 'SMK', 'MI', 'MTs', 'MA'] as SchoolLevel[]).map((lvl) => (
                        <option key={lvl} value={lvl}>
                          Jenjang {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Status Lembaga</label>
                    <select
                      value={formData.status || 'Swasta'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as SchoolStatus })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Swasta">Swasta (Muhammadiyah)</option>
                      <option value="Negeri">Negeri</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Alamat Sekolah/Madrasah Lengkap */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>2. Alamat Sekolah/Madrasah Lengkap</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">RT / RW</label>
                    <input
                      type="text"
                      value={formData.rtRw || ''}
                      onChange={(e) => setFormData({ ...formData, rtRw: e.target.value })}
                      placeholder="Contoh: 02 / 05"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kode Pos</label>
                    <input
                      type="text"
                      value={formData.kodePos || ''}
                      onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                      placeholder="Contoh: 57411"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kelurahan / Desa</label>
                    <input
                      type="text"
                      value={formData.kelurahan || ''}
                      onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                      placeholder="Contoh: Barenglor"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kecamatan</label>
                    <input
                      type="text"
                      value={formData.kecamatan || ''}
                      onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                      placeholder="Contoh: Klaten Utara"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kabupaten / Kota</label>
                    <input
                      type="text"
                      value={formData.kabupaten || 'Kabupaten Klaten'}
                      onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                      placeholder="Kabupaten Klaten"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Alamat Jalan Lengkap
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Contoh: Jl. Mayor Kusmanto No. 12, Barenglor, Klaten Utara, Klaten"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Visi Misi & Legalitas NIB */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>3. Visi/Misi & Legalitas Usaha (NIB)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Visi Sekolah/Madrasah
                    </label>
                    <textarea
                      rows={2}
                      value={formData.vision || ''}
                      onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                      placeholder="Visi sekolah..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Misi Sekolah/Madrasah
                    </label>
                    <textarea
                      rows={2}
                      value={formData.mission || ''}
                      onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                      placeholder="Misi sekolah..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Sudah mempunyai NIB ?
                    </label>
                    <select
                      value={formData.hasNib === 'Ya' || formData.hasNib === true ? 'Ya' : 'Tidak'}
                      onChange={(e) => setFormData({ ...formData, hasNib: e.target.value as 'Ya' | 'Tidak' })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="Ya">Ya, Sudah Memiliki NIB</option>
                      <option value="Tidak">Tidak / Belum Ada</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Nomor Induk Berusaha (NIB)
                    </label>
                    <input
                      type="text"
                      value={formData.nib || ''}
                      onChange={(e) => setFormData({ ...formData, nib: e.target.value })}
                      placeholder="Contoh: 9120001234567"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Kontak, Web, Sosmed & Operator */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>4. Kontak, Web, Sosmed & Petugas Operator</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Email Sekolah/Madrasah
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="info@smpmuh1klaten.sch.id"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Web Sekolah/Madrasah
                    </label>
                    <input
                      type="text"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://smpmuh1klaten.sch.id"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Nomor Telpon Sekolah
                    </label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0272-321234"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Akun Sosmed Sekolah/Madrasah
                    </label>
                    <input
                      type="text"
                      value={formData.sosmed || ''}
                      onChange={(e) => setFormData({ ...formData, sosmed: e.target.value })}
                      placeholder="IG: @smpmuh1klaten / FB: Muh1Klaten"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Nama Lengkap Operator
                    </label>
                    <input
                      type="text"
                      value={formData.operatorName || ''}
                      onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                      placeholder="Contoh: Ahmad Zaki, S.Kom."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Nomor HP Operator
                    </label>
                    <input
                      type="text"
                      value={formData.operatorPhone || ''}
                      onChange={(e) => setFormData({ ...formData, operatorPhone: e.target.value })}
                      placeholder="081234567890"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Akreditasi & Dokumen SK Pendirian / Izin Operasional */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>5. Akreditasi, SK Pendirian & Izin Operasional</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Status Akreditasi / Nilai BAN-S/M
                    </label>
                    <select
                      value={formData.accreditation || 'A'}
                      onChange={(e) => setFormData({ ...formData, accreditation: e.target.value as SchoolAccreditation })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    >
                      {['Unggul', 'A', 'Baik Sekali', 'B', 'C', 'Belum Terakreditasi'].map((acc) => (
                        <option key={acc} value={acc}>
                          Akreditasi {acc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Tanggal / Tahun Berakhir Status Akreditasi
                    </label>
                    <input
                      type="date"
                      value={formData.accreditationExpiryDate || ''}
                      onChange={(e) => setFormData({ ...formData, accreditationExpiryDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Nomor SK Pendirian Sekolah/Madrasah
                    </label>
                    <input
                      type="text"
                      value={formData.skPendirianNumber || ''}
                      onChange={(e) => setFormData({ ...formData, skPendirianNumber: e.target.value })}
                      placeholder="Contoh: 421.2/100/SK/1985"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Tanggal SK Pendirian
                    </label>
                    <input
                      type="date"
                      value={formData.skPendirianDate || ''}
                      onChange={(e) => setFormData({ ...formData, skPendirianDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      SK Ijin Oprasional
                    </label>
                    <input
                      type="text"
                      value={formData.skIzinOperasional || ''}
                      onChange={(e) => setFormData({ ...formData, skIzinOperasional: e.target.value })}
                      placeholder="Contoh: 503/012/Dikdas/2020"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Tanggal SK Ijin Oprasional
                    </label>
                    <input
                      type="date"
                      value={formData.skIzinOperasionalDate || ''}
                      onChange={(e) => setFormData({ ...formData, skIzinOperasionalDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Akses & Kredensial Akun Login Sekolah */}
              <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/60 dark:from-slate-800 dark:to-slate-800/60 p-4 rounded-xl space-y-3 border border-emerald-300/80 dark:border-slate-700 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span>6. Kredensial & Akun Login Satuan Pendidikan</span>
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Default: NPSN & sekolah123</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Panel pengelolaan akun login mandiri untuk operator sekolah ini. Jika belum diubah, username default adalah <b>NPSN Resmi</b> dan kata sandi default adalah <b>sekolah123</b>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Username Login */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Username Login Sekolah</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Default: NPSN Resmi</span>
                    </div>
                    <input
                      type="text"
                      value={formData.username !== undefined ? formData.username : formData.npsn || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder={formData.npsn || 'Contoh: 20309653'}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs font-semibold text-slate-900 dark:text-white"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Username untuk login ke aplikasi SIM Dikdasmen.
                    </span>
                  </div>

                  {/* Password Login */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Password / Kata Sandi Login</span>
                      </label>
                      <span className="text-[10px] text-emerald-600 font-bold">Default: sekolah123</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password !== undefined ? formData.password : 'sekolah123'}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="sekolah123"
                        className="w-full pl-3 pr-10 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs font-bold text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Kata sandi akun sekolah (dapat diubah kapan saja).
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200/60 dark:border-slate-700/60">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Status Kredensial: <b>Tersedia untuk Login</b></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        username: formData.npsn || '',
                        password: 'sekolah123',
                      });
                    }}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset ke Kredensial Default (NPSN & sekolah123)</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Simpan Profil ke Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail View with Live Automatic Rekap Metrics */}
      {isDetailModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <School className="w-5 h-5 text-emerald-600" />
                <span>Detail Profil & Rekap Data Otomatis Sekolah</span>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const recap = getSchoolRecap(selectedItem.id);
              return (
                <div className="space-y-5 my-4 text-xs">
                  {/* Top Bar Info */}
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <img
                      src={getSchoolLogo(selectedItem.logoUrl)}
                      alt={selectedItem.name}
                      className="w-16 h-16 rounded-xl object-contain bg-white ring-2 ring-emerald-500/20 flex-shrink-0 p-1"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedItem.name}</h3>
                      <div className="text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                        <span>NPSN: <b className="font-mono text-slate-700 dark:text-slate-300">{selectedItem.npsn}</b></span>
                        <span>•</span>
                        <span>Jenjang: <b className="text-slate-700 dark:text-slate-300">{selectedItem.level} ({selectedItem.status})</b></span>
                        <span>•</span>
                        <span>Akreditasi: <b className="text-emerald-600">{selectedItem.accreditation}</b></span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        NIB: <span className="font-mono">{selectedItem.nib || 'Belum Ada'}</span> • Berakhir Akreditasi: {selectedItem.accreditationExpiryDate || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Automatic Live Recap Metrics Banner */}
                  <div className="border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Rekapitulasi Otomatis (Live Aggregated Data)</span>
                      </h4>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                        Dihitung real-time dari database aktif
                      </span>
                    </div>

                    {/* Grid of aggregated cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500">Jumlah Siswa</div>
                        <div className="text-base font-black text-purple-600">{recap.totalSiswa}</div>
                        <div className="text-[9px] text-slate-400">Total Keseluruhan</div>
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500">Guru (GTP / GTTP)</div>
                        <div className="text-base font-black text-emerald-600">{recap.totalGuru}</div>
                        <div className="text-[9px] text-slate-400">GTP: {recap.gtp} | GTTP: {recap.gttp}</div>
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500">Tendik (KTP / KTTP)</div>
                        <div className="text-base font-black text-sky-600">{recap.totalTendik}</div>
                        <div className="text-[9px] text-slate-400">KTP: {recap.ktp} | KTTP: {recap.kttp}</div>
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500">Sertifikasi & Inpassing</div>
                        <div className="text-base font-black text-amber-600">{recap.guruSertifikasi} / {recap.guruInpassing}</div>
                        <div className="text-[9px] text-slate-400">Sertif / Inpassing (PNS: {recap.totalPnsDpk})</div>
                      </div>
                    </div>

                    {/* Breakdown Siswa per Kelas */}
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center justify-between">
                        <span>Jumlah Siswa Per Kelas:</span>
                        <span className="text-[10px] text-slate-400">{Object.keys(recap.classMap).length} Rombel / Kelas</span>
                      </div>
                      {Object.keys(recap.classMap).length === 0 ? (
                        <div className="text-slate-400 italic text-[11px]">Belum ada peserta didik terdaftar pada rombel ini.</div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(recap.classMap).map(([cls, count]) => (
                            <span
                              key={cls}
                              className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 text-[10px]"
                            >
                              {cls}: {count} Siswa
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* General Detail Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                      <div className="font-bold text-slate-800 dark:text-slate-200">Legalitas & Dokumen SK</div>
                      <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                        <div><b>SK Pendirian:</b> {selectedItem.skPendirianNumber || '-'} ({selectedItem.skPendirianDate || '-'})</div>
                        <div><b>SK Izin Operasional:</b> {selectedItem.skIzinOperasional || '-'} ({selectedItem.skIzinOperasionalDate || '-'})</div>
                        <div><b>NIB:</b> {selectedItem.nib || 'Belum terdaftar'}</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                      <div className="font-bold text-slate-800 dark:text-slate-200">Kontak & Operator Sekolah</div>
                      <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                        <div><b>Telepon / Email:</b> {selectedItem.phone || '-'} / {selectedItem.email || '-'}</div>
                        <div><b>Website:</b> {selectedItem.website || '-'}</div>
                        <div><b>Sosmed:</b> {selectedItem.sosmed || '-'}</div>
                        <div><b>Operator:</b> {selectedItem.operatorName || '-'} ({selectedItem.operatorPhone || '-'})</div>
                      </div>
                    </div>
                  </div>

                  {/* Panel Kredensial Akun Login Sekolah */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white shadow-md space-y-3 border border-slate-700/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-xs">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white">Akun & Kredensial Login Operator Sekolah</h4>
                          <p className="text-[10px] text-slate-300">Akses resmi satuan pendidikan ke SIM Dikdasmen</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 w-fit">
                        Peran: Operator Sekolah
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Username Login:</span>
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {selectedItem.username || selectedItem.npsn}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedItem.username || selectedItem.npsn, 'username')}
                          className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Salin Username"
                        >
                          {copiedText === 'username' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Password Login:</span>
                          <span className="font-mono text-xs font-bold text-amber-300">
                            {showDetailPassword ? selectedItem.password || 'sekolah123' : '••••••••••••'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setShowDetailPassword(!showDetailPassword)}
                            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 transition-colors"
                            title={showDetailPassword ? 'Sembunyikan' : 'Tampilkan password'}
                          >
                            {showDetailPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedItem.password || 'sekolah123', 'password')}
                            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Salin Password"
                          >
                            {copiedText === 'password' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                      <span>Default: NPSN Resmi & password <b>sekolah123</b></span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          handleOpenEditModal(selectedItem);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Ubah Username & Password</span>
                      </button>
                    </div>
                  </div>

                  {/* Alamat & Visi Misi */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                    <div className="font-bold text-slate-800 dark:text-slate-200">Alamat Satuan Pendidikan:</div>
                    <div className="text-slate-600 dark:text-slate-400">{selectedItem.address}</div>
                    {selectedItem.vision && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="font-bold text-slate-800 dark:text-slate-200">Visi & Misi:</div>
                        <div className="text-slate-600 dark:text-slate-400 whitespace-pre-line">{selectedItem.vision}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
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

