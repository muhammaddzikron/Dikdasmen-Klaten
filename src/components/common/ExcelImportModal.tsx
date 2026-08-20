import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { Sekolah, Guru, Tendik, Siswa } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  downloadGuruTemplate,
  downloadTendikTemplate,
  downloadSiswaTemplate,
  parseGuruExcel,
  parseTendikExcel,
  parseSiswaExcel,
  ImportPreviewResult,
} from '../../lib/excelTemplateUtils';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'guru' | 'tendik' | 'siswa';
  activeSchools: Sekolah[];
  defaultSchoolId?: string;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  entityType,
  activeSchools,
  defaultSchoolId,
}) => {
  const { importGuruBatch, importTendikBatch, importSiswaBatch } = useData();
  const { currentUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fallback school selection
  const [targetSchoolId, setTargetSchoolId] = useState<string>(
    currentUser?.sekolahId || defaultSchoolId || activeSchools[0]?.id || ''
  );

  // Parsed results
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult<any> | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  if (!isOpen) return null;

  const entityConfig = {
    guru: {
      title: 'Import Data Pendidik / Guru dari Excel',
      subtitle: 'Unggah file spreadsheet (.xlsx / .xls) untuk import massal data Guru & Pengajar',
      downloadAction: () => downloadGuruTemplate(activeSchools),
      templateName: 'Format_Import_Data_Guru_Dikdasmen.xlsx',
      columnsSummary: '32 Kolom (Nama Lengkap, NIPM, NPSN/Sekolah, JK, Status Kepegawaian, Mapel, NUPTK, NBM, Sertifikasi, Alamat, dll.)',
    },
    tendik: {
      title: 'Import Data Tenaga Kependidikan dari Excel',
      subtitle: 'Unggah file spreadsheet (.xlsx / .xls) untuk import massal data Tendik / Karyawan',
      downloadAction: () => downloadTendikTemplate(activeSchools),
      templateName: 'Format_Import_Data_Tendik_Dikdasmen.xlsx',
      columnsSummary: '26 Kolom (Nama Lengkap, NIPM, NPSN/Sekolah, JK, Posisi/Jabatan, Status Pegawai, NBM, Pendidikan, No HP, dll.)',
    },
    siswa: {
      title: 'Import Data Peserta Didik / Siswa dari Excel',
      subtitle: 'Unggah file spreadsheet (.xlsx / .xls) untuk import massal data Siswa & Rombel',
      downloadAction: () => downloadSiswaTemplate(activeSchools),
      templateName: 'Format_Import_Data_Siswa_Dikdasmen.xlsx',
      columnsSummary: '19 Kolom (Nama Siswa, NISN, NIS, Satuan Pendidikan, JK, Kelas/Rombel, TTL, Nama Orang Tua/Wali, No HP, dll.)',
    },
  }[entityType];

  const handleFileProcess = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setPreviewResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      // Look for format sheet or use the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      let parsed: ImportPreviewResult<any>;
      if (entityType === 'guru') {
        parsed = parseGuruExcel(jsonData, activeSchools, targetSchoolId);
      } else if (entityType === 'tendik') {
        parsed = parseTendikExcel(jsonData, activeSchools, targetSchoolId);
      } else {
        parsed = parseSiswaExcel(jsonData, activeSchools, targetSchoolId);
      }

      setPreviewResult(parsed);
    } catch (err: any) {
      console.error('Error parsing Excel file:', err);
      alert(`Gagal membaca file spreadsheet: ${err?.message || 'Format tidak valid'}`);
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleReParseWithSchool = (newSchoolId: string) => {
    setTargetSchoolId(newSchoolId);
    if (selectedFile) {
      handleFileProcess(selectedFile);
    }
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setPreviewResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = async () => {
    if (!previewResult || previewResult.validRows.length === 0) return;

    setIsSubmitting(true);
    try {
      if (entityType === 'guru') {
        await importGuruBatch(previewResult.validRows);
      } else if (entityType === 'tendik') {
        await importTendikBatch(previewResult.validRows);
      } else {
        await importSiswaBatch(previewResult.validRows);
      }
      onClose();
      handleResetFile();
    } catch (error: any) {
      console.error('Import batch error:', error);
      alert(`Gagal mengimpor data: ${error?.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {entityConfig.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {entityConfig.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 dark:text-slate-300">
          {/* Step 1: Download Template Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500 text-white shrink-0 mt-0.5">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-300">
                  Langkah 1: Unduh Format Template Excel Resmi
                </h4>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-0.5">
                  Format resmi telah dilengkapi header kolom, data contoh, panduan pengisian, dan daftar NPSN sekolah.
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[11px] font-medium bg-emerald-200/70 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-md">
                    {entityConfig.columnsSummary}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={entityConfig.downloadAction}
              type="button"
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template .XLSX</span>
            </button>
          </div>

          {/* Step 2: Upload Area or Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Langkah 2: Pilih Satuan Pendidikan & Unggah File
              </label>
              {selectedFile && (
                <button
                  onClick={handleResetFile}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                >
                  Ganti File Excel
                </button>
              )}
            </div>

            {/* School selection default */}
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Satuan Pendidikan Default (Jika di Excel kosong/sama):</span>
              </div>
              <select
                value={targetSchoolId}
                onChange={(e) => handleReParseWithSchool(e.target.value)}
                disabled={currentUser?.role === 'Sekolah'}
                className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 dark:text-slate-200 max-w-sm truncate"
              >
                {activeSchools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.level})
                  </option>
                ))}
              </select>
            </div>

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Tarik & Lepaskan File Excel ke Sini atau Klik untuk Memilih
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Pilih Dokumen Excel</span>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Loader2 className="w-8 h-8 mx-auto text-emerald-500 animate-spin mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Memproses dan memvalidasi baris Excel...
                </p>
              </div>
            ) : previewResult ? (
              <div className="space-y-4">
                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Baris</span>
                    <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                      {previewResult.totalParsed}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 block font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Siap Diimport
                    </span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {previewResult.validRows.length}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                    <span className="text-xs text-amber-700 dark:text-amber-400 block font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Ada Catatan
                    </span>
                    <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                      {previewResult.invalidRows.length}
                    </span>
                  </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewFilter('all')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        viewFilter === 'all'
                          ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      Semua ({previewResult.totalParsed})
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewFilter('valid')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        viewFilter === 'valid'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      Siap Diimport ({previewResult.validRows.length})
                    </button>
                    {previewResult.invalidRows.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setViewFilter('invalid')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                          viewFilter === 'invalid'
                            ? 'bg-amber-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        Perlu Perhatian ({previewResult.invalidRows.length})
                      </button>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                    📄 {selectedFile.name}
                  </span>
                </div>

                {/* Data Preview Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-2.5 w-12 text-center">No</th>
                        <th className="p-2.5">Nama Lengkap</th>
                        <th className="p-2.5">
                          {entityType === 'guru' ? 'NIPM / NUPTK' : entityType === 'tendik' ? 'NIPM / Jabatan' : 'NISN / Kelas'}
                        </th>
                        <th className="p-2.5">Satuan Pendidikan</th>
                        <th className="p-2.5">
                          {entityType === 'guru' ? 'Mapel' : entityType === 'tendik' ? 'Posisi' : 'Rombel'}
                        </th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 text-center">Status Validasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {/* Render Valid rows if filter allows */}
                      {(viewFilter === 'all' || viewFilter === 'valid') &&
                        previewResult.validRows.map((row: any, idx: number) => {
                          const school = activeSchools.find((s) => s.id === row.schoolId);
                          return (
                            <tr key={`v-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 text-center font-semibold text-slate-400">{idx + 1}</td>
                              <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                              <td className="p-2.5 text-slate-500">
                                {entityType === 'guru' ? row.nipm || row.nuptk || '-' : entityType === 'tendik' ? row.nipm || '-' : row.nisn}
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
                                {school?.name || row.schoolId}
                              </td>
                              <td className="p-2.5">
                                {entityType === 'guru' ? row.subject : entityType === 'tendik' ? row.position : row.class}
                              </td>
                              <td className="p-2.5">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {row.status || 'Aktif'}
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" /> Valid
                                </span>
                              </td>
                            </tr>
                          );
                        })}

                      {/* Render Invalid rows if filter allows */}
                      {(viewFilter === 'all' || viewFilter === 'invalid') &&
                        previewResult.invalidRows.map((inv: any, idx: number) => (
                          <tr key={`inv-${idx}`} className="bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/50">
                            <td className="p-2.5 text-center font-semibold text-rose-500">{inv.rowNumber}</td>
                            <td className="p-2.5 font-bold text-rose-700 dark:text-rose-400">
                              {inv.data[0] || '(Tanpa Nama)'}
                            </td>
                            <td className="p-2.5 text-slate-500">{inv.data[1] || '-'}</td>
                            <td className="p-2.5 text-rose-600 dark:text-rose-400 font-medium">
                              {inv.errors.join(', ')}
                            </td>
                            <td className="p-2.5 text-slate-400">-</td>
                            <td className="p-2.5 text-slate-400">-</td>
                            <td className="p-2.5 text-center">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3" /> Dilewati
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {previewResult.invalidRows.length > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span>
                        Terdapat <strong>{previewResult.invalidRows.length}</strong> baris yang tidak lengkap atau memiliki error pada kolom wajib. Baris tersebut akan dilewati secara otomatis saat proses import.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            {previewResult && previewResult.validRows.length > 0 && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isSubmitting || previewResult.validRows.length === 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Simpan & Import {previewResult.validRows.length} Data ke Database</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
