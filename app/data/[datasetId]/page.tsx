"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  Database, 
  Calendar, 
  ArrowLeft,
  FileText,
  Download,
  Info,
  Layers,
  MapPin,
  TrendingUp,
  Search,
  ChevronDown,
  ArrowUpDown
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomLineChart from "@/components/charts/CustomLineChart";
import CustomBarChart from "@/components/charts/CustomBarChart";
import dataProvider from "@/lib/providers";

// Dynamically import Leaflet Map to avoid SSR errors
const IndonesiaLeafletMap = dynamic(
  () => import("@/components/maps/IndonesiaLeafletMap"),
  { ssr: false }
);

export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = params.datasetId as string;

  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rawPoints, setRawPoints] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Load dataset info and points
  useEffect(() => {
    async function loadDatasetData() {
      setLoading(true);
      try {
        const ds = await dataProvider.getDataset(datasetId);
        if (!ds) {
          setDataset(null);
          setLoading(false);
          return;
        }
        setDataset(ds);

        // Get indicator ID
        const indicator = ds.indicators[0];
        if (indicator) {
          const points = await dataProvider.getDataPoints({
            indicatorId: indicator.id,
          });
          setRawPoints(points);

          // Pivot data points into [Province -> Year -> Value] rows
          const regions = await dataProvider.getRegions();
          const pivoted = regions.map((reg) => {
            const row: any = {
              id: reg.id,
              name: reg.name,
            };
            const years = [2021, 2022, 2023, 2024, 2025, 2026];
            years.forEach((yr) => {
              const pt = points.find((p) => p.regionId === reg.id && p.year === yr);
              row[yr] = pt ? pt.value : 0;
            });
            return row;
          });

          setTableData(pivoted);
        }
      } catch (error) {
        console.error("Failed to load dataset details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (datasetId) {
      loadDatasetData();
    }
  }, [datasetId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-red-600"></div>
        <span className="mt-4 text-xs font-semibold text-slate-500">Memuat rincian dataset...</span>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="flex-1 w-full max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-extrabold text-2xl text-navy-950 dark:text-white">Dataset Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">Dataset dengan ID &quot;{datasetId}&quot; tidak terdaftar dalam katalog kami.</p>
        <Button onClick={() => router.push("/data")} className="rounded-full bg-red-600 hover:bg-red-700 text-white">
          Kembali ke Katalog
        </Button>
      </div>
    );
  }

  const indicator = dataset.indicators[0];
  const unit = dataset.unit;

  // Filter and sort table rows
  const handleSort = (column: string) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(column);
  };

  const sortedTableData = [...tableData]
    .filter((row) => row.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        // numeric values
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
    });

  // Calculate ranked bar data for the selected year
  const getRankedBarData = () => {
    return tableData
      .map((row) => ({
        regionName: row.name,
        value: row[selectedYear] || 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15); // Top 15 provinces for bar readability
  };

  // Timeline data for the Line chart (averages over time)
  const getTimelineData = () => {
    const years = [2021, 2022, 2023, 2024, 2025, 2026];
    return years.map((yr) => {
      const vals = tableData.map((r) => r[yr] || 0);
      const isSum = ["Jiwa", "UnitUsaha", "Unit", "Miliar Rupiah"].includes(unit);
      
      const value = isSum 
        ? vals.reduce((a, b) => a + b, 0)
        : vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);

      return {
        year: yr,
        rataRata: parseFloat(value.toFixed(2)),
      };
    });
  };

  // CSV Exporter Action
  const downloadCSV = () => {
    const years = [2021, 2022, 2023, 2024, 2025, 2026];
    const headers = ["Provinsi Code", "Nama Provinsi", ...years.map(y => y.toString())];
    
    const rows = tableData.map((row) => [
      row.id,
      row.name,
      ...years.map((y) => row[y]),
    ]);

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map((r) => r.map(v => `"${v}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dataset_${dataset.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Exporter Action
  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tableData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `dataset_${dataset.id}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Back Button */}
      <button 
        onClick={() => router.push("/data")}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 font-semibold cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
      </button>

      {/* Dataset Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded bg-red-50 text-red-655 dark:bg-red-950/20 flex items-center justify-center">
              <Database className="h-4 w-4" />
            </span>
            <h1 className="font-extrabold text-2xl text-navy-950 dark:text-white tracking-tight leading-snug">
              {dataset.title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-slate-400">
            <span className="font-bold text-red-600 uppercase bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
              {dataset.category}
            </span>
            <span>•</span>
            <span>Sumber: {dataset.dataSource.name}</span>
            <span>•</span>
            <span>Rilis Data: 2026</span>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={downloadCSV}
            className="rounded-xl border-slate-200 text-slate-655 hover:bg-slate-50 text-xs flex items-center gap-1.5 dark:border-slate-800 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={downloadJSON}
            className="rounded-xl border-slate-200 text-slate-655 hover:bg-slate-50 text-xs flex items-center gap-1.5 dark:border-slate-800 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Download className="h-4 w-4" /> JSON
          </Button>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        
        <Card className="border-slate-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50">
          <CardContent className="pt-6 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Garis Satuan Data
            </span>
            <span className="text-xl font-extrabold text-navy-950 dark:text-white mt-1 block">
              {dataset.unit}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50">
          <CardContent className="pt-6 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Rasio Kepatuhan
            </span>
            <span className="text-xl font-extrabold text-navy-950 dark:text-white mt-1 block">
              100% (38 Wilayah)
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50">
          <CardContent className="pt-6 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Metode Survei
            </span>
            <span className="text-sm font-extrabold text-navy-950 dark:text-white mt-1.5 block line-clamp-1">
              {dataset.methodology || "Registrasi Terbuka"}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50">
          <CardContent className="pt-6 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Status Dataset
            </span>
            <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-[8px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
              ⚠️ {dataset.status.toUpperCase()} DATA
            </span>
          </CardContent>
        </Card>

      </div>

      {/* Dataset Description Text */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl text-xs space-y-2 leading-relaxed">
        <h4 className="font-extrabold text-navy-950 dark:text-white flex items-center gap-1.5">
          <Info className="h-4 w-4 text-slate-400" /> Deskripsi Dataset
        </h4>
        <p className="text-slate-655 dark:text-slate-300">
          {dataset.description} Dataset ini mencakup riwayat tren tahunan dari 2021 hingga 2026. Anda dapat memvisualisasikan tren rata-rata nasional, melihat perbandingan peringkat antar daerah, atau mengeksplorasi peta choropleth menggunakan tab di bawah ini.
        </p>
      </div>

      {/* Interactive Tabs */}
      <Tabs defaultValue="tabel" className="space-y-6">
        <TabsList className="bg-slate-100/80 border border-slate-200/50 p-1 dark:bg-slate-900/80 dark:border-slate-800">
          <TabsTrigger value="tabel" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            Tabel Data
          </TabsTrigger>
          <TabsTrigger value="grafik" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            Grafik Tren
          </TabsTrigger>
          <TabsTrigger value="peta" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
            Peta Choropleth
          </TabsTrigger>
        </TabsList>

        {/* Tab Content: Table */}
        <TabsContent value="tabel" className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex gap-2 justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari provinsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs border-slate-200 bg-white"
              />
            </div>
            <span className="text-[10px] text-slate-455">
              Menampilkan {sortedTableData.length} baris
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-900">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold dark:border-slate-800 dark:bg-slate-950">
                  <th 
                    onClick={() => handleSort("name")}
                    className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      Provinsi <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  {[2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
                    <th 
                      key={yr}
                      onClick={() => handleSort(yr.toString())}
                      className="p-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 select-none"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {yr} <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                {sortedTableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="p-3 font-semibold text-navy-950 dark:text-white">{row.name}</td>
                    <td className="p-3 text-right">{row[2021]?.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-right">{row[2022]?.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-right">{row[2023]?.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-right">{row[2024]?.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-right">{row[2025]?.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-right font-semibold text-navy-900 dark:text-slate-100">{row[2026]?.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab Content: Charts */}
        <TabsContent value="grafik" className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-50 duration-200">
          
          {/* Line Chart */}
          <Card className="border-slate-200/80 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tren Rata-Rata Nasional ({unit})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomLineChart
                data={getTimelineData()}
                series={[
                  { key: "rataRata", name: `Rata-rata Nasional (${unit})`, color: "#1e3a8a" }
                ]}
                unit={unit}
              />
            </CardContent>
          </Card>

          {/* Bar Chart (Rankings) */}
          <Card className="border-slate-200/80 bg-white flex flex-col justify-between">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                15 Provinsi Tertinggi (Tahun {selectedYear})
              </CardTitle>
              
              {/* Year Selector */}
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(val) => setSelectedYear(parseInt(val || "2026"))}
              >
                <SelectTrigger className="h-8 py-0 focus:ring-0 w-[80px] text-xs font-bold cursor-pointer">
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
            </CardHeader>
            <CardContent>
              <CustomBarChart
                data={getRankedBarData()}
                name={dataset.title}
                unit={unit}
                color="#0284c7"
              />
            </CardContent>
          </Card>

        </TabsContent>

        {/* Tab Content: Map */}
        <TabsContent value="peta" className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Peta Distribusi Nasional ({unit})
            </span>
            
            {/* Year Selector */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full text-xs">
              <span className="text-slate-400">Tahun:</span>
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(val) => setSelectedYear(parseInt(val || "2026"))}
              >
                <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 w-[65px] text-xs font-bold cursor-pointer">
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

          <IndonesiaLeafletMap
            dataPoints={tableData.map(r => ({
              regionId: r.id,
              regionName: r.name,
              value: r[selectedYear] || 0,
            }))}
            indicatorName={dataset.title}
            unit={unit}
          />
        </TabsContent>

      </Tabs>

    </div>
  );
}
