import React, { useState } from 'react';
import { History, Search, User, Clock, ShieldCheck, Download } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { exportToCSV } from '../../lib/exportUtils';

export const LogAktivitasModule: React.FC = () => {
  const { logList } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filtered = logList.filter((log) => {
    const matchSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.collection.toLowerCase().includes(searchQuery.toLowerCase());

    const matchAction = filterAction === 'ALL' || log.action === filterAction;
    return matchSearch && matchAction;
  });

  const handleExportCSV = () => {
    const rows = filtered.map((l) => ({
      Waktu: l.timestamp,
      Pengguna: l.userName,
      Aksi: l.action,
      Koleksi: l.collection,
      Detail: l.details,
    }));
    exportToCSV(`Audit_Log_SIM_Dikdasmen_${Date.now()}`, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Log Aktivitas & Audit Trail</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.length} Jejak Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rekaman kronologis setiap aksi tambah, ubah, hapus, dan verifikasi oleh pengguna sistem secara transparan
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor Log (CSV)</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari user, aksi, detail perubahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          aria-label="Filter Tipe Tindakan"
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="ALL">Semua Tipe Tindakan</option>
          <option value="CREATE">CREATE (Tambah Data)</option>
          <option value="UPDATE">UPDATE (Ubah Data)</option>
          <option value="DELETE">DELETE (Hapus Data)</option>
          <option value="RESTORE">RESTORE (Pemulihan Data)</option>
          <option value="LOGIN">LOGIN (Masuk Sistem)</option>
        </select>
      </div>

      {/* Log List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">Belum ada riwayat log aktivitas.</div>
          ) : (
            filtered.map((log) => (
              <div
                key={log.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 ${
                      log.action === 'CREATE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : log.action === 'UPDATE'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        : log.action === 'DELETE'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                    }`}
                  >
                    {log.action}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{log.details}</div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <strong>{log.userName}</strong>
                      </span>
                      <span>•</span>
                      <span>Koleksi: {log.collection}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 self-end sm:self-center">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
