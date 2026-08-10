"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Database, Calendar, Award, Compass, RefreshCw, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import dataProvider from "@/lib/providers";

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read query params
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "Semua";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const categories = [
    "Semua",
    "Ekonomi",
    "Pendidikan",
    "Kesehatan",
    "Infrastruktur",
    "Lingkungan",
    "UMKM",
    "Demografi",
  ];

  // Update states if URL query changes
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setSelectedCategory(searchParams.get("category") || "Semua");
  }, [searchParams]);

  // Fetch datasets on filter/query changes
  useEffect(() => {
    async function loadDatasets() {
      setLoading(true);
      try {
        const list = await dataProvider.getDatasets(
          selectedCategory === "Semua" ? undefined : selectedCategory
        );

        // Client-side text filter for search query
        const query = searchQuery.toLowerCase().trim();
        const filteredList = list.filter(
          (d) =>
            d.title.toLowerCase().includes(query) ||
            d.description.toLowerCase().includes(query)
        );

        setDatasets(filteredList);
      } catch (error) {
        console.error("Failed to fetch datasets:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDatasets();
  }, [selectedCategory, searchQuery]);

  // Helper to push new URL params
  const updateUrl = (q: string, category: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category !== "Semua") params.set("category", category);
    
    const queryString = params.toString();
    router.push(queryString ? `/data?${queryString}` : `/data`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(searchQuery, selectedCategory);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    updateUrl(searchQuery, category);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Search and Categories controls */}
      <div className="space-y-4">
        
        {/* Search input Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              placeholder="Cari dataset dengan kata kunci (misal: 'kemiskinan', 'populasi')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 py-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus-visible:ring-red-500 focus-visible:ring-1"
            />
          </div>
          <Button type="submit" className="bg-navy-900 hover:bg-navy-950 text-white dark:bg-navy-800 dark:hover:bg-navy-700">
            Cari
          </Button>
        </form>

        {/* Category badges */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-650 dark:bg-slate-900 dark:hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* Dataset Cards List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-[75px] bg-slate-100 dark:bg-slate-900 rounded-t-xl"></CardHeader>
              <CardContent className="h-[125px] bg-slate-50 dark:bg-slate-950/50 rounded-b-xl"></CardContent>
            </Card>
          ))}
        </div>
      ) : datasets.length === 0 ? (
        <div className="text-center p-12 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50">
          <Database className="h-10 w-10 text-slate-400 mx-auto stroke-1 animate-pulse" />
          <h3 className="font-extrabold text-sm text-navy-950 dark:text-white mt-4">
            Dataset Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-550 max-w-sm mx-auto mt-2 leading-relaxed">
            Tidak ada dataset yang cocok dengan kriteria pencarian atau kategori saat ini. Silakan coba kata kunci lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {datasets.map((ds) => {
            const isDemo = ds.status === "Demo";
            return (
              <Card 
                key={ds.id} 
                className="border-slate-200/80 bg-white/50 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {ds.category}
                    </span>
                    {isDemo ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
                        ⚠️ DEMO DATA
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400">
                        ✓ VERIFIED
                      </span>
                    )}
                  </div>
                  <CardTitle className="font-extrabold text-base text-navy-950 dark:text-white mt-2.5 leading-snug line-clamp-1">
                    {ds.title}
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {ds.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-slate-400" />
                      <span>Sumber: {ds.dataSourceId.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Periode: 2021–2026</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      <span>Cakupan: 38 Wilayah</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                      <span>Satuan: {ds.unit}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      onClick={() => router.push(`/data/${ds.id}`)}
                      className="w-full rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-semibold text-xs flex items-center justify-center gap-1.5 dark:bg-navy-800 dark:hover:bg-navy-700 cursor-pointer"
                    >
                      <Compass className="h-4 w-4" /> Eksplorasi Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default function DataCatalogPage() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="font-extrabold text-2xl sm:text-3xl text-navy-950 dark:text-white tracking-tight">
          Katalog Dataset Publik
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Jelajahi berbagai indikator pembangunan nasional, demografi, sosial, dan ekonomi sektoral.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-350 border-t-red-650"></div>
        </div>
      }>
        <CatalogContent />
      </Suspense>
    </div>
  );
}
