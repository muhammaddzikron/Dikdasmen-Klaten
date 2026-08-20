import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  School,
  Users,
  Briefcase,
  UserCheck,
  GraduationCap,
  FileCheck2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const RecycleBinModule: React.FC = () => {
  const {
    sekolahList,
    guruList,
    tendikList,
    kepalaSekolahList,
    siswaList,
    allSkList,
    restoreData,
    permanentDelete,
  } = useData();

  const [activeTab, setActiveTab] = useState<'sekolah' | 'guru' | 'tendik' | 'ks' | 'siswa' | 'sk'>('sekolah');

  const deletedSchools = sekolahList.filter((s) => s.isDeleted);
  const deletedGurus = guruList.filter((g) => g.isDeleted);
  const deletedTendiks = tendikList.filter((t) => t.isDeleted);
  const deletedKs = kepalaSekolahList.filter((k) => k.isDeleted);
  const deletedSiswas = siswaList.filter((s) => s.isDeleted);
  const deletedSks = allSkList.filter((sk) => sk.isDeleted);

  const handleRestore = async (col: string, id: string) => {
    await restoreData(col, id);
  };

  const handlePermanent = async (col: string, id: string, name: string) => {
    if (confirm(`Hapus permanen "${name}" dari database Firestore? Tindakan ini tidak dapat dibatalkan!`)) {
      await permanentDelete(col, id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-rose-500" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Recycle Bin & Pemulihan Data</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Penyimpanan data yang telah dihapus secara soft-delete. Anda dapat memulihkan (restore) data kembali ke modul aktif atau menghapusnya secara permanen dari Cloud Firestore.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('sekolah')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sekolah'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Sekolah ({deletedSchools.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('guru')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'guru'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Guru ({deletedGurus.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('tendik')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tendik'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Tendik ({deletedTendiks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ks')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ks'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Kepala Sekolah ({deletedKs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('siswa')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'siswa'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Siswa ({deletedSiswas.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sk')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sk'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>SK ({deletedSks.length})</span>
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Nama / Identitas Item</th>
                <th className="p-3.5">Keterangan / Status</th>
                <th className="p-3.5 text-right">Opsi Pemulihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeTab === 'sekolah' &&
                (deletedSchools.length === 0 ? (
                  <tr><td colSpan={3} className="p-6 text-center text-slate-400">Tidak ada data sekolah terhapus.</td></tr>
                ) : (
                  deletedSchools.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold">{item.name} (NPSN: {item.npsn})</td>
                      <td className="p-3.5 text-slate-500">Jenjang {item.level} • {item.address}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore('sekolah', item.id)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold rounded-lg flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Pulihkan (Restore)</span>
                          </button>
                          <button
                            onClick={() => handlePermanent('sekolah', item.id, item.name)}
                            className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Hapus Permanen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}

              {activeTab === 'guru' &&
                (deletedGurus.length === 0 ? (
                  <tr><td colSpan={3} className="p-6 text-center text-slate-400">Tidak ada data guru terhapus.</td></tr>
                ) : (
                  deletedGurus.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold">{item.name}</td>
                      <td className="p-3.5 text-slate-500">NBM: {item.nbm || '-'} • Mapel: {item.subject}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore('guru', item.id)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Pulihkan</span>
                          </button>
                          <button
                            onClick={() => handlePermanent('guru', item.id, item.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}

              {activeTab === 'tendik' &&
                (deletedTendiks.length === 0 ? (
                  <tr><td colSpan={3} className="p-6 text-center text-slate-400">Tidak ada data tendik terhapus.</td></tr>
                ) : (
                  deletedTendiks.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold">{item.name}</td>
                      <td className="p-3.5 text-slate-500">Jabatan: {item.position}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore('tendik', item.id)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Pulihkan</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}

              {activeTab === 'siswa' &&
                (deletedSiswas.length === 0 ? (
                  <tr><td colSpan={3} className="p-6 text-center text-slate-400">Tidak ada data siswa terhapus.</td></tr>
                ) : (
                  deletedSiswas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold">{item.name} (NISN: {item.nisn})</td>
                      <td className="p-3.5 text-slate-500">Kelas: {item.classGrade}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleRestore('siswa', item.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Pulihkan</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ))}

              {activeTab === 'sk' &&
                (deletedSks.length === 0 ? (
                  <tr><td colSpan={3} className="p-6 text-center text-slate-400">Tidak ada berkas SK terhapus.</td></tr>
                ) : (
                  deletedSks.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold">{item.title} ({item.skNumber})</td>
                      <td className="p-3.5 text-slate-500">Penerima: {item.targetName} • {item.type}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleRestore('sk', item.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Pulihkan</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
