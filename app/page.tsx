"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Map, Database, ArrowRight, Search, BarChart3, Users, Network, Landmark, CheckCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dataProvider from "@/lib/providers";

// Small count-up utility component
function CountUpNumber({ end, suffix = "", duration = 1500 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressPercent = Math.min(progress / duration, 1);
      
      setCount(Math.floor(startValue + progressPercent * (end - startValue)));

      if (progressPercent < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <span>
      {count.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

export default function Homepage() {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");
  const [isDemoData, setIsDemoData] = useState(true);

  useEffect(() => {
    async function checkProvider() {
      try {
        const datasetsList = await dataProvider.getDatasets();
        const hasOfficial = datasetsList.some(
          (d: any) => d.status === "Official" || d.status === "Verified"
        );
        setIsDemoData(!hasOfficial);
      } catch (error) {
        // Keep as demo if fetch fails
      }
    }
    checkProvider();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/data?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-between w-full flex-grow overflow-x-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-200">
      
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] dark:opacity-20 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative max-w-5xl w-full px-4 pt-16 pb-12 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Government Tech Banner */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm text-[10px] font-semibold text-slate-500 uppercase tracking-widest animate-fade-in mb-6">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
          CIVIC DATA INTELLIGENCE PLATFORM
        </div>

        {/* Title */}
        <h1 className="font-extrabold text-4xl sm:text-6xl tracking-tight text-navy-950 dark:text-white max-w-3xl leading-tight">
          NusaData <br />
          <span className="bg-gradient-to-r from-red-600 to-navy-900 bg-clip-text text-transparent dark:from-red-500 dark:to-blue-400">
            Memahami Indonesia
          </span> <br />
          melalui data.
        </h1>

        {/* Description */}
        <p className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
          Jelajahi, bandingkan, dan analisis data pembangunan nasional, ekonomi, pendidikan, hingga infrastruktur di seluruh 38 provinsi Indonesia dalam satu platform interaktif.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-8 w-full max-w-lg relative flex items-center group">
          <Search className="absolute left-3.5 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          <Input
            type="text"
            placeholder="Cari provinsi, kabupaten, indikator (misal: 'Jawa Timur', 'kemiskinan')..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-11 pr-32 py-6 rounded-full border-slate-200 bg-white shadow-md focus-visible:ring-red-500 dark:border-slate-800 dark:bg-slate-900 text-sm focus-visible:ring-1 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            className="absolute right-1.5 py-4 px-5 rounded-full bg-navy-900 hover:bg-navy-950 text-white font-medium text-xs dark:bg-navy-800 dark:hover:bg-navy-700"
          >
            Temukan
          </Button>
        </form>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/dashboard">
            <Button className="rounded-full bg-red-600 hover:bg-red-700 text-white px-6 py-5 text-sm font-semibold shadow-md flex items-center gap-2 group transition-all">
              Jelajahi Data <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/map">
            <Button variant="outline" className="rounded-full border-slate-200 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-850 px-6 py-5 text-sm font-semibold flex items-center gap-2">
              <Map className="h-4 w-4 text-red-600" /> Lihat Peta Indonesia
            </Button>
          </Link>
        </div>

      </section>

      {/* Counters Block */}
      <section className="w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          
          <div className="text-center flex flex-col items-center">
            <span className="h-9 w-9 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 flex items-center justify-center">
              <Landmark className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white">
              <CountUpNumber end={38} />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Provinsi Indonesia</p>
          </div>

          <div className="text-center flex flex-col items-center">
            <span className="h-9 w-9 rounded-lg bg-navy-50 text-navy-900 dark:bg-navy-950/30 dark:text-navy-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white">
              <CountUpNumber end={514} suffix="+" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kabupaten / Kota</p>
          </div>

          <div className="text-center flex flex-col items-center">
            <span className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white">
              <CountUpNumber end={10000} suffix="+" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Estimasi Dataset</p>
          </div>

          <div className="text-center flex flex-col items-center">
            <span className="h-9 w-9 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white">
              <CountUpNumber end={2026} duration={1000} />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Data Terbaru Terbit</p>
          </div>

        </div>
      </section>

      {/* Featured Features Section */}
      <section className="w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        
        <h2 className="text-center text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white mb-8">
          Akses Alat Analisis Utama
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Interactive Map */}
          <Link href="/map" className="group rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-lg transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Map className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-navy-950 dark:text-white mt-4">
                Peta Tematik Choropleth
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Visualisasikan ketimpangan pembangunan antardaerah dengan peta interaktif Leaflet. Filter provinsi berdasarkan populasi, tingkat kemiskinan, atau pemerataan digital.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-red-600 group-hover:translate-x-1 transition-transform">
              Buka Peta <ArrowRight className="h-3 w-3" />
            </div>
          </Link>

          {/* Card 2: Compare Tool */}
          <Link href="/compare" className="group rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-lg transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-900 dark:bg-navy-950/40 dark:text-navy-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Network className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-navy-950 dark:text-white mt-4">
                Perbandingan Antar Wilayah
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Pilih hingga 4 wilayah sekaligus untuk membandingkan performa ekonomi, fasilitas kesehatan, dan kualitas lingkungan menggunakan radar diagram yang informatif.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-navy-900 dark:text-navy-400 group-hover:translate-x-1 transition-transform">
              Mulai Bandingkan <ArrowRight className="h-3 w-3" />
            </div>
          </Link>

          {/* Card 3: Ranking Dashboard */}
          <Link href="/ranking" className="group rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-lg transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-navy-950 dark:text-white mt-4">
                Peringkat & Tren Nasional
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Lihat daerah berkinerja terbaik atau yang membutuhkan intervensi kebijakan khusus. Urutkan daerah berdasarkan metrik ekonomi, pendidikan, atau rasio listrik.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              Lihat Ranking <ArrowRight className="h-3 w-3" />
            </div>
          </Link>

        </div>
      </section>

      {/* Demo Warning Banner */}
      {isDemoData && (
        <section className="w-full max-w-4xl px-4 pb-12 sm:px-6">
          <div className="flex gap-3 bg-amber-50 border border-amber-200 p-4 rounded-2xl dark:bg-amber-950/20 dark:border-amber-900/30">
            <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-amber-800 dark:text-amber-500 uppercase tracking-wider">
                ⚠️ Platform Demo & Transparansi Data
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1 leading-relaxed">
                Platform NusaData ini dijalankan dalam status <strong>Demo Mode (Simulasi Data)</strong>. Seluruh data historis dari 2021 hingga 2026 disimulasikan secara realistis berdasarkan baseline BPS. Untuk menghubungkan dengan database produksi PostgreSQL milik Anda, silakan konfigurasikan file <code>.env</code> dan migrasikan skema database Prisma.
              </p>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
