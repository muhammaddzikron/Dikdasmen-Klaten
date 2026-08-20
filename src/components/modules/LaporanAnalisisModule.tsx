import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  School,
  Users,
  Award,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportUtils';

export const LaporanAnalisisModule: React.FC = () => {
  const { filteredSekolahList, filteredGuruList, filteredTendikList, filteredSiswaList, filteredSkList, cabangList } =
    useData();

  const [reportType, setReportType] = useState<'mutu' | 'rekap-sekolah' | 'kepegawaian' | 'sk'>('mutu');

  const activeSchools = filteredSekolahList.filter((s) => !s.isDeleted);
  const activeGurus = filteredGuruList.filter((g) => !g.isDeleted);
  const activeTendiks = filteredTendikList.filter((t) => !t.isDeleted);
  const activeSiswas = filteredSiswaList.filter((s) => !s.isDeleted);
  const activeSks = filteredSkList.filter((s) => !s.isDeleted);

  const handlePrintRekap = () => {
    const headers = ['No', 'NPSN', 'Nama Satuan Pendidikan', 'Jenjang', 'Akreditasi', 'Kategori Mutu', 'Total Siswa', 'Jml Guru'];
    const rows = activeSchools.map((s, idx) => {
      const gCount = activeGurus.filter((g) => g.schoolId === s.id).length;
      const sCount = activeSiswas.filter((st) => st.schoolId === s.id).length;
      return [
        String(idx + 1),
        s.npsn,
        s.name,
        s.level,
        s.accreditation,
        s.categoryCapability,
        String(sCount),
        String(gCount),
      ];
    });
    exportToPDF('Laporan Rekapitulasi Mutu Satuan Pendidikan Daerah', headers, rows, `Rekap_Mutu_Dikdasmen_${Date.now()}`);
  };

  const handleExportFullExcel = () => {
    const rows = activeSchools.map((s) => {
      const c = cabangList.find((cb) => cb.id === s.cabangId);
      const gCount = activeGurus.filter((g) => g.schoolId === s.id).length;
      const tCount = activeTendiks.filter((t) => t.schoolId === s.id).length;
      const sCount = activeSiswas.filter((st) => st.schoolId === s.id).length;
      return {
        NPSN: s.npsn,
        'Satuan Pendidikan': s.name,
        'Cabang / PCM': c?.name || '-',
        Jenjang: s.level,
        Status: s.status,
        Akreditasi: s.accreditation,
        'Klasifikasi Mutu': s.categoryCapability,
        'Jumlah Siswa': sCount,
        'Jumlah Guru': gCount,
        'Jumlah Tendik': tCount,
        'Rasio Siswa/Guru': gCount > 0 ? Math.round(sCount / gCount) : 0,
        Alamat: s.address,
      };
    });
    exportToExcel(`Laporan_Analisis_Komprehensif_${Date.now()}`, 'Analisis Mutu', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analisis Mutu & Ekspor Laporan</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pusat pembuatan dokumen laporan resmi, rekapitulasi data akreditasi, rasio PTK, dan dokumen eksekutif
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFullExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Master Excel</span>
          </button>
          <button
            onClick={handlePrintRekap}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Capaian Mutu Unggul</span>
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {Math.round(
              (activeSchools.filter((s) => s.accreditation === 'Unggul' || s.accreditation === 'A').length /
                (activeSchools.length || 1)) *
                100
            )}
            %
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Persentase sekolah dengan status akreditasi &quot;A&quot; atau &quot;Unggul&quot; di wilayah daerah.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-Rata Rasio Guru</span>
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            1 :{' '}
            {Math.round(
              activeSchools.reduce((acc, s) => acc + (s.jumlahKeseluruhanSiswa || 0), 0) / (activeGurus.length || 1)
            )}
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Rata-rata 1 orang guru mengampu peserta didik se-Kabupaten/Kota (Kategori Ideal).
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat Kepatuhan SK</span>
            <CheckCircle className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {Math.round(
              (activeSks.filter((sk) => sk.status === 'Terbit').length / (activeSks.length || 1)) * 100
            )}
            %
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Persentase dokumen SK pendidik dan tendik yang telah diterbitkan dan tersertifikasi.
          </p>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Matriks Rekapitulasi Data Satuan Pendidikan Daerah
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">Satuan Pendidikan</th>
                <th className="p-3">Jenjang</th>
                <th className="p-3">Akreditasi</th>
                <th className="p-3">Klasifikasi Mutu</th>
                <th className="p-3 text-center">Siswa</th>
                <th className="p-3 text-center">Guru</th>
                <th className="p-3 text-center">Tendik</th>
                <th className="p-3 text-center">Rasio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeSchools.map((s, idx) => {
                const gCount = activeGurus.filter((g) => g.schoolId === s.id).length;
                const tCount = activeTendiks.filter((t) => t.schoolId === s.id).length;
                const sCount = s.jumlahKeseluruhanSiswa || 0;
                const ratio = gCount > 0 ? Math.round(sCount / gCount) : 0;

                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{s.name}</td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{s.level}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {s.accreditation}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{s.categoryCapability}</td>
                    <td className="p-3 text-center font-bold">{sCount}</td>
                    <td className="p-3 text-center text-slate-700 dark:text-slate-300">{gCount}</td>
                    <td className="p-3 text-center text-slate-700 dark:text-slate-300">{tCount}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      1:{ratio}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
