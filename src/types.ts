export const DEFAULT_SCHOOL_LOGO = 'https://sekolah.dikdasmen.id/gambar/logo.png?v=1667216049';

export const getSchoolLogo = (logoUrl?: string | null): string => {
  if (!logoUrl || logoUrl.trim() === '' || logoUrl.includes('unsplash.com')) {
    return DEFAULT_SCHOOL_LOGO;
  }
  return logoUrl;
};

export type UserRole = 'Super Admin' | 'Admin' | 'Cabang' | 'Sekolah';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  originalRole?: UserRole;
  isSimulated?: boolean;
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
  password?: string;
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
  username?: string; // Username login (Default: NPSN Resmi)
  password?: string; // Kata sandi login (Default: sekolah123)
  passwordUpdatedAt?: string;
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

export type SkStatus = 'Terbit' | 'Belum Terbit' | 'Diproses' | 'Terverifikasi' | 'Ditolak';
export type SubmissionType = 'Baru' | 'Perpanjangan' | 'Perubahan' | 'Revisi';
export type SkMainType =
  | 'SK Guru (Pendidik)'
  | 'SK Tenaga Kependidikan'
  | 'SK Kepala Sekolah';
export type SkType = SkMainType | 'SK Guru' | 'SK Tendik' | 'SK Kepala Sekolah';
export type SkTypeCode = 'GURU' | 'TENDIK' | 'KS';
export type RecipientCategory = 'INDIVIDU' | 'SATUAN PENDIDIKAN';
export type RecipientType = 'INDIVIDU' | 'SATUAN PENDIDIKAN';
export type RecipientTypeKey = 'PERSON' | 'SCHOOL';

export interface DocumentRequirement {
  id: string;
  name: string;
  isRequired: boolean;
  description?: string;
}

export interface FormFieldConfig {
  fieldKey: string;
  label: string;
  isRequired: boolean;
  type: 'text' | 'date' | 'select' | 'number' | 'textarea';
  options?: string[];
  placeholder?: string;
  group?: 'identitas' | 'kepegawaian' | 'sekolah' | 'masa_berlaku';
}

export interface MasterSubJenisSk {
  id: string;
  skTypeCode: SkTypeCode;
  skTypeName: SkMainType;
  name: string;
  code: string;
  titleTemplate: string;
  description: string;
  recipientType: RecipientCategory;
  validityPeriodMonths: number;
  validityPeriodText: string;
  status: 'Aktif' | 'Nonaktif';
  order: number;
  requirements?: DocumentRequirement[];
  customFields?: FormFieldConfig[];
  menimbang?: string[];
  mengingat?: string[];
  memutuskan?: string[];
  diktum?: string[];
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface MasterJenisSk {
  id: string;
  name: SkMainType;
  code: SkTypeCode;
  description: string;
  recipientType: RecipientCategory;
  numberFormat: string;
  status: 'Aktif' | 'Nonaktif';
  order: number;
  fields: FormFieldConfig[];
  defaultRequirements: DocumentRequirement[];
  subTypes?: MasterSubJenisSk[];
  kopText?: string;
  signerName?: string;
  signerRole?: string;
  menimbang?: string[];
  mengingat?: string[];
  memutuskan?: string[];
  diktum?: string[];
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface UploadedSkDocument {
  requirementId: string;
  name: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface SuratKeputusan {
  id: string;
  sk_type_id?: string;
  sk_sub_type_id?: string;
  skTypeName?: SkMainType;
  skSubTypeName?: string;
  skNumber: string;
  sk_number?: string;
  title: string;
  schoolId: string;
  school_id?: string;
  schoolName?: string;
  type: SkType;
  subType?: string;
  submissionType: SubmissionType;
  submission_type?: SubmissionType;
  recipient_type?: RecipientTypeKey | RecipientCategory;
  recipient_id?: string;
  recipient_data?: Record<string, any>;
  status: SkStatus;
  verification_status?: 'Menunggu Verifikasi' | 'Diverifikasi' | 'Ditolak';
  approval_status?: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';
  targetName?: string;
  targetId?: string;
  targetCategory?: string;
  skStartDate?: string;
  skEndDate?: string;
  start_date?: string;
  end_date?: string;
  signerName?: string;
  signerRole?: string;
  documentUrl?: string;
  fileNbmUrl?: string;
  fileIjazahUrl?: string;
  fileSkLamaUrl?: string;
  uploaded_documents?: UploadedSkDocument[];
  notes?: string;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  isDeleted?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface SkDocument {
  id: string;
  sk_type_id?: string;
  sk_sub_type_id?: string;
  skTypeName?: SkMainType;
  skSubTypeName?: string;
  skNumber: string;
  sk_number?: string;
  skDate: string;
  skEndDate: string;
  start_date?: string;
  end_date?: string;
  title: string;
  targetId: string; // guruId | tendikId | kepalaSekolahId | schoolId
  targetName?: string;
  targetType: 'Guru' | 'Tendik' | 'KepalaSekolah' | 'Sekolah' | string;
  recipient_type?: RecipientTypeKey | RecipientCategory;
  recipient_id?: string;
  recipient_data?: Record<string, any>;
  schoolId: string;
  school_id?: string;
  schoolName?: string;
  fileUrl?: string;
  fileName?: string;
  status: SkStatus;
  verification_status?: string;
  approval_status?: string;
  submissionType: SubmissionType;
  submission_type?: SubmissionType;
  nbmUrl?: string;
  ijazahUrl?: string;
  skLamaUrl?: string;
  uploaded_documents?: UploadedSkDocument[];
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  created_at?: string;
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
