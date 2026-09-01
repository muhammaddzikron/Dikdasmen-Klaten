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
  ChevronRight,
  ArrowLeftRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole, Sekolah, Cabang } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout, quickLogin, updateCurrentUserProfile, theme, toggleTheme } = useAuth();
  const {
    cabangList,
    sekolahList,
    activeSekolahList,
    selectedCabangId,
    setSelectedCabangId,
    selectedSekolahId,
    setSelectedSekolahId,
    activeSekolah,
    notifikasiList,
    markNotifAsRead,
  } = useData();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isSuperAdminSession = currentUser?.originalRole === 'Super Admin' || currentUser?.role === 'Super Admin';
  const isSimulating = Boolean(isSuperAdminSession && (currentUser?.role !== 'Super Admin' || currentUser?.isSimulated));

  const unreadNotifs = notifikasiList.filter((n) => !n.isRead);
  const registeredSchools = activeSekolahList.length > 0 ? activeSekolahList : sekolahList.filter((s) => !s.isDeleted);
  const registeredCabangs = cabangList.filter((c) => !c.isDeleted);

  const handleRoleSwitch = (role: UserRole, targetId?: string) => {
    let customName = '';
    let cId = '';
    let sId = '';

    if (role === 'Super Admin') {
      customName = 'Administrator (Super Admin)';
    } else if (role === 'Admin') {
      customName = 'Staf Sekretariat Majelis';
    } else if (role === 'Cabang') {
      const targetCabang = targetId
        ? registeredCabangs.find((c) => c.id === targetId)
        : (selectedCabangId !== 'ALL' ? registeredCabangs.find((c) => c.id === selectedCabangId) : null) || registeredCabangs[0];
      if (targetCabang) {
        cId = targetCabang.id;
        customName = `Operator ${targetCabang.name}`;
        setSelectedCabangId(targetCabang.id);
      }
    } else if (role === 'Sekolah') {
      const targetSchool = targetId
        ? registeredSchools.find((s) => s.id === targetId)
        : (selectedSekolahId !== 'ALL' ? registeredSchools.find((s) => s.id === selectedSekolahId) : null) || registeredSchools[0];
      if (targetSchool) {
        sId = targetSchool.id;
        customName = `Operator ${targetSchool.name}`;
        setSelectedSekolahId(targetSchool.id);
        if (targetSchool.cabangId) {
          setSelectedCabangId(targetSchool.cabangId);
        }
      }
    }

    quickLogin(role, customName, cId, sId);
    setShowRoleMenu(false);
  };

  const handleSelectActiveSchool = (schoolId: string) => {
    setSelectedSekolahId(schoolId);
    const targetSchool = registeredSchools.find((s) => s.id === schoolId);
    if (targetSchool) {
      if (currentUser?.role === 'Sekolah') {
        updateCurrentUserProfile({
          sekolahId: targetSchool.id,
          name: `Operator ${targetSchool.name}`,
          email: targetSchool.email || `operator@${targetSchool.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id`,
        });
      }
      if (targetSchool.cabangId && selectedCabangId === 'ALL') {
        setSelectedCabangId(targetSchool.cabangId);
      }
    }
  };

  const handleSelectActiveCabang = (cabangId: string) => {
    setSelectedCabangId(cabangId);
    setSelectedSekolahId('ALL');
    const targetCabang = registeredCabangs.find((c) => c.id === cabangId);
    if (targetCabang && currentUser?.role === 'Cabang') {
      updateCurrentUserProfile({
        cabangId: targetCabang.id,
        name: `Operator ${targetCabang.name}`,
        email: targetCabang.email || `pcm@${targetCabang.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.dikdasmen.org`,
      });
    }
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

        <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-52 sm:w-72 md:w-80">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari NPSN, Guru, Siswa..."
            className="bg-transparent border-none text-xs focus:outline-hidden ml-2 w-full pr-5 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Global Scope & Active Entity Selectors (Super Admin) OR Simulation Banner */}
      <div className="hidden lg:flex items-center gap-2 text-xs">
        {isSimulating ? (
          /* Simulation Mode Indicator for Super Admin testing other roles */
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 px-3 py-1 rounded-lg text-xs shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Mode View:</span>
              <span className="font-bold text-amber-950 dark:text-amber-100">{currentUser?.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold uppercase">{currentUser?.role}</span>
            </div>
            <button
              type="button"
              onClick={() => handleRoleSwitch('Super Admin')}
              className="ml-2 px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-[11px] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Kembali ke peran Super Admin penuh"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Kembali ke Super Admin</span>
            </button>
          </div>
        ) : currentUser?.role === 'Super Admin' ? (
          /* Super Admin View: Region-wide scope selectors */
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500 font-semibold">Majelis Cabang:</span>
              <select
                value={selectedCabangId}
                onChange={(e) => {
                  setSelectedCabangId(e.target.value);
                  if (e.target.value !== 'ALL') setSelectedSekolahId('ALL');
                }}
                aria-label="Filter Majelis Cabang"
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer max-w-[140px] truncate"
              >
                <option value="ALL" className="dark:bg-slate-900">Semua Majelis Cabang</option>
                {registeredCabangs.map((c) => (
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
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer max-w-[180px] truncate"
              >
                <option value="ALL" className="dark:bg-slate-900">Semua Sekolah Terdaftar</option>
                {registeredSchools
                  .filter((s) => selectedCabangId === 'ALL' || s.cabangId === selectedCabangId)
                  .map((s) => (
                    <option key={s.id} value={s.id} className="dark:bg-slate-900">
                      {s.name} ({s.level})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ) : null}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Badge / Switcher - Role Switch dropdown is ONLY available for Super Admin Session */}
        <div className="relative">
          {isSuperAdminSession ? (
            <button
              id="btn-role-switcher"
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifMenu(false);
                setShowUserMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold shadow-xs transition-all cursor-pointer ${getRoleBadgeClass(
                currentUser?.role
              )}`}
              title={isSimulating ? "Klik untuk ganti simulasi atau kembali ke Super Admin" : "Super Admin: Klik untuk beralih mode simulasi / role"}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isSimulating ? `View: ${currentUser?.role}` : (currentUser?.role || 'Guest')}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          ) : (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold shadow-xs ${getRoleBadgeClass(
                currentUser?.role
              )}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{currentUser?.role || 'Guest'}</span>
            </div>
          )}

          {isSuperAdminSession && showRoleMenu && (
            <div
              id="dropdown-role-menu"
              className="absolute right-0 mt-2 w-72 max-h-[85vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 custom-scrollbar"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700/60 mb-1 flex items-center justify-between">
                <span>Simulasi Hak Akses (RBAC)</span>
                <Sparkles className="w-3 h-3 text-emerald-500" />
              </div>

              {/* 1. Sekolah Section */}
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <School className="w-3 h-3" />
                <span>Mode Sekolah Terdaftar ({registeredSchools.length}):</span>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/30">
                {registeredSchools.map((sch) => {
                  const isActive = currentUser?.role === 'Sekolah' && (activeSekolah?.id === sch.id || currentUser.sekolahId === sch.id);
                  return (
                    <button
                      key={sch.id}
                      onClick={() => handleRoleSwitch('Sekolah', sch.id)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{sch.name}</div>
                        <div className="text-[10px] text-slate-400">NPSN: {sch.npsn} • {sch.level}</div>
                      </div>
                      {isActive && <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* 2. Cabang Section */}
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 border-t border-slate-100 dark:border-slate-700/60 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                <span>Mode Majelis Cabang Terdaftar:</span>
              </div>
              <div className="max-h-36 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/30">
                {registeredCabangs.map((cabang) => {
                  const isActive = currentUser?.role === 'Cabang' && currentUser.cabangId === cabang.id;
                  return (
                    <button
                      key={cabang.id}
                      onClick={() => handleRoleSwitch('Cabang', cabang.id)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                        <span className="truncate">{cabang.name}</span>
                      </div>
                      {isActive && <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* 3. Super Admin & Admin Section */}
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 border-t border-slate-100 dark:border-slate-700/60 mt-1 flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                <span>Administrator Daerah:</span>
              </div>

              {/* Super Admin */}
              <button
                onClick={() => handleRoleSwitch('Super Admin')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  currentUser?.role === 'Super Admin'
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <div>
                    <div className="font-bold">Super Admin</div>
                    <div className="text-[10px] text-slate-400 font-normal">Akses Penuh Daerah & Master Data</div>
                  </div>
                </div>
                {currentUser?.role === 'Super Admin' && <UserCheck className="w-3.5 h-3.5 text-purple-600" />}
              </button>

              {/* Admin */}
              <button
                onClick={() => handleRoleSwitch('Admin')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  currentUser?.role === 'Admin'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <div className="font-bold">Admin Majelis</div>
                    <div className="text-[10px] text-slate-400 font-normal">Staf Sekretariat Dikdasmen</div>
                  </div>
                </div>
                {currentUser?.role === 'Admin' && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
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
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="text-right hidden sm:block max-w-[150px]">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none truncate">
                {currentUser?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                {currentUser?.role || 'Super Admin'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-700 shadow-xs">
              {getInitials(currentUser?.name)}
            </div>
          </button>

          {showUserMenu && (
            <div
              id="dropdown-user-menu"
              className="absolute right-0 top-11 w-64 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50"
            >
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{currentUser?.email}</div>
                <div className="mt-1.5 inline-block">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getRoleBadgeClass(currentUser?.role)}`}>
                    {currentUser?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-semibold transition-colors mt-1"
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
