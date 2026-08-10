"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Map, Calendar, Info, ArrowRight, Layers, Landmark } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import dataProvider from "@/lib/providers";

// Dynamically import Leaflet Map Component with SSR disabled
const IndonesiaLeafletMap = dynamic(
  () => import("@/components/maps/IndonesiaLeafletMap"),
  { ssr: false }
);

interface FilterIndicator {
  name: string;
  code: string;
  unit: string;
  label: string;
}

const mapIndicators: FilterIndicator[] = [
  { name: "Kemiskinan", code: "POVERTY_RATE", unit: "%", label: "Tingkat Kemiskinan" },
  { name: "Internet", code: "INTERNET_ACCESS", unit: "%", label: "Akses Internet" },
  { name: "Populasi", code: "POPULATION", unit: "Jiwa", label: "Jumlah Penduduk" },
  { name: "UMKM", code: "UMKM_COUNT", unit: "Unit", label: "Jumlah UMKM" },
  { name: "Kesehatan", code: "HEALTH_FACILITIES", unit: "Unit", label: "Fasilitas Kesehatan" },
  { name: "Pendidikan", code: "LITERACY_RATE", unit: "%", label: "Angka Melek Huruf" },
  { name: "Infrastruktur", code: "ELECTRICITY_ACCESS", unit: "%", label: "Rasio Elektrifikasi" },
];

export default function MapPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedIndCode, setSelectedIndCode] = useState<string>("POVERTY_RATE");
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [isDemoData, setIsDemoData] = useState<boolean>(true);

  const activeInd = mapIndicators.find((i) => i.code === selectedIndCode) || mapIndicators[0];

  // Fetch data points for the selected indicator & year
  useEffect(() => {
    async function loadPoints() {
      setLoading(true);
      try {
        const points = await dataProvider.getDataPoints({
          indicatorCode: selectedIndCode,
          year: selectedYear,
        });
        setDataPoints(points);

        // Check demo status
        const indicator = await dataProvider.getIndicatorByCode(selectedIndCode);
        setIsDemoData(indicator?.dataset?.status === "Demo");
      } catch (error) {
        console.error("Failed to load map data points:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPoints();
  }, [selectedIndCode, selectedYear]);

  const handleProvinceClick = (province: any) => {
    setSelectedProvince(province);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-2xl sm:text-3xl text-navy-950 dark:text-white tracking-tight">
              Peta Tematik Indonesia
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
            Visualisasi choropleth disparitas pembangunan antardaerah di Indonesia.
          </p>
        </div>

        {/* Year Select Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-sm">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tahun:</span>
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

      {/* Indicator Select Tabs */}
      <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        <Tabs value={selectedIndCode} onValueChange={setSelectedIndCode} className="w-auto">
          <TabsList className="bg-slate-100/80 border border-slate-200/50 p-1 dark:bg-slate-900/85 dark:border-slate-800">
            {mapIndicators.map((ind) => (
              <TabsTrigger
                key={ind.code}
                value={ind.code}
                className="text-xs font-semibold px-4 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-600 dark:data-[state=active]:bg-slate-950"
              >
                {ind.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Map and Details Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Map view (Main panel) */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex h-[450px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-red-650"></div>
              <span className="mt-4 text-xs text-slate-550">Memuat data peta...</span>
            </div>
          ) : (
            <IndonesiaLeafletMap
              dataPoints={dataPoints}
              indicatorName={activeInd.label}
              unit={activeInd.unit}
              onProvinceClick={handleProvinceClick}
            />
          )}
        </div>

        {/* Selected Province Details Box (Sidebar) */}
        <div className="col-span-1">
          {selectedProvince ? (
            <Card className="border-slate-200/85 bg-white/70 backdrop-blur-md dark:border-slate-800/85 dark:bg-slate-900/70 h-full flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="inline-flex items-center gap-1 text-[9px] font-bold text-red-655 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
                    <Landmark className="h-2.5 w-2.5" /> PROVINSI
                  </div>
                  <CardTitle className="font-extrabold text-xl text-navy-950 dark:text-white leading-tight">
                    {selectedProvince.name}
                  </CardTitle>
                  <CardDescription className="text-[10px] text-slate-400">
                    Kondisi wilayah berdasarkan filter aktif
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      {activeInd.label}
                    </span>
                    <span className="text-2xl font-extrabold text-navy-950 dark:text-white mt-1 block">
                      {selectedProvince.value !== null
                        ? `${selectedProvince.value.toLocaleString("id-ID")} ${activeInd.unit}`
                        : "Data Tidak Tersedia"}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-1">
                      Data Terbit: Tahun {selectedYear}
                    </span>
                  </div>

                  <div className="text-slate-550 dark:text-slate-400 leading-relaxed text-[11px] space-y-2">
                    <p>
                      Provinsi {selectedProvince.name} merupakan salah satu dari 38 wilayah administratif tingkat satu di Indonesia.
                    </p>
                    <p>
                      Arahkan kursor ke wilayah lainnya pada peta untuk membandingkan disparitas metrik {activeInd.name.toLowerCase()} ini secara visual.
                    </p>
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-0">
                <a
                  href={`/region/${selectedProvince.slug}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-semibold text-xs flex items-center justify-center gap-2 dark:bg-navy-800 dark:hover:bg-navy-700 shadow-sm transition-colors cursor-pointer"
                >
                  Lihat Profil Detail <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </Card>
          ) : (
            <Card className="border-slate-200/85 bg-white/50 backdrop-blur-md dark:border-slate-800/85 dark:bg-slate-900/50 h-full flex flex-col justify-center items-center text-center p-6 min-h-[300px]">
              <Info className="h-10 w-10 text-slate-400 mb-4 stroke-1 animate-pulse" />
              <h3 className="font-extrabold text-sm text-navy-950 dark:text-white">
                Wilayah Belum Dipilih
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-450 max-w-[200px] mt-2 leading-relaxed">
                Klik salah satu wilayah provinsi pada peta untuk menampilkan data statistik detail.
              </p>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
