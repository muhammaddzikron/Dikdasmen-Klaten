import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  School,
  Key,
  Eye,
  EyeOff,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLoginType, setActiveLoginType] = useState<'sekolah' | 'cabang' | 'admin'>('sekolah');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa username dan kata sandi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectRoleType = (type: 'sekolah' | 'cabang' | 'admin') => {
    setActiveLoginType(type);
    setError(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800 relative overflow-hidden">
      {/* Background Soft Pastel Glow Elements on White/Light Canvas */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-white/95 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-teal-600/20 ring-4 ring-emerald-500/20 p-2 backdrop-blur-xs">
            <img
              src="https://sekolah.dikdasmen.id/gambar/logo.png?v=1667216049"
              alt="Logo SIM Dikdasmen"
              className="w-full h-full object-contain drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            SIM DIKDASMEN
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xs sm:max-w-sm mx-auto font-medium leading-relaxed">
            Sistem Informasi Manajemen Pendidikan Dasar dan Menengah Pimpinan Daerah Muhammadiyah
          </p>
        </div>

        {/* Login Card - Signature Hijau-Biru Muhammadiyah */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-teal-950/25 border border-emerald-500/30 space-y-5 relative overflow-hidden">
          {/* Subtle Card Accent Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Title & Icon */}
          <div className="border-b border-teal-700/50 pb-3 flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Masuk ke Portal SIM</h2>
              <p className="text-xs text-teal-100/80">Pilih akses Sekolah, Cabang PCM, atau Administrator</p>
            </div>
            <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-emerald-300 backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Type Selector Buttons: 3 Column for Sekolah, Cabang/PCM, Super Admin */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-emerald-950/70 border border-teal-700/60 text-xs relative z-10">
            <button
              type="button"
              onClick={() => handleSelectRoleType('sekolah')}
              className={`py-2 px-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeLoginType === 'sekolah'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30'
                  : 'text-teal-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span className="text-[11px]">Sekolah</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoleType('cabang')}
              className={`py-2 px-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeLoginType === 'cabang'
                  ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-teal-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span className="text-[11px]">Cabang / PCM</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoleType('admin')}
              className={`py-2 px-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeLoginType === 'admin'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-teal-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="text-[11px]">Super Admin</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-100 text-xs flex items-start gap-2 relative z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-300 mt-1.5 shrink-0" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs relative z-10">
            <div>
              <label className="font-semibold text-teal-100 block mb-1.5">
                {activeLoginType === 'sekolah'
                  ? 'NPSN / Username Sekolah'
                  : activeLoginType === 'cabang'
                  ? 'Username / Kode PCM'
                  : 'Username Super Admin'}
              </label>

              <div className="relative">
                {activeLoginType === 'sekolah' ? (
                  <Key className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-3" />
                ) : activeLoginType === 'cabang' ? (
                  <Building className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-3" />
                ) : (
                  <User className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-3" />
                )}
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    activeLoginType === 'sekolah'
                      ? 'Masukkan NPSN / Username...'
                      : activeLoginType === 'cabang'
                      ? 'Masukkan Kode / Username PCM...'
                      : 'Masukkan Username Admin...'
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-emerald-950/60 border border-teal-600/40 rounded-xl text-white outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30 transition-all placeholder:text-teal-200/50 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-teal-100 block mb-1.5">Kata Sandi / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-teal-300/70 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-10 py-2.5 bg-emerald-950/60 border border-teal-600/40 rounded-xl text-white outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30 transition-all placeholder:text-teal-200/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-teal-300/70 hover:text-white cursor-pointer"
                  title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:via-teal-400 hover:to-sky-400 text-white font-bold rounded-xl shadow-lg shadow-teal-950/30 transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99] disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Memverifikasi Kredensial...' : 'Masuk ke Sistem'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} Majelis Dikdasmen & PNF. Cloud Firestore Database Terenkripsi.
        </div>
      </div>
    </div>
  );
};
