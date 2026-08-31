import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  Eye,
  FileSpreadsheet,
  FileText,
  CreditCard,
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  Clock,
  UploadCloud,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Guru, EmploymentStatus } from '../../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportUtils';
import { ExcelImportModal } from '../common/ExcelImportModal';

export const GuruModule: React.FC = () => {
  const { filteredGuruList, filteredSekolahList, sekolahList, activeSekolahList, addGuru, updateGuru, deleteGuru } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSchool, setFilterSchool] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Guru | null>(null);

  const [formData, setFormData] = useState<Partial<Guru>>({
    name: '',
    schoolId: '',
    birthPlace: 'Klaten',
    birthDate: '1985-05-10',
    phone: '',
    nipm: '',
    nbm: '',
    nuptk: '',
    nik: '',
    status: 'GTP',
    tmtGtyGtp: '2015-07-01',
    tmtGttyGttp: '',
    hasSerdik: 'Sudah',
    certificationField: 'Pendidikan Agama Islam',
    lastDegree: 'S1',
    studyProgram: 'Pendidikan Agama Islam',
    university: 'Universitas Muhammadiyah Surakarta',
    subject: 'Al-Islam & Kemuhammadiyahan',
    additionalTask: 'Waka Kesiswaan',
    teachingHoursPerWeek: 24,
    gender: 'L',
    isCertified: true,
  });

  const activeGurus = useMemo(() => filteredGuruList.filter((g) => !g.isDeleted), [filteredGuruList]);

  const filtered = useMemo(() => {
    return activeGurus.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.nbm && g.nbm.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (g.nipm && g.nipm.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (g.nuptk && g.nuptk.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (g.nik && g.nik.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (g.subject && g.subject.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSchool = filterSchool === 'ALL' || g.schoolId === filterSchool;
      const matchStatus = filterStatus === 'ALL' || g.status === filterStatus;

      return matchSearch && matchSchool && matchStatus;
    });
  }, [activeGurus, searchQuery, filterSchool, filterStatus]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    const defaultSchoolId = currentUser?.sekolahId || activeSekolahList[0]?.id || '';
    setFormData({
      name: '',
      schoolId: defaultSchoolId,
      birthPlace: 'Klaten',
      birthDate: '1990-01-01',
      phone: '',
      nipm: '',
      nbm: '',
      nuptk: '',
      nik: '',
      status: 'GTP',
      tmtGtyGtp: '2020-07-01',
      tmtGttyGttp: '',
      hasSerdik: 'Sudah',
      certificationField: '',
      lastDegree: 'S1',
      studyProgram: '',
      university: '',
      subject: '',
      additionalTask: '-',
      teachingHoursPerWeek: 24,
      gender: 'L',
      isCertified: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: Guru) => {
    setSelectedItem(g);
    setFormData({
      ...g,
      schoolId: g.schoolId || activeSekolahList[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenDetail = (g: Guru) => {
    setSelectedItem(g);
    setIsDetailOpen(true);
  };

  const handleOpenCard = (g: Guru) => {
    setSelectedItem(g);
    setIsCardModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.schoolId) return;

    if (selectedItem) {
      await updateGuru(selectedItem.id, formData);
    } else {
      await addGuru(formData as Omit<Guru, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Pindahkan data Guru "${name}" ke Recycle Bin?`)) {
      await deleteGuru(id);
    }
  };

  const handleExportCSV = () => {
    const rows = filtered.map((g) => {
      const school = sekolahList.find((s) => s.id === g.schoolId);
      return {
        Satuan_Pendidikan: school?.name || '',
        Nama_Lengkap_dan_Gelar: g.name,
        Tempat_Lahir: g.birthPlace || '',
        Tanggal_Lahir: g.birthDate || '',
        Nomor_HP: g.phone || '',
        NIPM: g.nipm || '-',
        NBM: g.nbm || '-',
        NUPTK: g.nuptk || '-',
        NIK: g.nik || '-',
        Status_Kepegawaian: g.status,
        TMT_GTY_GTP: g.tmtGtyGtp || '-',
        TMT_GTTY_GTTP: g.tmtGttyGttp || '-',
        Serdik: g.hasSerdik || (g.isCertified ? 'Ya' : 'Tidak'),
        Bidang_Studi_Serdik: g.certificationField || '-',
        Ijazah_Terakhir: g.lastDegree || g.education || '-',
        Program_Studi: g.studyProgram || '-',
        Nama_Kampus: g.university || '-',
        Mata_Pelajaran: g.subject,
        Tugas_Tambahan: g.additionalTask || '-',
        Jam_Mengajar_Minggu: g.teachingHoursPerWeek || 0,
      };
    });
    exportToCSV(`Data_Guru_Dikdasmen_${Date.now()}`, rows);
  };

  const handleExportExcel = () => {
    const rows = filtered.map((g) => {
      const school = sekolahList.find((s) => s.id === g.schoolId);
      return {
        'Satuan Pendidikan': school?.name || '',
        'Nama Lengkap Guru': g.name,
        'Tempat Lahir': g.birthPlace || '',
        'Tanggal Lahir': g.birthDate || '',
        'Nomor HP': g.phone || '',
        NIPM: g.nipm || '-',
        NBM: g.nbm || '-',
        NUPTK: g.nuptk || '-',
        NIK: g.nik || '-',
        'Status Kepegawaian': g.status,
        'TMT SK GTY/GTP': g.tmtGtyGtp || '-',
        'TMT SK GTTY/GTTP': g.tmtGttyGttp || '-',
        'Serdik (Ya/Tidak)': g.hasSerdik || (g.isCertified ? 'Ya' : 'Tidak'),
        'Bidang Sertifikasi': g.certificationField || '-',
        'Ijazah Terakhir': g.lastDegree || g.education || '-',
        'Program Studi': g.studyProgram || '-',
        'Universitas / Kampus': g.university || '-',
        'Mata Pelajaran': g.subject,
        'Tugas Tambahan': g.additionalTask || '-',
        'Jam Mengajar / Minggu': g.teachingHoursPerWeek || 0,
      };
    });
    exportToExcel(`Data_Guru_Dikdasmen_${Date.now()}`, 'Data Guru', rows);
  };

  const handleExportPDF = () => {
    const headers = ['No', 'Nama Lengkap & Gelar', 'Satuan Pendidikan', 'NBM / NIPM', 'Mapel', 'Status', 'Serdik'];
    const rows = filtered.map((g, idx) => {
      const school = sekolahList.find((s) => s.id === g.schoolId);
      return [
        String(idx + 1),
        g.name,
        school?.name || '-',
        g.nbm || g.nipm || '-',
        g.subject,
        g.status,
        g.hasSerdik === 'Ya' || g.isCertified ? 'Sudah' : 'Belum',
      ];
    });
    exportToPDF('Daftar Guru & Pendidik Muhammadiyah Klaten', headers, rows, 'Laporan_Data_Guru_Dikdasmen');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Data Pendidik & Guru</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {filtered.length} Guru Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data lengkap tenaga pendidik: NIPM, NBM, NUPTK, NIK, Serdik, TMT SK GTP/GTTP, Ijazah & Jam Mengajar
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
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          {currentUser?.role !== 'Cabang' && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300/80 dark:border-emerald-700/60 shadow-xs cursor-pointer transition-all"
                title="Import data Guru massal via file spreadsheet Excel (.xlsx / .xls)"
              >
                <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Upload Excel</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Data Guru</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama guru, NBM, NIPM, NUPTK, mapel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

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

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter Status Kepegawaian"
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">Semua Status Kepegawaian</option>
          <option value="GTP">GTP (Guru Tetap Persyarikatan)</option>
          <option value="GTTP">GTTP (Guru Tidak Tetap Persyarikatan)</option>
          <option value="GTY">GTY (Guru Tetap Yayasan)</option>
          <option value="GTT">GTT (Guru Tidak Tetap)</option>
          <option value="Guru Bantu">Guru Bantu</option>
          <option value="PNS DPK">PNS DPK</option>
          <option value="PPPK">PPPK</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Nama Guru & Gelar</th>
                <th className="p-3.5">Satuan Pendidikan</th>
                <th className="p-3.5">NBM / NIPM / NUPTK</th>
                <th className="p-3.5">Mata Pelajaran & Jam</th>
                <th className="p-3.5">Status Pegawai</th>
                <th className="p-3.5">Pendidikan Terakhir</th>
                <th className="p-3.5">Serdik</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada data guru yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => {
                  const school = sekolahList.find((s) => s.id === g.schoolId);
                  return (
                    <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <img
                          src={
                            g.photoUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={g.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/30 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{g.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {g.birthPlace && g.birthDate ? `${g.birthPlace}, ${g.birthDate}` : ''}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{school?.name || '-'}</td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">NBM: {g.nbm || '-'}</div>
                        <div className="text-[10px] text-slate-500">NIPM: {g.nipm || '-'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{g.subject}</div>
                        <div className="text-[10px] text-slate-400">{g.teachingHoursPerWeek || 0} Jam/Minggu</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            g.status === 'GTP' || g.status === 'GTY'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : g.status === 'GTTP' || g.status === 'GTT'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                          }`}
                        >
                          {g.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        <div>{g.lastDegree || g.education}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{g.studyProgram || ''}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            g.hasSerdik === 'Ya' || g.hasSerdik === 'Sudah' || g.isCertified
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {g.hasSerdik === 'Ya' || g.hasSerdik === 'Sudah' || g.isCertified ? '✓ Serdik' : 'Belum'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(g)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Lihat Detail Guru"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenCard(g)}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40"
                            title="Kartu Identitas Guru"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          {(currentUser?.role === 'Super Admin' ||
                            currentUser?.role === 'Admin' ||
                            (currentUser?.role === 'Sekolah' && currentUser.sekolahId === g.schoolId)) && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(g)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                title="Edit Guru"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(g.id, g.name)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Hapus ke Recycle Bin"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>{selectedItem ? 'Edit Formulir Data Pendidik / Guru' : 'Input Data Pendidik / Guru Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Nama Lengkap Guru (Dilengkapi Gelar) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Dra. Hj. Siti Aminah, M.Pd."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Satuan Pendidikan Bertugas *</label>
                  <select
                    required
                    value={formData.schoolId || ''}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                <div>
                  <label className="font-semibold block mb-1">Nomor HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold block mb-1">NIPM</label>
                  <input
                    type="text"
                    value={formData.nipm || ''}
                    onChange={(e) => setFormData({ ...formData, nipm: e.target.value })}
                    placeholder="NIPM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">NBM</label>
                  <input
                    type="text"
                    value={formData.nbm || ''}
                    onChange={(e) => setFormData({ ...formData, nbm: e.target.value })}
                    placeholder="NBM Muhammadiyah"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">NUPTK</label>
                  <input
                    type="text"
                    value={formData.nuptk || ''}
                    onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                    placeholder="NUPTK Resmi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">NIK (KTP)</label>
                  <input
                    type="text"
                    value={formData.nik || ''}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="16 Digit NIK"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.status || 'GTP'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmploymentStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                  >
                    <option value="GTP">GTP (Guru Tetap Persyarikatan)</option>
                    <option value="GTTP">GTTP (Guru Tidak Tetap Persyarikatan)</option>
                    <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                    <option value="GTT">GTT (Guru Tidak Tetap)</option>
                    <option value="Guru Bantu">Guru Bantu</option>
                    <option value="PNS DPK">PNS DPK</option>
                    <option value="PPPK">PPPK</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">TMT SK GTY / GTP</label>
                  <input
                    type="date"
                    value={formData.tmtGtyGtp || ''}
                    onChange={(e) => setFormData({ ...formData, tmtGtyGtp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">TMT SK GTTY / GTTP</label>
                  <input
                    type="date"
                    value={formData.tmtGttyGttp || ''}
                    onChange={(e) => setFormData({ ...formData, tmtGttyGttp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Sudah Mempunyai Serdik?</label>
                  <select
                    value={formData.hasSerdik || (formData.isCertified ? 'Ya' : 'Tidak')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hasSerdik: e.target.value as 'Ya' | 'Tidak',
                        isCertified: e.target.value === 'Ya',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold"
                  >
                    <option value="Ya">Ya (Sudah Mempunyai Serdik)</option>
                    <option value="Tidak">Tidak (Belum Mempunyai Serdik)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Bidang Studi Sertifikasi Pendidik</label>
                  <input
                    type="text"
                    value={formData.certificationField || ''}
                    onChange={(e) => setFormData({ ...formData, certificationField: e.target.value })}
                    placeholder="Contoh: Pendidikan Matematika"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Ijazah Terakhir</label>
                  <select
                    value={formData.lastDegree || 'S1'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastDegree: e.target.value as any,
                        education: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold"
                  >
                    <option value="S1">S1 (Sarjana)</option>
                    <option value="S2">S2 (Magister)</option>
                    <option value="S3">S3 (Doktor)</option>
                    <option value="D3">D3 (Diploma)</option>
                    <option value="SMA/SMK/MA">SMA / SMK / MA</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Program Studi Sesuai Ijazah</label>
                  <input
                    type="text"
                    value={formData.studyProgram || ''}
                    onChange={(e) => setFormData({ ...formData, studyProgram: e.target.value })}
                    placeholder="Pendidikan Agama Islam"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Nama Kampus Sesuai Ijazah</label>
                  <input
                    type="text"
                    value={formData.university || ''}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="Universitas Muhammadiyah Surakarta"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Tugas Mengajar / Mata Pelajaran *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Al-Islam & Kemuhammadiyahan"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Tugas Tambahan</label>
                  <input
                    type="text"
                    value={formData.additionalTask || ''}
                    onChange={(e) => setFormData({ ...formData, additionalTask: e.target.value })}
                    placeholder="Waka Kurikulum / Kepala Lab / Pembina OSIS"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Jam Tatap Muka Per Minggu</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={formData.teachingHoursPerWeek || 24}
                    onChange={(e) => setFormData({ ...formData, teachingHoursPerWeek: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                  />
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Simpan Data Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Guru */}
      {isDetailOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Detail Profil Pendidik / Guru</span>
              </h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 my-4 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedItem.photoUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={selectedItem.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedItem.name}</h4>
                  <div className="text-slate-500">
                    {sekolahList.find((s) => s.id === selectedItem.schoolId)?.name || '-'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 text-[10px]">NBM:</span>
                  <div className="font-mono font-bold text-emerald-600">{selectedItem.nbm || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">NIPM:</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedItem.nipm || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">NUPTK:</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedItem.nuptk || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">NIK:</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedItem.nik || '-'}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <div><b>Tempat, Tanggal Lahir:</b> {selectedItem.birthPlace || '-'}, {selectedItem.birthDate || '-'}</div>
                <div><b>Nomor HP:</b> {selectedItem.phone || '-'}</div>
                <div><b>Status Kepegawaian:</b> <span className="font-bold text-purple-600">{selectedItem.status}</span></div>
                <div><b>TMT SK GTP / GTY:</b> {selectedItem.tmtGtyGtp || '-'} | <b>TMT SK GTTP:</b> {selectedItem.tmtGttyGttp || '-'}</div>
                <div><b>Sertifikat Pendidik (Serdik):</b> {selectedItem.hasSerdik || (selectedItem.isCertified ? 'Ya' : 'Tidak')} {selectedItem.certificationField ? `(${selectedItem.certificationField})` : ''}</div>
                <div><b>Pendidikan Terakhir:</b> {selectedItem.lastDegree || selectedItem.education} - {selectedItem.studyProgram || ''} ({selectedItem.university || ''})</div>
                <div><b>Mata Pelajaran:</b> {selectedItem.subject} ({selectedItem.teachingHoursPerWeek || 0} Jam/Minggu)</div>
                <div><b>Tugas Tambahan:</b> {selectedItem.additionalTask || '-'}</div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Teacher ID Card Preview */}
      {isCardModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center">
            <div className="flex justify-end">
              <button onClick={() => setIsCardModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable ID Card */}
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-emerald-600/40 my-3 text-left">
              <div className="flex items-center justify-between border-b border-emerald-600/40 pb-3 mb-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">
                    KARTU IDENTITAS PENDIDIK
                  </div>
                  <div className="text-xs font-black">MAJELIS DIKDASMEN DAERAH KLATEN</div>
                </div>
                <Users className="w-6 h-6 text-emerald-300" />
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedItem.photoUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={selectedItem.name}
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-emerald-400"
                />
                <div>
                  <h4 className="font-black text-sm leading-snug">{selectedItem.name}</h4>
                  <div className="text-emerald-200 text-xs font-semibold mt-0.5">{selectedItem.subject}</div>
                  <div className="text-[11px] text-emerald-300 font-mono mt-1">NBM: {selectedItem.nbm || '-'}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-600/40 flex justify-between items-center text-[10px] text-emerald-200">
                <span>Status: {selectedItem.status}</span>
                <span>{selectedItem.hasSerdik === 'Ya' || selectedItem.isCertified ? 'Pendidik Tersertifikasi' : 'Aktif Mengajar'}</span>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Cetak Kartu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Excel */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        entityType="guru"
        activeSchools={activeSekolahList}
        defaultSchoolId={filterSchool !== 'ALL' ? filterSchool : currentUser?.sekolahId || activeSekolahList[0]?.id}
      />
    </div>
  );
};
