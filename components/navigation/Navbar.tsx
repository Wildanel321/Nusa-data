"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, Sun, Moon, Database, Map, TrendingUp, Layers, Info, BarChart2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    regions: any[];
    datasets: any[];
    indicators: any[];
  }>({ regions: [], datasets: [], indicators: [] });
  const [searchLoading, setSearchLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (systemPrefersDark) {
      setTheme("dark");
      document.documentElement.classList.toggle("dark", true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Search Input Change
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearchLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults({ regions: [], datasets: [], indicators: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Data", href: "/data" },
    { name: "Peta", href: "/map" },
    { name: "Ranking", href: "/ranking" },
    { name: "Bandingkan", href: "/compare" },
    { name: "Analisis", href: "/analytics" },
    { name: "Admin", href: "/admin" },
  ];

  const handleSearchResultClick = (type: string, id: string) => {
    setSearchQuery("");
    setSearchFocused(false);
    
    if (type === "region") {
      router.push(`/region/${id}`);
    } else if (type === "dataset") {
      router.push(`/data/${id}`);
    } else if (type === "indicator") {
      // Find dataset ID for indicator
      router.push(`/data`);
    }
  };

  const isSearchEmpty =
    searchResults.regions.length === 0 &&
    searchResults.datasets.length === 0 &&
    searchResults.indicators.length === 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 dark:bg-navy-800 text-white font-bold relative overflow-hidden transition-transform group-hover:scale-105 border border-red-500">
              <span className="text-lg relative z-10 text-white">N</span>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-red-600"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-navy-950 dark:text-white">
                Nusa<span className="text-red-600">Data</span>
              </span>
              <span className="text-[10px] -mt-1 font-semibold tracking-wider text-slate-500 uppercase">
                Civic-Tech Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-red-600 ${
                  isActive
                    ? "text-red-600 border-b-2 border-red-600 py-1"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-4 flex-1 justify-end md:flex-none">
          {/* Global Search Input */}
          <div ref={searchRef} className="relative w-full max-w-[280px] hidden sm:block">
            <div className="relative">
              <Search className="absolute top-2.5 left-2.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Cari provinsi, dataset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-9 pr-4 py-1.5 h-9 text-xs rounded-full border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 focus-visible:ring-red-500 focus-visible:border-red-500 focus-visible:ring-1"
              />
            </div>

            {/* Search Results Dropdown */}
            {searchFocused && (searchQuery.trim().length >= 2 || searchLoading) && (
              <div className="absolute top-11 right-0 w-[350px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-950 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                {searchLoading ? (
                  <div className="flex items-center justify-center p-6 text-xs text-slate-500">
                    <span className="animate-pulse">Mencari data...</span>
                  </div>
                ) : isSearchEmpty ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    <p>Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Regions Matches */}
                    {searchResults.regions.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Map className="h-3 w-3 text-red-500" /> Wilayah
                        </div>
                        <ul className="mt-1 space-y-1">
                          {searchResults.regions.map((reg) => (
                            <li key={reg.id}>
                              <button
                                onClick={() => handleSearchResultClick("region", reg.id)}
                                className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 flex justify-between items-center text-slate-700 dark:text-slate-200"
                              >
                                <span className="font-medium">{reg.name}</span>
                                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                                  Provinsi
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Datasets Matches */}
                    {searchResults.datasets.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Database className="h-3 w-3 text-navy-500" /> Dataset
                        </div>
                        <ul className="mt-1 space-y-1">
                          {searchResults.datasets.map((ds) => (
                            <li key={ds.id}>
                              <button
                                onClick={() => handleSearchResultClick("dataset", ds.id)}
                                className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200"
                              >
                                <div className="font-medium line-clamp-1">{ds.title}</div>
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  Kategori: {ds.category}
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Indicators Matches */}
                    {searchResults.indicators.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <TrendingUp className="h-3 w-3 text-blue-500" /> Indikator
                        </div>
                        <ul className="mt-1 space-y-1">
                          {searchResults.indicators.map((ind) => (
                            <li key={ind.id}>
                              <button
                                onClick={() => handleSearchResultClick("dataset", ind.datasetId)}
                                className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200"
                              >
                                <span className="font-medium">{ind.name}</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">
                                  Lihat pada Dataset
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* Mobile Hamburguer Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 px-4 pt-2 pb-6 space-y-4 animate-in slide-in-from-top-5 duration-200">
          {/* Mobile Search */}
          <div className="relative mt-2">
            <Search className="absolute top-2.5 left-2.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              placeholder="Cari provinsi, dataset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800"
            />
          </div>

          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-50 text-red-600 dark:bg-slate-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
