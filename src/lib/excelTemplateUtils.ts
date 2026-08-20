import * as XLSX from 'xlsx';
import { Sekolah, Guru, Tendik, Siswa } from '../types';

/**
 * Interface for Import Validation Result
 */
export interface ImportPreviewResult<T> {
  validRows: T[];
  invalidRows: { rowNumber: number; data: any; errors: string[] }[];
  totalParsed: number;
}

/**
 * Format date helper (handles Excel serial numbers or text dates)
 */
export function parseExcelDate(val: any): string {
  if (!val) return '';
  if (typeof val === 'number') {
    // Excel date serial number (days since 1899-12-30)
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  const str = String(val).trim();
  // Check if DD/MM/YYYY or DD-MM-YYYY
  const parts = str.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      // DD-MM-YYYY or MM-DD-YYYY
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    } else if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  return str;
}

/**
 * Normalize Gender
 */
export function normalizeGender(val: any): 'Laki-laki' | 'Perempuan' {
  if (!val) return 'Laki-laki';
  const str = String(val).trim().toUpperCase();
  if (str.startsWith('L') || str.startsWith('PRIA') || str === '1') {
    return 'Laki-laki';
  }
  if (str.startsWith('P') || str.startsWith('WANITA') || str === '2') {
    return 'Perempuan';
  }
  return 'Laki-laki';
}

/**
 * Match School ID from name, NPSN, or ID
 */
export function resolveSchoolId(
  input: string | undefined,
  activeSchools: Sekolah[],
  defaultSchoolId?: string
): string {
  if (!input || !input.trim()) {
    return defaultSchoolId || activeSchools[0]?.id || '';
  }

  const clean = input.trim().toLowerCase();

  // Match by ID
  const byId = activeSchools.find((s) => s.id.toLowerCase() === clean);
  if (byId) return byId.id;

  // Match by NPSN
  const byNpsn = activeSchools.find((s) => s.npsn.toLowerCase() === clean);
  if (byNpsn) return byNpsn.id;

  // Match by exact or partial School Name
  const byNameExact = activeSchools.find((s) => s.name.toLowerCase() === clean);
  if (byNameExact) return byNameExact.id;

  const byNameContains = activeSchools.find(
    (s) => s.name.toLowerCase().includes(clean) || clean.includes(s.name.toLowerCase())
  );
  if (byNameContains) return byNameContains.id;

  return defaultSchoolId || activeSchools[0]?.id || '';
}

// ==========================================
// 1. GURU TEMPLATE & PARSER
// ==========================================

export function downloadGuruTemplate(activeSchools: Sekolah[]) {
  const headers = [
    'Nama Lengkap Beserta Gelar *',
    'NIPM (Nomor Induk Pegawai Muhammadiyah)',
    'Satuan Pendidikan / Nama Sekolah *',
    'NPSN Sekolah',
    'Jenis Kelamin (Laki-laki / Perempuan) *',
    'Tempat Lahir',
    'Tanggal Lahir (YYYY-MM-DD)',
    'Status Kepegawaian (GTP / GTTP / PNS / GTY / GTT / PPPK) *',
    'Jenis Guru (Guru Kelas / Guru Mata Pelajaran)',
    'Mata Pelajaran / Tugas Mengajar *',
    'NUPTK',
    'NRG',
    'NIP',
    'NBM',
    'Sudah PPG? (Sudah / Belum)',
    'Sertifikasi? (Sudah / Belum)',
    'Inpassing? (Sudah / Belum)',
    'Pendidikan Terakhir (S1 / S2 / S3 / D3)',
    'Program Studi / Jurusan',
    'TMT Pengangkatan (YYYY-MM-DD)',
    'Nomor SK Pengangkatan',
    'No HP / WhatsApp Aktif',
    'Email',
    'Ortom / Ranting Persyarikatan',
    'Tingkat Persyarikatan (Ranting/Cabang/Daerah)',
    'Keaktifan Persyarikatan (Sangat Aktif/Aktif/Cukup)',
    'Alamat Lengkap',
    'RT/RW',
    'Kelurahan/Desa',
    'Kecamatan',
    'Kabupaten/Kota',
    'Kode Pos',
  ];

  const sampleRows = [
    [
      'Drs. H. Ahmad Dahlan, M.Pd.',
      '197508122002011001',
      activeSchools[0]?.name || 'SMA Muhammadiyah 1 Klaten',
      activeSchools[0]?.npsn || '20309695',
      'Laki-laki',
      'Klaten',
      '1975-08-12',
      'GTP',
      'Guru Mata Pelajaran',
      'Pendidikan Agama Islam & Kemuhammadiyahan',
      '1234567890123456',
      '987654321',
      '',
      '1054321',
      'Sudah',
      'Sudah',
      'Sudah',
      'S2',
      'Pendidikan Agama Islam',
      '2005-07-01',
      'SK-DIKDASMEN/2005/012',
      '081234567890',
      'ahmaddahlan@gmail.com',
      'Pimpinan Cabang Muhammadiyah',
      'Cabang',
      'Sangat Aktif',
      'Jl. Pemuda No. 12, Klaten Tengah',
      '02/05',
      'Bareng',
      'Klaten Tengah',
      'Klaten',
      '57411',
    ],
    [
      'Siti Walidah, S.Pd.',
      '198804152015032002',
      activeSchools[1]?.name || 'SMP Muhammadiyah 1 Klaten',
      activeSchools[1]?.npsn || '20309653',
      'Perempuan',
      'Klaten',
      '1988-04-15',
      'GTTP',
      'Guru Mata Pelajaran',
      'Matematika',
      '2345678901234567',
      '',
      '',
      '1065432',
      'Sudah',
      'Belum',
      'Belum',
      'S1',
      'Pendidikan Matematika',
      '2015-08-01',
      'SK-DIKDASMEN/2015/088',
      '085678901234',
      'siti.walidah@gmail.com',
      'Nasyiatul Aisyiyah',
      'Cabang',
      'Aktif',
      'Jl. Veteran No. 45, Barenglor',
      '01/03',
      'Barenglor',
      'Klaten Tengah',
      'Klaten',
      '57412',
    ],
  ];

  const wsData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 3, 16) }));

  // Guide sheet
  const guideData = [
    ['PANDUAN PENGISIAN DATA GURU / PENDIDIK'],
    ['1. Kolom bertanda (*) WAJIB diisi (Nama, Satuan Pendidikan, Jenis Kelamin, Status Kepegawaian, Mapel).'],
    ['2. Nama Satuan Pendidikan atau NPSN Sekolah harus sesuai dengan referensi yang terdaftar di sistem.'],
    ['3. Format Tanggal disarankan: YYYY-MM-DD (Contoh: 1985-06-15) atau teks standar tanggal.'],
    ['4. Pilihan Jenis Kelamin: Laki-laki atau Perempuan (Bisa ditulis L / P).'],
    ['5. Pilihan Status Kepegawaian: GTP, GTTP, PNS, GTY, GTT, PPPK.'],
    ['6. Jangan mengubah susunan baris pertama (Header). Silakan hapus baris contoh sebelum import jika tidak diperlukan.'],
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet(guideData);

  // School Reference sheet
  const schoolRefHeaders = ['NPSN', 'Nama Satuan Pendidikan', 'Jenjang', 'Cabang / PCM'];
  const schoolRefRows = activeSchools.map((s) => [s.npsn, s.name, s.level, s.cabangId]);
  const wsSchoolRef = XLSX.utils.aoa_to_sheet([schoolRefHeaders, ...schoolRefRows]);
  wsSchoolRef['!cols'] = [{ wch: 15 }, { wch: 35 }, { wch: 10 }, { wch: 25 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Format_Data_Guru');
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk_Pengisian');
  XLSX.utils.book_append_sheet(wb, wsSchoolRef, 'Referensi_Sekolah');

  XLSX.writeFile(wb, 'Format_Import_Data_Guru_Dikdasmen.xlsx');
}

export function parseGuruExcel(
  sheetData: any[][],
  activeSchools: Sekolah[],
  defaultSchoolId?: string
): ImportPreviewResult<Omit<Guru, 'id'>> {
  if (!sheetData || sheetData.length < 2) {
    return { validRows: [], invalidRows: [], totalParsed: 0 };
  }

  const headerRow = sheetData[0].map((h) => String(h || '').trim().toLowerCase());

  // Detect column indexes
  const colName = headerRow.findIndex((h) => h.includes('nama') && !h.includes('sekolah') && !h.includes('ortom'));
  const colNipm = headerRow.findIndex((h) => h.includes('nipm'));
  const colSchool = headerRow.findIndex((h) => h.includes('satuan') || h.includes('sekolah') || h.includes('madrasah'));
  const colNpsn = headerRow.findIndex((h) => h.includes('npsn'));
  const colGender = headerRow.findIndex((h) => h.includes('kelamin') || h === 'jk' || h === 'gender' || h === 'l/p');
  const colBirthPlace = headerRow.findIndex((h) => h.includes('tempat') && h.includes('lahir'));
  const colBirthDate = headerRow.findIndex((h) => h.includes('tanggal') && h.includes('lahir'));
  const colStatus = headerRow.findIndex((h) => h.includes('status') && (h.includes('pegawai') || h.includes('kepegawaian') || h.includes('guru')));
  const colTeacherType = headerRow.findIndex((h) => h.includes('jenis guru') || h.includes('tipe guru'));
  const colSubject = headerRow.findIndex((h) => h.includes('mapel') || h.includes('mata pelajaran') || h.includes('tugas mengajar') || h.includes('ampu'));
  const colNuptk = headerRow.findIndex((h) => h.includes('nuptk'));
  const colNrg = headerRow.findIndex((h) => h.includes('nrg'));
  const colNip = headerRow.findIndex((h) => h === 'nip');
  const colNbm = headerRow.findIndex((h) => h.includes('nbm'));
  const colPpg = headerRow.findIndex((h) => h.includes('ppg'));
  const colSertifikasi = headerRow.findIndex((h) => h.includes('sertifikasi') || h.includes('serdik'));
  const colInpassing = headerRow.findIndex((h) => h.includes('inpassing'));
  const colEducation = headerRow.findIndex((h) => h.includes('pendidikan') && !h.includes('satuan'));
  const colStudyProgram = headerRow.findIndex((h) => h.includes('prodi') || h.includes('jurusan') || h.includes('program studi'));
  const colTmt = headerRow.findIndex((h) => h.includes('tmt'));
  const colSkNumber = headerRow.findIndex((h) => h.includes('sk') && (h.includes('nomor') || h.includes('no')));
  const colPhone = headerRow.findIndex((h) => h.includes('hp') || h.includes('telepon') || h.includes('wa') || h.includes('phone'));
  const colEmail = headerRow.findIndex((h) => h.includes('email'));
  const colOrtom = headerRow.findIndex((h) => h.includes('ortom') || h.includes('persyarikatan'));
  const colLevel = headerRow.findIndex((h) => h.includes('tingkat') && h.includes('persyarikatan'));
  const colActivity = headerRow.findIndex((h) => h.includes('keaktifan'));
  const colAddress = headerRow.findIndex((h) => h.includes('alamat'));
  const colRtRw = headerRow.findIndex((h) => h.includes('rt') || h.includes('rw'));
  const colKelurahan = headerRow.findIndex((h) => h.includes('kelurahan') || h.includes('desa'));
  const colKecamatan = headerRow.findIndex((h) => h.includes('kecamatan'));
  const colKabupaten = headerRow.findIndex((h) => h.includes('kabupaten') || h.includes('kota'));
  const colKodePos = headerRow.findIndex((h) => h.includes('pos'));

  const validRows: Omit<Guru, 'id'>[] = [];
  const invalidRows: { rowNumber: number; data: any; errors: string[] }[] = [];

  for (let r = 1; r < sheetData.length; r++) {
    const row = sheetData[r];
    if (!row || row.every((c) => c === undefined || c === null || String(c).trim() === '')) {
      continue; // Skip empty rows
    }

    const name = String(row[colName >= 0 ? colName : 0] || '').trim();
    const rawSchool = (colSchool >= 0 ? row[colSchool] : '') || (colNpsn >= 0 ? row[colNpsn] : '');
    const schoolId = resolveSchoolId(rawSchool ? String(rawSchool) : undefined, activeSchools, defaultSchoolId);

    const errors: string[] = [];
    if (!name) errors.push('Nama Guru tidak boleh kosong');
    if (!schoolId) errors.push('Satuan Pendidikan / Sekolah tidak valid');

    const rawStatus = colStatus >= 0 ? String(row[colStatus] || '').trim().toUpperCase() : 'GTP';
    const status = (['GTP', 'GTTP', 'PNS', 'GTY', 'GTT', 'PPPK'].includes(rawStatus) ? rawStatus : 'GTP') as any;

    const rawSubject = colSubject >= 0 ? String(row[colSubject] || '').trim() : 'Guru Mata Pelajaran';
    const subject = rawSubject || 'Guru Mata Pelajaran';

    const rawPpg = colPpg >= 0 ? String(row[colPpg] || '').trim().toLowerCase() : '';
    const hasPpg = rawPpg.startsWith('sudah') || rawPpg.startsWith('ya') || rawPpg === '1' ? 'Sudah' : 'Belum';

    const rawCert = colSertifikasi >= 0 ? String(row[colSertifikasi] || '').trim().toLowerCase() : '';
    const isCertified = rawCert.startsWith('sudah') || rawCert.startsWith('ya') || rawCert === '1' || rawCert === 'true';

    const rawInpassing = colInpassing >= 0 ? String(row[colInpassing] || '').trim().toLowerCase() : '';
    const isInpassing = rawInpassing.startsWith('sudah') || rawInpassing.startsWith('ya') || rawInpassing === '1' ? 'Sudah' : 'Belum';

    const guruData: Omit<Guru, 'id'> = {
      name,
      nipm: colNipm >= 0 && row[colNipm] ? String(row[colNipm]).trim() : '',
      schoolId,
      gender: normalizeGender(colGender >= 0 ? row[colGender] : undefined),
      birthPlace: colBirthPlace >= 0 && row[colBirthPlace] ? String(row[colBirthPlace]).trim() : 'Klaten',
      birthDate: colBirthDate >= 0 ? parseExcelDate(row[colBirthDate]) : '',
      status,
      teacherType: (colTeacherType >= 0 && String(row[colTeacherType]).includes('Kelas') ? 'Guru Kelas' : 'Guru Mata Pelajaran') as any,
      subject,
      nuptk: colNuptk >= 0 && row[colNuptk] ? String(row[colNuptk]).trim() : '',
      nrg: colNrg >= 0 && row[colNrg] ? String(row[colNrg]).trim() : '',
      nip: colNip >= 0 && row[colNip] ? String(row[colNip]).trim() : '',
      nbm: colNbm >= 0 && row[colNbm] ? String(row[colNbm]).trim() : '',
      hasPpg,
      isCertified,
      isInpassing,
      education: colEducation >= 0 && row[colEducation] ? String(row[colEducation]).trim() : 'S1',
      studyProgram: colStudyProgram >= 0 && row[colStudyProgram] ? String(row[colStudyProgram]).trim() : '',
      tmtPengangkatan: colTmt >= 0 ? parseExcelDate(row[colTmt]) : '',
      skNumber: colSkNumber >= 0 && row[colSkNumber] ? String(row[colSkNumber]).trim() : '',
      phone: colPhone >= 0 && row[colPhone] ? String(row[colPhone]).trim() : '',
      email: colEmail >= 0 && row[colEmail] ? String(row[colEmail]).trim() : '',
      persyarikatanOrtom: colOrtom >= 0 && row[colOrtom] ? String(row[colOrtom]).trim() : '',
      persyarikatanLevel: colLevel >= 0 && row[colLevel] ? String(row[colLevel]).trim() : '',
      persyarikatanActivity: colActivity >= 0 && row[colActivity] ? String(row[colActivity]).trim() : 'Aktif',
      address: colAddress >= 0 && row[colAddress] ? String(row[colAddress]).trim() : '',
      rtRw: colRtRw >= 0 && row[colRtRw] ? String(row[colRtRw]).trim() : '',
      kelurahan: colKelurahan >= 0 && row[colKelurahan] ? String(row[colKelurahan]).trim() : '',
      kecamatan: colKecamatan >= 0 && row[colKecamatan] ? String(row[colKecamatan]).trim() : '',
      kabupaten: colKabupaten >= 0 && row[colKabupaten] ? String(row[colKabupaten]).trim() : 'Klaten',
      kodePos: colKodePos >= 0 && row[colKodePos] ? String(row[colKodePos]).trim() : '',
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    if (errors.length > 0) {
      invalidRows.push({ rowNumber: r + 1, data: row, errors });
    } else {
      validRows.push(guruData);
    }
  }

  return {
    validRows,
    invalidRows,
    totalParsed: validRows.length + invalidRows.length,
  };
}

// ==========================================
// 2. TENDIK TEMPLATE & PARSER
// ==========================================

export function downloadTendikTemplate(activeSchools: Sekolah[]) {
  const headers = [
    'Nama Lengkap Beserta Gelar *',
    'NIPM (Nomor Induk Pegawai Muhammadiyah)',
    'Satuan Pendidikan / Nama Sekolah *',
    'NPSN Sekolah',
    'Jenis Kelamin (Laki-laki / Perempuan) *',
    'Tempat Lahir',
    'Tanggal Lahir (YYYY-MM-DD)',
    'Status Kepegawaian (KTP / KTTP / PNS / KTY / KTT) *',
    'Jenis Karyawan / Posisi Jabatan (Staff TU / Operator / Bendahara / Laboran / Pustakawan / Satpam / Kebersihan) *',
    'NBM (Nomor Baku Muhammadiyah)',
    'NIP',
    'Pendidikan Terakhir (S1 / D3 / SMA / SMK)',
    'Program Studi / Jurusan',
    'TMT Pengangkatan (YYYY-MM-DD)',
    'Nomor SK Pengangkatan',
    'No HP / WhatsApp Aktif',
    'Email',
    'Ortom / Ranting Persyarikatan',
    'Tingkat Persyarikatan (Ranting/Cabang/Daerah)',
    'Keaktifan Persyarikatan (Sangat Aktif/Aktif/Cukup)',
    'Alamat Lengkap',
    'RT/RW',
    'Kelurahan/Desa',
    'Kecamatan',
    'Kabupaten/Kota',
    'Kode Pos',
  ];

  const sampleRows = [
    [
      'Bambang Wijaya, S.Kom.',
      '199203102018021003',
      activeSchools[0]?.name || 'SMA Muhammadiyah 1 Klaten',
      activeSchools[0]?.npsn || '20309695',
      'Laki-laki',
      'Klaten',
      '1992-03-10',
      'KTP',
      'Operator Sekolah & Dapodik',
      '1078901',
      '',
      'S1',
      'Teknik Informatika',
      '2018-02-01',
      'SK-DIKDASMEN/2018/044',
      '081398765432',
      'bambang.wijaya@gmail.com',
      'Pemuda Muhammadiyah',
      'Cabang',
      'Aktif',
      'Jl. Pemuda No. 88, Klaten',
      '03/02',
      'Bareng',
      'Klaten Tengah',
      'Klaten',
      '57411',
    ],
    [
      'Endang Suryani, A.Md.',
      '199507202020012004',
      activeSchools[1]?.name || 'SMP Muhammadiyah 1 Klaten',
      activeSchools[1]?.npsn || '20309653',
      'Perempuan',
      'Klaten',
      '1995-07-20',
      'KTTP',
      'Bendahara & Tata Usaha',
      '1089012',
      '',
      'D3',
      'Akuntansi',
      '2020-01-15',
      'SK-DIKDASMEN/2020/019',
      '082134567890',
      'endang.suryani@gmail.com',
      'Nasyiatul Aisyiyah',
      'Ranting',
      'Aktif',
      'Jl. Veteran No. 12, Barenglor',
      '02/04',
      'Barenglor',
      'Klaten Tengah',
      'Klaten',
      '57412',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 3, 16) }));

  const guideData = [
    ['PANDUAN PENGISIAN DATA TENAGA KEPENDIDIKAN (TENDIK)'],
    ['1. Kolom bertanda (*) WAJIB diisi (Nama, Satuan Pendidikan, Jenis Kelamin, Status, Posisi Jabatan).'],
    ['2. Posisi Jabatan: Staff TU, Operator Dapodik, Bendahara, Pustakawan, Laboran, Satpam, Penjaga Sekolah, dll.'],
    ['3. Status Kepegawaian: KTP (Karyawan Tetap Persyarikatan), KTTP, PNS, KTY, KTT.'],
    ['4. Format Tanggal disarankan: YYYY-MM-DD (Contoh: 1990-11-20).'],
    ['5. Jangan mengubah susunan baris pertama (Header).'],
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet(guideData);

  const schoolRefHeaders = ['NPSN', 'Nama Satuan Pendidikan', 'Jenjang', 'Cabang / PCM'];
  const schoolRefRows = activeSchools.map((s) => [s.npsn, s.name, s.level, s.cabangId]);
  const wsSchoolRef = XLSX.utils.aoa_to_sheet([schoolRefHeaders, ...schoolRefRows]);
  wsSchoolRef['!cols'] = [{ wch: 15 }, { wch: 35 }, { wch: 10 }, { wch: 25 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Format_Data_Tendik');
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk_Pengisian');
  XLSX.utils.book_append_sheet(wb, wsSchoolRef, 'Referensi_Sekolah');

  XLSX.writeFile(wb, 'Format_Import_Data_Tendik_Dikdasmen.xlsx');
}

export function parseTendikExcel(
  sheetData: any[][],
  activeSchools: Sekolah[],
  defaultSchoolId?: string
): ImportPreviewResult<Omit<Tendik, 'id'>> {
  if (!sheetData || sheetData.length < 2) {
    return { validRows: [], invalidRows: [], totalParsed: 0 };
  }

  const headerRow = sheetData[0].map((h) => String(h || '').trim().toLowerCase());

  const colName = headerRow.findIndex((h) => h.includes('nama') && !h.includes('sekolah') && !h.includes('ortom'));
  const colNipm = headerRow.findIndex((h) => h.includes('nipm'));
  const colSchool = headerRow.findIndex((h) => h.includes('satuan') || h.includes('sekolah') || h.includes('madrasah'));
  const colNpsn = headerRow.findIndex((h) => h.includes('npsn'));
  const colGender = headerRow.findIndex((h) => h.includes('kelamin') || h === 'jk' || h === 'gender' || h === 'l/p');
  const colBirthPlace = headerRow.findIndex((h) => h.includes('tempat') && h.includes('lahir'));
  const colBirthDate = headerRow.findIndex((h) => h.includes('tanggal') && h.includes('lahir'));
  const colStatus = headerRow.findIndex((h) => h.includes('status') && (h.includes('pegawai') || h.includes('kepegawaian') || h.includes('tendik') || h.includes('karyawan')));
  const colPosition = headerRow.findIndex((h) => h.includes('posisi') || h.includes('jabatan') || h.includes('tugas') || h.includes('jenis karyawan'));
  const colNbm = headerRow.findIndex((h) => h.includes('nbm'));
  const colNip = headerRow.findIndex((h) => h === 'nip');
  const colEducation = headerRow.findIndex((h) => h.includes('pendidikan') && !h.includes('satuan'));
  const colStudyProgram = headerRow.findIndex((h) => h.includes('prodi') || h.includes('jurusan') || h.includes('program studi'));
  const colTmt = headerRow.findIndex((h) => h.includes('tmt'));
  const colSkNumber = headerRow.findIndex((h) => h.includes('sk') && (h.includes('nomor') || h.includes('no')));
  const colPhone = headerRow.findIndex((h) => h.includes('hp') || h.includes('telepon') || h.includes('wa') || h.includes('phone'));
  const colEmail = headerRow.findIndex((h) => h.includes('email'));
  const colOrtom = headerRow.findIndex((h) => h.includes('ortom') || h.includes('persyarikatan'));
  const colLevel = headerRow.findIndex((h) => h.includes('tingkat') && h.includes('persyarikatan'));
  const colActivity = headerRow.findIndex((h) => h.includes('keaktifan'));
  const colAddress = headerRow.findIndex((h) => h.includes('alamat'));
  const colRtRw = headerRow.findIndex((h) => h.includes('rt') || h.includes('rw'));
  const colKelurahan = headerRow.findIndex((h) => h.includes('kelurahan') || h.includes('desa'));
  const colKecamatan = headerRow.findIndex((h) => h.includes('kecamatan'));
  const colKabupaten = headerRow.findIndex((h) => h.includes('kabupaten') || h.includes('kota'));
  const colKodePos = headerRow.findIndex((h) => h.includes('pos'));

  const validRows: Omit<Tendik, 'id'>[] = [];
  const invalidRows: { rowNumber: number; data: any; errors: string[] }[] = [];

  for (let r = 1; r < sheetData.length; r++) {
    const row = sheetData[r];
    if (!row || row.every((c) => c === undefined || c === null || String(c).trim() === '')) {
      continue;
    }

    const name = String(row[colName >= 0 ? colName : 0] || '').trim();
    const rawSchool = (colSchool >= 0 ? row[colSchool] : '') || (colNpsn >= 0 ? row[colNpsn] : '');
    const schoolId = resolveSchoolId(rawSchool ? String(rawSchool) : undefined, activeSchools, defaultSchoolId);

    const errors: string[] = [];
    if (!name) errors.push('Nama Tendik tidak boleh kosong');
    if (!schoolId) errors.push('Satuan Pendidikan / Sekolah tidak valid');

    const rawStatus = colStatus >= 0 ? String(row[colStatus] || '').trim().toUpperCase() : 'KTP';
    const status = (['KTP', 'KTTP', 'KTY', 'KTT', 'PNS'].includes(rawStatus) ? rawStatus : 'KTP') as any;

    const rawPosition = colPosition >= 0 ? String(row[colPosition] || '').trim() : 'Staff Tata Usaha';
    const position = rawPosition || 'Staff Tata Usaha';

    const tendikData: Omit<Tendik, 'id'> = {
      name,
      nipm: colNipm >= 0 && row[colNipm] ? String(row[colNipm]).trim() : '',
      schoolId,
      gender: normalizeGender(colGender >= 0 ? row[colGender] : undefined),
      birthPlace: colBirthPlace >= 0 && row[colBirthPlace] ? String(row[colBirthPlace]).trim() : 'Klaten',
      birthDate: colBirthDate >= 0 ? parseExcelDate(row[colBirthDate]) : '',
      status,
      position,
      nbm: colNbm >= 0 && row[colNbm] ? String(row[colNbm]).trim() : '',
      nip: colNip >= 0 && row[colNip] ? String(row[colNip]).trim() : '',
      education: colEducation >= 0 && row[colEducation] ? String(row[colEducation]).trim() : 'SMA / SMK',
      studyProgram: colStudyProgram >= 0 && row[colStudyProgram] ? String(row[colStudyProgram]).trim() : '',
      tmtPengangkatan: colTmt >= 0 ? parseExcelDate(row[colTmt]) : '',
      skNumber: colSkNumber >= 0 && row[colSkNumber] ? String(row[colSkNumber]).trim() : '',
      phone: colPhone >= 0 && row[colPhone] ? String(row[colPhone]).trim() : '',
      email: colEmail >= 0 && row[colEmail] ? String(row[colEmail]).trim() : '',
      persyarikatanOrtom: colOrtom >= 0 && row[colOrtom] ? String(row[colOrtom]).trim() : '',
      persyarikatanLevel: colLevel >= 0 && row[colLevel] ? String(row[colLevel]).trim() : '',
      persyarikatanActivity: colActivity >= 0 && row[colActivity] ? String(row[colActivity]).trim() : 'Aktif',
      address: colAddress >= 0 && row[colAddress] ? String(row[colAddress]).trim() : '',
      rtRw: colRtRw >= 0 && row[colRtRw] ? String(row[colRtRw]).trim() : '',
      kelurahan: colKelurahan >= 0 && row[colKelurahan] ? String(row[colKelurahan]).trim() : '',
      kecamatan: colKecamatan >= 0 && row[colKecamatan] ? String(row[colKecamatan]).trim() : '',
      kabupaten: colKabupaten >= 0 && row[colKabupaten] ? String(row[colKabupaten]).trim() : 'Klaten',
      kodePos: colKodePos >= 0 && row[colKodePos] ? String(row[colKodePos]).trim() : '',
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    if (errors.length > 0) {
      invalidRows.push({ rowNumber: r + 1, data: row, errors });
    } else {
      validRows.push(tendikData);
    }
  }

  return {
    validRows,
    invalidRows,
    totalParsed: validRows.length + invalidRows.length,
  };
}

// ==========================================
// 3. SISWA TEMPLATE & PARSER
// ==========================================

export function downloadSiswaTemplate(activeSchools: Sekolah[]) {
  const headers = [
    'Nama Lengkap Peserta Didik *',
    'NISN (Nomor Induk Siswa Nasional) *',
    'NIS / Nomor Induk Sekolah',
    'Satuan Pendidikan / Nama Sekolah *',
    'NPSN Sekolah',
    'Jenis Kelamin (Laki-laki / Perempuan) *',
    'Kelas / Rombel (Contoh: VII A, X MIPA 1, 1 SD) *',
    'Tempat Lahir',
    'Tanggal Lahir (YYYY-MM-DD)',
    'Nama Orang Tua / Wali',
    'No HP / WhatsApp Orang Tua',
    'No HP Siswa',
    'Status Siswa (Aktif / Lulus / Mutasi)',
    'Alamat Lengkap Siswa',
    'RT/RW',
    'Kelurahan/Desa',
    'Kecamatan',
    'Kabupaten/Kota',
    'Kode Pos',
  ];

  const sampleRows = [
    [
      'Muhammad Al-Fatih Pratama',
      '0081234567',
      '202401001',
      activeSchools[0]?.name || 'SMA Muhammadiyah 1 Klaten',
      activeSchools[0]?.npsn || '20309695',
      'Laki-laki',
      'X MIPA 1',
      'Klaten',
      '2008-05-14',
      'H. Agus Prasetyo',
      '081234567890',
      '089876543210',
      'Aktif',
      'Perum Bareng Indah Blok C No. 5',
      '04/08',
      'Bareng',
      'Klaten Tengah',
      'Klaten',
      '57411',
    ],
    [
      'Aisyah Rahmawati Putri',
      '0098765432',
      '202401002',
      activeSchools[1]?.name || 'SMP Muhammadiyah 1 Klaten',
      activeSchools[1]?.npsn || '20309653',
      'Perempuan',
      'VII Tahfidz A',
      'Klaten',
      '2011-09-22',
      'Hj. Nurul Hidayah',
      '085678901234',
      '',
      'Aktif',
      'Jl. Merbabu No. 18, Gayamprit',
      '02/03',
      'Gayamprit',
      'Klaten Selatan',
      'Klaten',
      '57421',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 3, 16) }));

  const guideData = [
    ['PANDUAN PENGISIAN DATA PESERTA DIDIK (SISWA)'],
    ['1. Kolom bertanda (*) WAJIB diisi (Nama, NISN, Satuan Pendidikan, Jenis Kelamin, Kelas).'],
    ['2. NISN harus berupa angka 10 digit yang valid.'],
    ['3. Kelas/Rombel: Isikan tingkat dan rombel kelas (misal: VII A, X MIPA 1, Kelas 1, dsb).'],
    ['4. Status Siswa: Aktif / Lulus / Mutasi (Default: Aktif).'],
    ['5. Format Tanggal disarankan: YYYY-MM-DD (Contoh: 2009-08-17).'],
    ['6. Jangan mengubah susunan baris pertama (Header).'],
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet(guideData);

  const schoolRefHeaders = ['NPSN', 'Nama Satuan Pendidikan', 'Jenjang', 'Cabang / PCM'];
  const schoolRefRows = activeSchools.map((s) => [s.npsn, s.name, s.level, s.cabangId]);
  const wsSchoolRef = XLSX.utils.aoa_to_sheet([schoolRefHeaders, ...schoolRefRows]);
  wsSchoolRef['!cols'] = [{ wch: 15 }, { wch: 35 }, { wch: 10 }, { wch: 25 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Format_Data_Siswa');
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk_Pengisian');
  XLSX.utils.book_append_sheet(wb, wsSchoolRef, 'Referensi_Sekolah');

  XLSX.writeFile(wb, 'Format_Import_Data_Siswa_Dikdasmen.xlsx');
}

export function parseSiswaExcel(
  sheetData: any[][],
  activeSchools: Sekolah[],
  defaultSchoolId?: string
): ImportPreviewResult<Omit<Siswa, 'id'>> {
  if (!sheetData || sheetData.length < 2) {
    return { validRows: [], invalidRows: [], totalParsed: 0 };
  }

  const headerRow = sheetData[0].map((h) => String(h || '').trim().toLowerCase());

  const colName = headerRow.findIndex((h) => h.includes('nama') && !h.includes('sekolah') && !h.includes('orang') && !h.includes('wali'));
  const colNisn = headerRow.findIndex((h) => h.includes('nisn'));
  const colNis = headerRow.findIndex((h) => h === 'nis' || h.includes('nomor induk sekolah'));
  const colSchool = headerRow.findIndex((h) => h.includes('satuan') || h.includes('sekolah') || h.includes('madrasah'));
  const colNpsn = headerRow.findIndex((h) => h.includes('npsn'));
  const colGender = headerRow.findIndex((h) => h.includes('kelamin') || h === 'jk' || h === 'gender' || h === 'l/p');
  const colClass = headerRow.findIndex((h) => h.includes('kelas') || h.includes('rombel') || h.includes('tingkat'));
  const colBirthPlace = headerRow.findIndex((h) => h.includes('tempat') && h.includes('lahir'));
  const colBirthDate = headerRow.findIndex((h) => h.includes('tanggal') && h.includes('lahir'));
  const colGuardian = headerRow.findIndex((h) => h.includes('orang tua') || h.includes('wali') || h.includes('ayah') || h.includes('ibu'));
  const colGuardianPhone = headerRow.findIndex((h) => (h.includes('hp') || h.includes('telepon') || h.includes('wa')) && (h.includes('orang tua') || h.includes('wali')));
  const colPhone = headerRow.findIndex((h) => (h.includes('hp') || h.includes('telepon') || h.includes('wa')) && !h.includes('orang tua') && !h.includes('wali'));
  const colStatus = headerRow.findIndex((h) => h.includes('status'));
  const colAddress = headerRow.findIndex((h) => h.includes('alamat'));
  const colRtRw = headerRow.findIndex((h) => h.includes('rt') || h.includes('rw'));
  const colKelurahan = headerRow.findIndex((h) => h.includes('kelurahan') || h.includes('desa'));
  const colKecamatan = headerRow.findIndex((h) => h.includes('kecamatan'));
  const colKabupaten = headerRow.findIndex((h) => h.includes('kabupaten') || h.includes('kota'));
  const colKodePos = headerRow.findIndex((h) => h.includes('pos'));

  const validRows: Omit<Siswa, 'id'>[] = [];
  const invalidRows: { rowNumber: number; data: any; errors: string[] }[] = [];

  for (let r = 1; r < sheetData.length; r++) {
    const row = sheetData[r];
    if (!row || row.every((c) => c === undefined || c === null || String(c).trim() === '')) {
      continue;
    }

    const name = String(row[colName >= 0 ? colName : 0] || '').trim();
    const rawSchool = (colSchool >= 0 ? row[colSchool] : '') || (colNpsn >= 0 ? row[colNpsn] : '');
    const schoolId = resolveSchoolId(rawSchool ? String(rawSchool) : undefined, activeSchools, defaultSchoolId);
    const rawNisn = colNisn >= 0 ? String(row[colNisn] || '').trim() : '';

    const errors: string[] = [];
    if (!name) errors.push('Nama Peserta Didik tidak boleh kosong');
    if (!rawNisn) errors.push('NISN tidak boleh kosong');
    if (!schoolId) errors.push('Satuan Pendidikan / Sekolah tidak valid');

    const rawClass = colClass >= 0 ? String(row[colClass] || '').trim() : 'Kelas 1';
    const className = rawClass || 'Kelas 1';

    const rawStatus = colStatus >= 0 ? String(row[colStatus] || '').trim() : 'Aktif';
    const status = (['Aktif', 'Lulus', 'Mutasi'].includes(rawStatus) ? rawStatus : 'Aktif') as any;

    const siswaData: Omit<Siswa, 'id'> = {
      name,
      nisn: rawNisn || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      nis: colNis >= 0 && row[colNis] ? String(row[colNis]).trim() : '',
      schoolId,
      gender: normalizeGender(colGender >= 0 ? row[colGender] : undefined),
      class: className,
      classGrade: className,
      birthPlace: colBirthPlace >= 0 && row[colBirthPlace] ? String(row[colBirthPlace]).trim() : 'Klaten',
      birthDate: colBirthDate >= 0 ? parseExcelDate(row[colBirthDate]) : '',
      guardianName: colGuardian >= 0 && row[colGuardian] ? String(row[colGuardian]).trim() : '',
      guardianPhone: colGuardianPhone >= 0 && row[colGuardianPhone] ? String(row[colGuardianPhone]).trim() : '',
      phone: colPhone >= 0 && row[colPhone] ? String(row[colPhone]).trim() : '',
      status,
      address: colAddress >= 0 && row[colAddress] ? String(row[colAddress]).trim() : '',
      rtRw: colRtRw >= 0 && row[colRtRw] ? String(row[colRtRw]).trim() : '',
      kelurahan: colKelurahan >= 0 && row[colKelurahan] ? String(row[colKelurahan]).trim() : '',
      kecamatan: colKecamatan >= 0 && row[colKecamatan] ? String(row[colKecamatan]).trim() : '',
      kabupaten: colKabupaten >= 0 && row[colKabupaten] ? String(row[colKabupaten]).trim() : 'Klaten',
      kodePos: colKodePos >= 0 && row[colKodePos] ? String(row[colKodePos]).trim() : '',
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    if (errors.length > 0) {
      invalidRows.push({ rowNumber: r + 1, data: row, errors });
    } else {
      validRows.push(siswaData);
    }
  }

  return {
    validRows,
    invalidRows,
    totalParsed: validRows.length + invalidRows.length,
  };
}
