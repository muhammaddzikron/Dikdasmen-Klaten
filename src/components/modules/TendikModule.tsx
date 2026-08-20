import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  X,
  Eye,
  Building2,
  Phone,
  Calendar,
  GraduationCap,
  Award,
  MapPin,
  Heart,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Tendik, TendikStatus, Gender } from '../../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportUtils';
import { ExcelImportModal } from '../common/ExcelImportModal';

export const TendikModule: React.FC = () => {
  const { filteredTendikList, filteredSekolahList, sekolahList, activeSekolahList, addTendik, updateTendik, deleteTendik } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSchool, setFilterSchool] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPosition, setFilterPosition] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Tendik | null>(null);

  const [formData, setFormData] = useState<Partial<Tendik>>({
    name: '',
    nipm: '',
    schoolId: '',
    gender: 'L',
    birthPlace: '',
    birthDate: '',
    status: 'KTP',
    position: 'Staff Tata Usaha',
    nbm: '',
    nip: '',
    skNumber: '',
    tmtPengangkatan: '',
    education: 'S1',
    studyProgram: '',
    rtRw: '',
    kodePos: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: 'Klaten',
    address: '',
    phone: '',
    persyarikatanOrtom: 'Pemuda Muhammadiyah',
    persyarikatanLevel: 'Cabang',
    persyarikatanActivity: 'Anggota Aktif',
    email: '',
  });

  const activeTendiks = useMemo(() => filteredTendikList.filter((t) => !t.isDeleted), [filteredTendikList]);

  const filtered = useMemo(() => {
    return activeTendiks.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.nbm && t.nbm.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.nipm && t.nipm.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSchool = filterSchool === 'ALL' || t.schoolId === filterSchool;
      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      const matchPos = filterPosition === 'ALL' || t.position.toLowerCase().includes(filterPosition.toLowerCase());
      return matchSearch && matchSchool && matchStatus && matchPos;
    });
  }, [activeTendiks, searchQuery, filterSchool, filterStatus, filterPosition]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    const defaultSchoolId = currentUser?.sekolahId || activeSekolahList[0]?.id || '';
    setFormData({
      name: '',
      nipm: '',
      schoolId: defaultSchoolId,
      gender: 'L',
      birthPlace: 'Klaten',
      birthDate: '',
      status: 'KTP',
      position: 'Staff Tata Usaha',
      nbm: '',
      nip: '',
      skNumber: '',
      tmtPengangkatan: '',
      education: 'S1',
      studyProgram: 'Administrasi Perkantoran',
      rtRw: '',
      kodePos: '57411',
      kelurahan: '',
      kecamatan: '',
      kabupaten: 'Klaten',
      address: '',
      phone: '',
      persyarikatanOrtom: 'Pemuda Muhammadiyah',
      persyarikatanLevel: 'Cabang',
      persyarikatanActivity: 'Anggota Aktif',
      email: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Tendik) => {
    setSelectedItem(t);
    setFormData({
      ...t,
      schoolId: t.schoolId || activeSekolahList[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenDetail = (t: Tendik) => {
    setSelectedItem(t);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.schoolId) return;

    if (selectedItem) {
      await updateTendik(selectedItem.id, formData);
    } else {
      await addTendik(formData as Omit<Tendik, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Pindahkan Tenaga Kependidikan "${name}" ke Recycle Bin?`)) {
      await deleteTendik(id);
    }
  };

  const handleExportCSV = () => {
    const rows = filtered.map((t) => {
      const s = sekolahList.find((sch) => sch.id === t.schoolId);
      return {
        'Nama Karyawan/Pegawai': t.name,
        'NIPM': t.nipm || '',
        'Satuan Pendidikan': s?.name || '',
        'Jenis Kelamin': t.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        'Tempat Lahir': t.birthPlace || '',
        'Tanggal Lahir': t.birthDate || '',
        'Status Kepegawaian': t.status,
        'Jenis Karyawan': t.position,
        'NBM': t.nbm || '',
        'No SK Pengangkatan': t.skNumber || '',
        'TMT Awal Pengangkatan': t.tmtPengangkatan || '',
        'Pendidikan Terakhir': t.education || '',
        'Program Studi': t.studyProgram || '',
        'RT/RW': t.rtRw || '',
        'Kelurahan': t.kelurahan || '',
        'Kecamatan': t.kecamatan || '',
        'Kabupaten/Kota': t.kabupaten || '',
        'Kode Pos': t.kodePos || '',
        'Nomor HP': t.phone || '',
        'Ortom Persyarikatan': t.persyarikatanOrtom || '',
        'Tingkat Ortom': t.persyarikatanLevel || '',
        'Keaktifan': t.persyarikatanActivity || '',
      };
    });
    exportToCSV(`Data_Tendik_Dikdasmen_${Date.now()}`, rows);
  };

  const handleExportExcel = () => {
    const rows = filtered.map((t) => {
      const s = sekolahList.find((sch) => sch.id === t.schoolId);
      return {
        'Nama Karyawan/Pegawai': t.name,
        'NIPM': t.nipm || '',
        'Satuan Pendidikan': s?.name || '',
        'Jenis Kelamin': t.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        'Tempat Lahir': t.birthPlace || '',
        'Tanggal Lahir': t.birthDate || '',
        'Status Kepegawaian': t.status,
        'Jenis Karyawan/Jabatan': t.position,
        'NBM': t.nbm || '',
        'No SK Pengangkatan': t.skNumber || '',
        'TMT Awal Pengangkatan': t.tmtPengangkatan || '',
        'Pendidikan Terakhir': t.education || '',
        'Program Studi': t.studyProgram || '',
        'RT/RW': t.rtRw || '',
        'Kelurahan': t.kelurahan || '',
        'Kecamatan': t.kecamatan || '',
        'Kabupaten/Kota': t.kabupaten || '',
        'Kode Pos': t.kodePos || '',
        'Nomor HP': t.phone || '',
        'Ortom Persyarikatan': t.persyarikatanOrtom || '',
        'Tingkat Ortom': t.persyarikatanLevel || '',
        'Keaktifan Persyarikatan': t.persyarikatanActivity || '',
      };
    });
    exportToExcel(`Data_Tendik_Dikdasmen_${Date.now()}`, 'Tendik', rows);
  };

  const handleExportPDF = () => {
    const headers = ['Nama Karyawan', 'Sekolah', 'NIPM/NBM', 'Jenis Karyawan', 'Status', 'Pendidikan', 'No HP'];
    const rows = filtered.map((t) => {
      const s = sekolahList.find((sch) => sch.id === t.schoolId);
      return [
        t.name,
        s?.name || '',
        `${t.nipm || '-'}\nNBM: ${t.nbm || '-'}`,
        t.position,
        t.status,
        `${t.education || '-'} ${t.studyProgram ? `(${t.studyProgram})` : ''}`,
        t.phone || '-',
      ];
    });
    exportToPDF('Laporan Data Tenaga Kependidikan (Tendik)', headers, rows, `Laporan_Tendik_Dikdasmen_${Date.now()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Data Tenaga Kependidikan (Tendik)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
              {filtered.length} Personel
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pengelolaan database Kepala Tata Usaha, Staf Administrasi, Operator, Laboran, Pustakawan, dan Keamanan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300/80 dark:border-emerald-700/60 shadow-xs cursor-pointer transition-all"
            title="Import data Tenaga Kependidikan massal via file spreadsheet Excel (.xlsx / .xls)"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Upload Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tendik</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama tendik, NIPM, NBM, jenis karyawan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {currentUser?.role !== 'Sekolah' && (
          <select
            value={filterSchool}
            onChange={(e) => setFilterSchool(e.target.value)}
            aria-label="Filter Satuan Pendidikan"
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
          >
            <option value="ALL">Semua Satuan Pendidikan</option>
            {filteredSekolahList
              .filter((s) => !s.isDeleted)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        )}

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter Status Kepegawaian"
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">Semua Status Kepegawaian</option>
          <option value="KTP">KTP (Karyawan Tetap Persyarikatan)</option>
          <option value="KTTP">KTTP (Karyawan Tidak Tetap)</option>
          <option value="KTY">KTY (Karyawan Tetap Yayasan)</option>
          <option value="KTT">KTT (Karyawan Tidak Tetap)</option>
          <option value="PNS">PNS DPK / PPPK</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Nama Personel & Gelar</th>
                <th className="p-3.5">Satuan Pendidikan</th>
                <th className="p-3.5">NIPM / NBM</th>
                <th className="p-3.5">Jenis Karyawan / Posisi</th>
                <th className="p-3.5">Status Kepegawaian</th>
                <th className="p-3.5">Pendidikan Terakhir</th>
                <th className="p-3.5">No. HP</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada data tenaga kependidikan yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const s = sekolahList.find((sch) => sch.id === t.schoolId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{t.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {t.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          {t.birthDate ? ` • Lahir: ${t.birthDate}` : ''}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{s?.name || '-'}</td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {t.nipm ? <span className="font-bold text-slate-800 dark:text-slate-200">{t.nipm}</span> : '-'}
                        {t.nbm && <div className="text-[10px] text-emerald-600 font-semibold">NBM: {t.nbm}</div>}
                      </td>
                      <td className="p-3.5 font-bold text-sky-600 dark:text-sky-400">{t.position}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                          {t.status}
                        </span>
                        {t.tmtPengangkatan && (
                          <div className="text-[10px] text-slate-400">TMT: {t.tmtPengangkatan}</div>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        <div className="font-medium">{t.education || '-'}</div>
                        {t.studyProgram && <div className="text-[10px] text-slate-400">{t.studyProgram}</div>}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono">{t.phone || '-'}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(t)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Lihat Detail Profil Tendik"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Edit Data Tendik"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id, t.name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Hapus ke Recycle Bin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <span>{selectedItem ? 'Edit Data Tenaga Kependidikan' : 'Tambah Tenaga Kependidikan Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              {/* Section 1: Profil Pribadi & Sekolah */}
              <div>
                <h4 className="font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> Data Pokok Pegawai & Penugasan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Nama Karyawan/Pegawai Beserta Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Budi Santoso, S.Kom."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Satuan Pendidikan Bertugas *</label>
                    <select
                      required
                      value={formData.schoolId || ''}
                      onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="" disabled>-- Pilih Satuan Pendidikan --</option>
                      {activeSekolahList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.level})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Nomor Induk & Identitas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">NIPM (No. Induk Pegawai Muh.)</label>
                  <input
                    type="text"
                    value={formData.nipm || ''}
                    onChange={(e) => setFormData({ ...formData, nipm: e.target.value })}
                    placeholder="Contoh: 19850101201001"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Nomor Baku Muhammadiyah (NBM)</label>
                  <input
                    type="text"
                    value={formData.nbm || ''}
                    onChange={(e) => setFormData({ ...formData, nbm: e.target.value })}
                    placeholder="Contoh: 1234567"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Jenis Kelamin *</label>
                  <select
                    value={formData.gender || 'L'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.birthPlace || ''}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="Contoh: Klaten"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              {/* Section 3: Status Kepegawaian & Posisi */}
              <div>
                <h4 className="font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Kepegawaian & SK Pengangkatan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Status Kepegawaian *</label>
                    <select
                      value={formData.status || 'KTP'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as TendikStatus })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                    >
                      <option value="KTP">KTP (Karyawan Tetap Persyarikatan)</option>
                      <option value="KTTP">KTTP (Karyawan Tidak Tetap)</option>
                      <option value="KTY">KTY (Karyawan Tetap Yayasan)</option>
                      <option value="KTT">KTT (Karyawan Tidak Tetap)</option>
                      <option value="PNS">PNS DPK / PPPK</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Jenis Karyawan / Posisi *</label>
                    <input
                      type="text"
                      required
                      value={formData.position || ''}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Contoh: Staff Tata Usaha / Operator / Laboran / Pustakawan / Satpam"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="font-semibold block mb-1">Nomor SK Pengangkatan</label>
                    <input
                      type="text"
                      value={formData.skNumber || ''}
                      onChange={(e) => setFormData({ ...formData, skNumber: e.target.value })}
                      placeholder="012/SK/PCM-DIKDASMEN/2022"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">TMT Awal Pengangkatan</label>
                    <input
                      type="date"
                      value={formData.tmtPengangkatan || ''}
                      onChange={(e) => setFormData({ ...formData, tmtPengangkatan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Pendidikan Terakhir */}
              <div>
                <h4 className="font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" /> Pendidikan Terakhir
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Ijazah Pendidikan Terakhir</label>
                    <select
                      value={formData.education || 'S1'}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold"
                    >
                      <option value="S2">S2 (Magister)</option>
                      <option value="S1">S1 (Sarjana)</option>
                      <option value="D3">D3 (Diploma)</option>
                      <option value="SMA/SMK">SMA / SMK / MA</option>
                      <option value="SMP">SMP / MTs</option>
                      <option value="SD">SD / MI</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Program Studi / Jurusan Sesuai Ijazah</label>
                    <input
                      type="text"
                      value={formData.studyProgram || ''}
                      onChange={(e) => setFormData({ ...formData, studyProgram: e.target.value })}
                      placeholder="Contoh: Sistem Informasi / Akuntansi"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Alamat & Kontak */}
              <div>
                <h4 className="font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Alamat Karyawan / Pegawai
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">RT / RW</label>
                    <input
                      type="text"
                      value={formData.rtRw || ''}
                      onChange={(e) => setFormData({ ...formData, rtRw: e.target.value })}
                      placeholder="02/05"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Kelurahan / Desa</label>
                    <input
                      type="text"
                      value={formData.kelurahan || ''}
                      onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                      placeholder="Bareng"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Kecamatan</label>
                    <input
                      type="text"
                      value={formData.kecamatan || ''}
                      onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                      placeholder="Klaten Tengah"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Kode Pos</label>
                    <input
                      type="text"
                      value={formData.kodePos || ''}
                      onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                      placeholder="57411"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="font-semibold block mb-1">Kabupaten / Kota</label>
                    <input
                      type="text"
                      value={formData.kabupaten || 'Klaten'}
                      onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                      placeholder="Klaten"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Nomor HP Aktif (WhatsApp) *</label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Keaktifan di Persyarikatan */}
              <div>
                <h4 className="font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                  <Heart className="w-4 h-4" /> Keaktifan di Persyarikatan & Ortom
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Organisasi Otonom (Ortom)</label>
                    <select
                      value={formData.persyarikatanOrtom || 'Pemuda Muhammadiyah'}
                      onChange={(e) => setFormData({ ...formData, persyarikatanOrtom: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="Pemuda Muhammadiyah">Pemuda Muhammadiyah</option>
                      <option value="Nasyiatul Aisyiyah">Nasyiatul Aisyiyah</option>
                      <option value="Tapak Suci">Tapak Suci</option>
                      <option value="Hizbul Wathan">Hizbul Wathan</option>
                      <option value="IPM">Ikatan Pelajar Muhammadiyah (IPM)</option>
                      <option value="IMM">Ikatan Mahasiswa Muhammadiyah (IMM)</option>
                      <option value="Aisyiyah">Aisyiyah</option>
                      <option value="Muhammadiyah">Pimpinan Ranting / Cabang Muhammadiyah</option>
                      <option value="Lainnya">Lainnya / Simpatisan</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Tingkat Kepengurusan</label>
                    <select
                      value={formData.persyarikatanLevel || 'Cabang'}
                      onChange={(e) => setFormData({ ...formData, persyarikatanLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="Ranting">Tingkat Ranting (PRM / PRA)</option>
                      <option value="Cabang">Tingkat Cabang (PCM / PCA)</option>
                      <option value="Daerah">Tingkat Daerah (PDM / PDA)</option>
                      <option value="Wilayah">Tingkat Wilayah (PWM / PWA)</option>
                      <option value="Pusat">Pimpinan Pusat</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Keaktifan / Jabatan</label>
                    <input
                      type="text"
                      value={formData.persyarikatanActivity || ''}
                      onChange={(e) => setFormData({ ...formData, persyarikatanActivity: e.target.value })}
                      placeholder="Ketua / Sekretaris / Anggota"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                >
                  Simpan Data Tendik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Tendik */}
      {isDetailOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <span>Detail Profil Tenaga Kependidikan</span>
              </h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 my-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xl ring-2 ring-sky-500/30">
                  {selectedItem.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedItem.name}</h4>
                  <div className="text-slate-500">
                    {sekolahList.find((s) => s.id === selectedItem.schoolId)?.name || '-'}
                  </div>
                  <div className="text-sky-600 font-bold text-xs mt-0.5">{selectedItem.position}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 text-[10px]">NIPM:</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedItem.nipm || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">NBM:</span>
                  <div className="font-mono font-bold text-emerald-600">{selectedItem.nbm || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Status Kepegawaian:</span>
                  <div className="font-bold text-sky-600">{selectedItem.status}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">TMT Pengangkatan:</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{selectedItem.tmtPengangkatan || '-'}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <div><b>Nomor SK:</b> {selectedItem.skNumber || '-'}</div>
                <div><b>Tempat, Tanggal Lahir:</b> {selectedItem.birthPlace || '-'}, {selectedItem.birthDate || '-'}</div>
                <div><b>Nomor HP:</b> {selectedItem.phone || '-'}</div>
                <div><b>Pendidikan:</b> {selectedItem.education || '-'} {selectedItem.studyProgram ? `(${selectedItem.studyProgram})` : ''}</div>
                <div>
                  <b>Alamat:</b> {selectedItem.rtRw ? `RT/RW ${selectedItem.rtRw}, ` : ''}
                  {selectedItem.kelurahan ? `Kel. ${selectedItem.kelurahan}, ` : ''}
                  {selectedItem.kecamatan ? `Kec. ${selectedItem.kecamatan}, ` : ''}
                  {selectedItem.kabupaten || 'Klaten'} {selectedItem.kodePos ? `(${selectedItem.kodePos})` : ''}
                </div>
                <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                  <b>Keaktifan Persyarikatan:</b> {selectedItem.persyarikatanOrtom || '-'} ({selectedItem.persyarikatanLevel || '-'}) - {selectedItem.persyarikatanActivity || '-'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Excel */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        entityType="tendik"
        activeSchools={activeSekolahList}
        defaultSchoolId={filterSchool !== 'ALL' ? filterSchool : currentUser?.sekolahId || activeSekolahList[0]?.id}
      />
    </div>
  );
};
