import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  FileCheck,
  Tag,
  Hash,
  Clock,
  Sparkles,
  Sliders,
  X,
  Search,
  Filter,
  Copy,
  Check,
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { MasterJenisSk, MasterSubJenisSk, SkMainType, RecipientType } from '../../../types';
import { DEFAULT_MASTER_JENIS_SK, DEFAULT_MASTER_SUB_JENIS_SK } from '../../../lib/masterSkDefaults';

export const MasterSkManager: React.FC = () => {
  const {
    masterJenisSkList,
    masterSubJenisSkList,
    addMasterJenisSk,
    updateMasterJenisSk,
    deleteMasterJenisSk,
    addMasterSubJenisSk,
    updateMasterSubJenisSk,
    deleteMasterSubJenisSk,
    resetMasterSkToDefault,
    showToast,
  } = useData();

  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';

  const [activeTab, setActiveTab] = useState<'jenis' | 'subJenis'>('jenis');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedParentFilter, setSelectedParentFilter] = useState<string>('ALL');

  // Modals
  const [isJenisModalOpen, setIsJenisModalOpen] = useState<boolean>(false);
  const [editingJenis, setEditingJenis] = useState<MasterJenisSk | null>(null);

  const [isSubJenisModalOpen, setIsSubJenisModalOpen] = useState<boolean>(false);
  const [editingSubJenis, setEditingSubJenis] = useState<MasterSubJenisSk | null>(null);

  // Variable copy feedback
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Form states for Jenis SK
  const [jenisForm, setJenisForm] = useState<Partial<MasterJenisSk>>({
    name: 'SK Guru (Pendidik)',
    code: 'GURU',
    recipientType: 'INDIVIDU',
    description: '',
    numberFormat: '[NO]/KEP/GURU/[TAHUN]',
    isActive: true,
    signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
    signerRole: 'Ketua Majelis Dikdasmen & PNF Daerah',
    menimbang: [],
    mengingat: [],
    memutuskan: [],
    diktum: [],
  });

  // Form states for Sub-Jenis SK
  const [subJenisForm, setSubJenisForm] = useState<Partial<MasterSubJenisSk>>({
    skTypeCode: 'GURU',
    skTypeName: 'SK Guru (Pendidik)',
    name: '',
    code: '',
    titleTemplate: '',
    description: '',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    isActive: true,
    sortOrder: 1,
  });

  const handleCopyVar = (varName: string) => {
    navigator.clipboard.writeText(`{{${varName}}}`);
    setCopiedVar(varName);
    showToast(`Variabel {{${varName}}} disalin ke clipboard!`, 'info');
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const openJenisModal = (jenis?: MasterJenisSk) => {
    if (jenis) {
      setEditingJenis(jenis);
      setJenisForm(jenis);
    } else {
      setEditingJenis(null);
      setJenisForm({
        name: 'SK Guru (Pendidik)',
        code: 'GURU',
        recipientType: 'INDIVIDU',
        description: '',
        numberFormat: '[NO]/KEP/GURU/[TAHUN]',
        isActive: true,
        signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
        signerRole: 'Ketua Majelis Dikdasmen & PNF Daerah',
        menimbang: [],
        mengingat: [],
        memutuskan: [],
        diktum: [],
      });
    }
    setIsJenisModalOpen(true);
  };

  const openSubJenisModal = (subJenis?: MasterSubJenisSk) => {
    if (subJenis) {
      setEditingSubJenis(subJenis);
      setSubJenisForm(subJenis);
    } else {
      setEditingSubJenis(null);
      const parent = masterJenisSkList[0] || DEFAULT_MASTER_JENIS_SK[0];
      setSubJenisForm({
        skTypeCode: parent.code,
        skTypeName: parent.name,
        name: '',
        code: '',
        titleTemplate: '',
        description: '',
        recipientType: parent.recipientType,
        validityPeriodMonths: 24,
        validityPeriodText: '2 Tahun',
        isActive: true,
        sortOrder: (masterSubJenisSkList.length + 1),
      });
    }
    setIsSubJenisModalOpen(true);
  };

  const handleSaveJenis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisForm.name || !jenisForm.code) {
      showToast('Nama dan Kode Jenis SK wajib diisi!', 'warning');
      return;
    }

    try {
      if (editingJenis) {
        await updateMasterJenisSk(editingJenis.id, jenisForm);
      } else {
        await addMasterJenisSk(jenisForm as Omit<MasterJenisSk, 'id'>);
      }
      setIsJenisModalOpen(false);
    } catch (err) {
      showToast('Gagal menyimpan Master Jenis SK.', 'error');
    }
  };

  const handleSaveSubJenis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subJenisForm.name || !subJenisForm.code) {
      showToast('Nama dan Kode Sub-Jenis SK wajib diisi!', 'warning');
      return;
    }

    try {
      if (editingSubJenis) {
        await updateMasterSubJenisSk(editingSubJenis.id, subJenisForm);
      } else {
        await addMasterSubJenisSk(subJenisForm as Omit<MasterSubJenisSk, 'id'>);
      }
      setIsSubJenisModalOpen(false);
    } catch (err) {
      showToast('Gagal menyimpan Sub-Jenis SK.', 'error');
    }
  };

  // Filtered lists
  const filteredJenisList = useMemo(() => {
    let list = masterJenisSkList.length > 0 ? masterJenisSkList : DEFAULT_MASTER_JENIS_SK;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.name.toLowerCase().includes(q) ||
          j.code.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [masterJenisSkList, searchQuery]);

  const filteredSubJenisList = useMemo(() => {
    let list = masterSubJenisSkList.length > 0 ? masterSubJenisSkList : DEFAULT_MASTER_SUB_JENIS_SK;
    if (selectedParentFilter !== 'ALL') {
      list = list.filter((s) => s.skTypeCode === selectedParentFilter || s.skTypeName === selectedParentFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.skTypeName.toLowerCase().includes(q) ||
          s.titleTemplate?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [masterSubJenisSkList, selectedParentFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Master Konfigurasi Jenis & Sub-Jenis SK
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Konfigurasi dinamis judul, template naskah, dasar hukum, persyaratan dokumen, dan format nomor SK.
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => resetMasterSkToDefault()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
              title="Reset ke Standar Dikdasmen"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Standar Dikdasmen</span>
            </button>
            <button
              onClick={() => (activeTab === 'jenis' ? openJenisModal() : openSubJenisModal())}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'jenis' ? 'Tambah Jenis SK' : 'Tambah Sub-Jenis SK'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('jenis')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'jenis'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            1. Master Jenis SK Utama ({filteredJenisList.length})
          </button>
          <button
            onClick={() => setActiveTab('subJenis')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'subJenis'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            2. Master Sub-Jenis SK ({filteredSubJenisList.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'subJenis' && (
            <select
              value={selectedParentFilter}
              onChange={(e) => setSelectedParentFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Semua Jenis SK Induk</option>
              <option value="GURU">SK Guru (Pendidik)</option>
              <option value="TENDIK">SK Tenaga Kependidikan</option>
              <option value="KS">SK Kepala Sekolah</option>
              <option value="OPS">SK Pendirian / Operasional</option>
            </select>
          )}

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jenis / sub-jenis SK..."
              className="text-xs pl-8 pr-7 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Bersihkan pencarian"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: MASTER JENIS SK */}
      {activeTab === 'jenis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJenisList.map((jenis, idx) => {
            const subCount = masterSubJenisSkList.filter((s) => s.skTypeCode === jenis.code || s.skTypeName === jenis.name).length;
            const reqCount = jenis.defaultRequirements?.length || 0;

            return (
              <div
                key={jenis.id || idx}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-xs space-y-4 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                      {jenis.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {jenis.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          jenis.recipientType === 'INDIVIDU'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {jenis.recipientType}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {subCount} Sub-Jenis Tersedia
                        </span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openJenisModal(jenis)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit Format & Template"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {jenis.description || 'Konfigurasi template, nomor SK, dan berkas persyaratan resmi.'}
                </p>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Format Nomor:</span>
                    <strong className="text-slate-900 dark:text-white">{jenis.numberFormat}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Penandatangan:</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{jenis.signerName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{reqCount} Dokumen Persyaratan</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedParentFilter(jenis.code);
                      setActiveTab('subJenis');
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Lihat Sub-Jenis</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT 2: MASTER SUB-JENIS SK */}
      {activeTab === 'subJenis' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">Nama Sub-Jenis SK</th>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Jenis Induk</th>
                  <th className="px-4 py-3">Tipe Penerima</th>
                  <th className="px-4 py-3">Masa Berlaku</th>
                  <th className="px-4 py-3">Template Judul Dokumen</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredSubJenisList.map((sub, idx) => (
                  <tr key={sub.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {sub.name}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {sub.code}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                      {sub.skTypeName}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.recipientType === 'INDIVIDU'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {sub.recipientType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {sub.validityPeriodText || (sub.validityPeriodMonths ? `${sub.validityPeriodMonths / 12} Tahun` : 'Permanen')}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {sub.titleTemplate || sub.name.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Aktif
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openSubJenisModal(sub)}
                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Edit Sub-Jenis"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH MASTER JENIS SK */}
      {isJenisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingJenis ? `Edit Master Jenis SK: ${editingJenis.name}` : 'Tambah Master Jenis SK Baru'}
              </h3>
              <button onClick={() => setIsJenisModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJenis} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Jenis SK <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={jenisForm.name || ''}
                    onChange={(e) => setJenisForm({ ...jenisForm, name: e.target.value as SkMainType })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    placeholder="Contoh: SK Guru (Pendidik)"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kode Unik <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={jenisForm.code || ''}
                    onChange={(e) => setJenisForm({ ...jenisForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                    placeholder="Contoh: GURU, TENDIK, KS, OPS"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipe Penerima <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={jenisForm.recipientType || 'INDIVIDU'}
                    onChange={(e) => setJenisForm({ ...jenisForm, recipientType: e.target.value as RecipientType })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="INDIVIDU">INDIVIDU (Guru / Tendik / Kepala Sekolah)</option>
                    <option value="SATUAN PENDIDIKAN">SATUAN PENDIDIKAN (Sekolah / Madrasah)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Format Nomor SK
                  </label>
                  <input
                    type="text"
                    value={jenisForm.numberFormat || ''}
                    onChange={(e) => setJenisForm({ ...jenisForm, numberFormat: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                    placeholder="[NO]/KEP/GURU/[TAHUN]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama & Jabatan Penandatangan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={jenisForm.signerName || ''}
                      onChange={(e) => setJenisForm({ ...jenisForm, signerName: e.target.value })}
                      placeholder="Nama Penandatangan (Dr. H. Muhammad Arifin, M.Pd.)"
                      className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                    <input
                      type="text"
                      value={jenisForm.signerRole || ''}
                      onChange={(e) => setJenisForm({ ...jenisForm, signerRole: e.target.value })}
                      placeholder="Jabatan (Ketua Majelis Dikdasmen & PNF Daerah)"
                      className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Template Variables Helper */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  Tag Variabel Otomatis (Klik untuk Salin):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['nomor_sk', 'nama_guru', 'nbm', 'nip', 'nama_sekolah', 'npsn', 'jabatan', 'tanggal_mulai', 'tanggal_akhir', 'tahun'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleCopyVar(v)}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded text-[11px] font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1"
                    >
                      {copiedVar === v ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{`{{${v}}}`}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsJenisModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH SUB-JENIS SK */}
      {isSubJenisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSubJenis ? `Edit Sub-Jenis SK: ${editingSubJenis.name}` : 'Tambah Sub-Jenis SK Baru'}
              </h3>
              <button onClick={() => setIsSubJenisModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubJenis} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Induk Jenis SK <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subJenisForm.skTypeCode}
                    onChange={(e) => {
                      const sel = masterJenisSkList.find((j) => j.code === e.target.value) || DEFAULT_MASTER_JENIS_SK.find((j) => j.code === e.target.value);
                      if (sel) {
                        setSubJenisForm({
                          ...subJenisForm,
                          skTypeCode: sel.code,
                          skTypeName: sel.name,
                          recipientType: sel.recipientType,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="GURU">SK Guru (Pendidik)</option>
                    <option value="TENDIK">SK Tenaga Kependidikan</option>
                    <option value="KS">SK Kepala Sekolah</option>
                    <option value="OPS">SK Pendirian / Operasional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kode Sub-Jenis <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subJenisForm.code || ''}
                    onChange={(e) => setSubJenisForm({ ...subJenisForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                    placeholder="Contoh: PGTY, TUGAS, DEFINITIF"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Sub-Jenis SK <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subJenisForm.name || ''}
                    onChange={(e) => setSubJenisForm({ ...subJenisForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    placeholder="Contoh: Pengangkatan Guru Tetap Yayasan (GTY)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Template Judul Dokumen Resmi
                  </label>
                  <input
                    type="text"
                    value={subJenisForm.titleTemplate || ''}
                    onChange={(e) => setSubJenisForm({ ...subJenisForm, titleTemplate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg uppercase font-semibold"
                    placeholder="PENGANGKATAN GURU TETAP YAYASAN"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Masa Berlaku (Bulan)
                  </label>
                  <input
                    type="number"
                    value={subJenisForm.validityPeriodMonths ?? 24}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setSubJenisForm({
                        ...subJenisForm,
                        validityPeriodMonths: val,
                        validityPeriodText: val === 0 ? 'Permanen' : `${val / 12} Tahun`,
                      });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Label Masa Berlaku
                  </label>
                  <input
                    type="text"
                    value={subJenisForm.validityPeriodText || '2 Tahun'}
                    onChange={(e) => setSubJenisForm({ ...subJenisForm, validityPeriodText: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    placeholder="2 Tahun / 4 Tahun / Tetap"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubJenisModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Simpan Sub-Jenis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
