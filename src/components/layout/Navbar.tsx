import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  Shield,
  Building2,
  School,
  ChevronDown,
  UserCheck,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout, quickLogin, theme, toggleTheme } = useAuth();
  const {
    cabangList,
    sekolahList,
    activeSekolahList,
    selectedCabangId,
    setSelectedCabangId,
    selectedSekolahId,
    setSelectedSekolahId,
    notifikasiList,
    markNotifAsRead,
  } = useData();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadNotifs = notifikasiList.filter((n) => !n.isRead);

  const handleRoleSwitch = (role: UserRole) => {
    let customName = '';
    let cId = '';
    let sId = '';

    if (role === 'Cabang') {
      const c = cabangList[0];
      if (c) {
        cId = c.id;
        customName = `Operator ${c.name}`;
      }
    } else if (role === 'Sekolah') {
      const s = sekolahList[0];
      if (s) {
        sId = s.id;
        customName = `Operator ${s.name}`;
      }
    }

    quickLogin(role, customName, cId, sId);
    setShowRoleMenu(false);
  };

  const getRoleBadgeClass = (role?: UserRole) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'Admin':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Cabang':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
      case 'Sekolah':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'SA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-30 transition-colors">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-52 sm:w-72 md:w-80">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari NPSN, Guru, Siswa..."
            className="bg-transparent border-none text-xs focus:outline-hidden ml-2 w-full text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Center: Global Scope Selectors (For Admins) */}
      {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
        <div className="hidden xl:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-500 font-semibold">Cabang:</span>
            <select
              value={selectedCabangId}
              onChange={(e) => {
                setSelectedCabangId(e.target.value);
                if (e.target.value !== 'ALL') setSelectedSekolahId('ALL');
              }}
              aria-label="Filter Cabang"
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer max-w-[130px] truncate"
            >
              <option value="ALL" className="dark:bg-slate-900">Semua Cabang / PCM</option>
              {cabangList
                .filter((c) => !c.isDeleted)
                .map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-slate-900">
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <School className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-500 font-semibold">Sekolah:</span>
            <select
              value={selectedSekolahId}
              onChange={(e) => setSelectedSekolahId(e.target.value)}
              aria-label="Filter Sekolah"
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer max-w-[160px] truncate"
            >
              <option value="ALL" className="dark:bg-slate-900">Semua Sekolah</option>
              {activeSekolahList
                .filter((s) => selectedCabangId === 'ALL' || s.cabangId === selectedCabangId)
                .map((s) => (
                  <option key={s.id} value={s.id} className="dark:bg-slate-900">
                    {s.name} ({s.level})
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick RBAC Switcher */}
        <div className="relative">
          <button
            id="btn-role-switcher"
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
              setShowUserMenu(false);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-bold shadow-xs transition-all ${getRoleBadgeClass(
              currentUser?.role
            )}`}
            title="Klik untuk beralih mode Role / Hak Akses Pengguna"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentUser?.role || 'Guest'}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showRoleMenu && (
            <div
              id="dropdown-role-menu"
              className="absolute right-0 mt-2 w-60 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700/60 mb-1 flex items-center justify-between">
                <span>Simulasi Hak Akses (RBAC)</span>
                <Sparkles className="w-3 h-3 text-emerald-500" />
              </div>

              {(['Super Admin', 'Admin', 'Cabang', 'Sekolah'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    currentUser?.role === role
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        role === 'Super Admin'
                          ? 'bg-purple-500'
                          : role === 'Admin'
                          ? 'bg-emerald-500'
                          : role === 'Cabang'
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span>{role}</span>
                  </div>
                  {currentUser?.role === role && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark/Light Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={toggleTheme}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowRoleMenu(false);
              setShowUserMenu(false);
            }}
            className="relative p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Pemberitahuan"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            )}
          </button>

          {showNotifMenu && (
            <div
              id="dropdown-notif-menu"
              className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50"
            >
              <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Notifikasi & Peringatan</span>
                </div>
                {unreadNotifs.length > 0 && (
                  <span className="text-[10px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded">
                    {unreadNotifs.length} Baru
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                {notifikasiList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Belum ada pemberitahuan baru.</div>
                ) : (
                  notifikasiList.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-xs transition-colors flex items-start justify-between gap-2 ${
                        !notif.isRead
                          ? 'bg-slate-50/80 dark:bg-slate-700/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              notif.type === 'warning'
                                ? 'bg-amber-500'
                                : notif.type === 'error'
                                ? 'bg-red-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          {notif.title}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-tight text-[11px]">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => markNotifAsRead(notif.id)}
                          className="text-emerald-600 hover:text-emerald-700 p-1"
                          title="Tandai telah dibaca"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge with Avatar / Initials */}
        <div className="relative flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
          <button
            id="btn-user-profile-menu"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowRoleMenu(false);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                {currentUser?.name || 'M. Akhyar'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                {currentUser?.role || 'Super Admin'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-700 dark:text-sky-300 font-bold text-xs border border-sky-200 dark:border-sky-700 shadow-xs">
              {getInitials(currentUser?.name)}
            </div>
          </button>

          {showUserMenu && (
            <div
              id="dropdown-user-menu"
              className="absolute right-0 top-11 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50"
            >
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{currentUser?.email}</div>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-semibold transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
