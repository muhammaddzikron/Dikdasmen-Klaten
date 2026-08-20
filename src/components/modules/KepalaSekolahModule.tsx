import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Clock,
  X,
  Sparkles,
  Eye,
  Phone,
  Award,
  Calendar,
  Building2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { KepalaSekolah } from '../../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportUtils';

export const KepalaSekolahModule: React.FC = () => {
  const {
    filteredKepalaSekolahList,
    filteredSekolahList,
    sekolahList,
    activeSekolahList,
    cabangList,
    addKepalaSekolah,
    updateKepalaSekolah,
    deleteKepalaSekolah,
  } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSchool, setFilterSchool] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KepalaSekolah | null>(null);

  const [formData, setFormData] = useState<Partial<KepalaSekolah>>({
    name: '',
    nipm: '',
    schoolId: '',
    birthPlace: 'Klaten',
    birthDate: '1975-01-01',
    phone: '',
    periodNumber: 1,
    startDate: '2024-07-01',
    endDate: '2028-06-30',
    nuptk: '',
    nuks: '',
    hasSerdik: 'Sudah',
    employmentStatus: 'GTY',
    skNumber: '',
    status: 'Aktif',
    email: '',
    nbm: '',
  });

  const activeList = useMemo(() => filteredKepalaSekolahList.filter((k) => !k.isDeleted), [filteredKepalaSekolahList]);

  const filtered = useMemo(() => {
    return activeList.filter((k) => {
      const matchSearch =
        k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (k.nipm && k.nipm.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (k.nuptk && k.nuptk.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (k.skNumber && k.skNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = filterStatus === 'ALL' || k.status === filterStatus;
      const matchSchool = filterSchool === 'ALL' || k.schoolId === filterSchool;
      return matchSearch && matchStatus && matchSchool;
    });
  }, [activeList, searchQuery, filterStatus, filterSchool]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    const defaultSchoolId = currentUser?.sekolahId || activeSekolahList[0]?.id || '';
    setFormData({
      name: '',
      nipm: '',
      schoolId: defaultSchoolId,
      birthPlace: 'Klaten',
      birthDate: '1975-05-12',
      phone: '',
      periodNumber: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 4 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      nuptk: '',
      nuks: '',
      hasSerdik: 'Sudah',
      employmentStatus: 'GTY',
      skNumber: `045/KEP/III.4/D/${new Date().getFullYear()}`,
      status: 'Aktif',
      email: '',
      nbm: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (k: KepalaSekolah) => {
    setSelectedItem(k);
    setFormData({
      ...k,
      schoolId: k.schoolId || activeSekolahList[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenDetail = (k: KepalaSekolah) => {
    setSelectedItem(k);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.schoolId) return;

    if (selectedItem) {
      await updateKepalaSekolah(selectedItem.id, formData);
    } else {
      await addKepalaSekolah(formData as Omit<KepalaSekolah, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Pindahkan data Kepala Sekolah "${name}" ke Recycle Bin?`)) {
      await deleteKepalaSekolah(id);
    }
  };

  const handleExportCSV = () => {
    const rows = filtered.map((k) => {
      const s = sekolahList.find((sch) => sch.id === k.schoolId);
      return {
        Nama_Lengkap_dan_Gelar: k.name,
        NIPM: k.nipm || '-',
        Satuan_Pendidikan: s?.name || '',
        Tempat_Lahir: k.birthPlace || '',
        Tanggal_Lahir: k.birthDate || '',
        Nomor_HP: k.phone || '',
        Periode_Ke: k.periodNumber,
        TMT_SK_Kepala: k.startDate,
        Tanggal_Berakhir_SK: k.endDate,
        NUPTK: k.nuptk || '-',
        NUKS: k.nuks || '-',
        Serdik: k.hasSerdik || 'Belum',
        Status_Kepegawaian: k.employmentStatus || 'GTY',
        No_SK: k.skNumber || '',
        Status_Jabatan: k.status,
      };
    });
    exportToCSV(`Data_Kepala_Sekolah_Klaten_${Date.now()}`, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Data Kepala Satuan Pendidikan</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {filtered.length} Kepala Sekolah
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data profil kepala sekolah lengkap: NIPM, NUPTK, NUKS, Serdik, periode kepemimpinan, dan monitoring SK jabatan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Kepala</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kepala sekolah, NIPM, NUPTK, SK..."
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
          aria-label="Filter Status Jabatan"
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">Semua Status Jabatan</option>
          <option value="Aktif">Aktif Menjabat</option>
          <option value="Selesai">Selesai Masa Jabatan</option>
          <option value="Mutasi">Mutasi / Dipindahtugaskan</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Nama Lengkap & Gelar</th>
                <th className="p-3.5">NIPM / NUPTK</th>
                <th className="p-3.5">Satuan Pendidikan</th>
                <th className="p-3.5">Periode</th>
                <th className="p-3.5">Masa Jabatan SK</th>
                <th className="p-3.5">Status & Serdik</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada data kepala sekolah yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((k) => {
                  const s = sekolahList.find((sch) => sch.id === k.schoolId);
                  const today = new Date();
                  const end = new Date(k.endDate);
                  const remainingDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <img
                          src={
                            k.photoUrl ||
                            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={k.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/30 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{k.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {k.birthPlace && k.birthDate ? `${k.birthPlace}, ${k.birthDate}` : ''}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        <div className="font-bold text-slate-800 dark:text-slate-200">NIPM: {k.nipm || '-'}</div>
                        <div className="text-[10px] text-slate-500">NUPTK: {k.nuptk || '-'}</div>
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{s?.name || '-'}</td>
                      <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        Periode ke-{k.periodNumber}
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-800 dark:text-slate-200">
                          {k.startDate} s/d {k.endDate}
                        </div>
                        {k.status === 'Aktif' && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{remainingDays > 0 ? `${remainingDays} hari lagi` : 'Masa jabatan usai'}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              k.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {k.status}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                            {k.employmentStatus || 'GTY'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                            Serdik: {k.hasSerdik === 'Sudah' || k.hasSerdik === true ? 'Ya' : 'Belum'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(k)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Lihat Detail Kepala Sekolah"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(k)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            title="Edit Data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(k.id, k.name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>{selectedItem ? 'Edit Formulir Data Kepala Sekolah' : 'Input Data Kepala Sekolah Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Lengkap Kepala (Dilengkapi Gelar) *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Drs. H. Ahmad Dahlan, M.Pd."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Satuan Pendidikan / Madrasah *</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">NIPM</label>
                  <input
                    type="text"
                    value={formData.nipm || ''}
                    onChange={(e) => setFormData({ ...formData, nipm: e.target.value })}
                    placeholder="Nomor Induk Pegawai Muh."
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
                  <label className="font-semibold block mb-1">NUKS</label>
                  <input
                    type="text"
                    value={formData.nuks || ''}
                    onChange={(e) => setFormData({ ...formData, nuks: e.target.value })}
                    placeholder="Nomor Unik Kepala Sekolah"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
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
                    placeholder="08123456789"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Periode Kepala yang ke</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.periodNumber || 1}
                    onChange={(e) => setFormData({ ...formData, periodNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Mempunyai Serdik ?</label>
                  <select
                    value={formData.hasSerdik === 'Sudah' || formData.hasSerdik === true ? 'Sudah' : 'Belum'}
                    onChange={(e) => setFormData({ ...formData, hasSerdik: e.target.value as 'Sudah' | 'Belum' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold"
                  >
                    <option value="Sudah">Sudah Mempunyai Serdik</option>
                    <option value="Belum">Belum Mempunyai Serdik</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.employmentStatus || 'GTY'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentStatus: e.target.value as 'GTY' | 'PNS' | 'GTP' | 'PPPK',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-semibold"
                  >
                    <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                    <option value="GTP">GTP (Guru Tetap Persyarikatan)</option>
                    <option value="PNS">PNS / DPK</option>
                    <option value="PPPK">PPPK</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">TMT SK Kepala Sekolah/Madrasah</label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    Tanggal Berakhir Jabatan sesuai SK Kepala
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Nomor SK Kepala Sekolah</label>
                <input
                  type="text"
                  value={formData.skNumber || ''}
                  onChange={(e) => setFormData({ ...formData, skNumber: e.target.value })}
                  placeholder="045/KEP/III.4/D/2024"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Simpan Data Kepala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {isDetailOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Detail Profil Kepala Sekolah</span>
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
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
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
                  <span className="text-slate-400 text-[10px]">NIPM:</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedItem.nipm || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">NUPTK:</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedItem.nuptk || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">NUKS:</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedItem.nuks || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Sertifikat Pendidik (Serdik):</span>
                  <div className="font-bold text-emerald-600">
                    {selectedItem.hasSerdik === 'Sudah' || selectedItem.hasSerdik === true ? 'Sudah Ada' : 'Belum Ada'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Status Kepegawaian:</span>
                  <div className="font-bold text-purple-600">{selectedItem.employmentStatus || 'GTY'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Periode Kepala Ke:</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Periode ke-{selectedItem.periodNumber}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <div><b>Tempat, Tanggal Lahir:</b> {selectedItem.birthPlace || '-'}, {selectedItem.birthDate || '-'}</div>
                <div><b>Nomor HP / WhatsApp:</b> {selectedItem.phone || '-'}</div>
                <div><b>SK Pengangkatan:</b> {selectedItem.skNumber || '-'}</div>
                <div><b>Masa Jabatan:</b> {selectedItem.startDate} s/d {selectedItem.endDate}</div>
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
    </div>
  );
};
