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
  Upload,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { SuratKeputusan, SkType, SkStatus } from '../../types';
import { printOfficialSK } from '../../lib/storageService';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportUtils';

export const SkModule: React.FC = () => {
  const { filteredSkList, sekolahList, activeSekolahList, guruList, tendikList, kepalaSekolahList, addSk, updateSk, deleteSk } =
    useData();
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

  // Upload simulation state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [formData, setFormData] = useState<Partial<SuratKeputusan>>({
    skNumber: '',
    title: '',
    schoolId: '',
    type: 'SK Guru',
    submissionType: 'Baru',
    status: 'Belum Terbit',
    targetName: '',
    skStartDate: new Date().toISOString().split('T')[0],
    skEndDate: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
    signerRole: 'Ketua Majelis Dikdasmen Daerah',
    documentUrl: '',
    fileNbmUrl: '',
    fileIjazahUrl: '',
  });

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
    const defaultSchoolId = currentUser?.sekolahId || activeSekolahList[0]?.id || '';
    setFormData({
      skNumber: `DIKDASMEN/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'Pengangkatan Guru Tetap Yayasan',
      schoolId: defaultSchoolId,
      type: 'SK Guru',
      submissionType: 'Baru',
      status: currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' ? 'Terbit' : 'Belum Terbit',
      targetName: guruList[0]?.name || '',
      skStartDate: new Date().toISOString().split('T')[0],
      skEndDate: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
      signerRole: 'Ketua Majelis Dikdasmen Daerah',
      documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setFormData((f) => ({
            ...f,
            documentUrl: `https://storage.googleapis.com/sim-dikdasmen/${file.name}`,
          }));
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.schoolId) return;

    if (selectedItem) {
      await updateSk(selectedItem.id, formData);
    } else {
      await addSk(formData as Omit<SuratKeputusan, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleApprove = async (sk: SuratKeputusan) => {
    const officialSkNumber = sk.skNumber.startsWith('DIKDASMEN')
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
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan SK Baru</span>
          </button>
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
                          {sk.skNumber}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{school?.name || '-'}</td>
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{sk.targetName || '-'}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{sk.type}</span>
                        <span className="text-slate-400 ml-1">({sk.submissionType})</span>
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

                <div>
                  <label className="font-semibold block mb-1">Jenis SK</label>
                  <select
                    value={formData.type || 'SK Guru'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SkType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold"
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

                <div>
                  <label className="font-semibold block mb-1">Nama Penerima SK (Guru / Tendik / KS)</label>
                  <input
                    type="text"
                    value={formData.targetName || ''}
                    onChange={(e) => setFormData({ ...formData, targetName: e.target.value })}
                    placeholder="Nama Lengkap Penerima"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Draft Nomor SK</label>
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

              {/* Upload Document / PDF */}
              <div className="pt-2">
                <label className="font-semibold block mb-1">Lampiran Berkas PDF / Dokumen Pendukung (NBM, Ijazah)</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-slate-600 dark:text-slate-400 text-xs">Pilih file PDF atau drag & drop ke sini</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="sk-file-input"
                  />
                  <label
                    htmlFor="sk-file-input"
                    className="mt-2 inline-block px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Telusuri Berkas
                  </label>

                  {isUploading && (
                    <div className="mt-3">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-600 h-1.5 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Mengunggah... {uploadProgress}%</span>
                    </div>
                  )}

                  {formData.documentUrl && !isUploading && (
                    <div className="mt-2 text-emerald-600 font-semibold text-[11px] flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Berkas berhasil terlampir</span>
                    </div>
                  )}
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
                <div className="font-mono text-emerald-600 font-bold">{selectedItem.skNumber}</div>
                <div className="text-slate-500 mt-1">Tentang: {selectedItem.title}</div>
              </div>

              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <div><strong>Penerima:</strong> {selectedItem.targetName || '-'}</div>
                <div><strong>Jenis SK:</strong> {selectedItem.type}</div>
                <div><strong>Masa Berlaku:</strong> {selectedItem.skStartDate} s/d {selectedItem.skEndDate}</div>
                <div><strong>Penandatangan:</strong> {selectedItem.signerName} ({selectedItem.signerRole})</div>
                <div><strong>Status:</strong> {selectedItem.status}</div>
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
