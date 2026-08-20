import React, { useState } from 'react';
import {
  School,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  Users,
  GraduationCap,
  Briefcase,
  FileCheck2,
  Plus,
  Building,
  Target,
  FileText,
  UserCheck,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Sekolah } from '../../types';

interface SchoolDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const SchoolDashboard: React.FC<SchoolDashboardProps> = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const {
    sekolahList,
    guruList,
    tendikList,
    kepalaSekolahList,
    siswaList,
    allSkList,
    selectedSekolahId,
    setSelectedSekolahId,
    activeSekolah,
    cabangList,
  } = useData();

  const [activeTabSub, setActiveTabSub] = useState<'ringkasan' | 'visi-misi' | 'ptk' | 'sk'>('ringkasan');

  const currentSchool: Sekolah | null = activeSekolah || sekolahList[0] || null;

  if (!currentSchool) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <School className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Belum ada Satuan Pendidikan terpilih</h3>
        <p className="text-xs text-slate-500 mt-1">Silakan pilih atau tambahkan sekolah terlebih dahulu.</p>
      </div>
    );
  }

  // School data
  const schoolCabang = cabangList.find((c) => c.id === currentSchool.cabangId);
  const schoolGurus = guruList.filter((g) => g.schoolId === currentSchool.id && !g.isDeleted);
  const schoolTendiks = tendikList.filter((t) => t.schoolId === currentSchool.id && !t.isDeleted);
  const schoolSiswas = siswaList.filter((s) => s.schoolId === currentSchool.id && !s.isDeleted);
  const schoolKs = kepalaSekolahList.find((k) => k.schoolId === currentSchool.id && k.status === 'Aktif' && !k.isDeleted);
  const schoolSks = allSkList.filter((sk) => sk.schoolId === currentSchool.id && !sk.isDeleted);

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'UGD':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';
      case 'RAWAT INAP':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'RAWAT JALAN':
        return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300';
      case 'SEHAT':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* School Selector Bar (if Admin / Cabang) */}
      {currentUser?.role !== 'Sekolah' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Satuan Pendidikan:</span>
          </div>
          <select
            id="school-profile-selector"
            value={selectedSekolahId === 'ALL' ? currentSchool.id : selectedSekolahId}
            onChange={(e) => setSelectedSekolahId(e.target.value)}
            aria-label="Pilih Profil Sekolah"
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {sekolahList
              .filter((s) => !s.isDeleted)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (NPSN: {s.npsn})
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Header Banner & School Identity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-44 sm:h-56 w-full relative bg-slate-800 overflow-hidden">
          <img
            src={
              currentSchool.bannerUrl ||
              'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80'
            }
            alt={currentSchool.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-2 text-xs font-medium bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>{schoolCabang?.name || 'Pimpinan Cabang Muhammadiyah'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${getCategoryBadge(currentSchool.categoryCapability)}`}>
                Kategori {currentSchool.categoryCapability}
              </span>
              <span className="bg-emerald-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg">
                Akreditasi {currentSchool.accreditation}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex items-start gap-4">
              <img
                src={
                  currentSchool.logoUrl ||
                  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80'
                }
                alt={currentSchool.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md flex-shrink-0 -mt-12 bg-white ring-4 ring-white dark:ring-slate-900"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {currentSchool.name}
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Jenjang {currentSchool.level}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">NPSN:</span> {currentSchool.npsn}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{currentSchool.address}</span>
                  </div>
                  {currentSchool.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentSchool.phone}</span>
                    </div>
                  )}
                  {currentSchool.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentSchool.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('manajemen-sk')}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Pengajuan SK Sekolah</span>
              </button>
            </div>
          </div>

          {/* Internal Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500">Jumlah Siswa</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {schoolSiswas.length}{' '}
                <span className="text-xs font-normal text-slate-500">Anak</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {schoolSiswas.length > 0 ? `${schoolSiswas.length} Siswa Terdaftar` : 'Belum Ada Data Siswa'}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500">Guru (Pendidik)</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {schoolGurus.length} <span className="text-xs font-normal text-slate-500">Orang</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500">Tenaga Kependidikan</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {schoolTendiks.length} <span className="text-xs font-normal text-slate-500">Staf</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500">SK Terbit Aktif</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {schoolSks.filter((s) => s.status === 'Terbit').length}{' '}
                <span className="text-xs font-normal text-slate-500">SK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTabSub('ringkasan')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTabSub === 'ringkasan'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Ringkasan & Kepala Sekolah
        </button>
        <button
          onClick={() => setActiveTabSub('visi-misi')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTabSub === 'visi-misi'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Visi, Misi & Izin Operasional
        </button>
        <button
          onClick={() => setActiveTabSub('ptk')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTabSub === 'ptk'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Daftar Guru & Tendik ({schoolGurus.length + schoolTendiks.length})
        </button>
        <button
          onClick={() => setActiveTabSub('sk')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTabSub === 'sk'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Arsip Dokumen SK ({schoolSks.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTabSub === 'ringkasan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kepala Sekolah Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Kepala Sekolah Aktif</span>
            </h3>

            {schoolKs ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      schoolKs.photoUrl ||
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={schoolKs.name}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-emerald-500/20"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{schoolKs.name}</h4>
                    <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Periode ke-{schoolKs.periodNumber} ({schoolKs.status})
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">NIP/NIPM:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{schoolKs.nip || schoolKs.nipm || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">NBM:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{schoolKs.nbm || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Masa Jabatan:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {schoolKs.startDate} s/d {schoolKs.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. SK Pengangkatan:</span>
                    <span className="font-medium font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                      {schoolKs.skNumber || 'Tersedia di Arsip'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500">
                Belum ada data Kepala Sekolah aktif yang terhubung.
              </div>
            )}
          </div>

          {/* School Description & Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Profil & Informasi Legalitas Satuan Pendidikan</span>
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentSchool.description ||
                'Satuan pendidikan binaan Majelis Pendidikan Dasar dan Menengah Daerah dengan program kurikulum terpadu nasional dan nilai-nilai Al-Islam Kemuhammadiyahan.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                <span className="text-slate-500 text-[11px] font-semibold">SK Pendirian Sekolah</span>
                <div className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {currentSchool.skPendirianNumber || '-'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                <span className="text-slate-500 text-[11px] font-semibold">SK Izin Operasional</span>
                <div className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {currentSchool.skIzinOperasional || '-'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                <span className="text-slate-500 text-[11px] font-semibold">Situs Web Resmi</span>
                <div className="text-emerald-600 font-medium truncate">
                  {currentSchool.website ? (
                    <a href={currentSchool.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                      <span>{currentSchool.website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                <span className="text-slate-500 text-[11px] font-semibold">Status Gedung / Tanah</span>
                <div className="font-medium text-slate-800 dark:text-slate-200">Wakaf Persyarikatan Muhammadiyah</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTabSub === 'visi-misi' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Visi Satuan Pendidikan</span>
            </h3>
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs font-semibold text-emerald-900 dark:text-emerald-200 leading-relaxed">
              &quot;{currentSchool.vision || 'Mewujudkan generasi berkarakter Islami, berprestasi unggul, dan berwawasan global.'}&quot;
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Misi Satuan Pendidikan</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {currentSchool.mission ||
                '1. Menyelenggarakan pembelajaran aktif, kreatif, dan menyenangkan berbasis Al-Quran.\n2. Menanamkan nilai akhlak mulia dan kedisiplinan kader persyarikatan.\n3. Mengembangkan potensi bakat sains, teknologi, seni, dan olahraga secara terpadu.'}
            </div>
          </div>
        </div>
      )}

      {activeTabSub === 'ptk' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Pendidik dan Tenaga Kependidikan ({currentSchool.name})</span>
            </h3>
            <button
              onClick={() => setActiveTab('data-guru')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Kelola di Modul Guru &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Nama Lengkap</th>
                  <th className="p-3">NBM / NIPM</th>
                  <th className="p-3">Jabatan / Mapel</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Pendidikan</th>
                  <th className="p-3 text-right rounded-r-lg">Kontak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schoolGurus.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{g.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{g.nbm || g.nipm || '-'}</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">{g.subject}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {g.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{g.education}</td>
                    <td className="p-3 text-right text-slate-500">{g.phone || '-'}</td>
                  </tr>
                ))}
                {schoolTendiks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{t.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{t.nbm || t.nipm || '-'}</td>
                    <td className="p-3 text-sky-600 dark:text-sky-400 font-medium">{t.position}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{t.education}</td>
                    <td className="p-3 text-right text-slate-500">{t.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTabSub === 'sk' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Daftar SK Resmi Sekolah</span>
            </h3>
            <button
              onClick={() => setActiveTab('manajemen-sk')}
              className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm"
            >
              + Ajukan SK Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">No. SK</th>
                  <th className="p-3">Judul SK</th>
                  <th className="p-3">Penerima</th>
                  <th className="p-3">Tgl Berakhir</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schoolSks.map((sk) => (
                  <tr key={sk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-medium text-slate-800 dark:text-slate-200">{sk.skNumber}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{sk.title}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{sk.targetName || sk.targetType}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{sk.skEndDate || '-'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sk.status === 'Terbit'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : sk.status === 'Ditolak'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {sk.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
