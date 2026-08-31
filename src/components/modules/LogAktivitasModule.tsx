import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  User,
  Clock,
  Download,
  PlusCircle,
  Edit3,
  Trash2,
  RotateCcw,
  FileSpreadsheet,
  LogIn,
  LogOut,
  Shield,
  FileText,
  Activity,
  Filter,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { exportToCSV } from '../../lib/exportUtils';
import { LogAktivitas } from '../../types';

// Helper to format ISO timestamp into Indonesian readable format
function formatLogTimestamp(ts: string): string {
  if (!ts) return '-';
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return ts;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date) + ' WIB';
  } catch {
    return ts;
  }
}

// Get action metadata: readable label, badge styling, and icon
function getActionMeta(action: string) {
  const act = (action || '').toUpperCase();

  if (act.startsWith('IMPORT_EXCEL')) {
    return {
      label: act === 'IMPORT_EXCEL_SISWA' ? 'Import Siswa' : act === 'IMPORT_EXCEL_GURU' ? 'Import Guru' : 'Import Excel',
      icon: FileSpreadsheet,
      bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
      category: 'IMPORT',
    };
  }

  if (act.startsWith('TAMBAH') || act === 'CREATE') {
    let label = 'Tambah Data';
    if (act.includes('SEKOLAH')) label = 'Tambah Sekolah';
    else if (act.includes('CABANG')) label = 'Tambah Cabang';
    else if (act.includes('GURU')) label = 'Tambah Guru';
    else if (act.includes('TENDIK')) label = 'Tambah Tendik';
    else if (act.includes('KS')) label = 'Tambah Kepala Sekolah';
    else if (act.includes('SISWA')) label = 'Tambah Siswa';

    return {
      label,
      icon: PlusCircle,
      bgClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
      iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300',
      category: 'CREATE',
    };
  }

  if (act.startsWith('UPDATE') || act === 'EDIT') {
    let label = 'Ubah Data';
    if (act.includes('SEKOLAH')) label = 'Ubah Sekolah';
    else if (act.includes('CABANG')) label = 'Ubah Cabang';
    else if (act.includes('GURU')) label = 'Ubah Guru';
    else if (act.includes('TENDIK')) label = 'Ubah Tendik';
    else if (act.includes('KS')) label = 'Ubah Kepala Sekolah';
    else if (act.includes('SISWA')) label = 'Ubah Siswa';
    else if (act.includes('SK')) label = 'Update SK';
    else if (act.includes('PROFILE')) label = 'Ubah Profil';

    return {
      label,
      icon: Edit3,
      bgClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
      iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
      category: 'UPDATE',
    };
  }

  if (act.startsWith('HAPUS') || act === 'DELETE') {
    let label = 'Hapus Data';
    if (act.includes('SEKOLAH')) label = 'Hapus Sekolah';
    else if (act.includes('CABANG')) label = 'Hapus Cabang';
    else if (act.includes('GURU')) label = 'Hapus Guru';
    else if (act.includes('TENDIK')) label = 'Hapus Tendik';
    else if (act.includes('KS')) label = 'Hapus Kepala Sekolah';
    else if (act.includes('SISWA')) label = 'Hapus Siswa';

    return {
      label,
      icon: Trash2,
      bgClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
      category: 'DELETE',
    };
  }

  if (act.startsWith('RESTORE')) {
    return {
      label: 'Pulihkan Data',
      icon: RotateCcw,
      bgClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
      category: 'RESTORE',
    };
  }

  if (act === 'LOGIN') {
    return {
      label: 'Masuk Sistem',
      icon: LogIn,
      bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
      iconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
      category: 'AUTH',
    };
  }

  if (act === 'LOGOUT') {
    return {
      label: 'Keluar Sistem',
      icon: LogOut,
      bgClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      iconBg: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      category: 'AUTH',
    };
  }

  if (act === 'SWITCH_ROLE') {
    return {
      label: 'Ganti Peran',
      icon: Shield,
      bgClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
      iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
      category: 'AUTH',
    };
  }

  if (act.includes('SK')) {
    return {
      label: act === 'PENGAJUAN_SK' ? 'Pengajuan SK' : 'Update SK',
      icon: FileText,
      bgClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
      iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
      category: 'SK',
    };
  }

  return {
    label: action || 'Aktivitas',
    icon: Activity,
    bgClass: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    category: 'OTHER',
  };
}

export const LogAktivitasModule: React.FC = () => {
  const { logList } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const filtered = useMemo(() => {
    return (logList || []).filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const meta = getActionMeta(log.action);

      const matchSearch =
        !q ||
        (log.userName || '').toLowerCase().includes(q) ||
        (log.userEmail || '').toLowerCase().includes(q) ||
        (log.details || '').toLowerCase().includes(q) ||
        (log.action || '').toLowerCase().includes(q) ||
        meta.label.toLowerCase().includes(q);

      const matchCategory =
        filterCategory === 'ALL' ||
        meta.category === filterCategory ||
        log.action === filterCategory;

      return matchSearch && matchCategory;
    });
  }, [logList, searchQuery, filterCategory]);

  const handleExportCSV = () => {
    const rows = filtered.map((l, index) => {
      const meta = getActionMeta(l.action);
      return {
        No: index + 1,
        'Waktu (WIB)': formatLogTimestamp(l.timestamp),
        'Waktu ISO': l.timestamp,
        Pengguna: l.userName || l.userEmail || 'System',
        Email: l.userEmail || '-',
        Peran: l.userRole || '-',
        Tindakan: meta.label,
        'Kode Aksi': l.action,
        'Detail Aktivitas': l.details,
      };
    });
    exportToCSV(`Audit_Log_SIM_Dikdasmen_${Date.now()}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Log Aktivitas & Audit Trail</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              {filtered.length} Jejak Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-0.5">
            Rekaman kronologis aksi penambahan, perubahan, penghapusan, impor, dan sesi oleh pengguna sistem secara transparan
          </p>
        </div>

        <button
          id="btn-export-log-csv"
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-all shadow-sm flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Log (CSV)</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-audit-log"
            type="text"
            placeholder="Cari nama pengguna, email, tindakan, atau detail aktivitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative sm:w-64">
          <Filter className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            id="filter-action-type"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter Kategori Tindakan"
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="ALL">Semua Kategori Tindakan</option>
            <option value="IMPORT">Import Excel (Massal)</option>
            <option value="CREATE">Tambah Data Baru</option>
            <option value="UPDATE">Ubah Data</option>
            <option value="DELETE">Hapus Data</option>
            <option value="RESTORE">Pemulihan (Restore)</option>
            <option value="SK">Pengajuan & Status SK</option>
            <option value="AUTH">Sesi & Akun (Login / Logout)</option>
          </select>
        </div>
      </div>

      {/* Log List View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada log aktivitas yang cocok
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau ganti filter kategori tindakan di atas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filtered.map((log) => {
              const meta = getActionMeta(log.action);
              const ActionIcon = meta.icon;

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Left Column: Icon + Badge + Details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Action Icon Pill */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs ${meta.iconBg}`}
                      title={log.action}
                    >
                      <ActionIcon className="w-5 h-5" />
                    </div>

                    {/* Content Details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Action Badge & Detail Heading */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${meta.bgClass}`}
                        >
                          {meta.label}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-[13px] leading-snug break-words">
                          {log.details}
                        </span>
                      </div>

                      {/* User & Role Metadata */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.userName || log.userEmail || 'System'}</span>
                        </span>

                        {log.userRole && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {log.userRole}
                            </span>
                          </>
                        )}

                        {log.userEmail && log.userEmail !== log.userName && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                              {log.userEmail}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Formatted Timestamp */}
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px] font-medium self-start md:self-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatLogTimestamp(log.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

