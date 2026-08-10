"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  TrendingDown, 
  TrendingUp, 
  BookOpen, 
  Globe, 
  HeartPulse, 
  ShoppingBag, 
  ShieldCheck, 
  Calendar,
  Database,
  Search,
  ArrowUpRight,
  TrendingUp as TrendUpIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dataProvider from "@/lib/providers";

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoData, setIsDemoData] = useState<boolean>(true);

  // Fetch National Overview Data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await dataProvider.getNationalOverview(selectedYear);
        setOverviewData(data);

        // Check if datasets in this system are demo data
        const datasetsList = await dataProvider.getDatasets();
        const hasOfficial = datasetsList.some(d => d.status === "Official" || d.status === "Verified");
        setIsDemoData(!hasOfficial);
      } catch (error) {
        console.error("Failed to load national overview:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedYear]);

  // Format Helper for Large Numbers
  const formatNumber = (num: number, code: string) => {
    if (code === "POPULATION") {
      return `${(num / 1000000).toFixed(2)} Juta`;
    }
    if (code === "UMKM_COUNT") {
      return `${(num / 1000000).toFixed(2)} Juta`;
    }
    return num.toLocaleString("id-ID");
  };

  const getCardIcon = (code: string) => {
    switch (code) {
      case "POPULATION": return <Users className="h-5 w-5 text-blue-600" />;
      case "POVERTY_RATE": return <TrendingDown className="h-5 w-5 text-red-600" />;
      case "LITERACY_RATE": return <BookOpen className="h-5 w-5 text-teal-600" />;
      case "INTERNET_ACCESS": return <Globe className="h-5 w-5 text-indigo-600" />;
      case "HEALTH_FACILITIES": return <HeartPulse className="h-5 w-5 text-emerald-600" />;
      case "UMKM_COUNT": return <ShoppingBag className="h-5 w-5 text-amber-600" />;
      default: return <Database className="h-5 w-5 text-slate-650" />;
    }
  };

  const getTrendColor = (change: number, code: string) => {
    // For poverty and unemployment, negative change (decrease) is positive (green)
    const reverseColors = ["POVERTY_RATE", "UNEMPLOYMENT_RATE"];
    const isDecreaseGood = reverseColors.includes(code);

    if (Math.abs(change) < 0.001) return "text-slate-500";
    
    if (change > 0) {
      return isDecreaseGood ? "text-red-650 bg-red-50 dark:bg-red-950/20" : "text-green-650 bg-green-50 dark:bg-green-950/20";
    } else {
      return isDecreaseGood ? "text-green-650 bg-green-50 dark:bg-green-950/20" : "text-red-650 bg-red-50 dark:bg-red-950/20";
    }
  };

  const getTrendIcon = (change: number) => {
    if (Math.abs(change) < 0.001) return null;
    return change > 0 ? (
      <TrendingUp className="h-3 w-3 inline mr-1" />
    ) : (
      <TrendingDown className="h-3 w-3 inline mr-1" />
    );
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-2xl sm:text-3xl text-navy-950 dark:text-white tracking-tight">
              Indonesia dalam Angka
            </h1>
            
            {/* Status Badge */}
            {isDemoData ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                ⚠️ DEMO DATA
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400">
                ✓ OFFICIAL DATA
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ringkasan indikator strategis nasional dan statistik pembangunan daerah.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-sm">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tahun Data:</span>
          <Select 
            value={selectedYear.toString()} 
            onValueChange={(val) => setSelectedYear(parseInt(val || "2026"))}
          >
            <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 w-[70px] text-xs font-bold text-navy-950 dark:text-white cursor-pointer">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {[2026, 2025, 2024, 2023, 2022, 2021].map((yr) => (
                <SelectItem key={yr} value={yr.toString()} className="text-xs">
                  {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-[90px] bg-slate-100 dark:bg-slate-900 rounded-t-xl"></CardHeader>
              <CardContent className="h-[120px] bg-slate-50 dark:bg-slate-950/50 rounded-b-xl"></CardContent>
            </Card>
          ))}
        </div>
      ) : overviewData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Population */}
          <Card className="border-slate-200/80 bg-white/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/50 hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Populasi Penduduk
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  Total estimasi penduduk Indonesia
                </CardDescription>
              </div>
              <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                {getCardIcon("POPULATION")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight">
                  {formatNumber(overviewData.POPULATION.value, "POPULATION")}
                </span>
                <span className="text-xs text-slate-450 dark:text-slate-400 ml-1">
                  {overviewData.POPULATION.unit}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                <span className={`px-2 py-0.5 rounded font-semibold ${getTrendColor(overviewData.POPULATION.change, "POPULATION")}`}>
                  {getTrendIcon(overviewData.POPULATION.change)}
                  {overviewData.POPULATION.change.toFixed(2)}%
                  <span className="text-[9px] font-normal text-slate-450 dark:text-slate-400 block sm:inline sm:ml-1">
                    dibanding tahun lalu
                  </span>
                </span>
                <span className="text-slate-400 text-right">
                  Sumber: {overviewData.POPULATION.source} ({selectedYear})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Poverty */}
          <Card className="border-slate-200/80 bg-white/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/50 hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tingkat Kemiskinan
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  Persentase rata-rata nasional
                </CardDescription>
              </div>
              <div className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                {getCardIcon("POVERTY_RATE")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight">
                  {overviewData.POVERTY_RATE.value.toFixed(2)}
                </span>
                <span className="text-xs text-slate-450 dark:text-slate-400 ml-1">
                  {overviewData.POVERTY_RATE.unit}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                <span className={`px-2 py-0.5 rounded font-semibold ${getTrendColor(overviewData.POVERTY_RATE.change, "POVERTY_RATE")}`}>
                  {getTrendIcon(overviewData.POVERTY_RATE.change)}
                  {Math.abs(overviewData.POVERTY_RATE.change).toFixed(2)}%
                  <span className="text-[9px] font-normal text-slate-450 dark:text-slate-400 block sm:inline sm:ml-1">
                    {overviewData.POVERTY_RATE.change < 0 ? "penurunan dari" : "peningkatan dari"} tahun lalu
                  </span>
                </span>
                <span className="text-slate-400 text-right">
                  Sumber: {overviewData.POVERTY_RATE.source} ({selectedYear})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Education */}
          <Card className="border-slate-200/80 bg-white/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/50 hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Angka Melek Huruf
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  Rata-rata penduduk usia 15 tahun ke atas
                </CardDescription>
              </div>
              <div className="h-9 w-9 rounded-lg bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
                {getCardIcon("LITERACY_RATE")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight">
                  {overviewData.LITERACY_RATE.value.toFixed(2)}
                </span>
                <span className="text-xs text-slate-450 dark:text-slate-400 ml-1">
                  {overviewData.LITERACY_RATE.unit}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                <span className={`px-2 py-0.5 rounded font-semibold ${getTrendColor(overviewData.LITERACY_RATE.change, "LITERACY_RATE")}`}>
                  {getTrendIcon(overviewData.LITERACY_RATE.change)}
                  {overviewData.LITERACY_RATE.change.toFixed(2)}%
                  <span className="text-[9px] font-normal text-slate-450 dark:text-slate-400 block sm:inline sm:ml-1">
                    dibanding tahun lalu
                  </span>
                </span>
                <span className="text-slate-400 text-right">
                  Sumber: {overviewData.LITERACY_RATE.source} ({selectedYear})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Internet */}
          <Card className="border-slate-200/80 bg-white/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/50 hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Akses Internet
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  Persentase rumah tangga berakses internet
                </CardDescription>
              </div>
              <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                {getCardIcon("INTERNET_ACCESS")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight">
                  {overviewData.INTERNET_ACCESS.value.toFixed(2)}
                </span>
                <span className="text-xs text-slate-450 dark:text-slate-400 ml-1">
                  {overviewData.INTERNET_ACCESS.unit}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                <span className={`px-2 py-0.5 rounded font-semibold ${getTrendColor(overviewData.INTERNET_ACCESS.change, "INTERNET_ACCESS")}`}>
                  {getTrendIcon(overviewData.INTERNET_ACCESS.change)}
                  {overviewData.INTERNET_ACCESS.change.toFixed(2)}%
                  <span className="text-[9px] font-normal text-slate-450 dark:text-slate-400 block sm:inline sm:ml-1">
                    akses digital tumbuh
                  </span>
                </span>
                <span className="text-slate-400 text-right">
                  Sumber: {overviewData.INTERNET_ACCESS.source} ({selectedYear})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Health */}
          <Card className="border-slate-200/80 bg-white/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/50 hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Fasilitas Kesehatan
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  Total Rumah Sakit dan Puskesmas aktif
                </CardDescription>
              </div>
              <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                {getCardIcon("HEALTH_FACILITIES")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight">
                  {formatNumber(overviewData.HEALTH_FACILITIES.value, "HEALTH_FACILITIES")}
                </span>
                <span className="text-xs text-slate-450 dark:text-slate-400 ml-1">
                  {overviewData.HEALTH_FACILITIES.unit}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                <span className={`px-2 py-0.5 rounded font-semibold ${getTrendColor(overviewData.HEALTH_FACILITIES.change, "HEALTH_FACILITIES")}`}>
                  {getTrendIcon(overviewData.HEALTH_FACILITIES.change)}
                  {overviewData.HEALTH_FACILITIES.change.toFixed(2)}%
                  <span className="text-[9px] font-normal text-slate-450 dark:text-slate-400 block sm:inline sm:ml-1">
                    fasilitas baru bertambah
                  </span>
                </span>
                <span className="text-slate-400 text-right">
                  Sumber: {overviewData.HEALTH_FACILITIES.source} ({selectedYear})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 6: UMKM */}
          <Card className="border-slate-200/80 bg-white/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/50 hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Jumlah UMKM Terdaftar
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  Estimasi unit usaha terdaftar
                </CardDescription>
              </div>
              <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                {getCardIcon("UMKM_COUNT")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-extrabold text-navy-950 dark:text-white tracking-tight">
                  {formatNumber(overviewData.UMKM_COUNT.value, "UMKM_COUNT")}
                </span>
                <span className="text-xs text-slate-450 dark:text-slate-400 ml-1">
                  {overviewData.UMKM_COUNT.unit}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                <span className={`px-2 py-0.5 rounded font-semibold ${getTrendColor(overviewData.UMKM_COUNT.change, "UMKM_COUNT")}`}>
                  {getTrendIcon(overviewData.UMKM_COUNT.change)}
                  {overviewData.UMKM_COUNT.change.toFixed(2)}%
                  <span className="text-[9px] font-normal text-slate-450 dark:text-slate-400 block sm:inline sm:ml-1">
                    unit usaha bertumbuh
                  </span>
                </span>
                <span className="text-slate-400 text-right">
                  Sumber: {overviewData.UMKM_COUNT.source} ({selectedYear})
                </span>
              </div>
            </CardContent>
          </Card>

        </div>
      ) : (
        <div className="text-center p-12 border border-slate-200 rounded-xl">
          <p className="text-slate-500">Gagal memuat data ringkasan.</p>
        </div>
      )}

      {/* Overview insights panel */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h3 className="font-extrabold text-sm text-navy-950 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          <TrendUpIcon className="h-4 w-4 text-red-650" /> Analisis Singkat Tahun {selectedYear}
        </h3>
        <p className="text-xs text-slate-655 dark:text-slate-300 leading-relaxed">
          Pada tahun {selectedYear}, data pembangunan menunjukkan pertumbuhan digital yang konsisten di mana akses internet rumah tangga meningkat secara nasional. Di sektor ekonomi, jumlah unit usaha mikro, kecil, dan menengah (UMKM) juga tercatat naik seiring dengan penyebaran stimulus perekonomian pasca-pandemi. 
          Guna mempelajari performa spesifik di tingkat provinsi atau membandingkan antar provinsi di Indonesia, Anda dapat mengakses menu 
          <a href="/map" className="text-red-600 font-semibold mx-1 hover:underline">Peta Interaktif</a> 
          atau menu 
          <a href="/compare" className="text-red-600 font-semibold mx-1 hover:underline">Bandingkan Wilayah</a>.
        </p>
      </div>

    </div>
  );
}
