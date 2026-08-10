"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface SeriesItem {
  key: string;
  name: string;
  color: string;
}

interface CustomLineChartProps {
  data: any[];
  xKey?: string;
  series: SeriesItem[];
  unit?: string;
}

export default function CustomLineChart({
  data,
  xKey = "year",
  series,
  unit = ""
}: CustomLineChartProps) {
  
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
    return [`${Number(value).toLocaleString("id-ID")} ${unit}`, ""];
  };

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
          <XAxis 
            dataKey={xKey} 
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
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
            labelStyle={{ fontWeight: "bold", color: "#334155", marginBottom: "4px" }}
          />
          <Legend 
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "#64748b" }}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1 }}
              activeDot={{ r: 7, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
