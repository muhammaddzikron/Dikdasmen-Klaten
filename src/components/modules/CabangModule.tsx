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
  Copy,
  LogIn,
  Eye,
  EyeOff,
  LayoutGrid,
  Table as TableIcon,
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
  const {
    cabangList,
    sekolahList,
    addCabang,
    updateCabang,
    deleteCabang,
    importCabangBatch,
    showToast,
  } = useData();
  const { currentUser, quickLogin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
      (c.ketuaName && c.ketuaName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCredentials = (c: Cabang) => {
    const text = `Username: ${c.username || c.code}\nPassword: ${c.password || 'cabang123'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    showToast(`Kredensial untuk ${c.name} disalin ke clipboard!`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestSession = (c: Cabang) => {
    quickLogin('Cabang', `Operator ${c.name}`, c.id);
    showToast(`Beralih ke Sesi ${c.name}`, 'success');
  };

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
        'Kode Majelis Cabang': c.code,
        'Nama Majelis Cabang': c.name,
        'Ketua Majelis Cabang': c.ketuaName || '-',
        'Nomor Telepon': c.phone || '-',
        'Email Majelis Cabang': c.email || '-',
        'Alamat Kantor Majelis Cabang': c.address || '-',
        'Username Login': c.username || c.code.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        'Password Default': c.password || 'cabang123',
        'Jumlah Satuan Pendidikan': `${underSchools.length} Sekolah`,
        'Tanggal Terdaftar': c.createdAt ? new Date(c.createdAt).toLocaleDateString('id-ID') : '-',
      };
    });
    exportToExcel(`Data_Master_Majelis_Cabang_Klaten_${Date.now()}`, 'Data Majelis Cabang', rows);
    showToast('Data Majelis Cabang berhasil diekspor ke format Excel!', 'success');
  };

  const handleExportPDF = () => {
    const headers = ['No', 'Kode', 'Nama Majelis Cabang', 'Ketua Majelis Cabang', 'Telepon', 'Email', 'Alamat Kantor', 'Jml Sekolah'];
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
    exportToPDF('Rekapitulasi Data Master Majelis Cabang Dikdasmen & PNF Klaten', headers, rows, `Laporan_Master_Majelis_Cabang_${Date.now()}`);
    showToast('Laporan PDF Master Majelis Cabang berhasil dibuat!', 'success');
  };

  // Download Sample Template for Upload
  const handleDownloadSample = (format: 'xlsx' | 'csv') => {
    const sampleData = [
      {
        'Kode Cabang': 'PCM-01',
        'Nama Majelis Cabang': 'PCM Klaten Kota',
        'Ketua Majelis Cabang': 'H. Budi Santoso, S.Pd.',
        'Nomor Telepon': '0272-321184',
        'Email Cabang': 'pcm_kotaklaten@muhammadiyah.id',
        'Alamat Kantor Majelis Cabang': 'Jl. Pemuda No. 123, Klaten Tengah',
        'Username Login': 'pcm_klatenkota',
        'Password Default': 'cabang123',
      },
      {
        'Kode Cabang': 'PCM-02',
        'Nama Majelis Cabang': 'PCM Delanggu',
        'Ketua Majelis Cabang': 'Drs. H. Mulyono, M.Ag.',
        'Nomor Telepon': '0272-551234',
        'Email Cabang': 'pcm_delanggu@muhammadiyah.id',
        'Alamat Kantor Majelis Cabang': 'Jl. Raya Delanggu No. 45, Delanggu',
        'Username Login': 'pcm_delanggu',
        'Password Default': 'cabang123',
      },
      {
        'Kode Cabang': 'PCM-03',
        'Nama Majelis Cabang': 'PCM Pedan',
        'Ketua Majelis Cabang': 'H. Wahyudi, S.Ag.',
        'Nomor Telepon': '0272-892110',
        'Email Cabang': 'pcm_pedan@muhammadiyah.id',
        'Alamat Kantor Majelis Cabang': 'Jl. Ronggowarsito No. 18, Pedan',
        'Username Login': 'pcm_pedan',
        'Password Default': 'cabang123',
      },
      {
        'Kode Cabang': 'PCM-04',
        'Nama Majelis Cabang': 'PCM Prambanan',
        'Ketua Majelis Cabang': 'Ir. H. Sudirman',
        'Nomor Telepon': '0272-491022',
        'Email Cabang': 'pcm_prambanan@muhammadiyah.id',
        'Alamat Kantor Majelis Cabang': 'Jl. Candi Sewu No. 05, Prambanan',
        'Username Login': 'pcm_prambanan',
        'Password Default': 'cabang123',
      },
      {
        'Kode Cabang': 'PCM-05',
        'Nama Majelis Cabang': 'PCM Cawas',
        'Ketua Majelis Cabang': 'Drs. H. Sukamto',
        'Nomor Telepon': '0813-2900-1122',
        'Email Cabang': 'pcm_cawas@muhammadiyah.id',
        'Alamat Kantor Majelis Cabang': 'Jl. Tembus Cawas No. 12, Cawas',
        'Username Login': 'pcm_cawas',
        'Password Default': 'cabang123',
      },
      {
        'Kode Cabang': 'PCM-06',
        'Nama Majelis Cabang': 'PCM Trucuk',
        'Ketua Majelis Cabang': 'H. Sunarto, M.Pd.',
        'Nomor Telepon': '0812-3344-5566',
        'Email Cabang': 'pcm_trucuk@muhammadiyah.id',
        'Alamat Kantor Majelis Cabang': 'Jl. Trucuk-Sajen No. 08, Trucuk',
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

          const name = getVal('Nama Majelis Cabang', 'Nama Cabang / PCM', 'Nama Cabang', 'Nama PCM', 'Nama', 'Cabang', 'name') || `Majelis Cabang Baru ${idx + 1}`;
          let code = getVal('Kode Majelis Cabang', 'Kode Cabang', 'Kode', 'Kode PCM', 'code');
          if (!code) {
            const nextNum = activeCabangs.length + idx + 1;
            code = `PCM-${nextNum < 10 ? '0' + nextNum : nextNum}`;
          }

          const ketuaName = getVal('Ketua Majelis Cabang', 'Ketua PCM', 'Ketua', 'Nama Ketua', 'ketua', 'ketuaName');
          const phone = getVal('Nomor Telepon', 'Telepon', 'No HP', 'No Telepon', 'HP', 'phone');
          const email = getVal('Email Majelis Cabang', 'Email Cabang', 'Email', 'Surel', 'email');
          const address = getVal('Alamat Kantor Majelis Cabang', 'Alamat Kantor PCM', 'Alamat Kantor', 'Alamat', 'address');
          
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
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Master Data Majelis Cabang</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
              {filtered.length} Majelis Cabang
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar Majelis Dikdasmen & PNF Cabang di tingkat kecamatan se-Kabupaten Klaten
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ekspor Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Ekspor seluruh data majelis cabang ke format Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>

          {/* Cetak PDF */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Cetak Laporan Rekapitulasi Data Majelis Cabang ke format PDF"
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
              title="Unggah dan impor data majelis cabang secara massal dari file Excel atau CSV"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Data Majelis Cabang</span>
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
              <span>Tambah Majelis Cabang</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama Majelis Cabang, ketua, kode, alamat, username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Tampilan Tabel Data"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cabang View (Grid or Table) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cabang) => {
            const underSchools = sekolahList.filter((s) => s.cabangId === cabang.id && !s.isDeleted);
            const isPwVisible = !!showPasswords[cabang.id];

            return (
              <div
                key={cabang.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-emerald-500/50 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{cabang.name}</h3>
                        <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {cabang.code}
                        </span>
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
                    <div className="flex items-start gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-slate-400 block">Ketua Majelis Cabang:</span>
                        <strong className="text-slate-800 dark:text-slate-200 text-xs">{cabang.ketuaName || '-'}</strong>
                      </div>
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
                        <span className="truncate text-sky-600 dark:text-sky-400">{cabang.email}</span>
                      </div>
                    )}
                    {cabang.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight text-slate-600 dark:text-slate-400">{cabang.address}</span>
                      </div>
                    )}

                    {/* Kredensial Box */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <Key className="w-3 h-3 text-amber-500" />
                          <span>Kredensial Login:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(cabang)}
                          className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                          title="Salin username dan password"
                        >
                          {copiedId === cabang.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === cabang.id ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">User:</span>
                        <code className="font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">
                          {cabang.username || cabang.code}
                        </code>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Pass:</span>
                        <div className="flex items-center gap-1">
                          <code className="font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                            {isPwVisible ? (cabang.password || 'cabang123') : '••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(cabang.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            title={isPwVisible ? 'Sembunyikan password' : 'Lihat password'}
                          >
                            {isPwVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Card */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <School className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Satuan Pendidikan:</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{underSchools.length} Sekolah</span>
                  </div>

                  {/* Sesi Test Switcher Button */}
                  <button
                    type="button"
                    onClick={() => handleTestSession(cabang)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-teal-600 hover:from-sky-600 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-teal-500/20 transition-all cursor-pointer active:scale-[0.98]"
                    title={`Masuk dan uji coba sesi operator ${cabang.name}`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk Sesi {cabang.name.replace('PCM ', '')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Majelis Cabang</th>
                  <th className="py-3 px-4">Ketua Majelis Cabang</th>
                  <th className="py-3 px-4">Kontak (Telp / Email)</th>
                  <th className="py-3 px-4">Alamat Kantor</th>
                  <th className="py-3 px-4">Kredensial Login</th>
                  <th className="py-3 px-4">Jml Sekolah</th>
                  <th className="py-3 px-4 text-center">Aksi / Sesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((cabang, idx) => {
                  const underSchools = sekolahList.filter((s) => s.cabangId === cabang.id && !s.isDeleted);
                  const isPwVisible = !!showPasswords[cabang.id];

                  return (
                    <tr key={cabang.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{cabang.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{cabang.name}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{cabang.ketuaName || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="text-slate-700 dark:text-slate-300">{cabang.phone || '-'}</div>
                          <div className="text-[11px] text-sky-600 dark:text-sky-400">{cabang.email || '-'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400" title={cabang.address}>
                        {cabang.address || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <span className="text-slate-400">U:</span>
                            <span className="font-bold text-sky-600 dark:text-sky-400">{cabang.username || cabang.code}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <span className="text-slate-400">P:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {isPwVisible ? (cabang.password || 'cabang123') : '••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(cabang.id)}
                              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            >
                              {isPwVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyCredentials(cabang)}
                              className="text-slate-400 hover:text-emerald-600 p-0.5 cursor-pointer"
                              title="Salin Kredensial"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{underSchools.length}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleTestSession(cabang)}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                            title={`Masuk sesi ${cabang.name}`}
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Sesi</span>
                          </button>
                          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(cabang)}
                                className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(cabang.id, cabang.name)}
                                className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  {selectedItem ? 'Edit Majelis Cabang' : 'Tambah Majelis Cabang Baru'}
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
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Nama Majelis Cabang *</label>
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
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Kode Majelis Cabang *</label>
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
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Ketua Majelis Cabang</label>
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
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Email Majelis Cabang</label>
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
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Alamat Kantor Majelis Cabang</label>
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
                  Simpan Majelis Cabang
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
                    Upload & Import Data Master Majelis Cabang
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Impor massal data Majelis Cabang via file Excel (.xlsx) atau CSV
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
                          <th className="p-2 text-left">Nama Majelis Cabang</th>
                          <th className="p-2 text-left">Ketua Majelis Cabang</th>
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
                        Simpan ({parsedData.filter((d) => d.status === 'valid').length}) Data Majelis Cabang
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
