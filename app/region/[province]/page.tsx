"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Landmark, 
  MapPin, 
  Layers, 
  Calendar, 
  ArrowLeft,
  Coins,
  GraduationCap,
  Activity,
  Zap,
  Leaf,
  Info,
  ShieldAlert
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomLineChart from "@/components/charts/CustomLineChart";
import dataProvider from "@/lib/providers";

export default function RegionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const provinceSlug = params.province as string;

  const [region, setRegion] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isDemoData, setIsDemoData] = useState<boolean>(true);

  useEffect(() => {
    async function loadRegionData() {
      setLoading(true);
      try {
        const regInfo = await dataProvider.getRegion(provinceSlug);
        if (!regInfo) {
          setRegion(null);
          setLoading(false);
          return;
        }
        setRegion(regInfo);

        // Fetch all points for this region
        const points = await dataProvider.getDataPoints({
          regionId: provinceSlug,
        });

        // Group points by year for charting
        const years = [2021, 2022, 2023, 2024, 2025, 2026];
        const indicatorsList = await dataProvider.getIndicators();

        const formattedTimeline = years.map((year) => {
          const yearRow: Record<string, any> = { year };
          
          indicatorsList.forEach((ind: any) => {
            const pt = points.find((p: any) => p.indicatorId === ind.id && p.year === year);
            if (pt) {
              yearRow[ind.code] = pt.value;
            } else {
              yearRow[ind.code] = 0;
            }
          });

          return yearRow;
        });

        setHistoricalData(formattedTimeline);

        // Check if data is demo or verified
        const datasets = await dataProvider.getDatasets();
        const hasOfficial = datasets.some(d => d.status === "Official" || d.status === "Verified");
        setIsDemoData(!hasOfficial);
      } catch (error) {
        console.error("Failed to load region details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (provinceSlug) {
      loadRegionData();
    }
  }, [provinceSlug]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-red-600"></div>
        <span className="mt-4 text-xs font-semibold text-slate-500">Memuat profil wilayah...</span>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="flex-1 w-full max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-extrabold text-2xl text-navy-950 dark:text-white">Wilayah Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">Maaf, kami tidak dapat menemukan data untuk wilayah dengan kode &quot;{provinceSlug}&quot;.</p>
        <Button onClick={() => router.push("/map")} className="rounded-full bg-red-600 hover:bg-red-700 text-white">
          Kembali ke Peta
        </Button>
      </div>
    );
  }

  // Get latest 2026 stats for display cards
  const getLatestValue = (code: string, fallback = 0) => {
    if (historicalData.length === 0) return fallback;
    const latestRow = historicalData.find((r) => r.year === 2026);
    return latestRow && latestRow[code] !== undefined ? latestRow[code] : fallback;
  };

  const getChangePercent = (code: string) => {
    if (historicalData.length < 2) return 0;
    const row2026 = historicalData.find((r) => r.year === 2026);
    const row2025 = historicalData.find((r) => r.year === 2025);
    if (!row2026 || !row2025 || !row2025[code]) return 0;
    return ((row2026[code] - row2025[code]) / row2025[code]) * 100;
  };

  const formatNumber = (num: number, code: string) => {
    if (code === "POPULATION") {
      return `${(num / 1000000).toFixed(2)} Juta`;
    }
    if (code === "UMKM_COUNT") {
      return `${num.toLocaleString("id-ID")}`;
    }
    if (code === "PDRB_VALUE") {
      return `Rp ${num.toLocaleString("id-ID")} M`;
    }
    return num.toLocaleString("id-ID");
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Breadcrumb Back Button */}
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 font-semibold cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Peta / Wilayah
      </button>

      {/* Region Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-lg bg-navy-50 text-navy-900 dark:bg-navy-950/30 dark:text-navy-400 flex items-center justify-center">
              <Landmark className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-extrabold text-2xl sm:text-4xl text-navy-950 dark:text-white tracking-tight">
                {region.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Republik Indonesia</span>
                <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-semibold uppercase">
                  {region.type}
                </span>
                {isDemoData && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                    ⚠️ DEMO
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5 justify-end">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Pembaruan Terakhir: 2026</span>
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-slate-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50">
          <CardContent className="pt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Populasi (2026)
            </span>
            <span className="text-2xl font-extrabold text-navy-950 dark:text-white mt-1 block">
              {formatNumber(getLatestValue("POPULATION"), "POPULATION")}
            </span>
            <span className="text-[10px] text-slate-450 mt-1 block leading-normal">
              Tumbuh sekitar {getChangePercent("POPULATION").toFixed(2)}% dibanding tahun sebelumnya.
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50">
          <CardContent className="pt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Jumlah Kota / Kabupaten
            </span>
            <span className="text-2xl font-extrabold text-navy-950 dark:text-white mt-1 block">
              {region.citiesCount} Wilayah
            </span>
            <span className="text-[10px] text-slate-455 mt-1 block leading-normal">
              Jumlah pembagian wilayah administratif tingkat dua resmi.
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50">
          <CardContent className="pt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Luas Wilayah Daratan
            </span>
            <span className="text-2xl font-extrabold text-navy-950 dark:text-white mt-1 block">
              {region.area.toLocaleString("id-ID")} km²
            </span>
            <span className="text-[10px] text-slate-450 mt-1 block leading-normal">
              Kepadatan Penduduk: ~{Math.round(getLatestValue("POPULATION") / region.area)} jiwa / km².
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Segment */}
      <Tabs defaultValue="ekonomi" className="space-y-6">
        <TabsList className="bg-slate-100/80 border border-slate-200/50 p-1 dark:bg-slate-900/80 dark:border-slate-800 w-full md:w-auto flex flex-wrap h-auto gap-1">
          <TabsTrigger value="ekonomi" className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            <Coins className="h-4 w-4 text-amber-500" /> Ekonomi
          </TabsTrigger>
          <TabsTrigger value="pendidikan" className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            <GraduationCap className="h-4 w-4 text-blue-500" /> Pendidikan
          </TabsTrigger>
          <TabsTrigger value="kesehatan" className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            <Activity className="h-4 w-4 text-emerald-500" /> Kesehatan
          </TabsTrigger>
          <TabsTrigger value="infrastruktur" className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            <Zap className="h-4 w-4 text-indigo-500" /> Infrastruktur
          </TabsTrigger>
          <TabsTrigger value="lingkungan" className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            <Leaf className="h-4 w-4 text-teal-500" /> Lingkungan
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Ekonomi */}
        <TabsContent value="ekonomi" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
          <div className="lg:col-span-2">
            <Card className="border-slate-200/80 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                  Pertumbuhan Ekonomi (Tren Nilai PDRB ADHK)
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-455">
                  Produk Domestik Regional Bruto (ADHK 2010) periode 2021-2026.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomLineChart
                  data={historicalData}
                  series={[
                    { key: "PDRB_VALUE", name: "PDRB ADHK (Miliar Rp)", color: "#243b53" }
                  ]}
                  unit=""
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Indikator Ekonomi Utama (2026)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Tingkat Kemiskinan</span>
                  <div className="text-right">
                    <span className="font-extrabold text-navy-950 dark:text-white">{getLatestValue("POVERTY_RATE")}%</span>
                    <span className={`block text-[9px] font-semibold ${getChangePercent("POVERTY_RATE") < 0 ? "text-green-600" : "text-red-600"}`}>
                      {getChangePercent("POVERTY_RATE").toFixed(2)}% dari 2025
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Tingkat Pengangguran Terbuka</span>
                  <div className="text-right">
                    <span className="font-extrabold text-navy-950 dark:text-white">{getLatestValue("UNEMPLOYMENT_RATE")}%</span>
                    <span className={`block text-[9px] font-semibold ${getChangePercent("UNEMPLOYMENT_RATE") < 0 ? "text-green-600" : "text-red-600"}`}>
                      {getChangePercent("UNEMPLOYMENT_RATE").toFixed(2)}% dari 2025
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Jumlah UMKM Terdaftar</span>
                  <div className="text-right">
                    <span className="font-extrabold text-navy-950 dark:text-white">{formatNumber(getLatestValue("UMKM_COUNT"), "UMKM_COUNT")}</span>
                    <span className="block text-[9px] text-green-600 font-semibold">
                      +{getChangePercent("UMKM_COUNT").toFixed(2)}% dari 2025
                    </span>
                  </div>
                </div>

              </CardContent>
            </Card>
            
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex gap-2 text-[10px] text-slate-500">
              <Info className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
              <span>PDRB merupakan indikator moneter utama yang menggambarkan total produksi dan nilai tambah bruto di provinsi tersebut.</span>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Pendidikan */}
        <TabsContent value="pendidikan" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
          <div className="lg:col-span-2">
            <Card className="border-slate-200/80 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                  Perkembangan Literasi (Tren Angka Melek Huruf)
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-455">
                  Persentase penduduk usia 15 tahun ke atas yang melek aksara periode 2021-2026.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomLineChart
                  data={historicalData}
                  series={[
                    { key: "LITERACY_RATE", name: "Angka Melek Huruf (%)", color: "#3b82f6" }
                  ]}
                  unit="%"
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Indikator Pendidikan (2026)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">
                    Angka Melek Huruf (AMH)
                  </span>
                  <span className="text-3xl font-extrabold text-navy-950 dark:text-white mt-1 block">
                    {getLatestValue("LITERACY_RATE")}%
                  </span>
                  <span className="text-[10px] text-green-600 font-semibold block mt-1">
                    Tumbuh +{getChangePercent("LITERACY_RATE").toFixed(2)}% dibanding tahun 2025
                  </span>
                </div>
                <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
                  Angka melek huruf yang tinggi mencerminkan keberhasilan akses pendidikan dasar gratis dan program pemberantasan buta aksara di provinsi {region.name}.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Kesehatan */}
        <TabsContent value="kesehatan" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
          <div className="lg:col-span-2">
            <Card className="border-slate-200/80 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                  Penyediaan Layanan Kesehatan (Tren Fasilitas Kesehatan)
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-455">
                  Jumlah total Rumah Sakit, Puskesmas, dan klinik aktif periode 2021-2026.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomLineChart
                  data={historicalData}
                  series={[
                    { key: "HEALTH_FACILITIES", name: "Fasilitas Kesehatan (Unit)", color: "#10b981" }
                  ]}
                  unit=" Unit"
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kapasitas Layanan (2026)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">
                    Total Unit Faskes
                  </span>
                  <span className="text-3xl font-extrabold text-navy-950 dark:text-white mt-1 block">
                    {getLatestValue("HEALTH_FACILITIES")} Unit
                  </span>
                  <span className="text-[10px] text-green-600 font-semibold block mt-1">
                    +{Math.round(getLatestValue("HEALTH_FACILITIES") * (getChangePercent("HEALTH_FACILITIES") / 100))} Faskes Baru (2026)
                  </span>
                </div>
                <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
                  Penyediaan fasilitas kesehatan dihitung secara registrasi resmi dari data Kementerian Kesehatan untuk memetakan kesiapan faskes per kapita daerah.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 4: Infrastruktur */}
        <TabsContent value="infrastruktur" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
          <div className="lg:col-span-2">
            <Card className="border-slate-200/80 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                  Pemerataan Utilitas (Listrik vs Internet)
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-455">
                  Perbandingan tingkat penetrasi internet rumah tangga dan rasio listrik periode 2021-2026.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomLineChart
                  data={historicalData}
                  series={[
                    { key: "ELECTRICITY_ACCESS", name: "Rasio Listrik (%)", color: "#eab308" },
                    { key: "INTERNET_ACCESS", name: "Akses Internet (%)", color: "#6366f1" }
                  ]}
                  unit="%"
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Rasio Utilitas Daerah (2026)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Penetrasi Internet</span>
                  <span className="font-extrabold text-navy-950 dark:text-white">{getLatestValue("INTERNET_ACCESS")}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Rasio Elektrifikasi</span>
                  <span className="font-extrabold text-navy-950 dark:text-white">{getLatestValue("ELECTRICITY_ACCESS")}%</span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed mt-2">
                  Rasio listrik dan internet merupakan pilar infrastruktur modern yang krusial untuk mendorong pertumbuhan digitalisasi daerah di seluruh Indonesia.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 5: Lingkungan */}
        <TabsContent value="lingkungan" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
          <div className="lg:col-span-2">
            <Card className="border-slate-200/80 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                  Kualitas Udara (Tren Indeks Kualitas Udara)
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-455">
                  Skor Indeks Kualitas Udara (IKU) berdasarkan standard KLHK periode 2021-2026.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomLineChart
                  data={historicalData}
                  series={[
                    { key: "AIR_QUALITY", name: "Indeks Kualitas Udara (Poin)", color: "#14b8a6" }
                  ]}
                  unit=" Poin"
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kelestarian Lingkungan (2026)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">
                    Indeks Kualitas Udara
                  </span>
                  <span className="text-3xl font-extrabold text-navy-950 dark:text-white mt-1 block">
                    {getLatestValue("AIR_QUALITY")} Poin
                  </span>
                  <span className="text-[9px] text-slate-450 mt-1 block leading-normal">
                    Nilai di bawah 50 menandakan polusi tinggi, sedangkan 70-100 menandakan udara yang sangat bersih.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>

    </div>
  );
}
