import React, { useRef } from 'react';
import { Printer, Download, X, ShieldCheck, QrCode, FileText, CheckCircle2 } from 'lucide-react';
import { SuratKeputusan, MasterJenisSk, MasterSubJenisSk } from '../../../types';
import { renderTemplateVariables } from '../../../lib/masterSkDefaults';

interface SkPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sk: SuratKeputusan | null;
  masterJenis?: MasterJenisSk;
  masterSubJenis?: MasterSubJenisSk;
  schoolName?: string;
  schoolAddress?: string;
}

export const SkPrintPreviewModal: React.FC<SkPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  sk,
  masterJenis,
  masterSubJenis,
  schoolName,
  schoolAddress,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sk) return null;

  const recipientData = sk.recipient_data || {};
  const isSchoolRecipient = sk.recipient_type === 'SATUAN PENDIDIKAN' || sk.type === 'SK Pendirian / Operasional' || sk.type === 'SK Pendirian';

  // Format dates
  const formatDateIndo = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const skYear = sk.skStartDate ? new Date(sk.skStartDate).getFullYear() : new Date().getFullYear();
  const currentDateIndo = formatDateIndo(new Date().toISOString());

  // Template variables mapping
  const templateVars = {
    nomor_sk: sk.skNumber || sk.sk_number || '---/KEP/DIKDASMEN/' + skYear,
    judul_sk: sk.title || 'SURAT KEPUTUSAN',
    nama_guru: sk.targetName || recipientData.name || '-',
    nama_personel: sk.targetName || recipientData.name || '-',
    nik: recipientData.nik || '-',
    nbm: recipientData.nbm || '-',
    nip: recipientData.nipm || recipientData.nip || '-',
    tempat_lahir: recipientData.birthPlace || '-',
    tanggal_lahir: formatDateIndo(recipientData.birthDate),
    pendidikan: recipientData.education || '-',
    program_studi: recipientData.studyProgram || '-',
    jabatan: recipientData.position || sk.targetCategory || 'Guru / Tenaga Pendidik',
    mata_pelajaran: recipientData.subject || '-',
    unit_kerja: recipientData.unitKerja || recipientData.subject || '-',
    status_kepegawaian: recipientData.statusKepegawaian || '-',
    nama_sekolah: sk.schoolName || schoolName || recipientData.schoolName || '-',
    npsn: recipientData.npsn || '-',
    nss: recipientData.nss || '-',
    jenjang: recipientData.level || '-',
    alamat_sekolah: recipientData.address || schoolAddress || '-',
    kelurahan: recipientData.kelurahan || '-',
    kecamatan: recipientData.kecamatan || '-',
    kabupaten: recipientData.kabupaten || 'Klaten',
    provinsi: recipientData.provinsi || 'Jawa Tengah',
    nama_kepala_sekolah: recipientData.principalName || '-',
    tanggal_mulai: formatDateIndo(sk.skStartDate || sk.start_date),
    tanggal_akhir: formatDateIndo(sk.skEndDate || sk.end_date),
    tanggal_penerbitan: formatDateIndo(sk.createdAt || new Date().toISOString()),
    tahun: String(skYear),
  };

  const kopText = masterJenis?.kopText || 'MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL\nPIMPINAN DAERAH MUHAMMADIYAH';
  const signerName = sk.signerName || masterJenis?.signerName || 'Dr. H. Muhammad Arifin, M.Pd.';
  const signerRole = sk.signerRole || masterJenis?.signerRole || 'Ketua Majelis Dikdasmen & PNF Daerah';

  const menimbangList = masterJenis?.menimbang || [
    'Bahwa dalam rangka peningkatan mutu dan kelancaran penyelenggaraan pendidikan di lingkungan Persyarikatan Muhammadiyah, dipandang perlu menerbitkan Surat Keputusan ini;',
    'Bahwa yang bersangkutan/satuan pendidikan telah memenuhi ketentuan dan persyaratan yang ditetapkan oleh Majelis Dikdasmen & PNF;',
    'Bahwa berdasarkan pertimbangan tersebut di atas, perlu ditetapkan Surat Keputusan Majelis Dikdasmen & PNF Pimpinan Daerah Muhammadiyah.'
  ];

  const mengingatList = masterJenis?.mengingat || [
    'Anggaran Dasar dan Anggaran Rumah Tangga Muhammadiyah;',
    'Pedoman Pimpinan Pusat Muhammadiyah tentang Majelis Pendidikan Dasar Menengah dan Pendidikan Nonformal;',
    'Ketentuan dan Peraturan Perundang-Undangan Pendidikan yang berlaku.'
  ];

  const memutuskanList = masterJenis?.memutuskan || [
    `Menetapkan ${sk.title || 'Surat Keputusan'} kepada pihak/satuan pendidikan yang tercantum dalam lampiran surat keputusan ini;`,
    'Menugaskan yang bersangkutan untuk melaksanakan tugas serta kewajiban dengan sebaik-baiknya sesuai pedoman persyarikatan;',
    'Surat Keputusan ini berlaku sejak tanggal ditetapkan sampai batas waktu yang telah ditentukan.'
  ];

  const diktumList = masterJenis?.diktum || [
    'Apabila di kemudian hari terdapat kekeliruan dalam surat keputusan ini, akan dilakukan pembetulan sebagaimana mestinya.',
    'Salinan keputusan ini disampaikan kepada pihak-pihak terkait untuk diketahui dan dipergunakan sebagaimana mestinya.'
  ];

  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dokumen Resmi SK - ${sk.skNumber || 'Dikdasmen'}</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4 portrait; margin: 20mm 15mm 20mm 15mm; }
            body { font-family: 'Times New Roman', Times, serif; font-size: 11.5pt; line-height: 1.45; color: #111; padding: 20px; }
            .kop-container { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 18px; }
            .kop-title { font-size: 13pt; font-weight: bold; margin: 0; text-transform: uppercase; }
            .kop-sub { font-size: 11pt; font-weight: bold; margin: 2px 0 0; }
            .kop-address { font-size: 9pt; color: #333; margin: 2px 0 0; }
            .sk-heading { text-align: center; margin-bottom: 16px; }
            .sk-heading h3 { font-size: 12.5pt; font-weight: bold; text-decoration: underline; margin: 0; text-transform: uppercase; }
            .sk-heading p { font-size: 10.5pt; margin: 2px 0 0; font-family: monospace; font-weight: bold; }
            .sk-about { text-align: center; font-weight: bold; font-size: 10.5pt; margin-bottom: 14px; text-transform: uppercase; }
            .section-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11pt; }
            .section-table td { vertical-align: top; padding: 2px 0; }
            .data-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11pt; }
            .data-table td { vertical-align: top; padding: 3px 0; }
            .decide-title { text-align: center; font-weight: bold; font-size: 11pt; margin: 14px 0 6px; letter-spacing: 1px; }
            .signature-wrapper { margin-top: 25px; width: 100%; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .qr-col { width: 180px; text-align: center; font-size: 8pt; color: #555; }
            .signer-col { width: 280px; text-align: center; float: right; position: relative; }
            .stamp-box { position: absolute; left: 10px; top: 15px; border: 2px solid #047857; color: #047857; padding: 4px 8px; border-radius: 6px; font-size: 8pt; font-weight: bold; transform: rotate(-7deg); opacity: 0.85; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pratinjau Surat Keputusan Resmi (PDF / Cetak)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format Naskah Dinas Resmi Majelis Dikdasmen & PNF PDM Klaten
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Paper View */}
        <div className="p-6 md:p-8 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex justify-center">
          <div
            ref={printAreaRef}
            className="w-full max-w-2xl bg-white text-slate-900 p-8 md:p-12 rounded-lg shadow-md border border-slate-200 font-serif leading-relaxed text-[13px]"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {/* KOP SURAT */}
            <div className="text-center border-b-[3px] border-double border-slate-900 pb-3 mb-5 relative">
              <div className="text-xs font-bold text-emerald-800 tracking-wider mb-0.5">
                MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL
              </div>
              <div className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">
                PIMPINAN DAERAH MUHAMMADIYAH KABUPATEN KLATEN
              </div>
              <div className="text-[10px] text-slate-600 font-sans mt-1">
                Gedung Dakwah Muhammadiyah, Jl. Pemuda No. 120 Klaten, Jawa Tengah • Telp: (0272) 321852 • Email: dikdasmen@pdmklaten.org
              </div>
            </div>

            {/* JUDUL DOKUMEN SK */}
            <div className="text-center mb-4">
              <h4 className="text-sm font-bold underline tracking-wide uppercase">
                SURAT KEPUTUSAN
              </h4>
              <p className="text-xs font-bold font-mono text-slate-800 mt-0.5">
                Nomor: {templateVars.nomor_sk}
              </p>
            </div>

            {/* TENTANG */}
            <div className="text-center font-bold text-xs uppercase mb-4 px-4 leading-normal">
              TENTANG<br />
              {templateVars.judul_sk}
            </div>

            <div className="text-center font-bold text-xs uppercase mb-3">
              MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL<br />
              PIMPINAN DAERAH MUHAMMADIYAH KABUPATEN KLATEN
            </div>

            {/* KONSIDERANS */}
            <table className="w-full text-xs border-collapse mb-3">
              <tbody>
                <tr>
                  <td className="w-24 font-bold align-top py-0.5">Menimbang</td>
                  <td className="w-4 align-top py-0.5">:</td>
                  <td className="align-top py-0.5 text-justify">
                    <ol className="list-outside list-[lower-alpha] ml-4 space-y-1">
                      {menimbangList.map((item, idx) => (
                        <li key={idx}>{renderTemplateVariables(item, templateVars)}</li>
                      ))}
                    </ol>
                  </td>
                </tr>
                <tr>
                  <td className="font-bold align-top py-0.5 pt-1.5">Mengingat</td>
                  <td className="align-top py-0.5 pt-1.5">:</td>
                  <td className="align-top py-0.5 pt-1.5 text-justify">
                    <ol className="list-outside list-decimal ml-4 space-y-1">
                      {mengingatList.map((item, idx) => (
                        <li key={idx}>{renderTemplateVariables(item, templateVars)}</li>
                      ))}
                    </ol>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* MEMUTUSKAN */}
            <div className="text-center font-bold text-xs uppercase tracking-widest my-3">
              MEMUTUSKAN:
            </div>

            <table className="w-full text-xs border-collapse mb-3">
              <tbody>
                <tr>
                  <td className="w-24 font-bold align-top py-0.5">Menetapkan</td>
                  <td className="w-4 align-top py-0.5">:</td>
                  <td className="align-top py-0.5 font-bold uppercase">
                    {templateVars.judul_sk}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold align-top py-0.5 pt-1.5">PERTAMA</td>
                  <td className="align-top py-0.5 pt-1.5">:</td>
                  <td className="align-top py-0.5 pt-1.5 text-justify">
                    {isSchoolRecipient ? (
                      <div>
                        Menetapkan Izin Pendirian / Operasional Satuan Pendidikan dengan rincian data sebagai berikut:
                        <table className="w-full mt-2 ml-2 text-xs">
                          <tbody>
                            <tr>
                              <td className="w-36 font-semibold py-0.5">Nama Satuan Pendidikan</td>
                              <td className="w-3">:</td>
                              <td className="font-bold py-0.5">{templateVars.nama_sekolah}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">NPSN</td>
                              <td>:</td>
                              <td className="font-mono py-0.5">{templateVars.npsn}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">Jenjang / Status</td>
                              <td>:</td>
                              <td className="py-0.5">{templateVars.jenjang} / Swasta Muhammadiyah</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">Alamat Lengkap</td>
                              <td>:</td>
                              <td className="py-0.5">{templateVars.alamat_sekolah}, {templateVars.kelurahan}, {templateVars.kecamatan}, {templateVars.kabupaten}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">Kepala Sekolah</td>
                              <td>:</td>
                              <td className="py-0.5">{templateVars.nama_kepala_sekolah}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div>
                        Mengangkat / Menetapkan nama yang tercantum di bawah ini:
                        <table className="w-full mt-2 ml-2 text-xs">
                          <tbody>
                            <tr>
                              <td className="w-36 font-semibold py-0.5">Nama Lengkap</td>
                              <td className="w-3">:</td>
                              <td className="font-bold py-0.5">{templateVars.nama_personel}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">NBM / KTAM</td>
                              <td>:</td>
                              <td className="font-mono py-0.5">{templateVars.nbm}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">NIP / NIPM / NUPTK</td>
                              <td>:</td>
                              <td className="font-mono py-0.5">{templateVars.nip}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">Pendidikan Terakhir</td>
                              <td>:</td>
                              <td className="py-0.5">{templateVars.pendidikan} {templateVars.program_studi !== '-' ? `(${templateVars.program_studi})` : ''}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">Jabatan / Penugasan</td>
                              <td>:</td>
                              <td className="font-semibold py-0.5">{templateVars.jabatan}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-0.5">Unit Kerja / Sekolah</td>
                              <td>:</td>
                              <td className="py-0.5">{templateVars.nama_sekolah}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold align-top py-0.5 pt-1.5">KEDUA</td>
                  <td className="align-top py-0.5 pt-1.5">:</td>
                  <td className="align-top py-0.5 pt-1.5 text-justify">
                    Surat Keputusan ini berlaku terhitung mulai tanggal{' '}
                    <strong>{templateVars.tanggal_mulai}</strong> sampai dengan tanggal{' '}
                    <strong>{templateVars.tanggal_akhir}</strong>.
                  </td>
                </tr>
                <tr>
                  <td className="font-bold align-top py-0.5 pt-1.5">KETIGA</td>
                  <td className="align-top py-0.5 pt-1.5">:</td>
                  <td className="align-top py-0.5 pt-1.5 text-justify">
                    {diktumList[0] ? renderTemplateVariables(diktumList[0], templateVars) : 'Keputusan ini disampaikan kepada yang bersangkutan untuk diketahui dan dilaksanakan dengan penuh amanah.'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* TANDA TANGAN & LEGALITAS */}
            <div className="mt-8 flex justify-between items-end pt-4 border-t border-slate-200">
              {/* QR Verification Box */}
              <div className="text-center font-sans">
                <div className="w-20 h-20 border border-slate-300 rounded p-1 bg-slate-50 flex flex-col items-center justify-center mx-auto mb-1">
                  <QrCode className="w-14 h-14 text-slate-800" />
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  E-SK #{sk.id?.substring(0, 8)}<br />
                  Terverifikasi Sah
                </div>
              </div>

              {/* Signature Box */}
              <div className="text-center w-64 relative">
                {/* Stamp Simulation */}
                <div className="absolute left-2 top-2 border-2 border-emerald-700 text-emerald-800 px-3 py-1 rounded font-bold text-[10px] -rotate-6 opacity-85 font-sans pointer-events-none">
                  DIKDASMEN PDM KLATEN<br />
                  ★ TERVERIFIKASI ★
                </div>

                <div className="text-xs">
                  Ditetapkan di : Klaten<br />
                  Pada tanggal : {templateVars.tanggal_penerbitan}
                </div>
                <div className="text-xs font-bold mt-2 uppercase">
                  {kopText.split('\n')[0] || 'MAJELIS DIKDASMEN & PNF PDM KLATEN'}
                </div>
                <div className="text-xs font-bold mb-14">Ketua,</div>
                <div className="text-xs font-bold underline uppercase">
                  {signerName}
                </div>
                <div className="text-[11px] text-slate-600 font-sans">
                  NBM. 842.190.221
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dokumen ini dilengkapi tanda tangan elektronik dan verifikasi digital SIM Dikdasmen.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
