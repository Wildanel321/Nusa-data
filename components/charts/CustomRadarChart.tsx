"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

interface RadarSeries {
  key: string;
  name: string;
  color: string;
}

interface CustomRadarChartProps {
  data: any[];
  series: RadarSeries[];
  angleKey?: string;
}

export default function CustomRadarChart({
  data,
  series,
  angleKey = "subject"
}: CustomRadarChartProps) {
  
  return (
    <div className="w-full h-[350px] flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-800" />
          <PolarAngleAxis 
            dataKey={angleKey} 
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: "medium" }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, "auto"]} 
            tick={{ fill: "#94a3b8", fontSize: 9 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px border #cbd5e1",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "#64748b" }}
          />
          {series.map((s) => (
            <Radar
              key={s.key}
              name={s.name}
              dataKey={s.key}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.25}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
