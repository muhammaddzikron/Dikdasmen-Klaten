import React, { useState } from 'react';
import {
  School,
  Users,
  GraduationCap,
  FileCheck2,
  AlertTriangle,
  HeartPulse,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useData } from '../../context/DataContext';

interface RegionalDashboardProps {
  setActiveTab?: (tab: string) => void;
}

export const RegionalDashboard: React.FC<RegionalDashboardProps> = ({ setActiveTab }) => {
  const {
    filteredSekolahList,
    filteredGuruList,
    filteredTendikList,
    filteredSiswaList,
    filteredSkList,
    filteredKepalaSekolahList,
    setSelectedSekolahId,
    notifikasiList,
  } = useData();

  const [filterJenjang, setFilterJenjang] = useState('ALL');

  const activeSchools = filteredSekolahList.filter((s) => !s.isDeleted);
  const activeGurus = filteredGuruList.filter((g) => !g.isDeleted);
  const activeTendiks = filteredTendikList.filter((t) => !t.isDeleted);
  const activeSiswas = filteredSiswaList.filter((s) => !s.isDeleted);
  const activeKs = filteredKepalaSekolahList.filter((k) => !k.isDeleted);

  // Filtered by selected jenjang if any
  const displayedSchools = filterJenjang === 'ALL'
    ? activeSchools
    : activeSchools.filter((s) => s.level.toUpperCase() === filterJenjang.toUpperCase());

  // Calculate effective student count per school from actual registered data
  const getSchoolStudentCount = (s: typeof activeSchools[0]) => {
    return activeSiswas.filter((st) => st.schoolId === s.id && st.status === 'Aktif').length;
  };

  // Category Capability Counts
  const ugdSchools = displayedSchools.filter((s) => s.categoryCapability === 'UGD');
  const rawatInapSchools = displayedSchools.filter((s) => s.categoryCapability === 'RAWAT INAP');
  const rawatJalanSchools = displayedSchools.filter((s) => s.categoryCapability === 'RAWAT JALAN');
  const sehatSchools = displayedSchools.filter((s) => s.categoryCapability === 'SEHAT' || !s.categoryCapability);

  // SK Status Count
  const skTerbitCount = filteredSkList.filter((sk) => sk.status === 'Terbit' && !sk.isDeleted).length;
  const skPendingCount = filteredSkList.filter((sk) => sk.status === 'Belum Terbit' && !sk.isDeleted).length;
  const totalSiswasCount = activeSiswas.filter((s) => s.status === 'Aktif').length;

  // Donut data for Mutu
  const mutuDonutData = [
    { name: 'UGD', value: ugdSchools.length, color: '#ef4444' },
    { name: 'RAWAT INAP', value: rawatInapSchools.length, color: '#10b981' },
    { name: 'RAWAT JALAN', value: rawatJalanSchools.length, color: '#3b82f6' },
    { name: 'SEHAT', value: sehatSchools.length, color: '#a855f7' },
  ];

  // Chart: Akreditasi Data
  const accreditationCounts = activeSchools.reduce((acc, curr) => {
    const accType = curr.accreditation || 'Belum Terakreditasi';
    acc[accType] = (acc[accType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const accreditationChartData = Object.entries(accreditationCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const ACC_COLORS: Record<string, string> = {
    Unggul: '#10b981',
    A: '#06b6d4',
    'Baik Sekali': '#3b82f6',
    B: '#f59e0b',
    C: '#f97316',
    'Belum Terakreditasi': '#94a3b8',
  };

  // Chart: Jenjang Level Data
  const levelCounts = activeSchools.reduce((acc, curr) => {
    acc[curr.level] = (acc[curr.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const levelChartData = Object.entries(levelCounts).map(([level, count]) => ({
    level,
    jumlah: count,
  }));

  // Upcoming SK Expirations (< 90 days)
  const today = new Date();
  const expiringSks = filteredSkList
    .filter((sk) => {
      if (!sk.skEndDate || sk.isDeleted) return false;
      const end = new Date(sk.skEndDate);
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 90;
    })
    .map((sk) => {
      const end = new Date(sk.skEndDate);
      const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const school = activeSchools.find((s) => s.id === sk.schoolId);
      return {
        ...sk,
        remainingDays: diffDays,
        schoolName: school?.name || 'Sekolah Terkait',
      };
    })
    .sort((a, b) => a.remainingDays - b.remainingDays);

  const recentQueueSks = filteredSkList.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4 High-Density Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sekolah */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Total Sekolah & Madrasah
          </p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {activeSchools.length.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/60">
              {activeSchools.filter((s) => s.categoryCapability === 'SEHAT').length} Sehat
            </span>
          </div>
          <div className="mt-3 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{
                width: `${activeSchools.length > 0 ? Math.min(100, Math.round((activeSchools.length / Math.max(activeSchools.length, 10)) * 100)) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Card 2: Guru & Tendik */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Total PTK (Guru & Tendik)
          </p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {(activeGurus.length + activeTendiks.length).toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400 px-1.5 py-0.5 rounded border border-sky-100 dark:border-sky-800/60">
              {activeGurus.length} Guru • {activeTendiks.length} Tendik
            </span>
          </div>
          <div className="mt-3 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="w-full h-full bg-sky-500 rounded-full" />
          </div>
        </div>

        {/* Card 3: Peserta Didik */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Total Peserta Didik
          </p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {totalSiswasCount.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/50 dark:text-orange-400 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-800/60">
              {activeSiswas.length > 0 ? `${activeSiswas.length} Siswa Terinput` : `Rasio 1:${activeGurus.length > 0 ? Math.round(totalSiswasCount / activeGurus.length) : 0}`}
            </span>
          </div>
          <div className="mt-3 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="w-full h-full bg-orange-500 rounded-full" />
          </div>
        </div>

        {/* Card 4: Pengajuan SK */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Berkas SK Digital
          </p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {filteredSkList.length.toLocaleString('id-ID')}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              skPendingCount > 0
                ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
            }`}>
              {skPendingCount > 0 ? `${skPendingCount} Pending` : `${skTerbitCount} Terbit`}
            </span>
          </div>
          <div className="mt-3 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{
                width: `${filteredSkList.length > 0 ? Math.round((skTerbitCount / filteredSkList.length) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Analisis Kategori Mutu (2 cols) & Alert & Notifikasi (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Analisis Kategori Mutu */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Analisis Kategori Mutu Sekolah</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Klasifikasi daya tampung peserta didik se-Daerah</p>
            </div>
            <select
              value={filterJenjang}
              onChange={(e) => setFilterJenjang(e.target.value)}
              className="text-[11px] border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-md px-2 py-1 font-medium text-slate-700 dark:text-slate-200 outline-hidden"
            >
              <option value="ALL">Semua Jenjang</option>
              <option value="SD">SD / MI</option>
              <option value="SMP">SMP / MTs</option>
              <option value="SMA">SMA / MA</option>
              <option value="SMK">SMK</option>
            </select>
          </div>

          <div className="p-6 flex-1 flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Donut Chart */}
            <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mutuDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {mutuDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                  {displayedSchools.length.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEKOLAH</p>
              </div>
            </div>

            {/* Legend & Summary List */}
            <div className="space-y-3 flex-1 max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded bg-red-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">UGD</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {ugdSchools.length} Sekolah ({displayedSchools.length > 0 ? Math.round((ugdSchools.length / displayedSchools.length) * 100) : 0}%) • &lt; 100 Siswa
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded bg-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">RAWAT INAP</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {rawatInapSchools.length} Sekolah ({displayedSchools.length > 0 ? Math.round((rawatInapSchools.length / displayedSchools.length) * 100) : 0}%) • 100-400 Siswa
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded bg-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">RAWAT JALAN</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {rawatJalanSchools.length} Sekolah ({displayedSchools.length > 0 ? Math.round((rawatJalanSchools.length / displayedSchools.length) * 100) : 0}%) • 400-600 Siswa
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded bg-purple-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">SEHAT</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {sehatSchools.length} Sekolah ({displayedSchools.length > 0 ? Math.round((sehatSchools.length / displayedSchools.length) * 100) : 0}%) • &gt; 600 Siswa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Alert & Notifikasi */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Alert & Notifikasi</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Sync</span>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[300px] custom-scrollbar">
            {/* Alert 1: Expiring SK */}
            <div className={`p-3 rounded-lg border ${
              expiringSks.length > 0
                ? 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/60'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${expiringSks.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`} />
                <p className={`text-xs font-bold ${expiringSks.length > 0 ? 'text-red-800 dark:text-red-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  Masa Berlaku SK PTK
                </p>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                {expiringSks.length > 0
                  ? `${expiringSks.length} Kepala Sekolah & Guru memasuki masa akhir jabatan < 90 hari.`
                  : 'Tidak ada berkas SK yang mendekati masa kedaluwarsa (< 90 hari).'}
              </p>
            </div>

            {/* Alert 2: Verifikasi Tertunda */}
            <div className={`p-3 rounded-lg border ${
              skPendingCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className={`w-4 h-4 flex-shrink-0 ${skPendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                <p className={`text-xs font-bold ${skPendingCount > 0 ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
                  Verifikasi Berkas SK
                </p>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                {skPendingCount > 0
                  ? `${skPendingCount} Berkas pengajuan SK baru menunggu persetujuan Admin Majelis.`
                  : 'Semua berkas pengajuan SK telah diproses (0 pending).'}
              </p>
            </div>

            {/* Alert 3: Info Sistem */}
            <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                <p className="text-xs font-bold text-sky-800 dark:text-sky-300">Status Sinkronisasi Sistem</p>
              </div>
              <p className="text-[11px] text-sky-700 dark:text-sky-400 leading-tight">
                {activeSchools.length} Satuan Pendidikan terdata aktif di SIM Dikdasmen Klaten.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table: Antrian Pengajuan SK Terbaru */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Antrian Pengajuan SK Terbaru</h3>
            <p className="text-[11px] text-slate-400">Daftar usulan Surat Keputusan PTK dalam proses</p>
          </div>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('sk')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <th className="px-4 py-3">No. Pengajuan</th>
                <th className="px-4 py-3">Personel</th>
                <th className="px-4 py-3">Sekolah Asal</th>
                <th className="px-4 py-3">Tipe SK</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800">
              {recentQueueSks.length > 0 ? (
                recentQueueSks.map((sk, i) => {
                  const sch = activeSchools.find((s) => s.id === sk.schoolId);
                  return (
                    <tr key={sk.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-medium text-slate-600 dark:text-slate-400">
                        {sk.skNumber || `SK/G/2025/04${i + 1}`}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-white">
                        {sk.targetName || sk.title || 'Ahmad Subari, S.Pd.'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        {sch?.name || 'Satuan Pendidikan'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        {sk.submissionType === 'Baru' ? `${sk.targetType || 'GTY'} Baru` : 'Perpanjangan'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            sk.status === 'Terbit'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : sk.status === 'Ditolak'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {sk.status === 'Terbit' ? 'Disetujui' : sk.status === 'Ditolak' ? 'Ditolak' : 'Verifikasi'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {setActiveTab && (
                          <button
                            onClick={() => setActiveTab('sk')}
                            className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                    <FileCheck2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">Belum ada antrian pengajuan SK saat ini</p>
                    <p className="text-[10px] text-slate-400">Pengajuan SK baru dari sekolah akan tampil di sini</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secondary Charts: Akreditasi & Jenjang */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1">
            Distribusi Akreditasi Sekolah
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Capaian akreditasi BAN-S/M sekolah & madrasah</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accreditationChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={42}
                  paddingAngle={3}
                >
                  {accreditationChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ACC_COLORS[entry.name] || '#10b981'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1">
            Sebaran Jenjang Satuan Pendidikan
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Jumlah sekolah berdasarkan tingkatan</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="level" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="jumlah" name="Jumlah Sekolah" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
