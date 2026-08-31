import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Download,
  Printer,
  CheckCircle,
  FileSpreadsheet,
  X,
  Building,
  School,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Mutasi, TargetPersonelType } from '../../types';
import { exportToCSV, exportToExcel } from '../../lib/exportUtils';

export const MutasiModule: React.FC = () => {
  const { filteredMutasiList, sekolahList, activeSekolahList, guruList, tendikList, siswaList, addMutasi, updateMutasi } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Mutasi | null>(null);

  const [formData, setFormData] = useState<Partial<Mutasi>>({
    personelType: 'Guru',
    personelName: '',
    targetId: '',
    fromSchoolId: '',
    toSchoolId: '',
    reason: 'Pemerataan Tenaga Pendidik Daerah',
    status: 'Selesai',
    mutationDate: new Date().toISOString().split('T')[0],
    skNumber: `089/MUTASI/III.4/D/${new Date().getFullYear()}`,
  });

  const activeMutasi = useMemo(() => (filteredMutasiList || []).filter((m) => !m?.isDeleted), [filteredMutasiList]);

  const filtered = useMemo(() => {
    return activeMutasi.filter((m) => {
      const matchSearch =
        m.personelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.skNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.reason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = filterType === 'ALL' || m.personelType === filterType;
      return matchSearch && matchType;
    });
  }, [activeMutasi, searchQuery, filterType]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    const originSchool = activeSekolahList[0]?.id || '';
    const destSchool = activeSekolahList[1]?.id || activeSekolahList[0]?.id || '';
    const initialGuru = guruList[0];

    setFormData({
      personelType: 'Guru',
      personelName: initialGuru?.name || '',
      targetId: initialGuru?.id || '',
      fromSchoolId: initialGuru?.schoolId || originSchool,
      toSchoolId: destSchool,
      reason: 'Kebutuhan Formasi Guru Mapel & Pemerataan Mutu',
      status: 'Selesai',
      mutationDate: new Date().toISOString().split('T')[0],
      skNumber: `089/MUTASI/III.4/D/${new Date().getFullYear()}`,
    });
    setIsModalOpen(true);
  };

  const handlePersonelTypeChange = (type: TargetPersonelType) => {
    let name = '';
    let targetId = '';
    let fromSchool = '';

    if (type === 'Guru' && guruList.length > 0) {
      name = guruList[0].name;
      targetId = guruList[0].id;
      fromSchool = guruList[0].schoolId;
    } else if (type === 'Tendik' && tendikList.length > 0) {
      name = tendikList[0].name;
      targetId = tendikList[0].id;
      fromSchool = tendikList[0].schoolId;
    } else if (type === 'Siswa' && siswaList.length > 0) {
      name = siswaList[0].name;
      targetId = siswaList[0].id;
      fromSchool = siswaList[0].schoolId;
    }

    setFormData({
      ...formData,
      personelType: type,
      personelName: name,
      targetId,
      fromSchoolId: fromSchool || sekolahList[0]?.id || '',
      toSchoolId: sekolahList[1]?.id || sekolahList[0]?.id || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personelName || !formData.fromSchoolId || !formData.toSchoolId) return;

    await addMutasi(formData as Omit<Mutasi, 'id'>);
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const rows = filtered.map((m) => {
      const fromSch = sekolahList.find((s) => s.id === m.fromSchoolId);
      const toSch = sekolahList.find((s) => s.id === m.toSchoolId);
      return {
        No_SK_Mutasi: m.skNumber,
        Tipe: m.personelType,
        Nama: m.personelName,
        Sekolah_Asal: fromSch?.name || '',
        Sekolah_Tujuan: toSch?.name || '',
        Tanggal_Mutasi: m.mutationDate,
        Alasan: m.reason,
        Status: m.status,
      };
    });
    exportToCSV(`Data_Mutasi_Dikdasmen_${Date.now()}`, rows);
  };

  const handlePrintMutasi = (m: Mutasi) => {
    const fromSch = sekolahList.find((s) => s.id === m.fromSchoolId)?.name || 'Sekolah Asal';
    const toSch = sekolahList.find((s) => s.id === m.toSchoolId)?.name || 'Sekolah Tujuan';

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <html>
        <head>
          <title>Surat Keputusan Mutasi - ${m.skNumber}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 24px; }
            .header h2 { margin: 0; font-size: 18pt; font-weight: bold; }
            .header p { margin: 4px 0 0; font-size: 11pt; }
            .title { text-align: center; margin-bottom: 24px; }
            .title h3 { margin: 0; font-size: 14pt; text-decoration: underline; }
            .content table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12pt; }
            .content td { padding: 6px 0; vertical-align: top; }
            .signature { margin-top: 50px; float: right; width: 250px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>MAJELIS PENDIDIKAN DASAR DAN MENENGAH</h2>
            <p>PIMPINAN DAERAH MUHAMMADIYAH KABUPATEN/KOTA</p>
            <p style="font-size: 10pt; color: #444;">Jl. Kapten Tendean No. 12 • Telp: (0274) 512345 • Email: dikdasmen@muhammadiyah.or.id</p>
          </div>
          <div class="title">
            <h3>SURAT KEPUTUSAN MUTASI PERSONEL</h3>
            <p>Nomor: ${m.skNumber}</p>
          </div>
          <div class="content">
            <p>Majelis Pendidikan Dasar dan Menengah Daerah dengan ini memutuskan dan menetapkan pemindahtugasan (mutasi):</p>
            <table>
              <tr><td style="width: 200px;"><strong>Nama Personel</strong></td><td>: ${m.personelName}</td></tr>
              <tr><td><strong>Jenis Personel</strong></td><td>: ${m.personelType}</td></tr>
              <tr><td><strong>Satuan Pendidikan Asal</strong></td><td>: ${fromSch}</td></tr>
              <tr><td><strong>Satuan Pendidikan Tujuan</strong></td><td>: ${toSch}</td></tr>
              <tr><td><strong>Mulai Berlaku</strong></td><td>: ${m.mutationDate}</td></tr>
              <tr><td><strong>Alasan / Pertimbangan</strong></td><td>: ${m.reason}</td></tr>
            </table>
            <p style="margin-top: 20px;">Kepada yang bersangkutan agar segera melaksanakan serah terima tugas dan penyesuaian administrasi.</p>
          </div>
          <div class="signature">
            <p>Ditetapkan di: Yogyakarta<br/>Pada tanggal: ${m.mutationDate}</p>
            <p style="margin-top: 60px; font-weight: bold; text-decoration: underline;">Dr. H. Muhammad Arifin, M.Pd.</p>
            <p>Ketua Majelis Dikdasmen Daerah</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Modul Mutasi Personel & Siswa</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              {filtered.length} Riwayat Mutasi
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pengelolaan pemindahan tugas guru, staf tendik, kepala sekolah, dan kepindahan peserta didik antar-lembaga
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Proses Mutasi Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama personel, no SK, alasan..."
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

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          aria-label="Filter Jenis Mutasi"
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">Semua Jenis Personel</option>
          <option value="Guru">Mutasi Guru (Pendidik)</option>
          <option value="Tendik">Mutasi Tenaga Kependidikan</option>
          <option value="Kepala Sekolah">Mutasi Kepala Sekolah</option>
          <option value="Siswa">Mutasi Peserta Didik (Siswa)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Nama & Tipe</th>
                <th className="p-3.5">Satuan Pendidikan Asal</th>
                <th className="p-3.5">Satuan Pendidikan Tujuan</th>
                <th className="p-3.5">No. SK Mutasi</th>
                <th className="p-3.5">Tgl Mutasi</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada riwayat mutasi.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const fromSch = activeSekolahList.find((s) => s.id === m.fromSchoolId);
                  const toSch = activeSekolahList.find((s) => s.id === m.toSchoolId);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{m.personelName}</div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {m.personelType}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">{fromSch?.name || '-'}</td>
                      <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">{toSch?.name || '-'}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">{m.skNumber}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{m.mutationDate}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handlePrintMutasi(m)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          title="Cetak Surat Keputusan Mutasi"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Mutasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                <span>Form Pemindahtugasan / Mutasi</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Jenis Personel yang Dimutasi</label>
                <select
                  value={formData.personelType || 'Guru'}
                  onChange={(e) => handlePersonelTypeChange(e.target.value as TargetPersonelType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
                >
                  <option value="Guru">Guru (Pendidik)</option>
                  <option value="Tendik">Tenaga Kependidikan</option>
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                  <option value="Siswa">Peserta Didik (Siswa)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Pilih Nama Personel *</label>
                <select
                  value={formData.targetId || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    let name = '';
                    let origin = '';
                    if (formData.personelType === 'Guru') {
                      const item = guruList.find((g) => g.id === id);
                      name = item?.name || '';
                      origin = item?.schoolId || '';
                    } else if (formData.personelType === 'Tendik') {
                      const item = tendikList.find((t) => t.id === id);
                      name = item?.name || '';
                      origin = item?.schoolId || '';
                    } else if (formData.personelType === 'Siswa') {
                      const item = siswaList.find((s) => s.id === id);
                      name = item?.name || '';
                      origin = item?.schoolId || '';
                    }
                    setFormData({ ...formData, targetId: id, personelName: name, fromSchoolId: origin });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                >
                  {formData.personelType === 'Guru' &&
                    guruList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.subject})
                      </option>
                    ))}
                  {formData.personelType === 'Tendik' &&
                    tendikList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.position})
                      </option>
                    ))}
                  {formData.personelType === 'Siswa' &&
                    siswaList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (NISN: {s.nisn})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Sekolah Asal *</label>
                  <select
                    required
                    value={formData.fromSchoolId || ''}
                    onChange={(e) => setFormData({ ...formData, fromSchoolId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="" disabled>-- Pilih Sekolah Asal --</option>
                    {activeSekolahList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.level})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Sekolah Tujuan *</label>
                  <select
                    required
                    value={formData.toSchoolId || ''}
                    onChange={(e) => setFormData({ ...formData, toSchoolId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" disabled>-- Pilih Sekolah Tujuan --</option>
                    {activeSekolahList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Alasan Pemindahtugasan / Mutasi</label>
                <input
                  type="text"
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Kebutuhan formasi guru / domisili"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Nomor SK Mutasi</label>
                  <input
                    type="text"
                    value={formData.skNumber || ''}
                    onChange={(e) => setFormData({ ...formData, skNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Tanggal Mulai Berlaku</label>
                  <input
                    type="date"
                    value={formData.mutationDate || ''}
                    onChange={(e) => setFormData({ ...formData, mutationDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Proses Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
