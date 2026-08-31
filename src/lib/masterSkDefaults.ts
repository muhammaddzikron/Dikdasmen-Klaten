import { MasterJenisSk, MasterSubJenisSk } from '../types';

export const DEFAULT_MASTER_JENIS_SK: MasterJenisSk[] = [
  {
    id: 'sk-guru',
    name: 'SK Guru (Pendidik)',
    code: 'GURU',
    description: 'Digunakan untuk pengajuan SK yang berkaitan dengan tenaga pendidik/guru (GTY, GTP, Guru Kelas, Mapel, perpanjangan, mutasi, dan revisi SK).',
    recipientType: 'INDIVIDU',
    numberFormat: '[NO]/KEP/GURU/[TAHUN]',
    status: 'Aktif',
    order: 1,
    kopText: 'MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL\nPIMPINAN DAERAH MUHAMMADIYAH',
    signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
    signerRole: 'Ketua Majelis Dikdasmen & PNF Daerah',
    menimbang: [
      'Bahwa dalam rangka kelancaran proses belajar mengajar serta pembinaan mutu pendidikan di lingkungan perguruan Muhammadiyah, dipandang perlu mengangkat/memperpanjang Surat Keputusan Guru;',
      'Bahwa berdasarkan hasil evaluasi kinerja dan usulan dari Satuan Pendidikan serta Pimpinan Cabang Muhammadiyah setempat, yang bersangkutan dipandang cakap dan memenuhi syarat untuk melaksanakan tugas tersebut;',
      'Bahwa sehubungan dengan butir a dan b di atas, perlu diterbitkan Surat Keputusan Majelis Dikdasmen & PNF Pimpinan Daerah Muhammadiyah.'
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
      { fieldKey: 'position', label: 'Jabatan Guru', isRequired: true, type: 'select', options: ['Guru Tetap Yayasan (GTY)', 'Guru Tetap Persyarikatan (GTP)', 'Guru Tidak Tetap (GTT)', 'Guru Kelas', 'Guru Mata Pelajaran', 'Guru BK / Konselor', 'Guru Pendamping'], group: 'kepegawaian' },
      { fieldKey: 'subject', label: 'Mata Pelajaran / Bidang Tugas', isRequired: true, type: 'text', placeholder: 'Contoh: Matematika / Guru Kelas V', group: 'kepegawaian' },
      { fieldKey: 'statusKepegawaian', label: 'Status Kepegawaian', isRequired: true, type: 'select', options: ['GTY', 'GTP', 'GTT', 'PNS DPK', 'PPPK'], group: 'kepegawaian' },
      { fieldKey: 'skStartDate', label: 'Tanggal Mulai Berlaku (TMT)', isRequired: true, type: 'date', group: 'masa_berlaku' },
      { fieldKey: 'skEndDate', label: 'Tanggal Berakhir Berlaku', isRequired: true, type: 'date', group: 'masa_berlaku' }
    ],
    defaultRequirements: [
      { id: 'req-ijazah', name: 'Ijazah Terakhir', isRequired: true, description: 'Scan Ijazah Terakhir (PDF/Gambar jelas)' },
      { id: 'req-nbm', name: 'Kartu Anggota NBM', isRequired: true, description: 'Scan Kartu NBM / KTAM Asli' },
      { id: 'req-ktp', name: 'KTP (Kartu Tanda Penduduk)', isRequired: false, description: 'Scan KTP yang masih berlaku' },
      { id: 'req-sk-lama', name: 'SK Sebelumnya', isRequired: false, description: 'Wajib dilampirkan jika perpanjangan atau revisi SK' },
      { id: 'req-cv', name: 'Curriculum Vitae (CV)', isRequired: false, description: 'Riwayat hidup singkat & pengabdian' },
      { id: 'req-surat-pengajuan', name: 'Surat Pengajuan Sekolah', isRequired: false, description: 'Surat pengantar resmi dari Kepala Sekolah' },
      { id: 'req-pernyataan', name: 'Surat Pernyataan', isRequired: false, description: 'Surat pernyataan kesediaan dan loyalitas persyarikatan' }
    ]
  },
  {
    id: 'sk-tendik',
    name: 'SK Tenaga Kependidikan',
    code: 'TENDIK',
    description: 'Digunakan untuk pengajuan SK tenaga kependidikan/karyawan (Tata Usaha, Operator, Pustakawan, Laboran, Keuangan, Satpam, Kebersihan).',
    recipientType: 'INDIVIDU',
    numberFormat: '[NO]/KEP/TENDIK/[TAHUN]',
    status: 'Aktif',
    order: 2,
    kopText: 'MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL\nPIMPINAN DAERAH MUHAMMADIYAH',
    signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
    signerRole: 'Ketua Majelis Dikdasmen & PNF Daerah',
    menimbang: [
      'Bahwa untuk menunjang kelancaran tata kelola administrasi dan pelayanan operasional di lingkungan Satuan Pendidikan Muhammadiyah, perlu mengangkat Tenaga Kependidikan;',
      'Bahwa yang bersangkutan dinilai memiliki integritas, dedikasi, dan kualifikasi teknis yang memadai untuk melaksanakan tugas;',
      'Bahwa berdasarkan pertimbangan tersebut, perlu diterbitkan Surat Keputusan Pengangkatan Tenaga Kependidikan.'
    ],
    mengingat: [
      'Anggaran Dasar dan Anggaran Rumah Tangga Muhammadiyah;',
      'Pedoman Pimpinan Pusat Muhammadiyah tentang Majelis Dikdasmen & PNF;',
      'Ketentuan Standar Sarana, Prasarana, dan Tenaga Kependidikan.'
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
      { fieldKey: 'position', label: 'Jabatan / Formasi', isRequired: true, type: 'select', options: ['Kepala Tata Usaha', 'Staff Administrasi / TU', 'Operator Sekolah / Dapodik', 'Pustakawan', 'Laboran', 'Staff Keuangan / Bendahara', 'Staff Sarpras', 'Satpam / Penjaga Sekolah', 'Petugas Kebersihan'], group: 'kepegawaian' },
      { fieldKey: 'unitKerja', label: 'Unit Kerja / Penugasan', isRequired: true, type: 'text', placeholder: 'Contoh: Bagian Tata Usaha & IT', group: 'kepegawaian' },
      { fieldKey: 'statusKepegawaian', label: 'Status Kepegawaian', isRequired: true, type: 'select', options: ['KTY (Karyawan Tetap Yayasan)', 'KTP (Karyawan Tetap Persyarikatan)', 'KTT (Karyawan Tidak Tetap)', 'PNS DPK', 'PPPK'], group: 'kepegawaian' },
      { fieldKey: 'skStartDate', label: 'Tanggal Mulai Berlaku (TMT)', isRequired: true, type: 'date', group: 'masa_berlaku' },
      { fieldKey: 'skEndDate', label: 'Tanggal Berakhir Berlaku', isRequired: true, type: 'date', group: 'masa_berlaku' }
    ],
    defaultRequirements: [
      { id: 'req-ijazah', name: 'Ijazah Terakhir', isRequired: true, description: 'Scan Ijazah Asli Terakhir' },
      { id: 'req-nbm', name: 'Kartu Anggota NBM', isRequired: true, description: 'Scan Kartu NBM Asli' },
      { id: 'req-ktp', name: 'KTP (Kartu Tanda Penduduk)', isRequired: false, description: 'Scan KTP pemohon' },
      { id: 'req-sk-lama', name: 'SK Sebelumnya', isRequired: false, description: 'Scan SK lama jika perpanjangan atau revisi' },
      { id: 'req-surat-pengajuan', name: 'Surat Pengantar Sekolah', isRequired: false, description: 'Surat rekomendasi usulan Kepala Sekolah' }
    ]
  },
  {
    id: 'sk-ks',
    name: 'SK Kepala Sekolah',
    code: 'KS',
    description: 'Digunakan untuk pengajuan pengangkatan, perpanjangan masa jabatan, rotasi, mutasi, atau pemberhentian Kepala Sekolah/Madrasah.',
    recipientType: 'INDIVIDU',
    numberFormat: '[NO]/KEP/KS/[TAHUN]',
    status: 'Aktif',
    order: 3,
    kopText: 'MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL\nPIMPINAN DAERAH MUHAMMADIYAH',
    signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
    signerRole: 'Ketua Majelis Dikdasmen & PNF Daerah',
    menimbang: [
      'Bahwa dalam rangka optimalisasi kepemimpinan manajerial, supervisi, dan kewirausahaan di Satuan Pendidikan Muhammadiyah, perlu mengangkat Kepala Sekolah/Madrasah;',
      'Bahwa setelah melalui proses seleksi, uji kelayakan dan kepatutan (fit and proper test), serta rekomendasi Pimpinan Cabang Muhammadiyah setempat, yang bersangkutan dinilai kompeten;',
      'Bahwa untuk kepastian hukum kepemimpinan sekolah, dipandang perlu menerbitkan Surat Keputusan Pengangkatan Kepala Sekolah.'
    ],
    mengingat: [
      'Anggaran Dasar dan Anggaran Rumah Tangga Muhammadiyah;',
      'Pedoman Pimpinan Pusat Muhammadiyah tentang Tata Cara Pengangkatan dan Pemberhentian Kepala Satuan Pendidikan Muhammadiyah;',
      'Peraturan Menteri Pendidikan mengenai Kualifikasi dan Standar Kepala Sekolah.'
    ],
    memutuskan: [
      'Mengangkat nama yang bersangkutan sebagai Kepala Sekolah/Madrasah pada Satuan Pendidikan Muhammadiyah untuk periode masa jabatan yang ditetapkan;',
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
      { id: 'req-nbm', name: 'Kartu Anggota NBM', isRequired: true, description: 'Scan Kartu NBM Asli yang masih berlaku' },
      { id: 'req-sk-lama', name: 'SK Kepala Sekolah Sebelumnya', isRequired: false, description: 'Wajib untuk perpanjangan periode jabatan' },
      { id: 'req-rekomendasi-pcm', name: 'Rekomendasi PCM / Komite', isRequired: false, description: 'Surat usulan/rekomendasi dari Pimpinan Cabang Muhammadiyah' },
      { id: 'req-berkas-fit-proper', name: 'Hasil Evaluasi / Fit & Proper Test', isRequired: false, description: 'Berita acara uji kelayakan dan kepatutan' },
      { id: 'req-dokumen-pendukung', name: 'Dokumen Pendukung Lainnya', isRequired: false, description: 'Sertifikat Pendidik / STTPP Penguatan Kepala Sekolah' }
    ]
  },
  {
    id: 'sk-ops',
    name: 'SK Pendirian / Operasional',
    code: 'OPS',
    description: 'Digunakan untuk pengajuan pendirian satuan pendidikan baru, izin operasional, perpanjangan, atau perubahan data operasional sekolah (Penerima SK: SATUAN PENDIDIKAN / SEKOLAH).',
    recipientType: 'SATUAN PENDIDIKAN',
    numberFormat: '[NO]/KEP/OPS/[TAHUN]',
    status: 'Aktif',
    order: 4,
    kopText: 'MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL\nPIMPINAN DAERAH MUHAMMADIYAH',
    signerName: 'Dr. H. Muhammad Arifin, M.Pd.',
    signerRole: 'Ketua Majelis Dikdasmen & PNF Daerah',
    menimbang: [
      'Bahwa dalam rangka pemerataan akses dan peningkatan mutu layanan pendidikan Islam modern bagi masyarakat, dipandang perlu menerbitkan SK Pendirian / Izin Operasional Satuan Pendidikan;',
      'Bahwa setelah dilakukan verifikasi lapangan dan telaah kelayakan dokumen sarana, ketenagaan, dan kurikulum, Satuan Pendidikan yang bersangkutan dinyatakan memenuhi standar;',
      'Bahwa sehubungan dengan hal tersebut, perlu diterbitkan Surat Keputusan Izin Operasional Persyarikatan.'
    ],
    mengingat: [
      'Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;',
      'Anggaran Dasar dan Anggaran Rumah Tangga Muhammadiyah;',
      'Pedoman Pimpinan Pusat Muhammadiyah tentang Pendirian dan Pengelolaan Satuan Pendidikan Muhammadiyah;',
      'Hasil Keputusan Rapat Pleno Majelis Dikdasmen & PNF PDM.'
    ],
    memutuskan: [
      'Memberikan Izin Pendirian dan Operasional kepada Satuan Pendidikan Muhammadiyah tersebut di atas;',
      'Menetapkan legalitas penyelenggaraan proses pembelajaran dengan kurikulum nasional dan kurikulum ciri khusus Al-Islam, Kemuhammadiyahan, dan Bahasa Arab (ISMUBA);',
      'Keputusan ini berlaku sejak tanggal ditetapkan dengan kewajiban melakukan akreditasi dan pembaruan berkala.'
    ],
    diktum: [
      'Penyelenggara wajib mematuhi ketentuan perundang-undangan dan tata tertib persyarikatan.',
      'Keputusan ini disampaikan kepada Dinas Pendidikan / Kemenag setempat dan instansi terkait.'
    ],
    fields: [
      { fieldKey: 'schoolName', label: 'Nama Satuan Pendidikan / Sekolah', isRequired: true, type: 'text', placeholder: 'Contoh: SD Muhammadiyah 1 Klaten', group: 'sekolah' },
      { fieldKey: 'npsn', label: 'NPSN (Nomor Pokok Sekolah Nasional)', isRequired: true, type: 'text', placeholder: '8 digit NPSN', group: 'sekolah' },
      { fieldKey: 'nss', label: 'NSS / NDS (jika tersedia)', isRequired: false, type: 'text', placeholder: 'Nomor Statistik Sekolah', group: 'sekolah' },
      { fieldKey: 'level', label: 'Jenjang Pendidikan', isRequired: true, type: 'select', options: ['SD', 'SMP', 'SMA', 'SMK', 'MI', 'MTs', 'MA', 'TK / PAUD'], group: 'sekolah' },
      { fieldKey: 'schoolStatus', label: 'Status Satuan Pendidikan', isRequired: true, type: 'select', options: ['Swasta', 'Negeri'], group: 'sekolah' },
      { fieldKey: 'address', label: 'Alamat Lengkap Satuan Pendidikan', isRequired: true, type: 'textarea', placeholder: 'Jalan, RT/RW, Dusun', group: 'sekolah' },
      { fieldKey: 'kelurahan', label: 'Desa / Kelurahan', isRequired: true, type: 'text', placeholder: 'Kelurahan / Desa', group: 'sekolah' },
      { fieldKey: 'kecamatan', label: 'Kecamatan', isRequired: true, type: 'text', placeholder: 'Kecamatan', group: 'sekolah' },
      { fieldKey: 'kabupaten', label: 'Kabupaten / Kota', isRequired: true, type: 'text', placeholder: 'Kabupaten Klaten', group: 'sekolah' },
      { fieldKey: 'provinsi', label: 'Provinsi', isRequired: true, type: 'text', placeholder: 'Jawa Tengah', group: 'sekolah' },
      { fieldKey: 'principalName', label: 'Nama Kepala Sekolah / Penanggung Jawab', isRequired: true, type: 'text', placeholder: 'Nama Kepala Sekolah', group: 'sekolah' },
      { fieldKey: 'principalNbm', label: 'NBM Kepala Sekolah', isRequired: false, type: 'text', placeholder: 'Nomor NBM Kepala Sekolah', group: 'sekolah' },
      { fieldKey: 'skPendirianLama', label: 'Nomor Izin / SK Pendirian Sebelumnya (jika ada)', isRequired: false, type: 'text', placeholder: 'Nomor SK Lama', group: 'sekolah' },
      { fieldKey: 'tanggalPendirian', label: 'Tanggal Pendirian Sekolah', isRequired: false, type: 'date', group: 'sekolah' },
      { fieldKey: 'statusOperasional', label: 'Status Operasional', isRequired: true, type: 'select', options: ['Aktif Beroperasi', 'Dalam Masa Rintisan', 'Pembaruan Izin', 'Perluasan Gedung'], group: 'sekolah' },
      { fieldKey: 'skStartDate', label: 'Tanggal Mulai Operasional (TMT)', isRequired: true, type: 'date', group: 'masa_berlaku' },
      { fieldKey: 'skEndDate', label: 'Tanggal Berakhir Izin (jika terbatas)', isRequired: false, type: 'date', group: 'masa_berlaku' }
    ],
    defaultRequirements: [
      { id: 'req-akta-pendirian', name: 'Akta Pendirian / Dokumen Legalitas Persyarikatan', isRequired: true, description: 'Scan Surat Penetapan / Akta Notaris Wakaf Persyarikatan' },
      { id: 'req-profil-sekolah', name: 'Data & Profil Satuan Pendidikan', isRequired: true, description: 'Dokumen profil lengkap, sarpras, dan data guru rintisan' },
      { id: 'req-izin-lama', name: 'Izin Operasional Sebelumnya', isRequired: false, description: 'Scan Izin Operasional lama jika perpanjangan' },
      { id: 'req-lahan', name: 'Dokumen Kepemilikan / Pengelolaan Lahan / Wakaf', isRequired: false, description: 'Sertifikat wakaf / hak guna bangunan persyarikatan' },
      { id: 'req-permohonan-pcm', name: 'Surat Permohonan dari PCM Setempat', isRequired: true, description: 'Surat pengantar permohonan resmi dari Cabang Muhammadiyah' },
      { id: 'req-dokumen-pendukung', name: 'Dokumen Pendukung Lainnya', isRequired: false, description: 'Rekomendasi Dinas Pendidikan / Kemenag jika ada' }
    ]
  }
];

export const DEFAULT_MASTER_SUB_JENIS_SK: MasterSubJenisSk[] = [
  // 1. SUB-JENIS SK GURU
  {
    id: 'sub-guru-gty',
    skTypeCode: 'GURU',
    skTypeName: 'SK Guru (Pendidik)',
    name: 'Pengangkatan Guru Tetap Yayasan',
    code: 'PGTY',
    titleTemplate: 'PENGANGKATAN GURU TETAP YAYASAN',
    description: 'Surat Keputusan pengangkatan perdana/resmi Guru Tetap Yayasan Muhammadiyah.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 1
  },
  {
    id: 'sub-guru-gtp',
    skTypeCode: 'GURU',
    skTypeName: 'SK Guru (Pendidik)',
    name: 'Pengangkatan Guru Tetap Persyarikatan',
    code: 'PGTP',
    titleTemplate: 'PENGANGKATAN GURU TETAP PERSYARIKATAN',
    description: 'Surat Keputusan penetapan Guru Tetap Persyarikatan di lingkungan PDM.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 2
  },
  {
    id: 'sub-guru-pg',
    skTypeCode: 'GURU',
    skTypeName: 'SK Guru (Pendidik)',
    name: 'Pengangkatan Guru',
    code: 'PG',
    titleTemplate: 'PENGANGKATAN GURU',
    description: 'Surat Keputusan pengangkatan guru kelas / guru mata pelajaran.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 3
  },
  {
    id: 'sub-guru-prp',
    skTypeCode: 'GURU',
    skTypeName: 'SK Guru (Pendidik)',
    name: 'Perpanjangan SK Guru',
    code: 'PRP-GURU',
    titleTemplate: 'PERPANJANGAN SURAT KEPUTUSAN GURU',
    description: 'Perpanjangan masa berlaku SK Guru yang telah habis masa berlakunya.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 4
  },
  {
    id: 'sub-guru-prb',
    skTypeCode: 'GURU',
    skTypeName: 'SK Guru (Pendidik)',
    name: 'Perubahan SK Guru',
    code: 'PRB-GURU',
    titleTemplate: 'PERUBAHAN SURAT KEPUTUSAN GURU',
    description: 'Perubahan penugasan bidang studi, jenjang mengajar, atau status kepegawaian guru.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 5
  },
  {
    id: 'sub-guru-rev',
    skTypeCode: 'GURU',
    skTypeName: 'SK Guru (Pendidik)',
    name: 'Revisi SK Guru',
    code: 'REV-GURU',
    titleTemplate: 'REVISI SURAT KEPUTUSAN GURU',
    description: 'Koreksi atau perbaikan data administratif (nama, gelar, NBM, TMT) pada SK Guru.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 6
  },

  // 2. SUB-JENIS SK TENDIK
  {
    id: 'sub-tdk-ptk',
    skTypeCode: 'TENDIK',
    skTypeName: 'SK Tenaga Kependidikan',
    name: 'Pengangkatan Tenaga Kependidikan',
    code: 'PTK',
    titleTemplate: 'PENGANGKATAN TENAGA KEPENDIDIKAN',
    description: 'Pengangkatan resmi staf kependidikan umum di sekolah.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 1
  },
  {
    id: 'sub-tdk-pta',
    skTypeCode: 'TENDIK',
    skTypeName: 'SK Tenaga Kependidikan',
    name: 'Pengangkatan Tenaga Administrasi',
    code: 'PTA',
    titleTemplate: 'PENGANGKATAN TENAGA ADMINISTRASI SEKOLAH',
    description: 'Pengangkatan staf Tata Usaha / Administrasi Umum.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 2
  },
  {
    id: 'sub-tdk-pos',
    skTypeCode: 'TENDIK',
    skTypeName: 'SK Tenaga Kependidikan',
    name: 'Pengangkatan Operator Sekolah',
    code: 'POS',
    titleTemplate: 'PENGANGKATAN OPERATOR SEKOLAH',
    description: 'Pengangkatan Tenaga Operator Dapodik, EMIS, dan SIM Dikdasmen.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 3
  },
  {
    id: 'sub-tdk-ppst',
    skTypeCode: 'TENDIK',
    skTypeName: 'SK Tenaga Kependidikan',
    name: 'Pengangkatan Pustakawan',
    code: 'PPST',
    titleTemplate: 'PENGANGKATAN PUSTAKAWAN SEKOLAH',
    description: 'Pengangkatan pengelola perpustakaan sekolah.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 4
  },
  {
    id: 'sub-tdk-plab',
    skTypeCode: 'TENDIK',
    skTypeName: 'SK Tenaga Kependidikan',
    name: 'Pengangkatan Laboran',
    code: 'PLAB',
    titleTemplate: 'PENGANGKATAN LABORAN SEKOLAH',
    description: 'Pengangkatan pengelola laboratorium IPA, Komputer, dan Bahasa.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 5
  },
  {
    id: 'sub-tdk-prp',
    skTypeCode: 'TENDIK',
    skTypeName: 'SK Tenaga Kependidikan',
    name: 'Perpanjangan SK Tendik',
    code: 'PRP-TDK',
    titleTemplate: 'PERPANJANGAN SURAT KEPUTUSAN TENAGA KEPENDIDIKAN',
    description: 'Perpanjangan masa penugasan tenaga kependidikan.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 6
  },
  {
    id: 'sub-tdk-prb',
    skTypeCode: 'TENDIK',
    skTypeName: 'SK Tenaga Kependidikan',
    name: 'Perubahan SK Tendik',
    code: 'PRB-TDK',
    titleTemplate: 'PERUBAHAN SURAT KEPUTUSAN TENAGA KEPENDIDIKAN',
    description: 'Perubahan unit penugasan atau formasi jabatan tenaga kependidikan.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 7
  },
  {
    id: 'sub-tdk-rev',
    skTypeCode: 'TENDIK',
    skTypeName: 'SK Tenaga Kependidikan',
    name: 'Revisi SK Tendik',
    code: 'REV-TDK',
    titleTemplate: 'REVISI SURAT KEPUTUSAN TENAGA KEPENDIDIKAN',
    description: 'Revisi data atau penyesuaian administratif SK Tenaga Kependidikan.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 24,
    validityPeriodText: '2 Tahun',
    status: 'Aktif',
    order: 8
  },

  // 3. SUB-JENIS SK KEPALA SEKOLAH
  {
    id: 'sub-ks-pks',
    skTypeCode: 'KS',
    skTypeName: 'SK Kepala Sekolah',
    name: 'Pengangkatan Kepala Sekolah',
    code: 'PKS',
    titleTemplate: 'PENGANGKATAN KEPALA SEKOLAH',
    description: 'Surat Keputusan pengangkatan definitif Kepala Satuan Pendidikan.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 48,
    validityPeriodText: '4 Tahun',
    status: 'Aktif',
    order: 1
  },
  {
    id: 'sub-ks-prp',
    skTypeCode: 'KS',
    skTypeName: 'SK Kepala Sekolah',
    name: 'Perpanjangan Masa Jabatan Kepala Sekolah',
    code: 'PRP-KS',
    titleTemplate: 'PERPANJANGAN MASA JABATAN KEPALA SEKOLAH',
    description: 'Perpanjangan masa jabatan Kepala Sekolah untuk periode berikutnya.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 48,
    validityPeriodText: '4 Tahun',
    status: 'Aktif',
    order: 2
  },
  {
    id: 'sub-ks-prb',
    skTypeCode: 'KS',
    skTypeName: 'SK Kepala Sekolah',
    name: 'Perubahan Kepala Sekolah',
    code: 'PRB-KS',
    titleTemplate: 'PERUBAHAN KEPALA SEKOLAH',
    description: 'Rotasi, mutasi antar sekolah, atau penyesuaian status pimpinan.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 48,
    validityPeriodText: '4 Tahun',
    status: 'Aktif',
    order: 3
  },
  {
    id: 'sub-ks-pbh',
    skTypeCode: 'KS',
    skTypeName: 'SK Kepala Sekolah',
    name: 'Pemberhentian Kepala Sekolah',
    code: 'PBH-KS',
    titleTemplate: 'PEMBERHENTIAN KEPALA SEKOLAH',
    description: 'Pemberhentian dengan hormat atau alih tugas Kepala Sekolah.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 0,
    validityPeriodText: 'Definitif',
    status: 'Aktif',
    order: 4
  },
  {
    id: 'sub-ks-rev',
    skTypeCode: 'KS',
    skTypeName: 'SK Kepala Sekolah',
    name: 'Revisi SK Kepala Sekolah',
    code: 'REV-KS',
    titleTemplate: 'REVISI SURAT KEPUTUSAN KEPALA SEKOLAH',
    description: 'Perbaikan teknis redaksi atau data pada SK Kepala Sekolah.',
    recipientType: 'INDIVIDU',
    validityPeriodMonths: 48,
    validityPeriodText: '4 Tahun',
    status: 'Aktif',
    order: 5
  },

  // 4. SUB-JENIS SK PENDIRIAN / OPERASIONAL (PENERIMA: SATUAN PENDIDIKAN)
  {
    id: 'sub-ops-pendirian',
    skTypeCode: 'OPS',
    skTypeName: 'SK Pendirian / Operasional',
    name: 'SK Pendirian Sekolah',
    code: 'PENDIRIAN',
    titleTemplate: 'PENDIRIAN SATUAN PENDIDIKAN',
    description: 'Penetapan pendirian satuan pendidikan baru di lingkungan persyarikatan.',
    recipientType: 'SATUAN PENDIDIKAN',
    validityPeriodMonths: 0,
    validityPeriodText: 'Permanen',
    status: 'Aktif',
    order: 1
  },
  {
    id: 'sub-ops-izin',
    skTypeCode: 'OPS',
    skTypeName: 'SK Pendirian / Operasional',
    name: 'SK Izin Operasional Sekolah',
    code: 'IZIN-OPS',
    titleTemplate: 'IZIN OPERASIONAL SATUAN PENDIDIKAN',
    description: 'Pemberian izin operasional penyelenggaraan kegiatan belajar mengajar.',
    recipientType: 'SATUAN PENDIDIKAN',
    validityPeriodMonths: 60,
    validityPeriodText: '5 Tahun',
    status: 'Aktif',
    order: 2
  },
  {
    id: 'sub-ops-prp',
    skTypeCode: 'OPS',
    skTypeName: 'SK Pendirian / Operasional',
    name: 'Perpanjangan SK Operasional',
    code: 'PRP-OPS',
    titleTemplate: 'PERPANJANGAN IZIN OPERASIONAL SATUAN PENDIDIKAN',
    description: 'Perpanjangan izin operasional sekolah yang mendekati habis masa berlaku.',
    recipientType: 'SATUAN PENDIDIKAN',
    validityPeriodMonths: 60,
    validityPeriodText: '5 Tahun',
    status: 'Aktif',
    order: 3
  },
  {
    id: 'sub-ops-prb',
    skTypeCode: 'OPS',
    skTypeName: 'SK Pendirian / Operasional',
    name: 'Perubahan SK Operasional',
    code: 'PRB-OPS',
    titleTemplate: 'PERUBAHAN IZIN OPERASIONAL SATUAN PENDIDIKAN',
    description: 'Perubahan nama sekolah, alamat, jenjang, atau perluasan kampus.',
    recipientType: 'SATUAN PENDIDIKAN',
    validityPeriodMonths: 60,
    validityPeriodText: '5 Tahun',
    status: 'Aktif',
    order: 4
  },
  {
    id: 'sub-ops-rev',
    skTypeCode: 'OPS',
    skTypeName: 'SK Pendirian / Operasional',
    name: 'Revisi SK Operasional',
    code: 'REV-OPS',
    titleTemplate: 'REVISI SURAT KEPUTUSAN OPERASIONAL',
    description: 'Revisi data administratif izin operasional sekolah.',
    recipientType: 'SATUAN PENDIDIKAN',
    validityPeriodMonths: 60,
    validityPeriodText: '5 Tahun',
    status: 'Aktif',
    order: 5
  }
];

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
