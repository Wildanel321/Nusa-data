"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface CustomBarChartProps {
  data: any[];
  xKey?: string;
  yKey?: string;
  name?: string;
  color?: string;
  unit?: string;
}

export default function CustomBarChart({
  data,
  xKey = "regionName",
  yKey = "value",
  name = "Nilai",
  color = "#3b82f6",
  unit = ""
}: CustomBarChartProps) {
  
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}rb`;
    }
    return `${value}${unit}`;
  };

  const formatTooltip = (value: any) => {
    return [`${Number(value).toLocaleString("id-ID")} ${unit}`, name];
  };

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
          <XAxis 
            dataKey={xKey} 
            stroke="#94a3b8" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px border #cbd5e1",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              fontSize: "12px",
              color: "#0f172a"
            }} 
            formatter={formatTooltip}
            labelStyle={{ fontWeight: "bold", color: "#334155" }}
          />
          <Bar 
            dataKey={yKey} 
            fill={color} 
            radius={[4, 4, 0, 0]}
            maxBarSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
