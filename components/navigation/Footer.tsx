import React from "react";
import Link from "next/link";
import { HelpCircle, FileText, Database, ShieldAlert, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-900 font-bold relative overflow-hidden">
                <span className="text-sm relative z-10 text-slate-950">N</span>
                <div className="absolute top-0 left-0 w-full h-1/2 bg-red-600"></div>
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Nusa<span className="text-red-500">Data</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              NusaData adalah platform civic-tech independen yang memvisualisasikan data publik Indonesia secara modern dan interaktif. Kami bertujuan mendukung keterbukaan informasi nasional dan membantu masyarakat umum memahami dinamika pembangunan di berbagai wilayah Indonesia melalui data.
            </p>
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 p-2.5 rounded-lg max-w-sm">
              <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="text-[10px] text-slate-300 leading-normal">
                <span className="font-bold text-amber-500 block uppercase">Informasi Status Data</span>
                Beberapa visualisasi menggunakan data simulasi (DEMO DATA). Mohon periksa lencana status di tiap halaman sebelum mengutip data.
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Navigasi Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
              </li>
              <li>
                <Link href="/data" className="hover:text-white transition-colors">Katalog Dataset</Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-white transition-colors">Peta Interaktif</Link>
              </li>
              <li>
                <Link href="/ranking" className="hover:text-white transition-colors">Peringkat Provinsi</Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">Alat Perbandingan</Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors">Analisis Tren</Link>
              </li>
            </ul>
          </div>

          {/* Resources & Sources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Sumber & Kebijakan</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Database className="h-3 w-3" />
                <a href="https://www.bps.go.id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Badan Pusat Statistik (BPS)
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Award className="h-3 w-3" />
                <a href="https://data.go.id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Satu Data Indonesia
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <HelpCircle className="h-3 w-3" />
                <Link href="/about" className="hover:text-white transition-colors">
                  Metodologi & Tentang Kami
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <FileText className="h-3 w-3" />
                <span className="text-[10px]">Versi MVP 1.0 (2026)</span>
              </li>
            </ul>
          </div>

        </div>

        <hr className="border-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
          <div>
            © {new Date().getFullYear()} NusaData Project. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Kebijakan Privasi</a>
            <a href="#" className="hover:underline">Syarat Penggunaan</a>
            <a href="mailto:contact@nusadata.id" className="hover:underline">Kontak Platform</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
