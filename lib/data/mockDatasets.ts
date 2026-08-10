export interface RegionMock {
  id: string;
  name: string;
  type: string;
  area: number;
  latitude: number;
  longitude: number;
}

export const provinces: RegionMock[] = [
  { id: "aceh", name: "Aceh", type: "PROVINCE", area: 57956, latitude: 4.6951, longitude: 96.7494 },
  { id: "sumatera-utara", name: "Sumatera Utara", type: "PROVINCE", area: 72981, latitude: 2.1121, longitude: 99.3986 },
  { id: "sumatera-barat", name: "Sumatera Barat", type: "PROVINCE", area: 42012, latitude: -0.7399, longitude: 100.8086 },
  { id: "riau", name: "Riau", type: "PROVINCE", area: 87023, latitude: 0.5071, longitude: 101.5434 },
  { id: "kepulauan-riau", name: "Kepulauan Riau", type: "PROVINCE", area: 8201, latitude: 3.9456, longitude: 108.1428 },
  { id: "jambi", name: "Jambi", type: "PROVINCE", area: 50058, latitude: -1.6101, longitude: 103.6131 },
  { id: "sumatera-selatan", name: "Sumatera Selatan", type: "PROVINCE", area: 91592, latitude: -3.3194, longitude: 104.9145 },
  { id: "bangka-belitung", name: "Kepulauan Bangka Belitung", type: "PROVINCE", area: 16424, latitude: -2.7410, longitude: 106.4406 },
  { id: "bengkulu", name: "Bengkulu", type: "PROVINCE", area: 19919, latitude: -3.7928, longitude: 102.2608 },
  { id: "lampung", name: "Lampung", type: "PROVINCE", area: 34623, latitude: -4.5586, longitude: 105.4000 },
  { id: "dki-jakarta", name: "DKI Jakarta", type: "PROVINCE", area: 664, latitude: -6.2088, longitude: 106.8456 },
  { id: "jawa-barat", name: "Jawa Barat", type: "PROVINCE", area: 35377, latitude: -7.0909, longitude: 107.6689 },
  { id: "banten", name: "Banten", type: "PROVINCE", area: 9662, latitude: -6.4058, longitude: 106.0600 },
  { id: "jawa-tengah", name: "Jawa Tengah", type: "PROVINCE", area: 32800, latitude: -7.1509, longitude: 110.1402 },
  { id: "di-yogyakarta", name: "DI Yogyakarta", type: "PROVINCE", area: 3133, latitude: -7.8753, longitude: 110.4262 },
  { id: "jawa-timur", name: "Jawa Timur", type: "PROVINCE", area: 47799, latitude: -7.5360, longitude: 112.2384 },
  { id: "bali", name: "Bali", type: "PROVINCE", area: 5780, latitude: -8.4095, longitude: 115.1889 },
  { id: "nusa-tenggara-barat", name: "Nusa Tenggara Barat", type: "PROVINCE", area: 18574, latitude: -8.6529, longitude: 117.3616 },
  { id: "nusa-tenggara-timur", name: "Nusa Tenggara Timur", type: "PROVINCE", area: 48718, latitude: -8.6573, longitude: 121.0794 },
  { id: "kalimantan-barat", name: "Kalimantan Barat", type: "PROVINCE", area: 147307, latitude: -0.2787, longitude: 111.4753 },
  { id: "kalimantan-tengah", name: "Kalimantan Tengah", type: "PROVINCE", area: 153564, latitude: -1.6814, longitude: 113.3823 },
  { id: "kalimantan-selatan", name: "Kalimantan Selatan", type: "PROVINCE", area: 38744, latitude: -3.0926, longitude: 115.2837 },
  { id: "kalimantan-timur", name: "Kalimantan Timur", type: "PROVINCE", area: 127346, latitude: 0.5386, longitude: 116.4193 },
  { id: "kalimantan-utara", name: "Kalimantan Utara", type: "PROVINCE", area: 75218, latitude: 2.7259, longitude: 116.9110 },
  { id: "sulawesi-utara", name: "Sulawesi Utara", type: "PROVINCE", area: 13851, latitude: 1.2739, longitude: 124.8481 },
  { id: "gorontalo", name: "Gorontalo", type: "PROVINCE", area: 11257, latitude: 0.6999, longitude: 122.4467 },
  { id: "sulawesi-tengah", name: "Sulawesi Tengah", type: "PROVINCE", area: 61841, latitude: -1.4300, longitude: 121.4456 },
  { id: "sulawesi-barat", name: "Sulawesi Barat", type: "PROVINCE", area: 16787, latitude: -2.8441, longitude: 119.3323 },
  { id: "sulawesi-selatan", name: "Sulawesi Selatan", type: "PROVINCE", area: 46717, latitude: -3.6687, longitude: 119.9740 },
  { id: "sulawesi-tenggara", name: "Sulawesi Tenggara", type: "PROVINCE", area: 38067, latitude: -4.1449, longitude: 122.1746 },
  { id: "maluku", name: "Maluku", type: "PROVINCE", area: 46914, latitude: -3.2384, longitude: 130.1452 },
  { id: "maluku-utara", name: "Maluku Utara", type: "PROVINCE", area: 31982, latitude: 0.8336, longitude: 127.6837 },
  { id: "papua-barat", name: "Papua Barat", type: "PROVINCE", area: 64134, latitude: -1.3361, longitude: 132.5768 },
  { id: "papua", name: "Papua", type: "PROVINCE", area: 81049, latitude: -2.3330, longitude: 138.0000 },
  { id: "papua-selatan", name: "Papua Selatan", type: "PROVINCE", area: 131493, latitude: -7.0000, longitude: 139.0000 },
  { id: "papua-tengah", name: "Papua Tengah", type: "PROVINCE", area: 66130, latitude: -4.0000, longitude: 136.0000 },
  { id: "papua-pegunungan", name: "Papua Pegunungan", type: "PROVINCE", area: 51213, latitude: -4.3000, longitude: 139.5000 },
  { id: "papua-barat-daya", name: "Papua Barat Daya", type: "PROVINCE", area: 39116, latitude: -1.1500, longitude: 131.3000 },
];

export interface DataSourceMock {
  id: string;
  name: string;
  url: string;
}

export const dataSources: DataSourceMock[] = [
  { id: "bps", name: "Badan Pusat Statistik (BPS)", url: "https://www.bps.go.id" },
  { id: "kemendikbud", name: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi", url: "https://www.kemdikbud.go.id" },
  { id: "kemenkes", name: "Kementerian Kesehatan RI", url: "https://www.kemkes.go.id" },
  { id: "kemenkopukm", name: "Kementerian Koperasi dan UKM", url: "https://kemenkopukm.go.id" },
  { id: "klhk", name: "Kementerian Lingkungan Hidup dan Kehutanan", url: "https://www.menlhk.go.id" },
];

export interface DatasetMock {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  unit: string;
  methodology: string;
  dataSourceId: string;
}

export const datasets: DatasetMock[] = [
  {
    id: "demografi-penduduk",
    title: "Populasi Penduduk Menurut Provinsi",
    description: "Data estimasi jumlah penduduk pertengahan tahun berdasarkan hasil sensus dan survei demografi.",
    category: "DEMOGRAFI",
    status: "Verified",
    unit: "Jiwa",
    methodology: "Estimasi kohort komponen berdasarkan kelahiran, kematian, dan migrasi neto.",
    dataSourceId: "bps",
  },
  {
    id: "kemiskinan-provinsi",
    title: "Tingkat Kemiskinan Menurut Provinsi",
    description: "Persentase penduduk yang memiliki rata-rata pengeluaran per kapita per bulan di bawah Garis Kemiskinan.",
    category: "EKONOMI",
    status: "Verified",
    unit: "%",
    methodology: "Data dihitung berdasarkan Survei Sosial Ekonomi Nasional (Susenas) konsumsi dan pengeluaran.",
    dataSourceId: "bps",
  },
  {
    id: "pendidikan-melek-huruf",
    title: "Angka Melek Huruf Penduduk Usia 15 Tahun ke Atas",
    description: "Persentase penduduk usia 15 tahun ke atas yang dapat membaca dan menulis huruf latin dan/atau huruf lainnya.",
    category: "PENDIDIKAN",
    status: "Verified",
    unit: "%",
    methodology: "Diperoleh melalui kuesioner kor Susenas modul pendidikan.",
    dataSourceId: "kemendikbud",
  },
  {
    id: "komunikasi-akses-internet",
    title: "Persentase Rumah Tangga yang Mengakses Internet",
    description: "Persentase rumah tangga yang menggunakan atau memiliki akses internet dalam 3 bulan terakhir.",
    category: "INFRASTRUKTUR",
    status: "Verified",
    unit: "%",
    methodology: "Diperoleh melalui kuesioner kor Susenas modul teknologi informasi dan komunikasi.",
    dataSourceId: "bps",
  },
  {
    id: "kesehatan-puskesmas-rs",
    title: "Jumlah Fasilitas Kesehatan Aktif",
    description: "Jumlah total Rumah Sakit, Puskesmas, Klinik Pratama, dan Poskesdes aktif di tingkat wilayah.",
    category: "KESEHATAN",
    status: "Verified",
    unit: "Unit",
    methodology: "Registrasi Fasilitas Pelayanan Kesehatan terintegrasi RS Online dan Komdat Kesehatan.",
    dataSourceId: "kemenkes",
  },
  {
    id: "ekonomi-umkm",
    title: "Jumlah UMKM Terdaftar",
    description: "Estimasi jumlah usaha mikro, kecil, dan menengah yang terdaftar secara resmi di daerah.",
    category: "UMKM",
    status: "Verified",
    unit: "Unit Usaha",
    methodology: "Data dikompilasi dari sistem database tunggal kementerian koperasi dan UKM (SIDT).",
    dataSourceId: "kemenkopukm",
  },
  {
    id: "ekonomi-pdrb",
    title: "PDRB atas Dasar Harga Konstan (ADHK)",
    description: "Produk Domestik Regional Bruto (PDRB) atas dasar harga konstan 2010 menurut provinsi.",
    category: "EKONOMI",
    status: "Verified",
    unit: "Miliar Rupiah",
    methodology: "Perhitungan nilai tambah bruto seluruh sektor ekonomi di wilayah tersebut menggunakan tahun dasar 2010.",
    dataSourceId: "bps",
  },
  {
    id: "ekonomi-pengangguran",
    title: "Tingkat Pengangguran Terbuka (TPT)",
    description: "Persentase jumlah penganggur terhadap jumlah angkatan kerja di tingkat wilayah.",
    category: "EKONOMI",
    status: "Verified",
    unit: "%",
    methodology: "Dihitung berdasarkan Survei Angkatan Kerja Nasional (Sakernas) BPS periode Agustus.",
    dataSourceId: "bps",
  },
  {
    id: "infrastruktur-listrik",
    title: "Rasio Elektrifikasi Wilayah",
    description: "Perbandingan jumlah rumah tangga berlistrik (baik PLN maupun non-PLN) dengan total rumah tangga.",
    category: "INFRASTRUKTUR",
    status: "Verified",
    unit: "%",
    methodology: "Data gabungan dari laporan PT PLN (Persero) dan kuesioner perumahan Susenas.",
    dataSourceId: "bps",
  },
  {
    id: "lingkungan-kualitas-udara",
    title: "Indeks Kualitas Udara (IKU)",
    description: "Indikator tingkat kebersihan udara berdasarkan konsentrasi polutan utama (PM2.5, SO2, NO2, O3, CO).",
    category: "LINGKUNGAN",
    status: "Verified",
    unit: "Poin",
    methodology: "Hasil pengukuran dari stasiun pemantauan kualitas udara otomatis (AQMS) dan manual kementerian.",
    dataSourceId: "klhk",
  },
];

export interface IndicatorMock {
  id: string;
  name: string;
  code: string;
  datasetId: string;
}

export const indicators: IndicatorMock[] = [
  { id: "ind-populasi", name: "Populasi Penduduk", code: "POPULATION", datasetId: "demografi-penduduk" },
  { id: "ind-kemiskinan", name: "Tingkat Kemiskinan", code: "POVERTY_RATE", datasetId: "kemiskinan-provinsi" },
  { id: "ind-melek-huruf", name: "Angka Melek Huruf", code: "LITERACY_RATE", datasetId: "pendidikan-melek-huruf" },
  { id: "ind-akses-internet", name: "Akses Internet Rumah Tangga", code: "INTERNET_ACCESS", datasetId: "komunikasi-akses-internet" },
  { id: "ind-faskes", name: "Fasilitas Kesehatan", code: "HEALTH_FACILITIES", datasetId: "kesehatan-puskesmas-rs" },
  { id: "ind-umkm", name: "Jumlah UMKM", code: "UMKM_COUNT", datasetId: "ekonomi-umkm" },
  { id: "ind-pdrb", name: "Nilai PDRB ADHK", code: "PDRB_VALUE", datasetId: "ekonomi-pdrb" },
  { id: "ind-pengangguran", name: "Tingkat Pengangguran Terbuka", code: "UNEMPLOYMENT_RATE", datasetId: "ekonomi-pengangguran" },
  { id: "ind-listrik", name: "Rasio Elektrifikasi", code: "ELECTRICITY_ACCESS", datasetId: "infrastruktur-listrik" },
  { id: "ind-udara", name: "Indeks Kualitas Udara", code: "AIR_QUALITY", datasetId: "lingkungan-kualitas-udara" },
];

export interface DataPointMock {
  id: string;
  regionId: string;
  indicatorId: string;
  year: number;
  value: number;
}

// Generate realistic data points procedurally
export function generateMockDataPoints(): DataPointMock[] {
  const points: DataPointMock[] = [];
  const years = [2021, 2022, 2023, 2024, 2025, 2026];

  // Base configurations for provinces to generate realistic values
  const baseStats: Record<string, Record<string, { base: number; trend: number; scatter: number }>> = {
    // ID -> Indicator Code -> Base value, annual trend multiplier/increment, scatter (randomness factor)
  };

  // Seed values based on approximate real statistics for provinces
  provinces.forEach((p) => {
    baseStats[p.id] = {};

    // POPULATION (base in absolute number of people, e.g. Jawa Barat is ~49M, Papua is ~1M)
    let popBase = 2000000; // default 2 million
    if (p.id === "jawa-barat") popBase = 48500000;
    else if (p.id === "jawa-timur") popBase = 41200000;
    else if (p.id === "jawa-tengah") popBase = 36800000;
    else if (p.id === "sumatera-utara") popBase = 15000000;
    else if (p.id === "banten") popBase = 12000000;
    else if (p.id === "dki-jakarta") popBase = 10600000;
    else if (p.id === "sulawesi-selatan") popBase = 9100000;
    else if (p.id === "lampung") popBase = 9000000;
    else if (p.id === "sumatera-selatan") popBase = 8600000;
    else if (p.id === "riau") popBase = 6500000;
    else if (p.id === "sumatera-barat") popBase = 5600000;
    else if (p.id === "ntt") popBase = 5400000;
    else if (p.id === "ntb") popBase = 5300000;
    else if (p.id === "bali") popBase = 4300000;
    else if (p.id === "aceh") popBase = 5300000;
    else if (p.id === "kalimantan-barat") popBase = 5500000;
    else if (p.id === "kalimantan-timur") popBase = 3800000;
    else if (p.id === "papua") popBase = 1000000;
    else if (p.id.startsWith("papua-")) popBase = 700000; // split newer papua provinces

    baseStats[p.id]["POPULATION"] = { base: popBase, trend: 1.011, scatter: 0.002 };

    // POVERTY_RATE (base in %, Jawa Barat ~7.5%, Papua ~20-26%, Bali ~4%)
    let povBase = 8.5; // default
    if (p.id === "bali") povBase = 3.8;
    else if (p.id === "dki-jakarta") povBase = 4.4;
    else if (p.id === "sulawesi-utara") povBase = 5.2;
    else if (p.id === "kepulauan-riau") povBase = 5.8;
    else if (p.id === "bangka-belitung") povBase = 4.7;
    else if (p.id === "jawa-timur") povBase = 10.4;
    else if (p.id === "jawa-tengah") povBase = 11.0;
    else if (p.id === "yogyakarta") povBase = 11.5;
    else if (p.id === "nusa-tenggara-timur") povBase = 20.1;
    else if (p.id === "papua-pegunungan") povBase = 27.5;
    else if (p.id === "papua") povBase = 26.2;
    else if (p.id === "maluku") povBase = 16.2;
    else if (p.id === "bengkulu") povBase = 14.5;
    else if (p.id === "aceh") povBase = 14.8;

    baseStats[p.id]["POVERTY_RATE"] = { base: povBase, trend: -0.25, scatter: 0.15 }; // decreases by 0.25% per year on average

    // LITERACY_RATE (%)
    let litBase = 96.5;
    if (p.id === "dki-jakarta") litBase = 99.7;
    else if (p.id === "sulawesi-utara") litBase = 99.6;
    else if (p.id === "bali") litBase = 98.2;
    else if (p.id === "jawa-barat") litBase = 98.5;
    else if (p.id === "papua-pegunungan") litBase = 82.5; // lower in pegunungan
    else if (p.id === "nusa-tenggara-timur") litBase = 93.5;

    baseStats[p.id]["LITERACY_RATE"] = { base: litBase, trend: 0.15, scatter: 0.05 }; // slowly increases by 0.15% per year

    // INTERNET_ACCESS (%)
    let netBase = 72.0;
    if (p.id === "dki-jakarta") netBase = 94.5;
    else if (p.id === "kepulauan-riau") netBase = 88.0;
    else if (p.id === "bali") netBase = 85.0;
    else if (p.id === "jawa-barat") netBase = 83.0;
    else if (p.id === "jawa-timur") netBase = 79.5;
    else if (p.id === "nusa-tenggara-timur") netBase = 58.0;
    else if (p.id.startsWith("papua")) netBase = 45.0;

    baseStats[p.id]["INTERNET_ACCESS"] = { base: netBase, trend: 2.8, scatter: 0.5 }; // grows 2.8% per year

    // HEALTH_FACILITIES (absolute count of hospitals/clinics/puskesmas)
    let hfBase = Math.floor(p.area / 200) + Math.floor(popBase / 50000);
    hfBase = Math.max(40, Math.min(hfBase, 1200)); // cap realistic boundaries
    if (p.id === "dki-jakarta") hfBase = 650; // dense
    baseStats[p.id]["HEALTH_FACILITIES"] = { base: hfBase, trend: 8, scatter: 2 }; // grows by 8 units per year

    // UMKM_COUNT (scaled based on population)
    let umkmBase = Math.floor(popBase * 0.04); // ~4% of population are registered UMKM
    baseStats[p.id]["UMKM_COUNT"] = { base: umkmBase, trend: 1.035, scatter: 0.005 }; // 3.5% growth

    // PDRB_VALUE (in Billion IDR)
    let pdrbBase = Math.floor((popBase / 1000000) * 35000); // 35 million IDR GDP per capita base
    if (p.id === "dki-jakarta") pdrbBase = 2200000; // Jakarta is extremely high
    else if (p.id === "kalimantan-timur") pdrbBase = 450000; // Mining rich
    else if (p.id === "jawa-timur") pdrbBase = 1800000;
    else if (p.id === "jawa-barat") pdrbBase = 1750000;
    else if (p.id === "jawa-tengah") pdrbBase = 1100000;
    baseStats[p.id]["PDRB_VALUE"] = { base: pdrbBase, trend: 1.048, scatter: 0.005 }; // 4.8% economic growth

    // UNEMPLOYMENT_RATE (%)
    let unempBase = 5.5;
    if (p.id === "dki-jakarta") unempBase = 7.8;
    else if (p.id === "banten") unempBase = 8.5;
    else if (p.id === "jawa-barat") unempBase = 7.6;
    else if (p.id === "bali") unempBase = 3.2; // tourism high
    else if (p.id === "gorontalo") unempBase = 3.5;
    baseStats[p.id]["UNEMPLOYMENT_RATE"] = { base: unempBase, trend: -0.22, scatter: 0.15 }; // post-COVID recovery trend

    // ELECTRICITY_ACCESS (%)
    let elecBase = 98.2;
    if (p.id === "dki-jakarta" || p.id === "bali") elecBase = 99.9;
    else if (p.id === "nusa-tenggara-timur") elecBase = 89.2;
    else if (p.id.startsWith("papua")) elecBase = 78.5;
    baseStats[p.id]["ELECTRICITY_ACCESS"] = { base: elecBase, trend: 0.45, scatter: 0.05 }; // slowly approach 100%

    // AIR_QUALITY (points)
    let airBase = 74.0;
    if (p.id === "dki-jakarta") airBase = 51.5; // low air quality
    else if (p.id === "jawa-barat") airBase = 62.0;
    else if (p.id === "kalimantan-utara") airBase = 86.0; // clean
    else if (p.id === "papua-pegunungan") airBase = 88.0;
    baseStats[p.id]["AIR_QUALITY"] = { base: airBase, trend: -0.15, scatter: 1.2 }; // fluctuates slightly, small decrease due to industrialization
  });

  // Now populate the data points array
  let pointIdCounter = 1;
  indicators.forEach((ind) => {
    provinces.forEach((p) => {
      const stats = baseStats[p.id][ind.code];
      if (!stats) return;

      years.forEach((year, idx) => {
        let value = 0;
        const diff = idx; // index from 2021

        if (ind.code === "POPULATION" || ind.code === "UMKM_COUNT" || ind.code === "PDRB_VALUE") {
          // Compound growth
          const randomMultiplier = 1 + (Math.sin(p.name.length + year) * stats.scatter);
          value = stats.base * Math.pow(stats.trend, diff) * randomMultiplier;
          value = Math.round(value);
        } else if (ind.code === "POVERTY_RATE" || ind.code === "UNEMPLOYMENT_RATE" || ind.code === "AIR_QUALITY") {
          // Linear change with fluctuation
          const randomFluc = Math.cos(p.name.length * 3 + year) * stats.scatter;
          value = stats.base + (stats.trend * diff) + randomFluc;
          value = Math.max(0.1, parseFloat(value.toFixed(2)));
        } else if (ind.code === "LITERACY_RATE" || ind.code === "INTERNET_ACCESS" || ind.code === "ELECTRICITY_ACCESS") {
          // Linear growth capped at 100%
          const randomFluc = Math.sin(p.name.length * 2 + year) * stats.scatter;
          value = stats.base + (stats.trend * diff) + randomFluc;
          value = Math.min(100.0, Math.max(10.0, parseFloat(value.toFixed(2))));
        } else {
          // Integer growth
          const randomFluc = Math.round(Math.sin(p.name.length + year) * stats.scatter);
          value = stats.base + (stats.trend * diff) + randomFluc;
          value = Math.max(0, Math.round(value));
        }

        points.push({
          id: `dp-${pointIdCounter++}`,
          regionId: p.id,
          indicatorId: ind.id,
          year,
          value,
        });
      });
    });
  });

  return points;
}
