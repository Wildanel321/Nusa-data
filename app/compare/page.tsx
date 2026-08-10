"use client";

import React, { useState, useEffect } from "react";
import { 
  GitCompare, 
  Calendar, 
  Plus, 
  Trash2,
  TrendingUp,
  Database,
  BarChart4,
  Layers
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomRadarChart from "@/components/charts/CustomRadarChart";
import CustomBarChart from "@/components/charts/CustomBarChart";
import dataProvider from "@/lib/providers";

interface CompareMetric {
  name: string;
  code: string;
  unit: string;
}

const compareMetrics: CompareMetric[] = [
  { name: "Populasi Penduduk", code: "POPULATION", unit: "Jiwa" },
  { name: "Tingkat Kemiskinan", code: "POVERTY_RATE", unit: "%" },
  { name: "Angka Melek Huruf", code: "LITERACY_RATE", unit: "%" },
  { name: "Akses Internet", code: "INTERNET_ACCESS", unit: "%" },
  { name: "Fasilitas Kesehatan", code: "HEALTH_FACILITIES", unit: "Unit" },
  { name: "Jumlah UMKM", code: "UMKM_COUNT", unit: "Unit Usaha" },
  { name: "PDRB ADHK", code: "PDRB_VALUE", unit: "Miliar Rp" },
  { name: "Pengangguran Terbuka", code: "UNEMPLOYMENT_RATE", unit: "%" },
];

export default function ComparePage() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [allProvinces, setAllProvinces] = useState<any[]>([]);
  
  // Selection slots for up to 4 regions
  const [selectedRegions, setSelectedRegions] = useState<string[]>([
    "jawa-barat",
    "jawa-timur",
    "bali",
    "nusa-tenggara-timur",
  ]);

  const [compareData, setCompareData] = useState<any>(null);
  const [nationalAverages, setNationalAverages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Load provinces list
  useEffect(() => {
    async function loadProvinces() {
      const list = await dataProvider.getRegions();
      setAllProvinces(list);
    }
    loadProvinces();
  }, []);

  // Fetch comparison stats and national averages
  useEffect(() => {
    async function loadComparison() {
      setLoading(true);
      try {
        const activeRegions = selectedRegions.filter(id => !!id);
        const indicatorCodes = compareMetrics.map(m => m.code);

        // Fetch comparison matrix
        const matrix = await dataProvider.getComparison(activeRegions, indicatorCodes, selectedYear);
        setCompareData(matrix);

        // Fetch national averages for normalization
        const nationalOverview = await dataProvider.getNationalOverview(selectedYear);
        const averages: Record<string, number> = {};
        compareMetrics.forEach((m) => {
          averages[m.code] = nationalOverview[m.code]?.value || 1;
        });
        setNationalAverages(averages);
      } catch (error) {
        console.error("Failed to load comparison data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadComparison();
  }, [selectedRegions, selectedYear]);

  const handleRegionChange = (index: number, id: string) => {
    const updated = [...selectedRegions];
    updated[index] = id;
    setSelectedRegions(updated);
  };

  const removeRegionSlot = (index: number) => {
    const updated = [...selectedRegions];
    updated.splice(index, 1);
    setSelectedRegions(updated);
  };

  const addRegionSlot = () => {
    if (selectedRegions.length < 4) {
      setSelectedRegions([...selectedRegions, ""]);
    }
  };

  // Compile radar chart dataset (normalized to national average = 100)
  const getRadarData = () => {
    if (!compareData) return [];
    
    // We only include scale-normalized metrics on the radar chart
    const radarMetrics = compareMetrics.filter(m => m.code !== "POPULATION" && m.code !== "PDRB_VALUE" && m.code !== "UMKM_COUNT");

    return radarMetrics.map((m) => {
      const row: any = {
        subject: m.name,
      };

      selectedRegions.forEach((rId, idx) => {
        if (!rId) return;
        const rawVal = compareData[rId]?.[m.code] || 0;
        const avgVal = nationalAverages[m.code] || 1;
        
        // Normalize as % of national average
        row[`region_${idx}`] = parseFloat(((rawVal / avgVal) * 100).toFixed(1));
      });

      return row;
    });
  };

  const getRadarSeries = () => {
    const colors = ["#243b53", "#dc2626", "#0284c7", "#10b981"];
    return selectedRegions
      .map((rId, idx) => {
        if (!rId) return null;
        const prov = allProvinces.find(p => p.id === rId);
        return {
          key: `region_${idx}`,
          name: prov ? prov.name : `Wilayah ${idx + 1}`,
          color: colors[idx % colors.length],
        };
      })
      .filter(s => s !== null) as any[];
  };

  const formatNumber = (num: number, code: string) => {
    if (!num) return "0";
    if (code === "POPULATION") {
      return `${(num / 1000000).toFixed(2)} Juta`;
    }
    if (code === "UMKM_COUNT") {
      return `${(num / 1000).toFixed(1)} ribu`;
    }
    if (code === "PDRB_VALUE") {
      return `Rp ${Math.round(num).toLocaleString("id-ID")} M`;
    }
    return num.toLocaleString("id-ID");
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded bg-red-50 text-red-655 dark:bg-red-950/20 flex items-center justify-center">
              <GitCompare className="h-4 w-4" />
            </span>
            <h1 className="font-extrabold text-2xl sm:text-3xl text-navy-950 dark:text-white tracking-tight">
              Bandingkan Daerah
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pilih dan bandingkan performa indikator pembangunan hingga 4 provinsi Indonesia.
          </p>
        </div>

        {/* Year Select Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-sm">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-550 dark:text-slate-455 font-medium">Tahun:</span>
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

      {/* Region Slots Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        {selectedRegions.map((rId, idx) => {
          const availableProvinces = allProvinces.filter(
            (p) => !selectedRegions.includes(p.id) || p.id === rId
          );

          return (
            <div key={idx} className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 p-3.5 rounded-xl space-y-2 relative shadow-sm">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Slot Wilayah {idx + 1}</span>
                {selectedRegions.length > 2 && (
                  <button 
                    onClick={() => removeRegionSlot(idx)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Select 
                value={rId} 
                onValueChange={(val) => handleRegionChange(idx, val || "")}
              >
                <SelectTrigger className="h-9 text-xs font-bold w-full bg-slate-50 border-slate-200 rounded-lg cursor-pointer">
                  <SelectValue placeholder="Pilih Provinsi" />
                </SelectTrigger>
                <SelectContent>
                  {availableProvinces.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}

        {/* Add Slot Button */}
        {selectedRegions.length < 4 && (
          <button
            onClick={addRegionSlot}
            className="col-span-1 rounded-xl border border-dashed border-slate-300 hover:border-red-500 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/10 flex flex-col justify-center items-center gap-1.5 p-6 transition-all min-h-[90px] cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Tambah Slot</span>
          </button>
        )}
      </div>

      {/* Comparison Grid & Visualisations */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-350 border-t-red-650"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Comparison Matrix Table */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                  Matriks Perbandingan Indikator
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  Data perbandingan komparatif di tahun {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-900 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-550 font-bold dark:border-slate-800 dark:bg-slate-950">
                        <th className="p-3">Indikator Pembangunan</th>
                        {selectedRegions.map((rId, idx) => {
                          const name = allProvinces.find(p => p.id === rId)?.name || `-`;
                          return (
                            <th key={idx} className="p-3 text-right">
                              {name}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                      {compareMetrics.map((m) => (
                        <tr key={m.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="p-3 font-semibold text-slate-650 dark:text-slate-200">
                            {m.name} <span className="text-[10px] text-slate-400 font-normal">({m.unit})</span>
                          </td>
                          {selectedRegions.map((rId, idx) => {
                            if (!rId) return <td key={idx} className="p-3 text-right text-slate-300">-</td>;
                            const val = compareData?.[rId]?.[m.code];
                            return (
                              <td key={idx} className="p-3 text-right font-bold text-navy-950 dark:text-white">
                                {val !== undefined ? formatNumber(val, m.code) : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart Panel */}
          <div className="col-span-1">
            <Card className="border-slate-200/80 bg-white h-full flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                  Radar Perbandingan Relatif
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  Nilai relatif (%) terhadap Rata-Rata Nasional (100%) untuk tahun {selectedYear}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getRadarSeries().length > 0 ? (
                  <CustomRadarChart
                    data={getRadarData()}
                    series={getRadarSeries()}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-xs text-slate-400">
                    Pilih provinsi untuk menampilkan grafik.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
}
