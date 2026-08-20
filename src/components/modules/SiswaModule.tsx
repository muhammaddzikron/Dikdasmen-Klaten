import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
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
  User,
  MapPin,
  Users,
  UploadCloud,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Siswa, StudentStatus, Gender } from '../../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportUtils';
import { ExcelImportModal } from '../common/ExcelImportModal';

export const SiswaModule: React.FC = () => {
  const { filteredSiswaList, filteredSekolahList, sekolahList, activeSekolahList, addSiswa, updateSiswa, deleteSiswa } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSchool, setFilterSchool] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Siswa | null>(null);

  const [formData, setFormData] = useState<Partial<Siswa>>({
    name: '',
    nisn: '',
    nis: '',
    schoolId: '',
    gender: 'L',
    birthPlace: 'Klaten',
    birthDate: '',
    classGrade: 'VII A',
    status: 'Aktif',
    guardianName: '',
    guardianPhone: '',
    rtRw: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: 'Klaten',
    kodePos: '57411',
    address: '',
    phone: '',
  });

  const activeSiswas = useMemo(() => filteredSiswaList.filter((s) => !s.isDeleted), [filteredSiswaList]);

  const filtered = useMemo(() => {
    return activeSiswas.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nis && s.nis.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.classGrade && s.classGrade.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.guardianName && s.guardianName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSchool = filterSchool === 'ALL' || s.schoolId === filterSchool;
      const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
      const matchClass = filterClass === 'ALL' || (s.classGrade && s.classGrade.toLowerCase().includes(filterClass.toLowerCase()));
      return matchSearch && matchSchool && matchStatus && matchClass;
    });
  }, [activeSiswas, searchQuery, filterSchool, filterStatus, filterClass]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    const defaultSchoolId = currentUser?.sekolahId || activeSekolahList[0]?.id || '';
    setFormData({
      name: '',
      nisn: '',
      nis: '',
      schoolId: defaultSchoolId,
      gender: 'L',
      birthPlace: 'Klaten',
      birthDate: '',
      classGrade: 'VII A',
      status: 'Aktif',
      guardianName: '',
      guardianPhone: '',
      rtRw: '',
      kelurahan: '',
      kecamatan: '',
      kabupaten: 'Klaten',
      kodePos: '57411',
      address: '',
      phone: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Siswa) => {
    setSelectedItem(s);
    setFormData({
      ...s,
      schoolId: s.schoolId || activeSekolahList[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenDetail = (s: Siswa) => {
    setSelectedItem(s);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.schoolId || !formData.nisn) return;

    if (selectedItem) {
      await updateSiswa(selectedItem.id, formData);
    } else {
      await addSiswa(formData as Omit<Siswa, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Pindahkan data Peserta Didik "${name}" ke Recycle Bin?`)) {
      await deleteSiswa(id);
    }
  };

  const handleExportCSV = () => {
    const rows = filtered.map((s) => {
      const sch = sekolahList.find((x) => x.id === s.schoolId);
      return {
        'Nama Lengkap Siswa': s.name,
        'NISN': s.nisn,
        'NIS': s.nis || '',
        'Satuan Pendidikan': sch?.name || '',
        'Rombel/Kelas': s.classGrade || s.class,
        'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        'Tempat Lahir': s.birthPlace || '',
        'Tanggal Lahir': s.birthDate || '',
        'Status Siswa': s.status,
        'Nama Orang Tua / Wali': s.guardianName || '',
        'No HP Orang Tua': s.guardianPhone || '',
        'RT/RW': s.rtRw || '',
        'Kelurahan': s.kelurahan || '',
        'Kecamatan': s.kecamatan || '',
        'Kabupaten/Kota': s.kabupaten || '',
        'Kode Pos': s.kodePos || '',
        'Alamat Lengkap': s.address || '',
      };
    });
    exportToCSV(`Data_Siswa_Dikdasmen_${Date.now()}`, rows);
  };

  const handleExportExcel = () => {
    const rows = filtered.map((s) => {
      const sch = sekolahList.find((x) => x.id === s.schoolId);
      return {
        'Nama Lengkap Siswa': s.name,
        'NISN': s.nisn,
        'NIS': s.nis || '',
        'Satuan Pendidikan': sch?.name || '',
        'Rombel / Kelas': s.classGrade || s.class,
        'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        'Tempat Lahir': s.birthPlace || '',
        'Tanggal Lahir': s.birthDate || '',
        'Status Keaktifan': s.status,
        'Nama Orang Tua / Wali': s.guardianName || '',
        'No HP / WA Wali': s.guardianPhone || '',
        'RT/RW': s.rtRw || '',
        'Kelurahan / Desa': s.kelurahan || '',
        'Kecamatan': s.kecamatan || '',
        'Kabupaten / Kota': s.kabupaten || '',
        'Kode Pos': s.kodePos || '',
      };
    });
    exportToExcel(`Data_Siswa_Dikdasmen_${Date.now()}`, 'Data Siswa', rows);
  };

  const handleExportPDF = () => {
    const headers = ['Nama Siswa', 'NISN / NIS', 'Sekolah', 'Kelas', 'L/P', 'Orang Tua / Wali', 'Status'];
    const rows = filtered.map((s) => {
      const sch = sekolahList.find((x) => x.id === s.schoolId);
      return [
        s.name,
        `${s.nisn}\n${s.nis || '-'}`,
        sch?.name || '',
        s.classGrade || s.class || '-',
        s.gender,
        `${s.guardianName || '-'}\n${s.guardianPhone || ''}`,
        s.status,
      ];
    });
    exportToPDF('Laporan Data Peserta Didik (Siswa)', headers, rows, `Laporan_Siswa_Dikdasmen_${Date.now()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Data Peserta Didik (Siswa)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
              {filtered.length} Siswa Terdata
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pengelolaan database rombongan belajar (rombel), NISN, biodata siswa, dan kontak orang tua
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
            title="Import data Peserta Didik (Siswa) massal via file spreadsheet Excel (.xlsx / .xls)"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Upload Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total Siswa Terdaftar
          </p>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {activeSiswas.length.toLocaleString('id-ID')}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Siswa dalam database aktif</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Laki-Laki (L)
          </p>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {activeSiswas.filter((s) => s.gender === 'L').length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Peserta didik putra</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Perempuan (P)
          </p>
          <div className="text-2xl font-black text-pink-600 dark:text-pink-400 mt-1">
            {activeSiswas.filter((s) => s.gender === 'P').length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Peserta didik putri</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Status Aktif
          </p>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {activeSiswas.filter((s) => s.status === 'Aktif').length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Siswa aktif belajar</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa, NISN, NIS, wali..."
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
          aria-label="Filter Status Siswa"
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">Semua Status Keaktifan</option>
          <option value="Aktif">Aktif</option>
          <option value="Lulus">Lulus</option>
          <option value="Mutasi">Mutasi Keluar</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">NISN / NIS</th>
                <th className="p-3.5">Satuan Pendidikan</th>
                <th className="p-3.5">Kelas / Rombel</th>
                <th className="p-3.5">L/P</th>
                <th className="p-3.5">Orang Tua / Wali</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada data peserta didik yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const sch = sekolahList.find((x) => x.id === s.schoolId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{s.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {s.birthPlace && s.birthDate ? `${s.birthPlace}, ${s.birthDate}` : ''}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{s.nisn}</div>
                        {s.nis && <div className="text-[10px] text-slate-400">NIS: {s.nis}</div>}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium">{sch?.name || '-'}</td>
                      <td className="p-3.5 font-semibold text-purple-600 dark:text-purple-400">
                        <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                          {s.classGrade || s.class || '-'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium">{s.gender}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        <div className="font-medium">{s.guardianName || '-'}</div>
                        {s.guardianPhone && <div className="text-[10px] font-mono text-slate-400">{s.guardianPhone}</div>}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : s.status === 'Lulus'
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Lihat Detail Peserta Didik"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Edit Data Siswa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
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

      {/* Modal Add / Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>{selectedItem ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              {/* Section 1: Data Pokok Siswa */}
              <div>
                <h4 className="font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Identitas Pokok & Rombel
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Nama Lengkap Siswa (Sesuai Akta Lahir) *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Muhammad Rizky Pratama"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Satuan Pendidikan *</label>
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

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
                  <div>
                    <label className="font-semibold block mb-1">NISN Resmi *</label>
                    <input
                      type="text"
                      required
                      value={formData.nisn || ''}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      placeholder="0081234567"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">NIS / No. Induk Lokal</label>
                    <input
                      type="text"
                      value={formData.nis || ''}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      placeholder="12345"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Kelas / Rombel *</label>
                    <input
                      type="text"
                      required
                      value={formData.classGrade || formData.class || ''}
                      onChange={(e) => setFormData({ ...formData, classGrade: e.target.value, class: e.target.value })}
                      placeholder="Contoh: VII A / X MIPA 1"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Jenis Kelamin *</label>
                    <select
                      value={formData.gender || 'L'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="font-semibold block mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={formData.birthPlace || ''}
                      onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                      placeholder="Klaten"
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

                  <div>
                    <label className="font-semibold block mb-1">Status Keaktifan *</label>
                    <select
                      value={formData.status || 'Aktif'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Lulus">Lulus</option>
                      <option value="Mutasi">Mutasi Keluar</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Data Orang Tua / Wali */}
              <div>
                <h4 className="font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Data Orang Tua / Wali Siswa
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Nama Orang Tua / Wali</label>
                    <input
                      type="text"
                      value={formData.guardianName || ''}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="Nama Ayah / Ibu / Wali"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">No. WhatsApp / HP Orang Tua / Wali</label>
                    <input
                      type="text"
                      value={formData.guardianPhone || ''}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Alamat Domisili Siswa */}
              <div>
                <h4 className="font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Alamat Domisili Siswa
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">RT / RW</label>
                    <input
                      type="text"
                      value={formData.rtRw || ''}
                      onChange={(e) => setFormData({ ...formData, rtRw: e.target.value })}
                      placeholder="01/03"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Kelurahan / Desa</label>
                    <input
                      type="text"
                      value={formData.kelurahan || ''}
                      onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                      placeholder="Tonggalan"
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
                      placeholder="57412"
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
                    <label className="font-semibold block mb-1">Alamat Lengkap / Jalan</label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Jl. Pemuda No. 12"
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
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Siswa */}
      {isDetailOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>Detail Profil Peserta Didik</span>
              </h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 my-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xl ring-2 ring-purple-500/30">
                  {selectedItem.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedItem.name}</h4>
                  <div className="text-slate-500">
                    {sekolahList.find((s) => s.id === selectedItem.schoolId)?.name || '-'}
                  </div>
                  <div className="text-purple-600 font-bold text-xs mt-0.5">
                    Kelas / Rombel: {selectedItem.classGrade || selectedItem.class}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 text-[10px]">NISN Resmi:</span>
                  <div className="font-mono font-bold text-purple-600 text-sm">{selectedItem.nisn}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">NIS Lokal:</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedItem.nis || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Jenis Kelamin:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedItem.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Status Keaktifan:</span>
                  <div className="font-bold text-emerald-600">{selectedItem.status}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <div><b>Tempat, Tanggal Lahir:</b> {selectedItem.birthPlace || '-'}, {selectedItem.birthDate || '-'}</div>
                <div><b>Nama Orang Tua / Wali:</b> {selectedItem.guardianName || '-'}</div>
                <div><b>No. WhatsApp / HP Orang Tua:</b> {selectedItem.guardianPhone || '-'}</div>
                <div>
                  <b>Alamat Domisili:</b> {selectedItem.address ? `${selectedItem.address}, ` : ''}
                  {selectedItem.rtRw ? `RT/RW ${selectedItem.rtRw}, ` : ''}
                  {selectedItem.kelurahan ? `Kel. ${selectedItem.kelurahan}, ` : ''}
                  {selectedItem.kecamatan ? `Kec. ${selectedItem.kecamatan}, ` : ''}
                  {selectedItem.kabupaten || 'Klaten'} {selectedItem.kodePos ? `(${selectedItem.kodePos})` : ''}
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
        entityType="siswa"
        activeSchools={activeSekolahList}
        defaultSchoolId={filterSchool !== 'ALL' ? filterSchool : currentUser?.sekolahId || activeSekolahList[0]?.id}
      />
    </div>
  );
};
