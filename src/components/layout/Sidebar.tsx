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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'Super Admin';

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Overview',
          icon: LayoutDashboard,
        },
        ...(role !== 'Sekolah'
          ? [
              {
                id: 'cabang',
                label: 'Cabang / PCM',
                icon: Building,
              },
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
    <div className="w-60 bg-slate-900 text-slate-300 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-500/20 text-sm">
            D
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">SIM Dikdasmen</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Management System</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar">
        {menuSections.map((section, idx) => {
          if (!section.items.length) return null;
          return (
            <div key={idx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`menu-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Online Status Widget */}
      <div className="p-3.5 bg-slate-800/50 m-3 rounded-lg border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] text-slate-300 font-semibold">Sistem Online</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Role: <span className="text-slate-200 font-semibold">{role}</span>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-shrink-0 h-full border-r border-slate-800 bg-slate-900">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={onClose} />
          <div className="relative z-10 flex h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
