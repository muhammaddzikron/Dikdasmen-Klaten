import React, { useState, useRef } from 'react';
import {
  Building,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  School,
  User,
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet,
  FileText,
  Upload,
  Download,
  Check,
  AlertCircle,
  FileUp,
  Sparkles,
  Key,
  ShieldCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Cabang } from '../../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportUtils';

interface ParsedCabang {
  code: string;
  name: string;
  ketuaName: string;
  phone: string;
  email: string;
  address: string;
  username: string;
  password: string;
  status: 'valid' | 'duplicate' | 'warning';
  statusMessage?: string;
}

export const CabangModule: React.FC = () => {
  const { cabangList, sekolahList, addCabang, updateCabang, deleteCabang, importCabangBatch, showToast } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Cabang | null>(null);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCabang[]>([]);
  const [importFileName, setImportFileName] = useState<string>('');
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Cabang>>({
    name: '',
    code: '',
    username: '',
    password: '',
    ketuaName: '',
    address: '',
    phone: '',
    email: '',
  });

  const activeCabangs = cabangList.filter((c) => !c.isDeleted);
  const filtered = activeCabangs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.username && c.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.ketuaName && c.ketuaName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setSelectedItem(null);
    const nextIdx = activeCabangs.length + 1;
    setFormData({
      name: '',
      code: `PCM-${nextIdx < 10 ? '0' + nextIdx : nextIdx}`,
      username: `pcm_cabang${nextIdx}`,
      password: 'cabang123',
      ketuaName: '',
      address: '',
      phone: '',
      email: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Cabang) => {
    setSelectedItem(c);
    setFormData({
      ...c,
      username: c.username || c.code.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      password: c.password || 'cabang123',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    if (selectedItem) {
      await updateCabang(selectedItem.id, formData);
    } else {
      await addCabang(formData as Omit<Cabang, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Pindahkan Cabang "${name}" ke Recycle Bin?`)) {
      await deleteCabang(id);
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    const rows = filtered.map((c, index) => {
      const underSchools = sekolahList.filter((s) => s.cabangId === c.id && !s.isDeleted);
      return {
        No: index + 1,
        'Kode Cabang': c.code,
        'Nama Cabang / PCM': c.name,
        'Ketua PCM': c.ketuaName || '-',
        'Nomor Telepon': c.phone || '-',
        'Email Cabang': c.email || '-',
        'Alamat Kantor PCM': c.address || '-',
        'Username Login': c.username || c.code.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        'Password Default': c.password || 'cabang123',
        'Jumlah Satuan Pendidikan': `${underSchools.length} Sekolah`,
        'Tanggal Terdaftar': c.createdAt ? new Date(c.createdAt).toLocaleDateString('id-ID') : '-',
      };
    });
    exportToExcel(`Data_Master_Cabang_PCM_Klaten_${Date.now()}`, 'Data Cabang PCM', rows);
    showToast('Data Cabang (PCM) berhasil diekspor ke format Excel!', 'success');
  };

  const handleExportPDF = () => {
    const headers = ['No', 'Kode', 'Nama Cabang / PCM', 'Ketua PCM', 'Telepon', 'Email', 'Alamat Kantor', 'Jml Sekolah'];
    const rows = filtered.map((c, index) => {
      const underSchools = sekolahList.filter((s) => s.cabangId === c.id && !s.isDeleted);
      return [
        String(index + 1),
        c.code,
        c.name,
        c.ketuaName || '-',
        c.phone || '-',
        c.email || '-',
        c.address || '-',
        `${underSchools.length} Sekolah`,
      ];
    });
    exportToPDF('Rekapitulasi Data Master Cabang / PCM Majelis Dikdasmen & PNF Klaten', headers, rows, `Laporan_Master_Cabang_PCM_${Date.now()}`);
    showToast('Laporan PDF Master Cabang (PCM) berhasil dibuat!', 'success');
  };

  // Download Sample Template for Upload
  const handleDownloadSample = (format: 'xlsx' | 'csv') => {
    const sampleData = [
      {
        'Kode Cabang': 'PCM-01',
        'Nama Cabang / PCM': 'PCM Klaten Kota',
        'Ketua PCM': 'H. Budi Santoso, S.Pd.',
        'Nomor Telepon': '0272-321184',
        'Email Cabang': 'pcm_kotaklaten@muhammadiyah.id',
        'Alamat Kantor PCM': 'Jl. Pemuda No. 123, Klaten Tengah',
        'Username Login': 'pcm_klatenkota',
        'Password Default': 'cabang123',
      },
      {
        'Kode Cabang': 'PCM-02',
        'Nama Cabang / PCM': 'PCM Delanggu',
        'Ketua PCM': 'Drs. H. Mulyono, M.Ag.',
        'Nomor Telepon': '0272-551234',
        'Email Cabang': 'pcm_delanggu@muhammadiyah.id',
        'Alamat Kantor PCM': 'Jl. Raya Delanggu No. 45, Delanggu',
        'Username Login': 'pcm_delanggu',
        'Password Default': 'cabang123',
      },
      {
        'Kode Cabang': 'PCM-03',
        'Nama Cabang / PCM': 'PCM Pedan',
        'Ketua PCM': 'H. Wahyudi, S.Ag.',
        'Nomor Telepon': '0272-892110',
        'Email Cabang': 'pcm_pedan@muhammadiyah.id',
        'Alamat Kantor PCM': 'Jl. Ronggowarsito No. 18, Pedan',
        'Username Login': 'pcm_pedan',
        'Password Default': 'cabang123',
      },
      {
        'Kode Cabang': 'PCM-04',
        'Nama Cabang / PCM': 'PCM Prambanan',
        'Ketua PCM': 'Ir. H. Sudirman',
        'Nomor Telepon': '0272-491022',
        'Email Cabang': 'pcm_prambanan@muhammadiyah.id',
        'Alamat Kantor PCM': 'Jl. Candi Sewu No. 05, Prambanan',
        'Username Login': 'pcm_prambanan',
        'Password Default': 'cabang123',
      },
      {
        'Kode Cabang': 'PCM-05',
        'Nama Cabang / PCM': 'PCM Cawas',
        'Ketua PCM': 'Drs. H. Sukamto',
        'Nomor Telepon': '0813-2900-1122',
        'Email Cabang': 'pcm_cawas@muhammadiyah.id',
        'Alamat Kantor PCM': 'Jl. Tembus Cawas No. 12, Cawas',
        'Username Login': 'pcm_cawas',
        'Password Default': 'cabang123',
      },
      {
        'Kode Cabang': 'PCM-06',
        'Nama Cabang / PCM': 'PCM Trucuk',
        'Ketua PCM': 'H. Sunarto, M.Pd.',
        'Nomor Telepon': '0812-3344-5566',
        'Email Cabang': 'pcm_trucuk@muhammadiyah.id',
        'Alamat Kantor PCM': 'Jl. Trucuk-Sajen No. 08, Trucuk',
        'Username Login': 'pcm_trucuk',
        'Password Default': 'cabang123',
      },
    ];

    if (format === 'xlsx') {
      exportToExcel('Master_Sample_Template_Cabang_PCM', 'Template Cabang', sampleData);
    } else {
      exportToCSV('Master_Sample_Template_Cabang_PCM', sampleData);
    }
    showToast(`Master sample template (${format.toUpperCase()}) berhasil diunduh!`, 'info');
  };

  // Process File Upload (Excel / CSV)
  const processUploadedFile = (file: File) => {
    setImportError(null);
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (!rawJson || rawJson.length === 0) {
          setImportError('File kosong atau tidak memiliki baris data yang valid.');
          setParsedData([]);
          return;
        }

        const existingCodes = new Set(activeCabangs.map((c) => c.code.trim().toUpperCase()));
        const existingNames = new Set(activeCabangs.map((c) => c.name.trim().toLowerCase()));
        const seenCodesInBatch = new Set<string>();

        const parsed: ParsedCabang[] = rawJson.map((row, idx) => {
          // Normalize column keys
          const getVal = (...keys: string[]) => {
            for (const k of keys) {
              for (const rowKey of Object.keys(row)) {
                if (rowKey.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                  const val = row[rowKey];
                  return val !== undefined && val !== null ? String(val).trim() : '';
                }
              }
            }
            return '';
          };

          const name = getVal('Nama Cabang / PCM', 'Nama Cabang', 'Nama PCM', 'Nama', 'Cabang', 'name') || `PCM Baru ${idx + 1}`;
          let code = getVal('Kode Cabang', 'Kode', 'Kode PCM', 'code');
          if (!code) {
            const nextNum = activeCabangs.length + idx + 1;
            code = `PCM-${nextNum < 10 ? '0' + nextNum : nextNum}`;
          }

          const ketuaName = getVal('Ketua PCM', 'Ketua', 'Nama Ketua', 'ketua', 'ketuaName');
          const phone = getVal('Nomor Telepon', 'Telepon', 'No HP', 'No Telepon', 'HP', 'phone');
          const email = getVal('Email Cabang', 'Email', 'Surel', 'email');
          const address = getVal('Alamat Kantor PCM', 'Alamat Kantor', 'Alamat', 'address');
          
          let username = getVal('Username Login', 'Username', 'User', 'username');
          if (!username) {
            username = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
            if (!username) username = code.toLowerCase().replace(/[^a-z0-9]/g, '_');
          }

          const password = getVal('Password Default', 'Password', 'Kata Sandi', 'password') || 'cabang123';

          const codeUpper = code.trim().toUpperCase();
          const nameLower = name.trim().toLowerCase();

          let status: 'valid' | 'duplicate' | 'warning' = 'valid';
          let statusMessage = 'Siap diimpor';

          if (existingCodes.has(codeUpper) || existingNames.has(nameLower)) {
            status = 'duplicate';
            statusMessage = 'Kode atau Nama sudah terdaftar di sistem';
          } else if (seenCodesInBatch.has(codeUpper)) {
            status = 'duplicate';
            statusMessage = 'Duplikat dalam file unggahan';
          } else if (!name) {
            status = 'warning';
            statusMessage = 'Nama cabang tidak boleh kosong';
          }

          seenCodesInBatch.add(codeUpper);

          return {
            code,
            name,
            ketuaName,
            phone,
            email,
            address,
            username,
            password,
            status,
            statusMessage,
          };
        });

        setParsedData(parsed);
      } catch (err) {
        console.error('Error parsing file:', err);
        setImportError('Gagal membaca file. Pastikan format file adalah .xlsx, .xls, atau .csv yang valid.');
        setParsedData([]);
      }
    };

    reader.onerror = () => {
      setImportError('Terjadi kesalahan saat membaca file.');
    };

    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleExecuteImport = async () => {
    const validItems = parsedData.filter((item) => item.status === 'valid');
    if (validItems.length === 0) {
      showToast('Tidak ada data valid yang dapat diimpor.', 'warning');
      return;
    }

    try {
      setIsSubmittingImport(true);
      const itemsToImport: Omit<Cabang, 'id'>[] = validItems.map((v) => ({
        code: v.code,
        name: v.name,
        ketuaName: v.ketuaName,
        phone: v.phone,
        email: v.email,
        address: v.address,
        username: v.username,
        password: v.password,
        createdAt: new Date().toISOString(),
        isDeleted: false,
      }));

      await importCabangBatch(itemsToImport);
      setIsImportModalOpen(false);
      setParsedData([]);
      setImportFileName('');
    } catch (err) {
      console.error('Failed to import cabang:', err);
      showToast('Gagal mengimpor data Cabang. Silakan coba lagi.', 'error');
    } finally {
      setIsSubmittingImport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Master Data Cabang (PCM)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
              {filtered.length} Cabang
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar Pimpinan Cabang Muhammadiyah / Majelis Dikdasmen Cabang di tingkat kecamatan se-Kabupaten Klaten
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ekspor Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Ekspor seluruh data cabang ke format Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>

          {/* Cetak PDF */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Cetak Laporan Rekapitulasi Data Cabang ke format PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>

          {/* Upload Data Cabang for Super Admin / Admin */}
          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
            <button
              type="button"
              onClick={() => {
                setParsedData([]);
                setImportFileName('');
                setImportError(null);
                setIsImportModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Unggah dan impor data cabang secara massal dari file Excel atau CSV"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Data Cabang</span>
            </button>
          )}

          {/* Tambah Cabang */}
          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Cabang</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Grid Cards */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Cari cabang / ketua / kode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      {/* Cabang Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cabang) => {
          const underSchools = sekolahList.filter((s) => s.cabangId === cabang.id && !s.isDeleted);

          return (
            <div
              key={cabang.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{cabang.name}</h3>
                    <span className="font-mono text-[11px] font-semibold text-slate-400">{cabang.code}</span>
                  </div>
                </div>
                {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cabang)}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      title="Edit Data Cabang"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cabang.id, cabang.name)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Hapus Cabang"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    Ketua: <strong className="text-slate-800 dark:text-slate-200">{cabang.ketuaName || '-'}</strong>
                  </span>
                </div>
                {cabang.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cabang.phone}</span>
                  </div>
                )}
                {cabang.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cabang.email}</span>
                  </div>
                )}
                {cabang.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cabang.address}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] pt-1 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-lg">
                  <span className="text-slate-400">Username Login:</span>
                  <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">{cabang.username || cabang.code}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Satuan Pendidikan:</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{underSchools.length} Sekolah</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedItem ? 'Edit Cabang (PCM)' : 'Tambah Cabang Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Nama Cabang / PCM *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: PCM Delanggu"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Kode Cabang *</label>
                  <input
                    type="text"
                    required
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="PCM-02"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Username Login</label>
                  <input
                    type="text"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="pcm_delanggu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Kata Sandi Login (Default: cabang123)</label>
                <input
                  type="text"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="cabang123"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Ketua PCM / Majelis Dikdasmen</label>
                <input
                  type="text"
                  value={formData.ketuaName || ''}
                  onChange={(e) => setFormData({ ...formData, ketuaName: e.target.value })}
                  placeholder="Contoh: Drs. H. Mulyono, M.Ag."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Nomor Telepon</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0272-551234 / 0812-xxxx"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Email Cabang</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="pcm_delanggu@muhammadiyah.id"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Alamat Kantor Cabang / PCM</label>
                <textarea
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat lengkap kantor PCM..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-md shadow-emerald-600/20"
                >
                  Simpan Cabang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload / Import Cabang */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Upload & Import Data Master Cabang (PCM)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Impor massal data Pimpinan Cabang Muhammadiyah via file Excel (.xlsx) atau CSV
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Template Download Box */}
              <div className="p-4 rounded-xl bg-linear-to-r from-sky-50 to-emerald-50 dark:from-sky-950/30 dark:to-emerald-950/30 border border-sky-100 dark:border-sky-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 dark:text-sky-300">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Download Master Sample File Template</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Gunakan template ini dengan struktur kolom resmi: Kode Cabang, Nama Cabang, Ketua, Telepon, Email, Alamat, Username, Password.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadSample('xlsx')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Sample Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadSample('csv')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Sample CSV</span>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {importFileName ? (
                        <span className="text-sky-600 dark:text-sky-400">{importFileName}</span>
                      ) : (
                        'Klik atau Seret file Excel (.xlsx, .xls) / CSV ke sini'
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV dengan auto-detection kolom
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {importError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Preview Table */}
              {parsedData.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Pratinjau Data Unggahan ({parsedData.length} Baris)
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {parsedData.filter((d) => d.status === 'valid').length} Siap Diimpor
                      </span>
                      {parsedData.some((d) => d.status === 'duplicate') && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          {parsedData.filter((d) => d.status === 'duplicate').length} Duplikat / Abaikan
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
                    >
                      Pilih File Lain
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 text-[11px] text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-2 text-left">No</th>
                          <th className="p-2 text-left">Kode</th>
                          <th className="p-2 text-left">Nama Cabang / PCM</th>
                          <th className="p-2 text-left">Ketua PCM</th>
                          <th className="p-2 text-left">Telepon / Email</th>
                          <th className="p-2 text-left">Username Login</th>
                          <th className="p-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                        {parsedData.map((row, idx) => (
                          <tr
                            key={idx}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                              row.status === 'duplicate' ? 'opacity-60 bg-amber-50/40 dark:bg-amber-950/20' : ''
                            }`}
                          >
                            <td className="p-2 font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-mono font-bold text-sky-600 dark:text-sky-400">{row.code}</td>
                            <td className="p-2 font-semibold text-slate-800 dark:text-slate-200">{row.name}</td>
                            <td className="p-2 text-slate-600 dark:text-slate-400">{row.ketuaName || '-'}</td>
                            <td className="p-2 text-slate-500">
                              <div>{row.phone || '-'}</div>
                              <div className="text-[10px] text-slate-400">{row.email}</div>
                            </td>
                            <td className="p-2 font-mono text-slate-600 dark:text-slate-400">{row.username}</td>
                            <td className="p-2">
                              {row.status === 'valid' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Valid</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>{row.statusMessage}</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="text-xs text-slate-500">
                {parsedData.length > 0
                  ? `${parsedData.filter((d) => d.status === 'valid').length} data valid siap disimpan ke database.`
                  : 'Pilih atau unggah file master cabang terlebih dahulu.'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmittingImport || parsedData.filter((d) => d.status === 'valid').length === 0}
                  onClick={handleExecuteImport}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingImport ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        Simpan ({parsedData.filter((d) => d.status === 'valid').length}) Data Cabang
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
