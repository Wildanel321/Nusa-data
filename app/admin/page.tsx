"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  Database,
  Info,
  ChevronRight,
  DatabaseZap,
  ArrowRight,
  Play,
  FileText,
  Landmark
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { provinces, dataSources } from "@/lib/data/mockDatasets";

export default function AdminPage() {
  const router = useRouter();
  // Dataset Form Metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("EKONOMI");
  const [unit, setUnit] = useState("");
  const [dataSourceId, setDataSourceId] = useState("bps");
  const [methodology, setMethodology] = useState("");

  // CSV State
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState("");

  // Import Workflow Steps
  // 1 = Form, 2 = Validate & Preview, 3 = Complete
  const [step, setStep] = useState(1);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<any>(null);

  // Reseed / Database status updater states
  const [adminKey, setAdminKey] = useState("");
  const [reseedLoading, setReseedLoading] = useState(false);

  // Default Template CSV generator for users
  const generateTemplateCSV = () => {
    const header = "regionId,year,value\n";
    const sampleRows = provinces
      .slice(0, 5)
      .map((p, idx) => `${p.id},2026,${(idx + 1) * 15.2}`)
      .join("\n");
    
    const blob = new Blob([header + sampleRows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "nusadata_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Local CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  // CSV Parser and Validator Workflow
  const handleValidate = () => {
    if (!title || !description || !unit || !csvContent) {
      alert("Mohon isi seluruh data metadata dan pilih/ketik file CSV data terlebih dahulu.");
      return;
    }

    const lines = csvContent.split("\n");
    const errors: string[] = [];
    const points: any[] = [];
    const validProvinceIds = provinces.map((p) => p.id);

    // 1. Check CSV headers
    const headerLine = lines[0].trim();
    const headers = headerLine.split(",").map(h => h.trim().toLowerCase());
    
    const hasRegionId = headers.includes("regionid");
    const hasYear = headers.includes("year");
    const hasValue = headers.includes("value");

    if (!hasRegionId || !hasYear || !hasValue) {
      errors.push("Header CSV tidak valid. Harus mengandung kolom: regionId, year, value (dipisahkan koma).");
      setValidationErrors(errors);
      setStep(2);
      return;
    }

    const colRegionIdx = headers.indexOf("regionid");
    const colYearIdx = headers.indexOf("year");
    const colValueIdx = headers.indexOf("value");

    // 2. Validate Row data
    for (let i = 1; i < lines.length; i++) {
      const rawLine = lines[i].trim();
      if (!rawLine) continue; // skip empty lines

      const cells = rawLine.split(",").map(c => c.trim());
      const rowNum = i + 1;

      if (cells.length < 3) {
        errors.push(`Baris ${rowNum}: Format kolom tidak lengkap (harus 3 kolom).`);
        continue;
      }

      const rId = cells[colRegionIdx].toLowerCase();
      const yrStr = cells[colYearIdx];
      const valStr = cells[colValueIdx];

      // Validate Region ID
      if (!validProvinceIds.includes(rId)) {
        errors.push(`Baris ${rowNum}: ID Wilayah '${rId}' tidak valid. Harus sesuai kode provinsi (misal: 'jawa-timur').`);
      }

      // Validate Year
      const year = parseInt(yrStr);
      if (isNaN(year) || year < 2000 || year > 2100) {
        errors.push(`Baris ${rowNum}: Tahun '${yrStr}' tidak valid. Tahun harus angka bulat antara 2000-2100.`);
      }

      // Validate Value
      const value = parseFloat(valStr);
      if (isNaN(value)) {
        errors.push(`Baris ${rowNum}: Nilai '${valStr}' tidak valid. Nilai harus berupa angka.`);
      }

      if (errors.length === 0) {
        points.push({ regionId: rId, year, value });
      }
    }

    setValidationErrors(errors);
    setParsedData(points);
    setStep(2);
  };

  // Sanitize potential CSV Formula Injections (OWASP A03)
  const sanitizeInput = (val: string): string => {
    if (val.startsWith("=") || val.startsWith("+") || val.startsWith("-") || val.startsWith("@")) {
      return `'${val}`;
    }
    return val;
  };

  // Submit and save to database / mock provider API
  const handleImport = async () => {
    if (!adminKey) {
      alert("Mohon masukkan Admin API Key Anda di kolom bawah terlebih dahulu untuk otorisasi impor data.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          metadata: {
            title: sanitizeInput(title),
            description: sanitizeInput(description),
            category,
            status: "Official", // imported data is set to Official
            unit: sanitizeInput(unit),
            methodology: sanitizeInput(methodology),
            dataSourceId,
          },
          dataPoints: parsedData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessInfo(data);
        setStep(3);
      } else {
        const err = await res.json();
        alert(`Gagal mengimpor dataset: ${err.message || "Kesalahan Server"}`);
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert("Terjadi kesalahan koneksi server saat mengimpor.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatusToOfficial = async () => {
    if (!adminKey) {
      alert("Mohon masukkan Admin API Key terlebih dahulu.");
      return;
    }

    setReseedLoading(true);
    try {
      const res = await fetch("/api/admin/reseed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminKey}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Sukses! ${data.updatedCount} dataset di database produksi Anda berhasil diubah statusnya menjadi 'Official'. Silakan muat ulang halaman visualisasi data.`);
        setAdminKey("");
      } else {
        alert(`Gagal memperbarui status: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi server.");
    } finally {
      setReseedLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setCategory("EKONOMI");
    setUnit("");
    setDataSourceId("bps");
    setMethodology("");
    setCsvContent("");
    setFileName("");
    setParsedData([]);
    setValidationErrors([]);
    setSuccessInfo(null);
    setStep(1);
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="font-extrabold text-2xl sm:text-3xl text-navy-950 dark:text-white tracking-tight">
          Admin Panel Importer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pengelolaan data nasional dan impor berkas data kualitatif.
        </p>
      </div>

      {/* Step Progress Indicators */}
      <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <span className={step === 1 ? "text-red-600 font-extrabold" : "text-slate-500"}>
          1. Pengisian Metadata
        </span>
        <ChevronRight className="h-4 w-4 text-slate-350" />
        <span className={step === 2 ? "text-red-600 font-extrabold" : "text-slate-550"}>
          2. Validasi & Pratinjau
        </span>
        <ChevronRight className="h-4 w-4 text-slate-350" />
        <span className={step === 3 ? "text-red-600 font-extrabold" : "text-slate-550"}>
          3. Selesai
        </span>
      </div>

      {/* Step 1: Input Metadata & CSV */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          {/* Form fields (2/3 width) */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                  Metadata Dataset
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  Definisikan rincian katalog dataset sebelum mengunggah berkas.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 text-xs">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-300">Judul Dataset</label>
                  <Input 
                    type="text" 
                    placeholder="Contoh: Rasio Penetrasi Internet 2021-2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-9 border-slate-200"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-300">Deskripsi</label>
                  <textarea 
                    rows={4}
                    placeholder="Jelaskan mengenai cakupan data dan kegunaannya..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                  />
                </div>

                {/* Grid columns */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-655 dark:text-slate-300">Kategori</label>
                    <Select value={category} onValueChange={(val) => setCategory(val || "")}>
                      <SelectTrigger className="h-9 w-full bg-slate-50 border-slate-200 rounded-lg cursor-pointer">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {["EKONOMI", "PENDIDIKAN", "KESEHATAN", "INFRASTRUKTUR", "LINGKUNGAN", "UMKM", "DEMOGRAFI"].map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-xs">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Unit */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-655 dark:text-slate-300">Satuan Unit Data</label>
                    <Input 
                      type="text" 
                      placeholder="Contoh: % / Jiwa / Unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="h-9 border-slate-200"
                    />
                  </div>

                  {/* Publisher */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-655 dark:text-slate-300">Sumber Penerbit Data</label>
                    <Select value={dataSourceId} onValueChange={(val) => setDataSourceId(val || "")}>
                      <SelectTrigger className="h-9 w-full bg-slate-50 border-slate-200 rounded-lg cursor-pointer">
                        <SelectValue placeholder="Pilih Sumber" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSources.map((ds) => (
                          <SelectItem key={ds.id} value={ds.id} className="text-xs">
                            {ds.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Methodology */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-655 dark:text-slate-300">Metodologi (Opsional)</label>
                    <Input 
                      type="text" 
                      placeholder="Contoh: Survei Sosial Ekonomi Nasional"
                      value={methodology}
                      onChange={(e) => setMethodology(e.target.value)}
                      className="h-9 border-slate-200"
                    />
                  </div>

                </div>

              </CardContent>
            </Card>
          </div>

          {/* CSV File Uploader / Paste box (1/3 width) */}
          <div className="col-span-1 space-y-6">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                  Unggah Berkas CSV
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  Unggah berkas tabular data dengan format standard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                
                {/* File Upload Box */}
                <div className="border-2 border-dashed border-slate-200 hover:border-red-500 rounded-xl p-4 text-center cursor-pointer relative bg-slate-50/50 hover:bg-red-50/10 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="h-8 w-8 text-slate-400 mx-auto stroke-1" />
                  <span className="mt-2 block font-semibold text-slate-650">
                    {fileName ? fileName : "Pilih File .CSV"}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-1">
                    Cakupan baris dibatasi koma (,)
                  </span>
                </div>

                {/* Download Template CSV Link */}
                <button
                  type="button"
                  onClick={generateTemplateCSV}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" /> Unduh Template CSV
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
                  <label className="font-semibold text-slate-655 block">Atau Tempel Salinan CSV</label>
                  <textarea 
                    rows={4}
                    placeholder="regionId,year,value&#10;jawa-barat,2026,75.4&#10;jawa-timur,2026,80.1"
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-transparent text-[10px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 font-mono"
                  />
                </div>

              </CardContent>
            </Card>

            <Button 
              onClick={handleValidate}
              className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex justify-center items-center gap-1.5 cursor-pointer py-5"
            >
              Proses & Validasi <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

        </div>
      )}

      {/* Step 2: Validate Results & Preview */}
      {step === 2 && (
        <Card className="border-slate-200 bg-white animate-in fade-in duration-200 text-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-navy-950 dark:text-white flex items-center gap-2">
              <DatabaseZap className="h-4 w-4 text-red-655" /> Pratinjau & Hasil Validasi Berkas
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-400">
              Periksa log kesalahan struktur CSV atau setujui impor ke database.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            
            {/* Validations errors panel */}
            {validationErrors.length > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="h-4.5 w-4.5 text-red-655" /> Terdeteksi {validationErrors.length} Kesalahan
                </h4>
                <ul className="list-disc list-inside space-y-1 text-red-755 text-[11px] leading-relaxed max-h-[150px] overflow-y-auto">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
                <p className="text-[10px] text-red-600 font-medium pt-1">
                  Harap perbaiki file CSV Anda berdasarkan log di atas, lalu kembali ke langkah sebelumnya.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-green-800 uppercase tracking-wider">
                    Format Berkas Tervalidasi Sukses
                  </h4>
                  <p className="text-[11px] text-green-700 mt-0.5 leading-relaxed">
                    Seluruh {parsedData.length} baris data tervalidasi dengan baik dan ID Wilayah terdaftar pada 38 provinsi Indonesia.
                  </p>
                </div>
              </div>
            )}

            {/* Preview table (only if there are data points) */}
            {parsedData.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-655 uppercase tracking-wider">Pratinjau Baris Data (Pertama 5 Baris)</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-550 font-bold dark:border-slate-900">
                        <th className="p-2.5">ID Wilayah</th>
                        <th className="p-2.5">Nama Wilayah</th>
                        <th className="p-2.5 text-center">Tahun</th>
                        <th className="p-2.5 text-right">Nilai ({unit})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700">
                      {parsedData.slice(0, 5).map((row, idx) => {
                        const prov = provinces.find((p) => p.id === row.regionId);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-mono">{row.regionId}</td>
                            <td className="p-2.5 font-semibold">{prov ? prov.name : row.regionId}</td>
                            <td className="p-2.5 text-center">{row.year}</td>
                            <td className="p-2.5 text-right font-bold">{row.value.toLocaleString("id-ID")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="rounded-xl border-slate-200 cursor-pointer"
              >
                Kembali ke Form
              </Button>
              
              <Button
                onClick={handleImport}
                disabled={validationErrors.length > 0 || parsedData.length === 0 || loading}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mengimpor..." : "Setujui & Impor"} <Play className="h-3.5 w-3.5" />
              </Button>
            </div>

          </CardContent>
        </Card>
      )}

      {/* Step 3: Complete */}
      {step === 3 && successInfo && (
        <Card className="border-slate-200 bg-white animate-in scale-in duration-200 text-xs text-center p-8 flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          
          <h2 className="font-extrabold text-xl text-navy-950 dark:text-white">
            Dataset Berhasil Diimpor!
          </h2>
          
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            Katalog dataset Anda <strong>&quot;{title}&quot;</strong> telah berhasil disimpan secara aman ke dalam sistem dengan total <strong>{successInfo.pointsCount}</strong> baris data wilayah.
          </p>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 max-w-sm w-full text-[11px] text-slate-500 space-y-1.5">
            <div className="flex justify-between">
              <span>ID Dataset:</span>
              <span className="font-mono font-bold text-navy-950">{successInfo.datasetId}</span>
            </div>
            <div className="flex justify-between">
              <span>Kode Indikator:</span>
              <span className="font-mono font-bold text-navy-950">{successInfo.indicatorCode}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4 justify-center">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="rounded-xl border-slate-200 cursor-pointer"
            >
              Unggah Lagi
            </Button>
            <Button
              onClick={() => router.push(`/data/${successInfo.datasetId}`)}
              className="rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              Lihat Dataset <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Database Status Updater Card (Always visible at the bottom) */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <Card className="border-slate-200 bg-white dark:border-slate-800 text-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-navy-950 dark:text-white flex items-center gap-2">
              <Landmark className="h-4.5 w-4.5 text-navy-900" /> Pengelolaan Status Database Produksi
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-400">
              Ubah status seluruh indikator pembangunan di database produksi Anda dari "Demo" menjadi "Official" secara instant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="space-y-1.5 flex-1">
                <label className="font-semibold text-slate-655 dark:text-slate-350 block text-[10px] uppercase tracking-wider">
                  Admin API Key (Authorization Token)
                </label>
                <Input 
                  type="password" 
                  placeholder="Masukkan Token Admin API Key (Default: nusadata-admin-secret-key)"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="h-9 border-slate-200"
                />
              </div>
              <Button
                onClick={handleUpdateStatusToOfficial}
                disabled={reseedLoading}
                className="rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-semibold flex items-center gap-1.5 h-9 cursor-pointer disabled:opacity-50 text-xs px-4"
              >
                {reseedLoading ? "Memproses..." : "Setel Status ke Official"} <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
