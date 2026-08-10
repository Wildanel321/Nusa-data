"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Trophy, 
  TrendingUp,
  Database,
  ArrowUpDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomBarChart from "@/components/charts/CustomBarChart";
import dataProvider from "@/lib/providers";

interface RankIndicator {
  name: string;
  code: string;
  unit: string;
  label: string;
}

const rankIndicators: RankIndicator[] = [
  { name: "Kemiskinan", code: "POVERTY_RATE", unit: "%", label: "Tingkat Kemiskinan" },
  { name: "Internet", code: "INTERNET_ACCESS", unit: "%", label: "Akses Internet" },
  { name: "Populasi", code: "POPULATION", unit: "Jiwa", label: "Jumlah Penduduk" },
  { name: "UMKM", code: "UMKM_COUNT", unit: "Unit Usaha", label: "Jumlah UMKM" },
  { name: "Ekonomi (PDRB)", code: "PDRB_VALUE", unit: "Miliar Rp", label: "PDRB ADHK" },
  { name: "Pengangguran", code: "UNEMPLOYMENT_RATE", unit: "%", label: "Tingkat Pengangguran" },
];

export default function RankingPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedIndCode, setSelectedIndCode] = useState<string>("POVERTY_RATE");
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoData, setIsDemoData] = useState<boolean>(true);

  const activeInd = rankIndicators.find((i) => i.code === selectedIndCode) || rankIndicators[0];

  useEffect(() => {
    async function loadRankings() {
      setLoading(true);
      try {
        const list = await dataProvider.getRanking(selectedIndCode, selectedYear, 38); // get all to display
        setRankings(list);

        // Check if demo or official data
        const indicator = await dataProvider.getIndicatorByCode(selectedIndCode);
        setIsDemoData(indicator?.dataset?.status === "Demo");
      } catch (error) {
        console.error("Failed to load rankings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRankings();
  }, [selectedIndCode, selectedYear]);

  // Style helper for trend badges
  const renderTrendBadge = (trend: string, diff: number) => {
    // For poverty and unemployment, negative difference (decrease) is positive (green)
    const reverseColors = ["POVERTY_RATE", "UNEMPLOYMENT_RATE"];
    const isDecreaseGood = reverseColors.includes(selectedIndCode);

    if (trend === "UP") {
      return (
        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
          isDecreaseGood ? "text-red-650 bg-red-50 dark:bg-red-950/20" : "text-green-650 bg-green-50 dark:bg-green-950/20"
        }`}>
          <ArrowUp className="h-3 w-3" /> +{diff.toFixed(2)}
        </span>
      );
    } else if (trend === "DOWN") {
      return (
        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
          isDecreaseGood ? "text-green-650 bg-green-50 dark:bg-green-950/20" : "text-red-650 bg-red-50 dark:bg-red-950/20"
        }`}>
          <ArrowDown className="h-3 w-3" /> {diff.toFixed(2)}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500 bg-slate-50 dark:bg-slate-900">
        <Minus className="h-3 w-3" /> 0.00
      </span>
    );
  };

  // Medal stylings for top 3
  const renderRankNumber = (index: number) => {
    const rank = index + 1;
    if (rank === 1) {
      return (
        <span className="h-5 w-5 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="h-5 w-5 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="h-5 w-5 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
          3
        </span>
      );
    }
    return <span className="text-slate-500 pl-1.5">{rank}</span>;
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-2xl sm:text-3xl text-navy-950 dark:text-white tracking-tight">
              Peringkat Wilayah Nasional
            </h1>
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
            Peringkat provinsi berdasarkan metrik pembangunan dan utilitas utama.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Indicator selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-sm">
            <Database className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-550 dark:text-slate-400 font-medium">Metrik:</span>
            <Select value={selectedIndCode} onValueChange={(val) => setSelectedIndCode(val || "")}>
              <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 w-[110px] text-xs font-bold text-navy-950 dark:text-white cursor-pointer">
                <SelectValue placeholder="Metrik" />
              </SelectTrigger>
              <SelectContent>
                {rankIndicators.map((ind) => (
                  <SelectItem key={ind.code} value={ind.code} className="text-xs">
                    {ind.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-550 dark:text-slate-400 font-medium">Tahun:</span>
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
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse h-[350px]"></Card>
          <Card className="animate-pulse h-[350px]"></Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top 10 Table list */}
          <Card className="border-slate-200/80 bg-white/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-yellow-500" /> 10 Peringkat Teratas ({selectedYear})
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400 mt-1">
                  10 daerah dengan capaian terbaik untuk metrik {activeInd.name.toLowerCase()}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-900 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold dark:border-slate-800 dark:bg-slate-950">
                      <th className="p-3 w-12 text-center">Rank</th>
                      <th className="p-3">Provinsi</th>
                      <th className="p-3 text-right">Nilai ({activeInd.unit})</th>
                      <th className="p-3 text-center w-24">Perubahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                    {rankings.slice(0, 10).map((row, idx) => (
                      <tr 
                        key={row.regionId} 
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                      >
                        <td className="p-3 flex justify-center items-center">{renderRankNumber(idx)}</td>
                        <td className="p-3 font-semibold text-navy-950 dark:text-white">{row.regionName}</td>
                        <td className="p-3 text-right font-semibold">
                          {row.value.toLocaleString("id-ID")}
                        </td>
                        <td className="p-3 text-center">{renderTrendBadge(row.change, row.diff)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart Representation */}
          <Card className="border-slate-200/80 bg-white/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                Perbandingan Visual Capaian Daerah
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-400">
                Perbandingan nilai indikator {activeInd.name.toLowerCase()} ({activeInd.unit}) di 10 daerah teratas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomBarChart
                data={rankings.slice(0, 10).map(r => ({
                  regionName: r.regionName,
                  value: r.value,
                }))}
                name={activeInd.label}
                unit={activeInd.unit}
                color={selectedIndCode === "POVERTY_RATE" || selectedIndCode === "UNEMPLOYMENT_RATE" ? "#dc2626" : "#1e3a8a"}
              />
            </CardContent>
          </Card>

        </div>
      )}

    </div>
  );
}
