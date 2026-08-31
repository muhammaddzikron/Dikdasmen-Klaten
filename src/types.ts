export type UserRole = 'Super Admin' | 'Admin' | 'Cabang' | 'Sekolah';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cabangId?: string;
  sekolahId?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Cabang {
  id: string;
  name: string;
  code: string;
  username?: string;
  address?: string;
  phone?: string;
  email?: string;
  ketuaName?: string;
  createdAt: string;
  isDeleted?: boolean;
}

export type SchoolLevel = 'SD' | 'SMP' | 'SMA' | 'SMK' | 'MI' | 'MTs' | 'MA';
export type SchoolStatus = 'Negeri' | 'Swasta';
export type SchoolAccreditation = 'A' | 'B' | 'C' | 'Unggul' | 'Baik Sekali' | 'Belum Terakreditasi';
export type CapabilityCategory = 'UGD' | 'RAWAT INAP' | 'RAWAT JALAN' | 'SEHAT';

export interface Sekolah {
  id: string;
  name: string; // Nama Sekolah/Madrasah sesuai Referensi Data Kemendikdasmen
  npsn: string;
  cabangId: string;
  address: string;
  rtRw?: string;
  kodePos?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  status: SchoolStatus;
  level: SchoolLevel;
  phone?: string;
  email?: string;
  website?: string;
  vision?: string;
  mission?: string;
  hasNib?: 'Ya' | 'Tidak' | boolean;
  nib?: string;
  accreditation: SchoolAccreditation;
  accreditationExpiryDate?: string;
  skPendirianNumber?: string;
  skPendirianDate?: string;
  skIzinOperasional?: string;
  skIzinOperasionalDate?: string;
  categoryCapability: CapabilityCategory;
  jumlahKeseluruhanSiswa: number;
  sosmed?: string;
  operatorName?: string;
  operatorPhone?: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  principalName?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

export type TeacherStatus = 'GTP' | 'GTTP' | 'PNS' | 'GTY' | 'GTT' | 'PPPK';
export type EmploymentStatus = TeacherStatus;
export type Gender = 'Laki-laki' | 'Perempuan';

export interface Guru {
  id: string;
  name: string; // Nama Guru beserta title/gelar
  nipm?: string; // Nomor Induk Pegawai Muhammadiyah
  schoolId: string;
  gender: Gender;
  birthPlace?: string;
  birthDate?: string;
  status: TeacherStatus; // GTP / GTTP / PNS
  teacherType?: 'Guru Kelas' | 'Guru Mata Pelajaran';
  subject: string; // Mapel atau Kelas yang diampu
  hasPpg?: 'Sudah' | 'Belum' | boolean;
  isCertified?: boolean;
  nuptk?: string;
  nrg?: string;
  nip?: string;
  nbm?: string;
  skNumber?: string; // Nomor SK Pengangkatan
  tmtPengangkatan?: string; // TMT Awal Pengangkatan
  education: string; // Pendidikan Terakhir
  studyProgram?: string; // Prodi Pendidikan Terakhir
  rtRw?: string;
  kodePos?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  address?: string;
  phone?: string; // Nomor HP Aktif
  persyarikatanOrtom?: string;
  persyarikatanLevel?: string;
  persyarikatanActivity?: string; // Keaktifan di Persyarikatan
  isInpassing?: boolean | 'Sudah' | 'Belum';
  email?: string;
  photoUrl?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

export type TendikStatus = 'KTP' | 'KTTP' | 'KTY' | 'KTT' | 'PNS';

export interface Tendik {
  id: string;
  name: string; // Nama Karyawan beserta title
  nipm?: string; // NIPM (Nomor Induk Pegawai Muhammadiyah)
  schoolId: string;
  gender: Gender;
  birthPlace?: string;
  birthDate?: string;
  status: TendikStatus; // KTP / KTTP / PNS
  position: string; // Jenis Karyawan: Staff TU, Operator, dsb.
  nbm?: string;
  skNumber?: string; // Nomor SK Pengangkatan
  tmtPengangkatan?: string; // TMT Awal Pengangkatan
  education: string; // Pendidikan Terakhir
  studyProgram?: string; // Prodi Pendidikan Terakhir
  rtRw?: string;
  kodePos?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  address?: string;
  phone?: string;
  persyarikatanOrtom?: string;
  persyarikatanLevel?: string;
  persyarikatanActivity?: string; // Keaktifan di Persyarikatan
  nip?: string;
  email?: string;
  photoUrl?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

export type PrincipalStatus = 'Aktif' | 'Selesai' | 'Mutasi';

export interface KepalaSekolah {
  id: string;
  name: string; // Nama Lengkap Kepala (Dilengkapi Gelar)
  nipm?: string; // NIPM
  birthPlace?: string;
  birthDate?: string;
  phone?: string;
  periodNumber: number; // Periode Kepala yang ke berapa
  startDate: string; // TMT SK Kepala Sekolah/Madrasah
  endDate: string; // Tanggal Berakhir Jabatan Kepala sesuai SK Kepala
  nuptk?: string;
  nuks?: string;
  hasSerdik?: 'Sudah' | 'Belum' | boolean;
  employmentStatus?: 'GTY' | 'PNS' | 'GTP' | 'PPPK';
  schoolId: string;
  nip?: string;
  nbm?: string;
  skNumber?: string;
  status: PrincipalStatus;
  email?: string;
  photoUrl?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

export type StudentStatus = 'Aktif' | 'Lulus' | 'Mutasi';

export interface Siswa {
  id: string;
  name: string;
  gender: Gender;
  nisn: string;
  birthPlace?: string;
  birthDate?: string;
  class: string; // Kelas
  classGrade?: string; // Alias for class
  schoolId: string;
  rtRw?: string;
  kodePos?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  address?: string;
  nis?: string;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
  status: StudentStatus;
  isDeleted?: boolean;
  createdAt?: string;
}

export type SkStatus = 'Terbit' | 'Belum Terbit' | 'Ditolak';
export type SubmissionType = 'Baru' | 'Perpanjangan';
export type SkType = 'SK Guru' | 'SK Tendik' | 'SK Kepala Sekolah' | 'SK Pendirian';

export interface SuratKeputusan {
  id: string;
  skNumber: string;
  title: string;
  schoolId: string;
  type: SkType;
  submissionType: SubmissionType;
  status: SkStatus;
  targetName?: string;
  targetId?: string;
  skStartDate?: string;
  skEndDate?: string;
  signerName?: string;
  signerRole?: string;
  documentUrl?: string;
  fileNbmUrl?: string;
  fileIjazahUrl?: string;
  fileSkLamaUrl?: string;
  notes?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface SkDocument {
  id: string;
  skNumber: string;
  skDate: string;
  skEndDate: string;
  title: string;
  targetId: string; // guruId | tendikId | kepalaSekolahId
  targetName?: string;
  targetType: 'Guru' | 'Tendik' | 'KepalaSekolah';
  schoolId: string;
  fileUrl?: string;
  fileName?: string;
  status: SkStatus;
  submissionType: SubmissionType;
  nbmUrl?: string;
  ijazahUrl?: string;
  skLamaUrl?: string;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  isDeleted?: boolean;
}

export type TargetPersonelType = 'Guru' | 'Tendik' | 'Kepala Sekolah' | 'Siswa';

export interface Mutasi {
  id: string;
  personelType: TargetPersonelType;
  personelName: string;
  targetId: string;
  fromSchoolId: string;
  toSchoolId: string;
  reason: string;
  status: string;
  mutationDate: string;
  skNumber: string;
  isDeleted?: boolean;
}

export interface MutasiRecord {
  id: string;
  type: 'Guru' | 'Tendik' | 'KepalaSekolah' | 'Siswa';
  personId: string;
  personName: string;
  fromSchoolId: string;
  fromSchoolName?: string;
  toSchoolId: string;
  toSchoolName?: string;
  reason: string;
  date: string;
  skNumber?: string;
  status: 'Diproses' | 'Disetujui' | 'Ditolak';
  approvedBy?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  targetRole?: string;
  schoolId?: string;
  link?: string;
  createdAt: string;
}

export interface LogAktivitas {
  id: string;
  userEmail: string;
  userName?: string;
  userRole?: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
}
