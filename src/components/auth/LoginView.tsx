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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/10">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">SIM DIKDASMEN</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Sistem Informasi Manajemen Pendidikan Dasar dan Menengah Pimpinan Daerah Muhammadiyah
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Masuk ke Portal SIM</h2>
              <p className="text-xs text-slate-400">Pilih akses Sekolah, Cabang PCM, atau Administrator</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Type Selector Buttons: 3 Column for Sekolah, Cabang/PCM, Super Admin */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => handleSelectRoleType('sekolah')}
              className={`py-2 px-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                activeLoginType === 'sekolah'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span className="text-[11px]">Sekolah</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoleType('cabang')}
              className={`py-2 px-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                activeLoginType === 'cabang'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span className="text-[11px]">Cabang / PCM</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoleType('admin')}
              className={`py-2 px-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                activeLoginType === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="text-[11px]">Super Admin</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">
                {activeLoginType === 'sekolah'
                  ? 'NPSN / Username Sekolah'
                  : activeLoginType === 'cabang'
                  ? 'Username / Kode PCM'
                  : 'Username Super Admin'}
              </label>

              <div className="relative">
                {activeLoginType === 'sekolah' ? (
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                ) : activeLoginType === 'cabang' ? (
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                ) : (
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Kata Sandi / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                activeLoginType === 'cabang'
                  ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30'
                  : activeLoginType === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <span>{isSubmitting ? 'Memverifikasi Kredensial...' : 'Masuk ke Sistem'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} Majelis Dikdasmen & PNF. Cloud Firestore Database Terenkripsi.
        </div>
      </div>
    </div>
  );
};
