import React from 'react';
import {
  LayoutDashboard,
  Building,
  School,
  Users,
  Briefcase,
  UserCheck,
  GraduationCap,
  FileCheck,
  ArrowLeftRight,
  Trash2,
  History,
  BarChart3,
  Settings,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { activeSekolah, cabangList } = useData();
  const role = currentUser?.role || 'Super Admin';

  const activeCabangName =
    role === 'Cabang'
      ? cabangList.find((c) => c.id === currentUser?.cabangId)?.name || 'Majelis Cabang'
      : null;

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Overview',
          icon: LayoutDashboard,
        },
        ...(role === 'Super Admin' || role === 'Admin'
          ? [
              {
                id: 'cabang',
                label: 'Majelis Cabang',
                icon: Building,
              },
              {
                id: 'sekolah',
                label: 'Data Sekolah & Madrasah',
                icon: School,
              },
            ]
          : role === 'Cabang'
          ? [
              {
                id: 'sekolah',
                label: 'Data Sekolah & Madrasah',
                icon: School,
              },
            ]
          : []),
      ],
    },
    {
      title: 'SUMBER DAYA',
      items: [
        {
          id: 'kepala-sekolah',
          label: 'Kepala Sekolah',
          icon: UserCheck,
        },
        {
          id: 'guru',
          label: 'Guru / Pendidik',
          icon: Users,
        },
        {
          id: 'tendik',
          label: 'Tenaga Kependidikan',
          icon: Briefcase,
        },
        {
          id: 'siswa',
          label: 'Siswa',
          icon: GraduationCap,
        },
      ],
    },
    {
      title: 'ADMINISTRASI & LAYANAN',
      items: [
        {
          id: 'sk',
          label: 'Pengajuan & Penerbitan SK',
          icon: FileCheck,
        },
        {
          id: 'mutasi',
          label: 'Mutasi Personel & Siswa',
          icon: ArrowLeftRight,
        },
        {
          id: 'laporan',
          label: 'Analisis Mutu & Laporan',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'SISTEM & AUDIT',
      items: [
        ...(role === 'Super Admin' || role === 'Admin'
          ? [
              {
                id: 'recycle-bin',
                label: 'Recycle Bin',
                icon: Trash2,
              },
              {
                id: 'log',
                label: 'Log Aktivitas & Audit',
                icon: History,
              },
            ]
          : []),
        {
          id: 'settings',
          label: 'Pengaturan & Backup',
          icon: Settings,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="w-64 bg-gradient-to-b from-[#042f2e] via-[#083344] to-[#020617] text-slate-200 flex flex-col h-full select-none relative overflow-hidden shadow-2xl border-r border-emerald-800/30">
      {/* Decorative Aura Background Elements */}
      <div className="absolute top-0 -left-12 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/3 -right-12 w-44 h-44 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 left-4 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-teal-800/40 flex items-center justify-between relative z-10 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/95 rounded-xl flex items-center justify-center p-1 shadow-lg shadow-teal-500/25 ring-2 ring-white/20 shrink-0">
            <img
              src="https://sekolah.dikdasmen.id/gambar/logo.png?v=1667216049"
              alt="Logo SIM Dikdasmen"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-white tracking-wide leading-tight">SIM Dikdasmen</h1>
              <Sparkles className="w-3 h-3 text-emerald-300 animate-pulse" />
            </div>
            <p className="text-[9.5px] text-teal-200/75 uppercase tracking-widest font-bold mt-0.5">
              Management System
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-teal-200/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar relative z-10">
        {menuSections.map((section, idx) => {
          if (!section.items.length) return null;
          return (
            <div key={idx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold text-teal-300/65 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400/80" />
                <span>{section.title}</span>
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`menu-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 text-left group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white font-bold shadow-lg shadow-teal-950/50 border border-teal-300/30 ring-1 ring-white/15'
                        : 'text-slate-300/90 hover:bg-white/10 hover:text-white font-medium hover:translate-x-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`p-1 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-950/40 text-teal-300/80 group-hover:text-emerald-200 group-hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      </div>
                      <span className="truncate tracking-wide">{item.label}</span>
                    </div>

                    {isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-white/90 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-transparent group-hover:text-teal-300/50 shrink-0 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Online Status Widget with Premium Glass Effect */}
      <div className="p-3.5 bg-gradient-to-br from-emerald-950/70 via-teal-950/80 to-sky-950/70 m-3 rounded-2xl border border-teal-500/30 shadow-xl shadow-black/40 backdrop-blur-md relative z-10 overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-sm shadow-emerald-400" />
            </span>
            <span className="text-[11px] text-white font-bold tracking-wide">Sistem Online</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-white/10 text-teal-200 border border-white/10">
            Aktif
          </span>
        </div>

        <div className="space-y-1 text-[10.5px]">
          <p className="text-teal-100/75 leading-tight flex items-center justify-between">
            <span>Peran:</span>
            <strong className="text-white font-semibold">{role}</strong>
          </p>
          {role === 'Sekolah' && activeSekolah && (
            <p className="text-amber-300 font-semibold truncate pt-1 border-t border-teal-800/40 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="truncate">{activeSekolah.name}</span>
            </p>
          )}
          {role === 'Cabang' && activeCabangName && (
            <p className="text-sky-300 font-semibold truncate pt-1 border-t border-teal-800/40 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
              <span className="truncate">{activeCabangName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-shrink-0 h-full border-r border-emerald-900/40 bg-gradient-to-b from-[#042f2e] via-[#083344] to-[#020617]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-10 flex h-full max-w-[280px] w-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
