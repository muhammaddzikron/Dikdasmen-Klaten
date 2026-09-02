import { Cabang, Sekolah } from '../types';

export const PDM_KLATEN_NPSN_LIST = [
  '20309653', // SMP Muhammadiyah 1 Klaten
  '20363271', // MTs Muhammadiyah Klaten
  '20309695', // SMA Muhammadiyah 1 Klaten
  '60728951', // MA Muhammadiyah Klaten
  '20309531', // SMK Muhammadiyah 1 Klaten Utara
  '20309537', // SMK Muhammadiyah 2 Klaten Utara
  '20309528', // SMK Muhammadiyah 3 Klaten Utara
  '20309538', // SMK Muhammadiyah 1 Klaten Tengah
  '20309539', // SMK Muhammadiyah 3 Klaten Tengah
  '20309536', // SMK Muhammadiyah 4 Klaten Tengah
];

export const isPdmKlatenSchool = (school: Partial<Sekolah> | undefined | null): boolean => {
  if (!school) return false;
  const npsn = String(school.npsn || '').trim();
  if (PDM_KLATEN_NPSN_LIST.includes(npsn)) return true;

  const id = String(school.id || '').toLowerCase().trim();
  if (
    id === 'sch-20309653' ||
    id === 'sch-20363271' ||
    id === 'sch-20309695' ||
    id === 'sch-60728951' ||
    id === 'sch-20309531' ||
    id === 'sch-20309537' ||
    id === 'sch-20309528' ||
    id === 'sch-20309538' ||
    id === 'sch-20309539' ||
    id === 'sch-20309536'
  ) {
    return true;
  }

  const name = String(school.name || '').toLowerCase();
  if (name.includes('smp muhammadiyah 1 klaten')) return true;
  if (name.includes('mts muhammadiyah klaten')) return true;
  if (name.includes('sma muhammadiyah 1 klaten')) return true;
  if (name.includes('ma muhammadiyah klaten')) return true;
  if (name.includes('smk muhammadiyah 1 klaten utara')) return true;
  if (name.includes('smk muhammadiyah 2 klaten utara')) return true;
  if (name.includes('smk muhammadiyah 3 klaten utara')) return true;
  if (name.includes('smk muhammadiyah 1 klaten tengah')) return true;
  if (name.includes('smk muhammadiyah 3 klaten tengah')) return true;
  if (name.includes('smk muhammadiyah 4 klaten tengah')) return true;

  return false;
};

export const isPdmKlatenCabang = (cabang: Partial<Cabang> | string | undefined | null): boolean => {
  if (!cabang) return false;
  if (typeof cabang === 'string') {
    const str = cabang.toLowerCase().trim();
    return (
      str === 'cabang-klaten-kota' ||
      str === 'pcm-klt-01' ||
      str === 'pcm_klatenkota' ||
      str.includes('pdm') ||
      str.includes('dikdasmen daerah') ||
      str.includes('klaten kota') ||
      str.includes('klaten-kota')
    );
  }
  const id = String(cabang.id || '').toLowerCase().trim();
  const code = String(cabang.code || '').toLowerCase().trim();
  const name = String(cabang.name || '').toLowerCase().trim();
  const username = String(cabang.username || '').toLowerCase().trim();

  return (
    id === 'cabang-klaten-kota' ||
    id.includes('pdm') ||
    code === 'pcm-klt-01' ||
    username === 'pcm_klatenkota' ||
    name.includes('pdm klaten') ||
    name.includes('dikdasmen daerah') ||
    name.includes('klaten kota')
  );
};

export const isSchoolUnderCabang = (school: Sekolah | undefined | null, cabang: Cabang | undefined | null): boolean => {
  if (!school || !cabang || school.isDeleted) return false;

  // 1. PDM Klaten special matching for the 10 schools
  if (isPdmKlatenCabang(cabang) && isPdmKlatenSchool(school)) {
    return true;
  }

  const sCabangId = String(school.cabangId || '').toLowerCase().trim();
  const cId = String(cabang.id || '').toLowerCase().trim();
  const cCode = String(cabang.code || '').toLowerCase().trim();
  const cName = String(cabang.name || '').toLowerCase().trim();
  const cUsername = String(cabang.username || '').toLowerCase().trim();
  const sKecamatan = String(school.kecamatan || '').toLowerCase().trim();

  // 2. Direct ID, code, or username match
  if (sCabangId && (sCabangId === cId || (cCode && sCabangId === cCode) || (cUsername && sCabangId === cUsername))) {
    return true;
  }

  // 3. Fallback for PDM Cabang matching schools labeled cabang-klaten-kota
  if (isPdmKlatenCabang(cabang)) {
    if (sCabangId === 'cabang-klaten-kota' || sCabangId.includes('pdm') || sCabangId.includes('kota')) {
      return true;
    }
  }

  // 4. District / Kecamatan Name Matching
  const cleanCabangName = cName
    .toLowerCase()
    .replace(/^(majelis\s+(cabang|dikdasmen)\s+dan\s+pnf|pcm|cabang|pdm)\s+/i, '')
    .trim();

  if (cleanCabangName && cleanCabangName.length >= 3) {
    if (sKecamatan.includes(cleanCabangName) || sCabangId.includes(cleanCabangName)) {
      // Avoid mismatching Klaten Utara / Tengah with PDM if they have their own Cabang
      if (cleanCabangName === 'klaten utara' && isPdmKlatenSchool(school)) {
        // PDM schools belong to PDM Klaten, not the PCM branch
        return false;
      }
      return true;
    }
  }

  return false;
};

export const isSchoolUnderCabangId = (
  school: Sekolah | undefined | null,
  cabangIdOrCode: string,
  cabangList: Cabang[]
): boolean => {
  if (!school || !cabangIdOrCode || cabangIdOrCode === 'ALL') return true;

  const targetCabang = cabangList.find(
    (c) =>
      c.id === cabangIdOrCode ||
      (c.code && c.code.toLowerCase() === cabangIdOrCode.toLowerCase()) ||
      (c.name && c.name.toLowerCase() === cabangIdOrCode.toLowerCase())
  );

  if (targetCabang) {
    return isSchoolUnderCabang(school, targetCabang);
  }

  if (isPdmKlatenCabang(cabangIdOrCode) && isPdmKlatenSchool(school)) {
    return true;
  }

  const sCabangId = String(school.cabangId || '').toLowerCase().trim();
  return sCabangId === cabangIdOrCode.toLowerCase().trim();
};
