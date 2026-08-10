"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  TrendingDown, 
  Calendar,
  Layers,
  Database,
  ArrowRight,
  Info
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CustomLineChart from "@/components/charts/CustomLineChart";
import dataProvider from "@/lib/providers";

interface AnalyticsIndicator {
  name: string;
  code: string;
  unit: string;
  label: string;
}

const analyticsIndicators: AnalyticsIndicator[] = [
  { name: "Kemiskinan", code: "POVERTY_RATE", unit: "%", label: "Tingkat Kemiskinan" },
  { name: "Akses Internet", code: "INTERNET_ACCESS", unit: "%", label: "Penetrasi Internet" },
  { name: "Populasi", code: "POPULATION", unit: "Jiwa", label: "Penduduk Nasional" },
  { name: "UMKM", code: "UMKM_COUNT", unit: "Unit", label: "Kekuatan Usaha UMKM" },
  { name: "Ekonomi (PDRB)", code: "PDRB_VALUE", unit: "Miliar Rp", label: "PDRB ADHK" },
];

export default function AnalyticsPage() {
  const [selectedIndCode, setSelectedIndCode] = useState<string>("POVERTY_RATE");
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>({
    overallChange: 0,
    highestProvName: "",
    highestProvVal: 0,
    lowestProvName: "",
    lowestProvVal: 0,
  });

  const activeInd = analyticsIndicators.find(i => i.code === selectedIndCode) || analyticsIndicators[0];

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const years = [2021, 2022, 2023, 2024, 2025, 2026];
        const regions = await dataProvider.getRegions();
        
        // 1. Get national averages
        const avgTimeline = await Promise.all(years.map(async (yr) => {
          const overview = await dataProvider.getNationalOverview(yr);
          return {
            year: yr,
            avg: overview[selectedIndCode]?.value || 0,
          };
        }));

        // 2. Fetch all data points for latest year to identify top/bottom regions
        const points2026 = await dataProvider.getDataPoints({
          indicatorCode: selectedIndCode,
          year: 2026,
        });

        const isPovertyOrUnemployment = ["POVERTY_RATE", "UNEMPLOYMENT_RATE"].includes(selectedIndCode);
        
        // Sort to find top and bottom in 2026
        const sortedPoints = [...points2026].sort((a, b) => b.value - a.value);
        if (sortedPoints.length > 0) {
          const highest = sortedPoints[0];
          const lowest = sortedPoints[sortedPoints.length - 1];

          // Fetch timelines for highest and lowest regions
          const pointsHighest = await dataProvider.getDataPoints({
            indicatorCode: selectedIndCode,
            regionId: highest.regionId,
          });

          const pointsLowest = await dataProvider.getDataPoints({
            indicatorCode: selectedIndCode,
            regionId: lowest.regionId,
          });

          // 3. Merge timelines
          const merged = years.map((yr) => {
            const avgRow = avgTimeline.find(a => a.year === yr);
            const highRow = pointsHighest.find(p => p.year === yr);
            const lowRow = pointsLowest.find(p => p.year === yr);

            return {
              year: yr,
              nationalAverage: parseFloat((avgRow?.avg || 0).toFixed(2)),
              highestRegion: highRow ? highRow.value : 0,
              lowestRegion: lowRow ? lowRow.value : 0,
            };
          });

          setTimelineData(merged);

          // Calculate 5-year growth/decrease of average (2021 to 2026)
          const avg2021 = avgTimeline.find(a => a.year === 2021)?.avg || 1;
          const avg2026 = avgTimeline.find(a => a.year === 2026)?.avg || 1;
          const overallChange = ((avg2026 - avg2021) / avg2021) * 100;

          setStats({
            overallChange,
            highestProvName: highest.regionName,
            highestProvVal: highest.value,
            lowestProvName: lowest.regionName,
            lowestProvVal: lowest.value,
          });
        }
      } catch (error) {
        console.error("Failed to load analytics details:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [selectedIndCode]);

  const getNarrativeAnalysis = () => {
    const isPoverty = selectedIndCode === "POVERTY_RATE";
    const direction = stats.overallChange > 0 ? "kenaikan" : "penurunan";
    const changeAbs = Math.abs(stats.overallChange).toFixed(1);

    if (isPoverty) {
      return `Dalam periode 5 tahun terakhir (2021–2026), tingkat kemiskinan rata-rata nasional mencatat ${direction} kumulatif sebesar ${changeAbs}%. Hal ini mencerminkan keberhasilan intervensi perlindungan sosial pasca-pandemi secara perlahan. Namun, ketimpangan ekstrem masih membayangi di mana provinsi ${stats.highestProvName} mencatat angka tertinggi (${stats.highestProvVal}%) dibandingkan provinsi ${stats.lowestProvName} yang berhasil menekan kemiskinan hingga menyentuh ${stats.lowestProvVal}%.`;
    }
    
    return `Tren 5 tahun terakhir untuk indikator ${activeInd.name.toLowerCase()} menunjukkan pertumbuhan positif di tingkat nasional dengan ${direction} rata-rata mencapai ${changeAbs}%. Pertumbuhan utilitas ini terutama didorong oleh penetrasi infrastruktur digital dan penguatan sektor UMKM daerah. Provinsi ${stats.highestProvName} memimpin kemajuan di garis depan dengan pencapaian tertinggi, sementara akselerasi pembangunan masih terus diupayakan di provinsi ${stats.lowestProvName}.`;
  };

  const getGrowthIndicatorClass = () => {
    const isPoverty = selectedIndCode === "POVERTY_RATE";
    const isIncrease = stats.overallChange > 0;
    
    if (isPoverty) {
      return isIncrease ? "text-red-650 bg-red-50 dark:bg-red-950/20" : "text-green-650 bg-green-50 dark:bg-green-950/20";
    }
    return isIncrease ? "text-green-650 bg-green-50 dark:bg-green-950/20" : "text-red-650 bg-red-50 dark:bg-red-950/20";
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="font-extrabold text-2xl sm:text-3xl text-navy-950 dark:text-white tracking-tight">
          Analisis Tren Indonesia
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Analisis komparatif tren 5 tahun terakhir (2021–2026) dan peta persebaran ketimpangan indikator pembangunan.
        </p>
      </div>

      {/* Selector Tabs */}
      <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        <Tabs value={selectedIndCode} onValueChange={setSelectedIndCode} className="w-auto">
          <TabsList className="bg-slate-100/80 border border-slate-200/50 p-1 dark:bg-slate-900/80 dark:border-slate-800">
            {analyticsIndicators.map((ind) => (
              <TabsTrigger
                key={ind.code}
                value={ind.code}
                className="text-xs font-semibold px-4 py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950"
              >
                {ind.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Grid Layout: Visual Chart vs Insight Cards */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 animate-pulse h-[350px]"></Card>
          <Card className="animate-pulse h-[350px]"></Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Timeline trend line chart (Main panel) */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                  Visualisasi Kesenjangan Pembangunan
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-455">
                  Bandingan Tren Rata-Rata Nasional dengan Provinsi Tertinggi dan Terendah (2021–2026)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomLineChart
                  data={timelineData}
                  series={[
                    { key: "highestRegion", name: `Tertinggi (${stats.highestProvName})`, color: "#1e3a8a" },
                    { key: "nationalAverage", name: "Rata-Rata Nasional", color: "#64748b" },
                    { key: "lowestRegion", name: `Terendah (${stats.lowestProvName})`, color: "#dc2626" },
                  ]}
                  unit={activeInd.unit}
                />
              </CardContent>
            </Card>
          </div>

          {/* Analytical Insights (Right panel) */}
          <div className="col-span-1 space-y-6">
            
            {/* 5-year Cumulative Growth card */}
            <Card className="border-slate-200/80 bg-white">
              <CardContent className="pt-6 text-xs space-y-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                  Perubahan Kumulatif Rata-Rata (5 Tahun)
                </span>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-extrabold ${getGrowthIndicatorClass()}`}>
                    {stats.overallChange > 0 ? <ArrowUp className="h-4.5 w-4.5" /> : <ArrowDown className="h-4.5 w-4.5" />}
                    {Math.abs(stats.overallChange).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 text-right">
                    Rata-Rata Nasional<br />2021 vs 2026
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* High & Low Records */}
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Rekor Wilayah (Tahun 2026)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                
                <div className="flex justify-between items-start py-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-500 font-medium block">Daerah Capaian Tertinggi</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{stats.highestProvName}</span>
                  </div>
                  <span className="font-extrabold text-navy-950 dark:text-white text-right">
                    {stats.highestProvVal.toLocaleString("id-ID")} {activeInd.unit}
                  </span>
                </div>

                <div className="flex justify-between items-start py-2">
                  <div>
                    <span className="text-slate-500 font-medium block">Daerah Capaian Terendah</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{stats.lowestProvName}</span>
                  </div>
                  <span className="font-extrabold text-navy-950 dark:text-white text-right">
                    {stats.lowestProvVal.toLocaleString("id-ID")} {activeInd.unit}
                  </span>
                </div>

              </CardContent>
            </Card>

          </div>

        </div>
      )}

      {/* Narrative analysis text box */}
      {!loading && (
        <Card className="border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70 p-6 shadow-sm">
          <h3 className="font-extrabold text-sm text-navy-950 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="h-4.5 w-4.5 text-red-655" /> Ringkasan Analisis Intelijen Data
          </h3>
          <p className="text-xs text-slate-655 dark:text-slate-300 leading-relaxed">
            {getNarrativeAnalysis()}
          </p>
        </Card>
      )}

    </div>
  );
}
