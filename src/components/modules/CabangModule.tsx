import React, { useState } from 'react';
import { Building, Plus, Search, Edit2, Trash2, X, School, User, Phone } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Cabang } from '../../types';
import { exportToCSV, exportToExcel } from '../../lib/exportUtils';

export const CabangModule: React.FC = () => {
  const { cabangList, sekolahList, addCabang, updateCabang, deleteCabang } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Cabang | null>(null);

  const [formData, setFormData] = useState<Partial<Cabang>>({
    name: '',
    code: '',
    ketua: '',
    address: '',
    phone: '',
  });

  const activeCabangs = cabangList.filter((c) => !c.isDeleted);
  const filtered = activeCabangs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.ketua && c.ketua.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({ name: '', code: `PCM-${activeCabangs.length + 1}`, ketua: '', address: '', phone: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Cabang) => {
    setSelectedItem(c);
    setFormData({ ...c });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    if (selectedItem) {
      await updateCabang(selectedItem.id, formData);
    } else {
      await addCabang(formData as Omit<Cabang, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Pindahkan Cabang "${name}" ke Recycle Bin?`)) {
      await deleteCabang(id);
    }
  };

  const handleExportCSV = () => {
    const rows = filtered.map((c) => ({
      Kode_Cabang: c.code,
      Nama_Cabang: c.name,
      Ketua_PCM: c.ketua || '',
      Telepon: c.phone || '',
      Alamat: c.address || '',
    }));
    exportToCSV(`Data_Cabang_PCM_${Date.now()}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Master Data Cabang (PCM)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
              {filtered.length} Cabang
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar Pimpinan Cabang Muhammadiyah / Majelis Dikdasmen Cabang di tingkat kecamatan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Ekspor CSV
          </button>
          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Cabang</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Grid Cards */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Cari cabang / ketua / kode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      {/* Cabang Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cabang) => {
          const underSchools = sekolahList.filter((s) => s.cabangId === cabang.id && !s.isDeleted);

          return (
            <div
              key={cabang.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{cabang.name}</h3>
                    <span className="font-mono text-[11px] font-semibold text-slate-400">{cabang.code}</span>
                  </div>
                </div>
                {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cabang)}
                      className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cabang.id, cabang.name)}
                      className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ketua: <strong className="text-slate-800 dark:text-slate-200">{cabang.ketua || '-'}</strong></span>
                </div>
                {cabang.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cabang.phone}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Satuan Pendidikan:</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{underSchools.length} Sekolah</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedItem ? 'Edit Cabang (PCM)' : 'Tambah Cabang Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Cabang / PCM *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="PCM Gondomanan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Kode Cabang *</label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="PCM-01"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Ketua PCM / Majelis</label>
                <input
                  type="text"
                  value={formData.ketua || ''}
                  onChange={(e) => setFormData({ ...formData, ketua: e.target.value })}
                  placeholder="Nama Ketua"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Nomor Telepon / Kontak</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Alamat Kantor Cabang</label>
                <textarea
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat kantor PCM..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
