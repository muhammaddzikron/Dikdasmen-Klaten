import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  FileCheck,
  Upload,
  UserCheck,
  School,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CreditCard,
  BookOpen,
  Eye,
  Trash2,
  FileText,
  Search,
  Building,
  UserPlus,
  HelpCircle,
  Paperclip,
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import {
  MasterJenisSk,
  MasterSubJenisSk,
  SkMainType,
  SubmissionType,
  SuratKeputusan,
  UploadedSkDocument,
  Sekolah,
} from '../../../types';
import {
  DEFAULT_MASTER_JENIS_SK,
  DEFAULT_MASTER_SUB_JENIS_SK,
  generateSkTitle,
  generateFormattedSkNumber,
  getDocumentRequirements,
} from '../../../lib/masterSkDefaults';
import { uploadFileToStorage } from '../../../lib/storageService';

interface DynamicSkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<SuratKeputusan> | null;
  onSuccess?: () => void;
}

export const DynamicSkFormModal: React.FC<DynamicSkFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const {
    masterJenisSkList,
    masterSubJenisSkList,
    filteredSekolahList,
    activeSekolahList,
    guruList,
    tendikList,
    kepalaSekolahList,
    allSkList,
    submitSk,
    updateSk,
    showToast,
  } = useData();

  const { currentUser } = useAuth();

  // 1. Jenis SK State
  const [selectedJenisName, setSelectedJenisName] = useState<SkMainType>('SK Guru (Pendidik)');
  const [selectedSubJenisId, setSelectedSubJenisId] = useState<string>('');
  const [submissionType, setSubmissionType] = useState<SubmissionType>('Baru');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');

  // 2. Judul & Nomor SK
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSkNumber, setCustomSkNumber] = useState<string>('');
  const [skStartDate, setSkStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [skEndDate, setSkEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // 3. Recipient Selection & Data
  const [recipientSearch, setRecipientSearch] = useState<string>('');
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState<boolean>(false);
  const [isManualRecipient, setIsManualRecipient] = useState<boolean>(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const recipientDropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Form Field Payload
  const [formFieldsData, setFormFieldsData] = useState<Record<string, any>>({
    name: '',
    nik: '',
    nbm: '',
    nipm: '',
    birthPlace: '',
    birthDate: '',
    education: 'S1',
    studyProgram: '',
    position: '',
    subject: '',
    unitKerja: '',
    statusKepegawaian: 'GTY',
    schoolName: '',
    npsn: '',
    nss: '',
    level: 'SD',
    schoolStatus: 'Swasta',
    address: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: 'Klaten',
    provinsi: 'Jawa Tengah',
    principalName: '',
    principalNbm: '',
    skPendirianLama: '',
    tanggalPendirian: '',
    statusOperasional: 'Aktif Beroperasi',
  });

  // 4. Uploaded Documents Map: requirementId -> UploadedSkDocument
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedSkDocument>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  // 5. Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active Master Jenis SK Object
  const currentMasterJenis = useMemo(() => {
    const list = masterJenisSkList && masterJenisSkList.length > 0 ? masterJenisSkList : DEFAULT_MASTER_JENIS_SK;
    return list.find((j) => j.name === selectedJenisName) || list[0];
  }, [masterJenisSkList, selectedJenisName]);

  // Active Sub-Jenis SK List
  const availableSubJenisList = useMemo(() => {
    const list = masterSubJenisSkList && masterSubJenisSkList.length > 0 ? masterSubJenisSkList : DEFAULT_MASTER_SUB_JENIS_SK;
    return list.filter(
      (s) => s.skTypeCode === currentMasterJenis.code || s.skTypeName === currentMasterJenis.name
    );
  }, [masterSubJenisSkList, currentMasterJenis]);

  // Selected Sub-Jenis Object
  const currentSubJenis = useMemo(() => {
    if (!selectedSubJenisId) return availableSubJenisList[0] || null;
    return availableSubJenisList.find((s) => s.id === selectedSubJenisId) || availableSubJenisList[0] || null;
  }, [availableSubJenisList, selectedSubJenisId]);

  // Determine recipient category
  const isSchoolRecipient = currentMasterJenis.recipientType === 'SATUAN PENDIDIKAN';

  // Active Document Requirements based on submission type (Pengajuan Baru: Ijazah, NBM & Rekomendasi Cabang; Perpanjangan: SK Lama & Rekomendasi Cabang)
  const activeRequirements = useMemo(() => {
    return getDocumentRequirements(submissionType);
  }, [submissionType]);

  // Auto initialize default school from current user
  useEffect(() => {
    if (currentUser?.sekolahId) {
      setSelectedSchoolId(currentUser.sekolahId);
    } else if (filteredSekolahList.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(filteredSekolahList[0].id);
    }
  }, [currentUser, filteredSekolahList]);

  // Synchronize Sub-Jenis when Jenis changes
  useEffect(() => {
    if (availableSubJenisList.length > 0) {
      const isAlreadyInList = availableSubJenisList.some((s) => s.id === selectedSubJenisId);
      if (!isAlreadyInList) {
        setSelectedSubJenisId(availableSubJenisList[0].id);
      }
    } else {
      setSelectedSubJenisId('');
    }
  }, [selectedJenisName, availableSubJenisList]);

  // Synchronize dynamic title
  useEffect(() => {
    if (currentSubJenis) {
      const generated = generateSkTitle(currentMasterJenis.name, currentSubJenis.name, currentSubJenis.titleTemplate);
      setCustomTitle(generated);
    } else {
      setCustomTitle(currentMasterJenis.name.toUpperCase());
    }
  }, [currentMasterJenis, currentSubJenis]);

  // Synchronize End Date based on Sub-Jenis validity period
  useEffect(() => {
    if (!skStartDate) return;
    const months = currentSubJenis?.validityPeriodMonths ?? 24;
    if (months > 0) {
      const start = new Date(skStartDate);
      start.setMonth(start.getMonth() + months);
      setSkEndDate(start.toISOString().split('T')[0]);
    } else {
      // Permanent / seumur
      setSkEndDate('');
    }
  }, [skStartDate, currentSubJenis]);

  // Auto-generate SK Number Preview
  const generatedSkNumberPreview = useMemo(() => {
    const pattern = currentMasterJenis.numberFormat || '[NO]/KEP/GURU/[TAHUN]';
    const seq = (allSkList.length + 1);
    const year = skStartDate ? new Date(skStartDate).getFullYear() : new Date().getFullYear();
    return generateFormattedSkNumber(pattern, seq, year);
  }, [currentMasterJenis, allSkList.length, skStartDate]);

  // Populate school data when school is selected (for SK Pendirian/Operasional)
  useEffect(() => {
    if (!selectedSchoolId) return;
    const school = activeSekolahList.find((s) => s.id === selectedSchoolId);
    if (school) {
      setFormFieldsData((prev) => ({
        ...prev,
        schoolName: school.name,
        npsn: school.npsn,
        level: school.level,
        schoolStatus: school.status,
        address: school.address,
        kelurahan: school.kelurahan || '',
        kecamatan: school.kecamatan || '',
        kabupaten: school.kabupaten || 'Klaten',
        skPendirianLama: school.skPendirianNumber || '',
        statusOperasional: school.categoryCapability ? `Kategori ${school.categoryCapability}` : 'Aktif Beroperasi',
      }));
    }
  }, [selectedSchoolId, activeSekolahList]);

  // Close recipient dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (recipientDropdownRef.current && !recipientDropdownRef.current.contains(event.target as Node)) {
        setIsRecipientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Personnel Candidates for Person Picker
  const candidatePersonnel = useMemo(() => {
    let list: Array<{
      id: string;
      name: string;
      category: 'Guru' | 'Tendik' | 'Kepala Sekolah';
      nbm?: string;
      nik?: string;
      nipm?: string;
      nuptk?: string;
      position?: string;
      subject?: string;
      education?: string;
      studyProgram?: string;
      schoolId: string;
      schoolName?: string;
      birthPlace?: string;
      birthDate?: string;
      statusKepegawaian?: string;
    }> = [];

    const schoolMap = new Map(activeSekolahList.map((s) => [s.id, s.name]));

    if (currentMasterJenis.code === 'GURU') {
      list = guruList.map((g) => ({
        id: g.id,
        name: g.name,
        category: 'Guru',
        nbm: g.nbm,
        nik: g.nik,
        nipm: g.nipm,
        nuptk: g.nuptk,
        position: g.position || 'Guru',
        subject: g.subject || 'Guru Kelas',
        education: g.education || 'S1',
        studyProgram: g.studyProgram || '',
        schoolId: g.schoolId,
        schoolName: schoolMap.get(g.schoolId) || '',
        birthPlace: g.birthPlace || '',
        birthDate: g.birthDate || '',
        statusKepegawaian: g.status || 'GTY',
      }));
    } else if (currentMasterJenis.code === 'TENDIK') {
      list = tendikList.map((t) => ({
        id: t.id,
        name: t.name,
        category: 'Tendik',
        nbm: t.nbm,
        nik: t.nik,
        nipm: t.nipm,
        nuptk: (t as any).nuptk || (t as any).npk || '',
        position: t.position || 'Staf Administrasi',
        subject: t.position || 'Tata Usaha',
        education: t.education || 'SMA/SMK Sederajat',
        studyProgram: t.studyProgram || '',
        schoolId: t.schoolId,
        schoolName: schoolMap.get(t.schoolId) || '',
        birthPlace: t.birthPlace || '',
        birthDate: t.birthDate || '',
        statusKepegawaian: t.status || 'KTY',
      }));
    } else if (currentMasterJenis.code === 'KS') {
      list = kepalaSekolahList.map((ks) => ({
        id: ks.id,
        name: ks.name,
        category: 'Kepala Sekolah',
        nbm: ks.nbm,
        nik: ks.nik,
        nipm: ks.nipm,
        nuptk: ks.nuptk,
        position: 'Kepala Sekolah',
        subject: 'Manajemen Satuan Pendidikan',
        education: ks.education || 'S1',
        studyProgram: ks.studyProgram || '',
        schoolId: ks.schoolId,
        schoolName: schoolMap.get(ks.schoolId) || '',
        birthPlace: ks.birthPlace || '',
        birthDate: ks.birthDate || '',
        statusKepegawaian: ks.statusKepegawaian || 'GTY',
      }));
    }

    // Filter by selected school if available
    if (selectedSchoolId) {
      list = list.filter((p) => p.schoolId === selectedSchoolId);
    }

    // Filter by query
    if (recipientSearch.trim()) {
      const q = recipientSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nbm && p.nbm.toLowerCase().includes(q)) ||
          (p.nipm && p.nipm.toLowerCase().includes(q)) ||
          (p.nuptk && p.nuptk.toLowerCase().includes(q)) ||
          (p.position && p.position.toLowerCase().includes(q))
      );
    }

    return list;
  }, [currentMasterJenis.code, guruList, tendikList, kepalaSekolahList, activeSekolahList, selectedSchoolId, recipientSearch]);

  const handleSelectPerson = (person: (typeof candidatePersonnel)[0]) => {
    setSelectedPersonId(person.id);
    setIsManualRecipient(false);
    setIsRecipientDropdownOpen(false);
    setRecipientSearch(person.name);

    setFormFieldsData((prev) => ({
      ...prev,
      name: person.name,
      nbm: person.nbm || '',
      nomorRekomendasiCabang: prev.nomorRekomendasiCabang || '',
      nipm: person.nipm || '',
      nuptk: person.nuptk || '',
      education: person.education || 'S1',
      studyProgram: person.studyProgram || '',
      position: person.position || '',
      subject: person.subject || '',
      unitKerja: person.position || person.subject || '',
      birthPlace: person.birthPlace || '',
      birthDate: person.birthDate || '',
      statusKepegawaian: person.statusKepegawaian || 'GTY',
    }));
  };

  // Handle Document Upload per slot
  const handleFileUpload = async (reqId: string, reqName: string, file: File) => {
    try {
      setUploadingSlot(reqId);
      setUploadProgress((prev) => ({ ...prev, [reqId]: 10 }));

      const res = await uploadFileToStorage(file, 'sk_documents', (prog) => {
        setUploadProgress((prev) => ({ ...prev, [reqId]: prog }));
      });

      const uploadedDoc: UploadedSkDocument = {
        requirementId: reqId,
        name: reqName,
        fileUrl: res.url,
        fileName: res.fileName,
        fileSize: res.fileSize,
        uploadedAt: new Date().toISOString(),
      };

      setUploadedDocs((prev) => ({
        ...prev,
        [reqId]: uploadedDoc,
      }));

      showToast(`Berkas ${reqName} berhasil diunggah!`, 'success');
    } catch (err) {
      showToast(`Gagal mengunggah berkas ${reqName}.`, 'error');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleRemoveFile = (reqId: string) => {
    setUploadedDocs((prev) => {
      const copy = { ...prev };
      delete copy[reqId];
      return copy;
    });
    setUploadProgress((prev) => {
      const copy = { ...prev };
      delete copy[reqId];
      return copy;
    });
  };

  // Form Submission Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!selectedSchoolId) {
      errors.school = 'Satuan Pendidikan wajib dipilih.';
    }

    if (!skStartDate) {
      errors.skStartDate = 'Tanggal Mulai Berlaku (TMT) wajib diisi.';
    }

    if (isSchoolRecipient) {
      if (!formFieldsData.schoolName) errors.schoolName = 'Nama Satuan Pendidikan wajib diisi.';
      if (!formFieldsData.npsn) errors.npsn = 'NPSN wajib diisi.';
      if (!formFieldsData.address) errors.address = 'Alamat Satuan Pendidikan wajib diisi.';
    } else {
      if (!formFieldsData.name || formFieldsData.name.trim() === '') {
        errors.name = 'Nama Penerima SK wajib diisi.';
      }
      if (!formFieldsData.nbm || formFieldsData.nbm.trim() === '') {
        errors.nbm = 'Nomor NBM wajib diisi.';
      }
      if (!formFieldsData.position || formFieldsData.position.trim() === '') {
        errors.position = 'Jabatan / Penugasan wajib diisi.';
      }
    }

    // Check mandatory document requirements
    activeRequirements.forEach((req) => {
      if (req.isRequired && !uploadedDocs[req.id]) {
        errors[`doc_${req.id}`] = `Dokumen persyaratan "${req.name}" wajib diunggah.`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Mohon lengkapi semua data wajib dan berkas persyaratan bertanda bintang (*).', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const schoolObj = activeSekolahList.find((s) => s.id === selectedSchoolId);
      const skNumberToUse = customSkNumber.trim() ? customSkNumber.trim() : generatedSkNumberPreview;

      const submissionPayload: Partial<SuratKeputusan> = {
        sk_type_id: currentMasterJenis.id,
        sk_sub_type_id: currentSubJenis?.id || '',
        skTypeName: currentMasterJenis.name,
        skSubTypeName: currentSubJenis?.name || '',
        type: currentMasterJenis.name,
        subType: currentSubJenis?.name,
        submissionType,
        submission_type: submissionType,
        schoolId: selectedSchoolId,
        school_id: selectedSchoolId,
        schoolName: schoolObj?.name || formFieldsData.schoolName || '',
        recipient_type: currentMasterJenis.recipientType,
        recipient_id: selectedPersonId || (isSchoolRecipient ? selectedSchoolId : undefined),
        recipient_data: formFieldsData,
        targetName: isSchoolRecipient ? (schoolObj?.name || formFieldsData.schoolName) : formFieldsData.name,
        targetId: selectedPersonId || selectedSchoolId,
        targetCategory: isSchoolRecipient ? 'Sekolah' : currentMasterJenis.code === 'GURU' ? 'Guru' : currentMasterJenis.code === 'TENDIK' ? 'Tendik' : 'Kepala Sekolah',
        title: customTitle || generateSkTitle(currentMasterJenis.name, currentSubJenis?.name),
        skNumber: skNumberToUse,
        sk_number: skNumberToUse,
        skStartDate,
        skEndDate: skEndDate || undefined,
        start_date: skStartDate,
        end_date: skEndDate || undefined,
        status: 'Belum Terbit',
        verification_status: 'Menunggu Verifikasi',
        approval_status: 'Menunggu Persetujuan',
        uploaded_documents: Object.values(uploadedDocs),
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      await submitSk(submissionPayload);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast('Gagal mengajukan SK. Silakan coba kembali.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Formulir Pengajuan Surat Keputusan (SK)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sistem Dinamis Berbasis Master Jenis SK & Standar Majelis Dikdasmen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: MASTER JENIS & SUB-JENIS SK SELECTOR */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>1. Klasifikasi & Jenis SK Utama</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Jenis SK Utama */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Jenis SK <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedJenisName}
                  onChange={(e) => setSelectedJenisName(e.target.value as SkMainType)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="SK Guru (Pendidik)">SK Guru (Pendidik)</option>
                  <option value="SK Tenaga Kependidikan">SK Tenaga Kependidikan</option>
                  <option value="SK Kepala Sekolah">SK Kepala Sekolah</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tipe Penerima: <strong className="text-emerald-600 dark:text-emerald-400">{currentMasterJenis.recipientType}</strong>
                </p>
              </div>

              {/* Sub-Jenis SK */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Sub-Jenis SK <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSubJenisId}
                  onChange={(e) => setSelectedSubJenisId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {availableSubJenisList.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Masa Berlaku: <strong>{currentSubJenis?.validityPeriodText || '2 Tahun'}</strong>
                </p>
              </div>

              {/* Jenis Pengajuan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Jenis Pengajuan <span className="text-red-500">*</span>
                </label>
                <select
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value as SubmissionType)}
                  className="w-full text-xs font-medium px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Baru">Pengajuan Baru</option>
                  <option value="Perpanjangan">Perpanjangan SK</option>
                  <option value="Perubahan">Perubahan / Mutasi</option>
                  <option value="Revisi">Revisi Data SK</option>
                </select>
              </div>
            </div>

            {/* Satuan Pendidikan (Sekolah) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Satuan Pendidikan (Sekolah / Madrasah) <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className={`w-full text-xs font-medium px-3 py-2 bg-white dark:bg-slate-800 border ${
                  formErrors.school ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                } rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
              >
                <option value="">-- Pilih Satuan Pendidikan --</option>
                {activeSekolahList.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.name} (NPSN: {sch.npsn})
                  </option>
                ))}
              </select>
              {formErrors.school && <p className="text-[11px] text-red-500 mt-1">{formErrors.school}</p>}
            </div>
          </div>

          {/* SECTION 2: DYNAMIC RECIPIENT DATA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs uppercase tracking-wider">
                {isSchoolRecipient ? <School className="w-4 h-4 text-emerald-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                <span>2. Data {isSchoolRecipient ? 'Satuan Pendidikan (Penerima SK)' : 'Penerima SK (Individu)'}</span>
              </div>
              {!isSchoolRecipient && (
                <button
                  type="button"
                  onClick={() => {
                    setIsManualRecipient(!isManualRecipient);
                    setSelectedPersonId('');
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isManualRecipient ? 'Cari dari Data Pegawai Sekolah' : 'Input Manual / Pegawai Baru'}</span>
                </button>
              )}
            </div>

            {/* CONDITIONAL FORM RENDERING */}
            {isSchoolRecipient ? (
              /* SATUAN PENDIDIKAN FORM */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Satuan Pendidikan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formFieldsData.schoolName || ''}
                    onChange={(e) => setFormFieldsData({ ...formFieldsData, schoolName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    placeholder="Contoh: SD Muhammadiyah 1 Klaten"
                  />
                  {formErrors.schoolName && <p className="text-[11px] text-red-500 mt-1">{formErrors.schoolName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    NPSN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formFieldsData.npsn || ''}
                    onChange={(e) => setFormFieldsData({ ...formFieldsData, npsn: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                    placeholder="8 Digit NPSN"
                  />
                  {formErrors.npsn && <p className="text-[11px] text-red-500 mt-1">{formErrors.npsn}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Jenjang Pendidikan
                  </label>
                  <select
                    value={formFieldsData.level || 'SD'}
                    onChange={(e) => setFormFieldsData({ ...formFieldsData, level: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                    <option value="MI">MI</option>
                    <option value="MTs">MTs</option>
                    <option value="MA">MA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Kepala Sekolah / Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    value={formFieldsData.principalName || ''}
                    onChange={(e) => setFormFieldsData({ ...formFieldsData, principalName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    placeholder="Nama Kepala Sekolah beserta gelar"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Lengkap Satuan Pendidikan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formFieldsData.address || ''}
                    onChange={(e) => setFormFieldsData({ ...formFieldsData, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    placeholder="Jalan, RT/RW, Dusun, Desa/Kelurahan, Kecamatan, Klaten"
                  />
                  {formErrors.address && <p className="text-[11px] text-red-500 mt-1">{formErrors.address}</p>}
                </div>
              </div>
            ) : (
              /* INDIVIDU (GURU / TENDIK / KS) FORM */
              <div className="space-y-4">
                {/* Person Quick Search Selector (if not manual) */}
                {!isManualRecipient && (
                  <div className="relative" ref={recipientDropdownRef}>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Pilih dari Data Personel {currentMasterJenis.name.replace('SK ', '')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={recipientSearch}
                        onChange={(e) => {
                          setRecipientSearch(e.target.value);
                          setIsRecipientDropdownOpen(true);
                        }}
                        onFocus={() => setIsRecipientDropdownOpen(true)}
                        placeholder={`Ketik nama atau NBM ${currentMasterJenis.name.replace('SK ', '')}...`}
                        className="w-full text-xs pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>

                    {/* Dropdown Suggestions */}
                    {isRecipientDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                        {candidatePersonnel.length > 0 ? (
                          candidatePersonnel.map((person) => (
                            <div
                              key={person.id}
                              onClick={() => handleSelectPerson(person)}
                              className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0 flex items-center justify-between"
                            >
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                  {person.name}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  NBM: {person.nbm || '-'} • {person.position} • {person.schoolName}
                                </div>
                              </div>
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-semibold">
                                Pilih
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-500">
                            Tidak ditemukan data {currentMasterJenis.name.replace('SK ', '')} yang cocok.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Form Fields for Individu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap (beserta Gelar) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formFieldsData.name || ''}
                      onChange={(e) => setFormFieldsData({ ...formFieldsData, name: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                      placeholder="Contoh: Ahmad Fauzi, S.Pd."
                    />
                    {formErrors.name && <p className="text-[11px] text-red-500 mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nomor Baku Muhammadiyah (NBM) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formFieldsData.nbm || ''}
                      onChange={(e) => setFormFieldsData({ ...formFieldsData, nbm: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      placeholder="Contoh: 1234567"
                    />
                    {formErrors.nbm && <p className="text-[11px] text-red-500 mt-1">{formErrors.nbm}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nomor SK Rekomendasi Cabang
                    </label>
                    <input
                      type="text"
                      value={formFieldsData.nomorRekomendasiCabang || formFieldsData.noSkRekomendasiCabang || ''}
                      onChange={(e) => setFormFieldsData({ ...formFieldsData, nomorRekomendasiCabang: e.target.value, noSkRekomendasiCabang: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      placeholder="Contoh: 045/PCM-DEL/IV/2024"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      NIPM
                    </label>
                    <input
                      type="text"
                      value={formFieldsData.nipm || ''}
                      onChange={(e) => setFormFieldsData({ ...formFieldsData, nipm: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      placeholder="Contoh: M-19850109-077 (jika ada)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      NUPTK / NPK
                    </label>
                    <input
                      type="text"
                      value={formFieldsData.nuptk || formFieldsData.nuptk_npk || ''}
                      onChange={(e) => setFormFieldsData({ ...formFieldsData, nuptk: e.target.value, nuptk_npk: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      placeholder="16 digit NUPTK / NPK jika ada"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Pendidikan Terakhir <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formFieldsData.education || 'S1'}
                      onChange={(e) => setFormFieldsData({ ...formFieldsData, education: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                    >
                      <option value="S3">S3</option>
                      <option value="S2">S2</option>
                      <option value="S1">S1</option>
                      <option value="D4">D4</option>
                      <option value="D3">D3</option>
                      <option value="D2">D2</option>
                      <option value="D1">D1</option>
                      <option value="SMA/SMK Sederajat">SMA/SMK Sederajat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Program Studi / Jurusan
                    </label>
                    <input
                      type="text"
                      value={formFieldsData.studyProgram || ''}
                      onChange={(e) => setFormFieldsData({ ...formFieldsData, studyProgram: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                      placeholder="Contoh: Pendidikan Agama Islam"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Jabatan / Formasi Penugasan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formFieldsData.position || ''}
                      onChange={(e) => setFormFieldsData({ ...formFieldsData, position: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                      placeholder="Contoh: Guru Kelas / Kepala Tata Usaha"
                    />
                    {formErrors.position && <p className="text-[11px] text-red-500 mt-1">{formErrors.position}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Mata Pelajaran / Unit Kerja
                    </label>
                    <input
                      type="text"
                      value={formFieldsData.subject || formFieldsData.unitKerja || ''}
                      onChange={(e) => setFormFieldsData({ ...formFieldsData, subject: e.target.value, unitKerja: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                      placeholder="Contoh: Matematika / IT & Dapodik"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: MASA BERLAKU & DETAIL DOKUMEN */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>3. Masa Berlaku & Judul Keputusan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Mulai Berlaku (TMT) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={skStartDate}
                  onChange={(e) => setSkStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Berakhir Berlaku
                </label>
                <input
                  type="date"
                  value={skEndDate}
                  onChange={(e) => setSkEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Otomatis dihitung {currentSubJenis?.validityPeriodText || '2 Tahun'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Format Nomor SK (Otomatis)
                </label>
                <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {generatedSkNumberPreview}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Judul Surat Keputusan (SK)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg uppercase font-semibold"
                placeholder="Contoh: PENGANGKATAN GURU TETAP YAYASAN"
              />
            </div>
          </div>

          {/* SECTION 4: DYNAMIC DOCUMENT REQUIREMENTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs uppercase tracking-wider">
                <Paperclip className="w-4 h-4 text-emerald-600" />
                <span>4. Dokumen Persyaratan Berkas</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Format: PDF, JPG, PNG (Maks. 5 MB)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeRequirements.map((req) => {
                const isUploaded = !!uploadedDocs[req.id];
                const docData = uploadedDocs[req.id];
                const isUploading = uploadingSlot === req.id;
                const progress = uploadProgress[req.id] || 0;
                const hasError = formErrors[`doc_${req.id}`];

                return (
                  <div
                    key={req.id}
                    className={`p-3 rounded-xl border ${
                      hasError
                        ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20'
                        : isUploaded
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30'
                    } transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {req.name}
                          </span>
                          {req.isRequired ? (
                            <span className="px-1.5 py-0.2 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded text-[9px] font-bold">
                              Wajib *
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[9px]">
                              Opsional
                            </span>
                          )}
                        </div>
                        {req.description && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {req.description}
                          </p>
                        )}
                      </div>

                      {isUploaded && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>

                    {isUploaded ? (
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
                            {docData.fileName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-2">
                          <a
                            href={docData.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-500 hover:text-emerald-600"
                            title="Lihat Berkas"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(req.id)}
                            className="p-1 text-slate-400 hover:text-red-500"
                            title="Hapus / Ganti Berkas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer transition-colors text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <Upload className="w-3.5 h-3.5 text-slate-400" />
                          <span>{isUploading ? `Mengunggah... ${progress}%` : 'Pilih Berkas Dokumen'}</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={isUploading}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(req.id, req.name, f);
                            }}
                            className="hidden"
                          />
                        </label>
                        {hasError && <p className="text-[10px] text-red-500 mt-1">{hasError}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: CATATAN TAMBAHAN */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Catatan Pengajuan / Keterangan Tambahan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              placeholder="Catatan pertimbangan khusus untuk verifikator..."
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan SK'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
