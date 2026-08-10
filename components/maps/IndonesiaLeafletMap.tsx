"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Import Leaflet dynamically to prevent Server-Side Rendering (SSR) issues
let MapContainer: any, TileLayer: any, GeoJSON: any, useMap: any;

export default function IndonesiaLeafletMap({
  dataPoints,
  indicatorName,
  unit,
  onProvinceClick,
}: {
  dataPoints: any[];
  indicatorName: string;
  unit: string;
  onProvinceClick?: (province: any) => void;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [mapLibraryLoaded, setMapLibraryLoaded] = useState(false);
  const [hoveredProvince, setHoveredProvince] = useState<any>(null);

  const geoJsonRef = useRef<any>(null);

  // Load React-Leaflet libraries only on client-side
  useEffect(() => {
    setIsMounted(true);
    Promise.all([
      import("react-leaflet"),
      import("leaflet")
    ]).then(([reactLeaflet, L]) => {
      MapContainer = reactLeaflet.MapContainer;
      TileLayer = reactLeaflet.TileLayer;
      GeoJSON = reactLeaflet.GeoJSON;
      useMap = reactLeaflet.useMap;

      // Fix default leaflet marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      setMapLibraryLoaded(true);
    }).catch(err => console.error("Failed to load map libraries:", err));
  }, []);

  // Fetch GeoJSON file
  useEffect(() => {
    fetch("/data/indonesia-provinces.json")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Failed to fetch GeoJSON map boundaries:", err));
  }, []);

  // Force re-render of GeoJSON layer when dataPoints change
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.clearLayers();
      if (geoJsonData) {
        geoJsonRef.current.addData(geoJsonData);
      }
    }
  }, [dataPoints, geoJsonData]);

  if (!isMounted || !mapLibraryLoaded || !geoJsonData) {
    return (
      <div className="flex h-[450px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-red-600"></div>
        <span className="mt-4 text-xs font-medium text-slate-500">Memuat peta Indonesia...</span>
      </div>
    );
  }

  // Calculate stats to define scale
  const values = dataPoints.map((dp) => dp.value);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 100;

  // Choropleth coloring function (Navy Blue scale)
  const getColor = (value: number) => {
    if (maxVal === minVal) return "#bae6fd"; // default light blue
    const normalized = (value - minVal) / (maxVal - minVal);

    if (normalized < 0.2) return "#e0f2fe"; // sky-100
    if (normalized < 0.4) return "#bae6fd"; // sky-200
    if (normalized < 0.6) return "#7dd3fc"; // sky-300
    if (normalized < 0.8) return "#0284c7"; // sky-600
    return "#1e3a8a"; // navy/blue-900
  };

  // Helper to find data point value for a province
  const getProvinceValue = (provName: string) => {
    // Normalization of naming (some geojson use caps or slightly different spacing)
    const normalizedName = provName.toLowerCase().replace(/[^a-z]/g, "");
    
    const dp = dataPoints.find((d) => {
      const targetName = d.regionName.toLowerCase().replace(/[^a-z]/g, "");
      // Partial matching to handle names like "DKI Jakarta" vs "Jakarta" or "Papua" vs "Papua Barat"
      return targetName === normalizedName || 
             targetName.includes(normalizedName) || 
             normalizedName.includes(targetName);
    });
    
    return dp ? dp.value : null;
  };

  const getProvinceSlug = (provName: string) => {
    // Return matching slug from dataPoints
    const normalizedName = provName.toLowerCase().replace(/[^a-z]/g, "");
    const dp = dataPoints.find((d) => {
      const targetName = d.regionName.toLowerCase().replace(/[^a-z]/g, "");
      return targetName === normalizedName || targetName.includes(normalizedName);
    });
    return dp ? dp.regionId : provName.toLowerCase().replace(/\s+/g, "-");
  };

  // GeoJSON style handler
  const style = (feature: any) => {
    const provName = feature.properties.PROVINSI || feature.properties.name || "";
    const val = getProvinceValue(provName);
    return {
      fillColor: val !== null ? getColor(val) : "#cbd5e1", // gray if no data
      weight: 1.5,
      opacity: 1,
      color: "#ffffff", // white borders
      fillOpacity: 0.8,
    };
  };

  // Hover highlighting and Click popup triggers
  const onEachFeature = (feature: any, layer: any) => {
    const provName = feature.properties.PROVINSI || feature.properties.name || "";
    const val = getProvinceValue(provName);
    const slug = getProvinceSlug(provName);

    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2.5,
          color: "#dc2626", // indonesian red border on hover
          fillOpacity: 0.9,
        });
        layer.bringToFront();
        setHoveredProvince({
          name: provName,
          value: val,
          slug,
        });
      },
      mouseout: (e: any) => {
        geoJsonRef.current.resetStyle(e.target);
        setHoveredProvince(null);
      },
      click: () => {
        if (onProvinceClick) {
          onProvinceClick({ name: provName, value: val, slug });
        } else {
          router.push(`/region/${slug}`);
        }
      },
    });
  };

  // Center coordinate of Indonesia
  const position: [number, number] = [-2.5489, 118.0149];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 shadow-md dark:border-slate-800 dark:bg-slate-900/50">
      
      {/* Leaflet map object */}
      <div className="h-[450px] w-full">
        <MapContainer
          center={position}
          zoom={5}
          minZoom={4}
          maxZoom={7}
          style={{ height: "100%", width: "100%", background: "#f8fafc" }}
          zoomControl={true}
          scrollWheelZoom={false}
          className="dark:bg-slate-950"
        >
          {/* Base TileLayer (Very minimal light style to keep visual clean) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            className="dark:invert dark:opacity-80"
          />

          <GeoJSON
            ref={geoJsonRef}
            data={geoJsonData}
            style={style}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      </div>

      {/* Floating Info Overlay (Hover Box) */}
      <div className="absolute bottom-4 left-4 z-[1000] w-64 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
        {hoveredProvince ? (
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Detail Wilayah
            </span>
            <h4 className="font-bold text-sm text-navy-950 dark:text-white mt-0.5">
              {hoveredProvince.name}
            </h4>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
              <div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block">
                  {indicatorName}
                </span>
                <span className="text-sm font-extrabold text-navy-950 dark:text-white">
                  {hoveredProvince.value !== null
                    ? `${hoveredProvince.value.toLocaleString("id-ID")} ${unit}`
                    : "Data Tidak Tersedia"}
                </span>
              </div>
              <span className="text-[9px] text-red-600 font-semibold flex items-center gap-0.5 hover:underline cursor-pointer">
                Klik detail <Info className="h-3 w-3" />
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 flex items-center gap-2 py-1">
            <Info className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Arahkan kursor atau sentuh provinsi untuk melihat nilai detail.</span>
          </div>
        )}
      </div>

      {/* Legend Block */}
      <div className="absolute top-4 right-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 p-2.5 shadow-md backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95 flex flex-col gap-1.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
          Legenda ({unit})
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-slate-500">Rendah</span>
          <div className="flex h-3.5 items-center gap-0.5 px-1">
            <div className="w-4 h-full bg-[#e0f2fe] rounded-sm border border-white"></div>
            <div className="w-4 h-full bg-[#bae6fd] rounded-sm border border-white"></div>
            <div className="w-4 h-full bg-[#7dd3fc] rounded-sm border border-white"></div>
            <div className="w-4 h-full bg-[#0284c7] rounded-sm border border-white"></div>
            <div className="w-4 h-full bg-[#1e3a8a] rounded-sm border border-white"></div>
          </div>
          <span className="text-[9px] text-slate-500">Tinggi</span>
        </div>
        <div className="text-[9px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1 flex justify-between">
          <span>{minVal.toLocaleString("id-ID")}</span>
          <span>{maxVal.toLocaleString("id-ID")}</span>
        </div>
      </div>

    </div>
  );
}
