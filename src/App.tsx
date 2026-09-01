import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RegionalDashboard } from './components/dashboard/RegionalDashboard';
import { SchoolDashboard } from './components/dashboard/SchoolDashboard';
import { SekolahModule } from './components/modules/SekolahModule';
import { CabangModule } from './components/modules/CabangModule';
import { GuruModule } from './components/modules/GuruModule';
import { TendikModule } from './components/modules/TendikModule';
import { KepalaSekolahModule } from './components/modules/KepalaSekolahModule';
import { SiswaModule } from './components/modules/SiswaModule';
import { SkModule } from './components/modules/SkModule';
import { MutasiModule } from './components/modules/MutasiModule';
import { LaporanAnalisisModule } from './components/modules/LaporanAnalisisModule';
import { RecycleBinModule } from './components/modules/RecycleBinModule';
import { LogAktivitasModule } from './components/modules/LogAktivitasModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { LoginView } from './components/auth/LoginView';
import { AlertTriangle, ExternalLink } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const { selectedSekolahId, isQuotaExceeded } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-semibold text-slate-400">Menghubungkan ke Cloud Firestore SIM Dikdasmen...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'Sekolah' || (selectedSekolahId && selectedSekolahId !== 'ALL')) {
          return <SchoolDashboard />;
        }
        return <RegionalDashboard setActiveTab={setActiveTab} />;
      case 'sekolah':
        if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin' && currentUser.role !== 'Cabang') {
          return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Akses Terbatas</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Modul Master Data Sekolah hanya dapat diakses oleh Super Admin, Admin, dan Majelis Cabang.
              </p>
            </div>
          );
        }
        return <SekolahModule />;
      case 'cabang':
        if (currentUser.role !== 'Super Admin') {
          return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Akses Terbatas</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Modul Master Data Majelis Cabang hanya dapat diakses dan dikelola oleh Super Admin.
              </p>
            </div>
          );
        }
        return <CabangModule />;
      case 'guru':
        return <GuruModule />;
      case 'tendik':
        return <TendikModule />;
      case 'kepala-sekolah':
        return <KepalaSekolahModule />;
      case 'siswa':
        return <SiswaModule />;
      case 'sk':
        return <SkModule />;
      case 'mutasi':
        return <MutasiModule />;
      case 'laporan':
        return <LaporanAnalisisModule />;
      case 'recycle-bin':
        return <RecycleBinModule />;
      case 'log':
        return <LogAktivitasModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <RegionalDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* High Density Dark Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Quota Notice Banner when Firebase daily read limit is reached */}
        {isQuotaExceeded && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 z-20 transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="leading-snug">
                <strong>Batas Kuota Harian Firestore Tercapai (Spark Plan):</strong> Kuota baca harian database telah mencapai batas gratis dan akan direset otomatis pukul 00:00 UTC esok hari. Aplikasi saat ini berjalan dalam mode interaktif lokal yang aman.
              </span>
            </div>
            <a
              href="https://console.firebase.google.com/project/sim-arafah-556bd/firestore/databases/ai-studio-3a9b395c-8ffc-4279-b2c5-d36e3001bfaa/data?openUpgradeDialog=true"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-[11px] whitespace-nowrap shadow-xs transition-colors"
            >
              <span>Buka Firebase Console / Upgrade</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Scrollable View */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
          <div className="max-w-7xl mx-auto w-full">{renderContent()}</div>
        </main>

        {/* High Density Compact Footer */}
        <footer className="h-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between text-[10px] text-slate-500 font-medium flex-shrink-0 z-10 transition-colors">
          <div>© 2025 Dikdasmen Central Management System • Versi 2.4.0-build.firebase</div>
          <div className="flex items-center gap-4">
            <span>
              Server Status: <span className="text-emerald-500 font-bold">Operational</span>
            </span>
            <span className="hidden sm:inline">Database: Cloud Firestore Multi-Region</span>
          </div>
        </footer>
      </div>

      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainLayout />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
