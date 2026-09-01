import { MasterJenisSk, MasterSubJenisSk, DocumentRequirement, SubmissionType } from '../types';

export const DEFAULT_MASTER_JENIS_SK: MasterJenisSk[] = [
  {
    id: 'sk-guru',
    name: 'SK Guru (Pendidik)',
    code: 'GURU',
    description: 'Digunakan untuk pengajuan SK Guru/Pendidik di lingkungan Satuan Pendidikan Muhammadiyah (GTP, GTTP, DPK/PNS).',
    recipientType: 'INDIVIDU',
    numberFormat: '[NO]/KEP/GURU/[TAHUN]',
    status: 'Aktif',
    order: 1,
    kopText: 'MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL\nPIMPINAN DAERAH MUHAMMADIYAH',
    signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
    signerRole: 'Ketua Majelis Dikdasmen & PNF Daerah',
    menimbang: [
      'Bahwa dalam rangka kelancaran proses belajar mengajar serta pembinaan mutu pendidikan di lingkungan perguruan Muhammadiyah, dipandang perlu mengangkat/menetapkan Surat Keputusan Guru;',
      'Bahwa berdasarkan hasil evaluasi kinerja dan usulan dari Satuan Pendidikan serta Pimpinan Cabang Muhammadiyah setempat, yang bersangkutan dipandang cakap dan memenuhi syarat;',
      'Bahwa sehubungan dengan butir di atas, perlu diterbitkan Surat Keputusan Majelis Dikdasmen & PNF Pimpinan Daerah Muhammadiyah.'
    ],
    mengingat: [
      'Anggaran Dasar dan Anggaran Rumah Tangga Muhammadiyah;',
      'Pedoman Pimpinan Pusat Muhammadiyah Nomor 01/PED/I.0/B/2023 tentang Majelis Pendidikan Dasar Menengah dan Pendidikan Nonformal;',
      'Keputusan Rapat Kerja Daerah Majelis Dikdasmen & PNF Pimpinan Daerah Muhammadiyah;',
      'Ketentuan dan Standar Nasional Pendidikan (SNP).'
    ],
    memutuskan: [
      'Mengangkat / Menetapkan nama yang tercantum di bawah ini sebagai Pendidik / Guru pada Satuan Pendidikan Muhammadiyah;',
      'Menugaskan yang bersangkutan untuk melaksanakan tugas dan kewajiban sesuai ketentuan persyarikatan dan perundang-undangan yang berlaku;',
      'Surat Keputusan ini berlaku terhitung sejak tanggal ditetapkan sampai dengan batas masa berlaku yang ditentukan.'
    ],
    diktum: [
      'Apabila di kemudian hari terdapat kekeliruan dalam keputusan ini, akan diadakan perbaikan sebagaimana mestinya.',
      'Salinan Surat Keputusan ini disampaikan kepada Pimpinan Cabang Muhammadiyah setempat, Kepala Sekolah yang bersangkutan, dan arsip Majelis.'
    ],
    fields: [
      { fieldKey: 'name', label: 'Nama Lengkap Guru (beserta Gelar)', isRequired: true, type: 'text', placeholder: 'Contoh: Ahmad Fauzi, S.Pd.', group: 'identitas' },
      { fieldKey: 'nik', label: 'NIK (Nomor Induk Kependudukan)', isRequired: false, type: 'text', placeholder: '16 digit NIK', group: 'identitas' },
      { fieldKey: 'nbm', label: 'NBM (Nomor Baku Muhammadiyah)', isRequired: true, type: 'text', placeholder: 'Nomor NBM / KTAM', group: 'identitas' },
      { fieldKey: 'nipm', label: 'NIP / NIPM / NUPTK', isRequired: false, type: 'text', placeholder: 'NIP / NIPM jika ada', group: 'identitas' },
      { fieldKey: 'birthPlace', label: 'Tempat Lahir', isRequired: false, type: 'text', placeholder: 'Kota/Kabupaten lahir', group: 'identitas' },
      { fieldKey: 'birthDate', label: 'Tanggal Lahir', isRequired: false, type: 'date', group: 'identitas' },
      { fieldKey: 'education', label: 'Pendidikan Terakhir', isRequired: true, type: 'select', options: ['S3', 'S2', 'S1', 'D4', 'D3', 'D2', 'D1', 'SMA/SMK Sederajat'], group: 'kepegawaian' },
      { fieldKey: 'studyProgram', label: 'Program Studi / Jurusan', isRequired: false, type: 'text', placeholder: 'Contoh: Pendidikan Matematika', group: 'kepegawaian' },
      { fieldKey: 'position', label: 'Jabatan Guru', isRequired: true, type: 'select', options: ['Guru Tetap Persyarikatan (GTP)', 'Guru Tidak Tetap Persyarikatan (GTTP)', 'Guru DPK / PNS', 'Guru Kelas', 'Guru Mata Pelajaran', 'Guru BK / Konselor'], group: 'kepegawaian' },
      { fieldKey: 'subject', label: 'Mata Pelajaran / Bidang Tugas', isRequired: true, type: 'text', placeholder: 'Contoh: Matematika / Guru Kelas V', group: 'kepegawaian' },
      { fieldKey: 'statusKepegawaian', label: 'Status Kepegawaian', isRequired: true, type: 'select', options: ['GURU TETAP PERSYARIKATAN', 'GURU TIDAK TETAP PERSYARIKATAN', 'DPK/PNS'], group: 'kepegawaian' },
      { fieldKey: 'skStartDate', label: 'Tanggal Mulai Berlaku (TMT)', isRequired: true, type: 'date', group: 'masa_berlaku' },
      { fieldKey: 'skEndDate', label: 'Tanggal Berakhir Berlaku', isRequired: true, type: 'date', group: 'masa_berlaku' }
    ],
    defaultRequirements: [
      { id: 'req-ijazah', name: 'Ijazah Terakhir', isRequired: true, description: 'Scan Ijazah Terakhir Asli (PDF/Gambar jelas)' },
      { id: 'req-nbm', name: 'NBM', isRequired: true, description: 'Scan Kartu Tanda Anggota NBM / KTAM' },
    ]
  },
  {
    id: 'sk-tendik',
    name: 'SK Tenaga Kependidikan',
    code: 'TENDIK',
    description: 'Digunakan untuk pengajuan SK Tenaga Kependidikan/Karyawan di lingkungan Satuan Pendidikan Muhammadiyah.',
    recipientType: 'INDIVIDU',
    numberFormat: '[NO]/KEP/TENDIK/[TAHUN]',
    status: 'Aktif',
    order: 2,
    kopText: 'MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL\nPIMPINAN DAERAH MUHAMMADIYAH',
    signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
    signerRole: 'Ketua Majelis Dikdasmen & PNF Daerah',
    menimbang: [
      'Bahwa untuk menunjang kelancaran tata kelola administrasi dan operasional di lingkungan Satuan Pendidikan Muhammadiyah, perlu mengangkat Tenaga Kependidikan;',
      'Bahwa yang bersangkutan dinilai memiliki integritas, dedikasi, dan kualifikasi teknis yang memadai untuk melaksanakan tugas;',
      'Bahwa berdasarkan pertimbangan tersebut, perlu diterbitkan Surat Keputusan Pengangkatan Tenaga Kependidikan.'
    ],
    mengingat: [
      'Anggaran Dasar dan Anggaran Rumah Tangga Muhammadiyah;',
      'Pedoman Pimpinan Pusat Muhammadiyah tentang Majelis Dikdasmen & PNF;',
      'Ketentuan Standar Tenaga Kependidikan.'
    ],
    memutuskan: [
      'Mengangkat nama yang tercantum pada surat ini sebagai Tenaga Kependidikan pada Satuan Pendidikan Muhammadiyah;',
      'Memberikan tugas dan tanggung jawab sesuai formasi dan unit kerja yang ditetapkan;',
      'Surat Keputusan ini berlaku sejak tanggal ditetapkan hingga waktu yang ditentukan.'
    ],
    diktum: [
      'Segala hak dan kewajiban yang bersangkutan disesuaikan dengan ketentuan persyarikatan.',
      'Surat Keputusan ini diberikan kepada yang bersangkutan untuk diketahui dan dilaksanakan.'
    ],
    fields: [
      { fieldKey: 'name', label: 'Nama Lengkap Tenaga Kependidikan', isRequired: true, type: 'text', placeholder: 'Contoh: Hendra Setiawan, A.Md.', group: 'identitas' },
      { fieldKey: 'nik', label: 'NIK (Nomor Induk Kependudukan)', isRequired: false, type: 'text', placeholder: '16 digit NIK', group: 'identitas' },
      { fieldKey: 'nbm', label: 'NBM (Nomor Baku Muhammadiyah)', isRequired: true, type: 'text', placeholder: 'Nomor NBM / KTAM', group: 'identitas' },
      { fieldKey: 'nipm', label: 'NIP / NIPM (jika tersedia)', isRequired: false, type: 'text', placeholder: 'NIPM jika ada', group: 'identitas' },
      { fieldKey: 'birthPlace', label: 'Tempat Lahir', isRequired: false, type: 'text', placeholder: 'Tempat lahir', group: 'identitas' },
      { fieldKey: 'birthDate', label: 'Tanggal Lahir', isRequired: false, type: 'date', group: 'identitas' },
      { fieldKey: 'education', label: 'Pendidikan Terakhir', isRequired: true, type: 'select', options: ['S2', 'S1', 'D4', 'D3', 'D2', 'D1', 'SMA/SMK Sederajat', 'SMP/MTs'], group: 'kepegawaian' },
      { fieldKey: 'studyProgram', label: 'Program Studi / Jurusan', isRequired: false, type: 'text', placeholder: 'Contoh: Administrasi / Komputer', group: 'kepegawaian' },
      { fieldKey: 'position', label: 'Jabatan / Formasi', isRequired: true, type: 'select', options: ['Kepala Tata Usaha', 'Staff Administrasi / TU', 'Operator Sekolah / Dapodik', 'Pustakawan', 'Laboran', 'Staff Keuangan / Bendahara', 'Satpam / Penjaga Sekolah', 'Petugas Kebersihan'], group: 'kepegawaian' },
      { fieldKey: 'unitKerja', label: 'Unit Kerja / Penugasan', isRequired: true, type: 'text', placeholder: 'Contoh: Bagian Tata Usaha & IT', group: 'kepegawaian' },
      { fieldKey: 'statusKepegawaian', label: 'Status Kepegawaian', isRequired: true, type: 'select', options: ['KARYAWAN TETAP PERSYARIKATAN', 'KARYAWAN TIDAK TETAP PERSYARIKATAN', 'DPK/PNS'], group: 'kepegawaian' },
      { fieldKey: 'skStartDate', label: 'Tanggal Mulai Berlaku (TMT)', isRequired: true, type: 'date', group: 'masa_berlaku' },
      { fieldKey: 'skEndDate', label: 'Tanggal Berakhir Berlaku', isRequired: true, type: 'date', group: 'masa_berlaku' }
    ],
    defaultRequirements: [
      { id: 'req-ijazah', name: 'Ijazah Terakhir', isRequired: true, description: 'Scan Ijazah Asli Terakhir (PDF/Gambar jelas)' },
      { id: 'req-nbm', name: 'NBM', isRequired: true, description: 'Scan Kartu Tanda Anggota NBM' },
    ]
  },
  {
    id: 'sk-ks',
    name: 'SK Kepala Sekolah',
    code: 'KS',
    description: 'Digunakan untuk pengajuan pengangkatan atau perpanjangan masa jabatan Kepala Sekolah/Madrasah Muhammadiyah.',
    recipientType: 'INDIVIDU',
    numberFormat: '[NO]/KEP/KS/[TAHUN]',
    status: 'Aktif',
    order: 3,
    kopText: 'MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL\nPIMPINAN DAERAH MUHAMMADIYAH',
    signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
    signerRole: 'Ketua Majelis Dikdasmen & PNF Daerah',
    menimbang: [
      'Bahwa dalam rangka optimalisasi kepemimpinan manajerial, supervisi, dan kewirausahaan di Satuan Pendidikan Muhammadiyah, perlu mengangkat/memperpanjang Kepala Sekolah/Madrasah;',
      'Bahwa setelah melalui proses seleksi, uji kelayakan dan kepatutan, serta rekomendasi Pimpinan Cabang Muhammadiyah setempat, yang bersangkutan dinilai kompeten;',
      'Bahwa untuk kepastian hukum kepemimpinan sekolah, dipandang perlu menerbitkan Surat Keputusan Kepala Sekolah.'
    ],
    mengingat: [
      'Anggaran Dasar dan Anggaran Rumah Tangga Muhammadiyah;',
      'Pedoman Pimpinan Pusat Muhammadiyah tentang Tata Cara Pengangkatan dan Pemberhentian Kepala Satuan Pendidikan Muhammadiyah;',
      'Peraturan Menteri Pendidikan mengenai Kualifikasi dan Standar Kepala Sekolah.'
    ],
    memutuskan: [
      'Mengangkat/Menetapkan nama yang bersangkutan sebagai Kepala Sekolah/Madrasah pada Satuan Pendidikan Muhammadiyah untuk periode masa jabatan yang ditetapkan;',
      'Menugaskan Kepala Sekolah untuk memimpin, mengembangkan kurikulum Ismuba dan Nasional, serta mengelola seluruh potensi sekolah secara amanah;',
      'Surat Keputusan ini berlaku untuk masa jabatan 4 (empat) tahun terhitung sejak tanggal ditetapkan.'
    ],
    diktum: [
      'Kepala Sekolah bertanggung jawab secara berkala menyampaikan laporan kinerja kepada Majelis Dikdasmen & PNF.',
      'Petikan keputusan ini disampaikan kepada pihak yang berwenang untuk dipergunakan sebagaimana mestinya.'
    ],
    fields: [
      { fieldKey: 'name', label: 'Nama Lengkap Kepala Sekolah (beserta Gelar)', isRequired: true, type: 'text', placeholder: 'Contoh: Dra. Hj. Siti Maryam, M.Pd.', group: 'identitas' },
      { fieldKey: 'nik', label: 'NIK (Nomor Induk Kependudukan)', isRequired: false, type: 'text', placeholder: '16 digit NIK', group: 'identitas' },
      { fieldKey: 'nbm', label: 'NBM (Nomor Baku Muhammadiyah)', isRequired: true, type: 'text', placeholder: 'Nomor NBM / KTAM', group: 'identitas' },
      { fieldKey: 'nipm', label: 'NIP / NIPM / NUPTK / NUKS', isRequired: false, type: 'text', placeholder: 'Nomor Induk Pegawai / NUKS', group: 'identitas' },
      { fieldKey: 'birthPlace', label: 'Tempat Lahir', isRequired: false, type: 'text', placeholder: 'Tempat lahir', group: 'identitas' },
      { fieldKey: 'birthDate', label: 'Tanggal Lahir', isRequired: false, type: 'date', group: 'identitas' },
      { fieldKey: 'education', label: 'Pendidikan Terakhir', isRequired: true, type: 'select', options: ['S3', 'S2', 'S1', 'D4'], group: 'kepegawaian' },
      { fieldKey: 'studyProgram', label: 'Program Studi / Keahlian', isRequired: false, type: 'text', placeholder: 'Contoh: Manajemen Pendidikan', group: 'kepegawaian' },
      { fieldKey: 'position', label: 'Jabatan Penugasan', isRequired: true, type: 'text', placeholder: 'Contoh: Kepala Sekolah / Kepala Madrasah', group: 'kepegawaian' },
      { fieldKey: 'periodNumber', label: 'Periode Masa Jabatan Ke-', isRequired: true, type: 'select', options: ['Periode Ke-1 (Tahun 1-4)', 'Periode Ke-2 (Tahun 5-8)', 'Periode Perpanjangan Khusus', 'Pelaksana Tugas (Plt.)'], group: 'kepegawaian' },
      { fieldKey: 'statusKepegawaian', label: 'Status Kepegawaian Induk', isRequired: true, type: 'select', options: ['GTY', 'GTP', 'PNS DPK', 'PPPK'], group: 'kepegawaian' },
      { fieldKey: 'skStartDate', label: 'Tanggal Mulai Masa Jabatan (TMT)', isRequired: true, type: 'date', group: 'masa_berlaku' },
      { fieldKey: 'skEndDate', label: 'Tanggal Berakhir Masa Jabatan', isRequired: true, type: 'date', group: 'masa_berlaku' }
    ],
    defaultRequirements: [
      { id: 'req-ijazah', name: 'Ijazah Terakhir', isRequired: true, description: 'Scan Ijazah S1/S2/S3 Asli' },
      { id: 'req-nbm', name: 'NBM', isRequired: true, description: 'Scan Kartu Anggota NBM Asli' },
    ]
  }
];

export const DEFAULT_MASTER_SUB_JENIS_SK: MasterSubJenisSk[] = [
  // 1. SUB-JENIS SK GURU
  {
    id: 'sub-guru-gtp',
    skTypeCode: 'GURU',
    skTypeName: 'SK Guru (Pendidik)',
    name: 'GURU TETAP PERSYARIKATAN',
    code: 'GTP',
    titleTemplate: 'PENGANGKATAN GURU TETAP PERSYARIKATAN',
    description: 'Surat Keputusan pengangkatan Guru Tetap Persyarikatan (GTP).',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 1
  },
  {
    id: 'sub-guru-gttp',
    skTypeCode: 'GURU',
    skTypeName: 'SK Guru (Pendidik)',
    name: 'GURU TIDAK TETAP PERSYARIKATAN',
    code: 'GTTP',
    titleTemplate: 'PENGANGKATAN GURU TIDAK TETAP PERSYARIKATAN',
    description: 'Surat Keputusan penetapan Guru Tidak Tetap Persyarikatan (GTTP).',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 2
  },
  {
    id: 'sub-guru-dpk-pns',
    skTypeCode: 'GURU',
    skTypeName: 'SK Guru (Pendidik)',
    name: 'DPK/PNS',
    code: 'DPK-PNS',
    titleTemplate: 'SURAT KEPUTUSAN PENUGASAN GURU DPK/PNS',
    description: 'Surat Keputusan penugasan guru DPK / Pegawai Negeri Sipil di perguruan Muhammadiyah.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 3
  },

  // 2. SUB-JENIS SK TENAGA KEPENDIDIKAN
  {
    id: 'sub-tdk-ktp',
    skTypeCode: 'TENDIK',
    skTypeName: 'SK Tenaga Kependidikan',
    name: 'KARYAWAN TETAP PERSYARIKATAN',
    code: 'KTP',
    titleTemplate: 'PENGANGKATAN KARYAWAN TETAP PERSYARIKATAN',
    description: 'Surat Keputusan pengangkatan Karyawan / Tenaga Kependidikan Tetap Persyarikatan.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 1
  },
  {
    id: 'sub-tdk-kttp',
    skTypeCode: 'TENDIK',
    skTypeName: 'SK Tenaga Kependidikan',
    name: 'KARYAWAN TIDAK TETAP PERSYARIKATAN',
    code: 'KTTP',
    titleTemplate: 'PENGANGKATAN KARYAWAN TIDAK TETAP PERSYARIKATAN',
    description: 'Surat Keputusan penetapan Karyawan / Tenaga Kependidikan Tidak Tetap Persyarikatan.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 2
  },
  {
    id: 'sub-tdk-dpk-pns',
    skTypeCode: 'TENDIK',
    skTypeName: 'SK Tenaga Kependidikan',
    name: 'DPK/PNS',
    code: 'DPK-PNS',
    titleTemplate: 'SURAT KEPUTUSAN PENUGASAN KARYAWAN DPK/PNS',
    description: 'Surat Keputusan penugasan Karyawan / Tenaga Kependidikan DPK/PNS.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 3
  },

  // 3. SUB-JENIS SK KEPALA SEKOLAH
  {
    id: 'sub-ks-pks',
    skTypeCode: 'KS',
    skTypeName: 'SK Kepala Sekolah',
    name: 'Pengangkatan Kepala Sekolah (PKS)',
    code: 'PKS',
    titleTemplate: 'PENGANGKATAN KEPALA SEKOLAH',
    description: 'Surat Keputusan Pengangkatan Kepala Sekolah (PKS) definitif.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 48,
    validityPeriodText: '4 Tahun',
    status: 'Aktif',
    order: 1
  },
  {
    id: 'sub-ks-pmjks',
    skTypeCode: 'KS',
    skTypeName: 'SK Kepala Sekolah',
    name: 'Perpanjangan Masa Jabatan Kepala Sekolah (PMJKS)',
    code: 'PMJKS',
    titleTemplate: 'PERPANJANGAN MASA JABATAN KEPALA SEKOLAH',
    description: 'Surat Keputusan Perpanjangan Masa Jabatan Kepala Sekolah (PMJKS).',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 48,
    validityPeriodText: '4 Tahun',
    status: 'Aktif',
    order: 2
  }
];

/**
 * Returns required document slots strictly based on submission type (Pengajuan Baru vs Perpanjangan SK)
 */
export function getDocumentRequirements(submissionType: SubmissionType = 'Baru'): DocumentRequirement[] {
  if (submissionType === 'Perpanjangan') {
    return [
      {
        id: 'req-sk-lama',
        name: 'SK Lama',
        isRequired: true,
        description: 'Scan Surat Keputusan (SK) Lama / Sebelumnya (PDF/Gambar jelas)',
      },
    ];
  }

  // Default: Pengajuan Baru (hanya Ijazah Terakhir dan NBM)
  return [
    {
      id: 'req-ijazah',
      name: 'Ijazah Terakhir',
      isRequired: true,
      description: 'Scan Ijazah Pendidikan Terakhir Asli (PDF/Gambar jelas)',
    },
    {
      id: 'req-nbm',
      name: 'NBM',
      isRequired: true,
      description: 'Scan Kartu Tanda Anggota NBM (Nomor Baku Muhammadiyah)',
    },
  ];
}

/**
 * Computes dynamic SK document title based on Jenis SK, Sub-Jenis SK, and custom title templates
 */
export function generateSkTitle(jenisName: string, subJenisName?: string, customTitleTemplate?: string): string {
  if (customTitleTemplate && customTitleTemplate.trim() !== '') {
    return customTitleTemplate.toUpperCase().trim();
  }
  if (subJenisName) {
    const matchedSub = DEFAULT_MASTER_SUB_JENIS_SK.find(
      (s) => s.name.toLowerCase() === subJenisName.toLowerCase() || s.code.toLowerCase() === subJenisName.toLowerCase()
    );
    if (matchedSub && matchedSub.titleTemplate) {
      return matchedSub.titleTemplate.toUpperCase();
    }
    return subJenisName.toUpperCase();
  }
  return jenisName.toUpperCase();
}

/**
 * Generates official formatted SK Number according to Jenis SK format pattern
 */
export function generateFormattedSkNumber(formatPattern: string, sequenceNumber: number | string, year: number = new Date().getFullYear()): string {
  const paddedNo = String(sequenceNumber).padStart(3, '0');
  return formatPattern
    .replace(/\[NO\]/g, paddedNo)
    .replace(/\[TAHUN\]/g, String(year))
    .replace(/\[YEAR\]/g, String(year));
}

/**
 * Replaces dynamic variables inside SK template text with actual data
 */
export function renderTemplateVariables(templateStr: string, variables: Record<string, any>): string {
  if (!templateStr) return '';
  let result = templateStr;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    result = result.replace(regex, value !== undefined && value !== null ? String(value) : '-');
  }
  return result;
}
