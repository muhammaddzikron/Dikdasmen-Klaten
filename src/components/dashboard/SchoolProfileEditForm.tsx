import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Award,
  Globe,
  FileCheck,
  Lock,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  CheckCircle2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Sekolah, Cabang, SchoolLevel, SchoolStatus, SchoolAccreditation } from '../../types';

interface SchoolProfileEditFormProps {
  school: Sekolah;
  cabangList: Cabang[];
  onSave: (updatedData: Partial<Sekolah>) => Promise<void>;
  onCancel?: () => void;
  isModal?: boolean;
}

export const SchoolProfileEditForm: React.FC<SchoolProfileEditFormProps> = ({
  school,
  cabangList,
  onSave,
  onCancel,
  isModal = false,
}) => {
  const [formData, setFormData] = useState<Partial<Sekolah>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || '',
        npsn: school.npsn || '',
        cabangId: school.cabangId || (cabangList[0]?.id || ''),
        level: school.level || 'SMP',
        status: school.status || 'Swasta',
        rtRw: school.rtRw || '',
        kodePos: school.kodePos || '',
        kelurahan: school.kelurahan || '',
        kecamatan: school.kecamatan || '',
        kabupaten: school.kabupaten || 'Kabupaten Klaten',
        address: school.address || '',
        vision: school.vision || '',
        mission: school.mission || '',
        hasNib: school.hasNib === 'Ya' || school.hasNib === true ? 'Ya' : 'Tidak',
        nib: school.nib || '',
        email: school.email || '',
        website: school.website || '',
        phone: school.phone || '',
        sosmed: school.sosmed || '',
        operatorName: school.operatorName || '',
        operatorPhone: school.operatorPhone || '',
        accreditation: school.accreditation || 'A',
        accreditationExpiryDate: school.accreditationExpiryDate || '',
        skPendirianNumber: school.skPendirianNumber || '',
        skPendirianDate: school.skPendirianDate || '',
        skIzinOperasional: school.skIzinOperasional || '',
        skIzinOperasionalDate: school.skIzinOperasionalDate || '',
        username: school.username !== undefined ? school.username : school.npsn || '',
        password: school.password !== undefined ? school.password : 'sekolah123',
      });
    }
  }, [school, cabangList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      await onSave({
        ...formData,
        name: formData.name?.trim(),
        npsn: formData.npsn?.trim(),
        username: (formData.username || formData.npsn || '').trim(),
        password: (formData.password || 'sekolah123').trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update school profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profil Sekolah {school.name} berhasil diperbarui dan tersimpan ke database!</span>
        </div>
      )}

      {/* Section 1: Identitas Satuan Pendidikan Sesuai Kemendikdasmen */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wide">
          <div className="p-1 rounded-md bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Building2 className="w-4 h-4" />
          </div>
          <span>1. Identitas Satuan Pendidikan Sesuai Kemendikdasmen</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nama Sekolah/Madrasah sesuai Referensi Data Kemendikdasmen *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: MTs Muhammadiyah 1 Klaten"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NPSN Resmi *</label>
            <input
              type="text"
              required
              value={formData.npsn || ''}
              onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
              placeholder="Contoh: 20363271"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Majelis Cabang Naungan
            </label>
            <select
              value={formData.cabangId || ''}
              onChange={(e) => setFormData({ ...formData, cabangId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900 dark:text-white cursor-pointer"
            >
              {cabangList
                .filter((c) => !c.isDeleted)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jenjang Pendidikan</label>
            <select
              value={formData.level || 'SMP'}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as SchoolLevel })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white cursor-pointer"
            >
              {(['SD', 'SMP', 'SMA', 'SMK', 'MI', 'MTs', 'MA'] as SchoolLevel[]).map((lvl) => (
                <option key={lvl} value={lvl}>
                  Jenjang {lvl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Lembaga</label>
            <select
              value={formData.status || 'Swasta'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as SchoolStatus })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="Swasta">Swasta (Muhammadiyah)</option>
              <option value="Negeri">Negeri</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Alamat Sekolah/Madrasah Lengkap */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wide">
          <div className="p-1 rounded-md bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <MapPin className="w-4 h-4" />
          </div>
          <span>2. Alamat Sekolah/Madrasah Lengkap</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">RT / RW</label>
            <input
              type="text"
              value={formData.rtRw || ''}
              onChange={(e) => setFormData({ ...formData, rtRw: e.target.value })}
              placeholder="Contoh: 02 / 05"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kode Pos</label>
            <input
              type="text"
              value={formData.kodePos || ''}
              onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
              placeholder="Contoh: 57411"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kelurahan / Desa</label>
            <input
              type="text"
              value={formData.kelurahan || ''}
              onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
              placeholder="Contoh: Barenglor"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kecamatan</label>
            <input
              type="text"
              value={formData.kecamatan || ''}
              onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
              placeholder="Contoh: Klaten Tengah"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kabupaten / Kota</label>
            <input
              type="text"
              value={formData.kabupaten || 'Kabupaten Klaten'}
              onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
              placeholder="Kabupaten Klaten"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Alamat Jalan Lengkap
            </label>
            <textarea
              rows={2}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Contoh: Jl. Veteran No. 72, Barenglor, Kec. Klaten Tengah, Kab. Klaten, Jawa Tengah"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Visi/Misi & Legalitas Usaha (NIB) */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wide">
          <div className="p-1 rounded-md bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Award className="w-4 h-4" />
          </div>
          <span>3. Visi/Misi & Legalitas Usaha (NIB)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Visi Sekolah/Madrasah
            </label>
            <textarea
              rows={2}
              value={formData.vision || ''}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
              placeholder="Visi sekolah..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Misi Sekolah/Madrasah
            </label>
            <textarea
              rows={2}
              value={formData.mission || ''}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              placeholder="Misi sekolah..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Sudah mempunyai NIB ?
            </label>
            <select
              value={formData.hasNib === 'Ya' || formData.hasNib === true ? 'Ya' : 'Tidak'}
              onChange={(e) => setFormData({ ...formData, hasNib: e.target.value as 'Ya' | 'Tidak' })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
            >
              <option value="Ya">Ya, Sudah Memiliki NIB</option>
              <option value="Tidak">Tidak / Belum Ada</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nomor Induk Berusaha (NIB)
            </label>
            <input
              type="text"
              value={formData.nib || ''}
              onChange={(e) => setFormData({ ...formData, nib: e.target.value })}
              placeholder="Contoh: 9120001234567"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Kontak, Web, Sosmed & Petugas Operator */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wide">
          <div className="p-1 rounded-md bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Globe className="w-4 h-4" />
          </div>
          <span>4. Kontak, Web, Sosmed & Petugas Operator</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Email Sekolah/Madrasah
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="mtsmuh1klaten@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Web Sekolah/Madrasah
            </label>
            <input
              type="text"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://mtsmuh1klaten.sch.id"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nomor Telpon Sekolah
            </label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0272-322190"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Akun Sosmed Sekolah/Madrasah
            </label>
            <input
              type="text"
              value={formData.sosmed || ''}
              onChange={(e) => setFormData({ ...formData, sosmed: e.target.value })}
              placeholder="IG: @mtsmuh1klaten / FB: MTs Muh 1 Klaten"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nama Lengkap Operator
            </label>
            <input
              type="text"
              value={formData.operatorName || ''}
              onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
              placeholder="Contoh: Ahmad Zaki, S.Kom."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nomor HP Operator
            </label>
            <input
              type="text"
              value={formData.operatorPhone || ''}
              onChange={(e) => setFormData({ ...formData, operatorPhone: e.target.value })}
              placeholder="081234567890"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Akreditasi, SK Pendirian & Izin Operasional */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wide">
          <div className="p-1 rounded-md bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <FileCheck className="w-4 h-4" />
          </div>
          <span>5. Akreditasi, SK Pendirian & Izin Operasional</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Status Akreditasi / Nilai BAN-S/M
            </label>
            <select
              value={formData.accreditation || 'A'}
              onChange={(e) => setFormData({ ...formData, accreditation: e.target.value as SchoolAccreditation })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-bold cursor-pointer"
            >
              {['Unggul', 'A', 'Baik Sekali', 'B', 'C', 'Belum Terakreditasi'].map((acc) => (
                <option key={acc} value={acc}>
                  Akreditasi {acc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tanggal / Tahun Berakhir Status Akreditasi
            </label>
            <input
              type="date"
              value={formData.accreditationExpiryDate || ''}
              onChange={(e) => setFormData({ ...formData, accreditationExpiryDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nomor SK Pendirian Sekolah/Madrasah
            </label>
            <input
              type="text"
              value={formData.skPendirianNumber || ''}
              onChange={(e) => setFormData({ ...formData, skPendirianNumber: e.target.value })}
              placeholder="Contoh: W.m/6.c/082/1980"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tanggal SK Pendirian
            </label>
            <input
              type="date"
              value={formData.skPendirianDate || ''}
              onChange={(e) => setFormData({ ...formData, skPendirianDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              SK Ijin Oprasional
            </label>
            <input
              type="text"
              value={formData.skIzinOperasional || ''}
              onChange={(e) => setFormData({ ...formData, skIzinOperasional: e.target.value })}
              placeholder="Contoh: 14/MTS/KLT/2018"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tanggal SK Ijin Oprasional
            </label>
            <input
              type="date"
              value={formData.skIzinOperasionalDate || ''}
              onChange={(e) => setFormData({ ...formData, skIzinOperasionalDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 6: Kredensial & Akun Login Satuan Pendidikan */}
      <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/60 dark:from-slate-800 dark:to-slate-800/60 p-4 sm:p-5 rounded-2xl space-y-3.5 border border-emerald-300/80 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <span>6. Kredensial & Akun Login Satuan Pendidikan</span>
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Default: NPSN & sekolah123</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          Username dan kata sandi login mandiri untuk operator sekolah ini.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>Username Login</span>
              </label>
              <span className="text-[10px] text-slate-400">Default: NPSN Resmi</span>
            </div>
            <input
              type="text"
              value={formData.username !== undefined ? formData.username : formData.npsn || ''}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder={formData.npsn || '20363271'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Password / Kata Sandi Login</span>
              </label>
              <span className="text-[10px] text-emerald-600 font-bold">Default: sekolah123</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password !== undefined ? formData.password : 'sekolah123'}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="sekolah123"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs font-bold text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200/60 dark:border-slate-700/60">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Status Kredensial: <b>Tersedia untuk Login</b></span>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                username: formData.npsn || '',
                password: 'sekolah123',
              });
            }}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset ke Kredensial Default (NPSN & sekolah123)</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Menyimpan Profil...' : 'Simpan Perubahan Profil'}</span>
        </button>
      </div>
    </form>
  );
};
