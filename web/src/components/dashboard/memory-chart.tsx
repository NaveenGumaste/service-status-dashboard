'use client';

import * as React from 'react';
import { Database, HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface MemoryDataPoint {
  timestamp: number;
  timeStr: string;
  heapUsed: number;
  heapTotal: number;
  rss: number;
}

interface MemoryChartProps {
  data: MemoryDataPoint[];
  currentHeapUsed: number;
  currentHeapTotal: number;
  currentRss: number;
}

export function MemoryChart({
  data,
  currentHeapUsed,
  currentHeapTotal,
  currentRss,
}: MemoryChartProps) {
  const width = 600;
  const height = 140;
  const padding = { top: 15, right: 15, bottom: 25, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Max value calculation for scale
  const allValues = data.flatMap((d) => [d.heapUsed, d.heapTotal, d.rss]);
  const maxMem = allValues.length > 0 ? Math.max(...allValues, currentRss, 80) : 100;
  const maxYValue = Math.ceil(maxMem / 20) * 20;

  const getX = (index: number) => {
    if (data.length <= 1) return padding.left;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.min(val, maxYValue);
    return padding.top + chartHeight - (clamped / maxYValue) * chartHeight;
  };

  const makeLinePath = (getter: (d: MemoryDataPoint) => number) => {
    if (data.length === 0) return '';
    return data
      .map((d, i) => {
        const x = getX(i);
        const y = getY(getter(d));
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const makeAreaPath = (getter: (d: MemoryDataPoint) => number) => {
    if (data.length === 0) return '';
    const line = makeLinePath(getter);
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const bottomY = padding.top + chartHeight;
    return `${line} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  };

  const heapUsedLine = makeLinePath((d) => d.heapUsed);
  const heapUsedArea = makeAreaPath((d) => d.heapUsed);
  const rssLine = makeLinePath((d) => d.rss);

  const heapPct = currentHeapTotal > 0 ? Math.round((currentHeapUsed / currentHeapTotal) * 100) : 0;

  return (
    <Card className="border-border/70 overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-sky-500 animate-pulse" />
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Node.js Memory Utilization & Resident Set Size (RSS)
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Live process memory consumption (MB) reported directly from process.memoryUsage()
            </CardDescription>
          </div>

          <Badge variant="outline" className="font-mono text-xs py-0.5 self-start sm:self-auto">
            Heap Pressure: {heapPct}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded border border-border/50 bg-muted/20">
            <div className="text-[10px] text-muted-foreground uppercase font-sans">Heap Active</div>
            <div className="text-base font-bold text-sky-600 dark:text-sky-400 mt-0.5">
              {currentHeapUsed} <span className="text-xs font-normal">MB</span>
            </div>
          </div>
          <div className="p-2.5 rounded border border-border/50 bg-muted/20">
            <div className="text-[10px] text-muted-foreground uppercase font-sans">Heap Allocated</div>
            <div className="text-base font-bold text-foreground mt-0.5">
              {currentHeapTotal} <span className="text-xs font-normal">MB</span>
            </div>
          </div>
          <div className="p-2.5 rounded border border-border/50 bg-muted/20">
            <div className="text-[10px] text-muted-foreground uppercase font-sans">Resident (RSS)</div>
            <div className="text-base font-bold text-foreground mt-0.5">
              {currentRss} <span className="text-xs font-normal">MB</span>
            </div>
          </div>
        </div>

        {/* Memory Bar Gauge */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Heap Distribution</span>
            <span className="font-mono">
              {currentHeapUsed} MB / {currentHeapTotal} MB ({heapPct}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
            <div
              className="bg-sky-500 transition-all duration-300"
              style={{ width: `${Math.min(heapPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Live SVG Graph */}
        <div className="relative w-full h-36 rounded-lg border border-border/60 bg-muted/10 p-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="heapGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {[0, 0.5, 1].map((pct, idx) => {
              const yVal = Math.round(maxYValue * (1 - pct));
              const yPos = padding.top + chartHeight * pct;
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={width - padding.right}
                    y2={yPos}
                    stroke="currentColor"
                    strokeOpacity="0.08"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 6}
                    y={yPos + 3}
                    textAnchor="end"
                    className="text-[9px] fill-muted-foreground font-mono"
                  >
                    {yVal}MB
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {heapUsedArea && <path d={heapUsedArea} fill="url(#heapGrad)" />}

            {/* Lines */}
            {rssLine && (
              <path
                d={rssLine}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            )}
            {heapUsedLine && (
              <path
                d={heapUsedLine}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-xs bg-sky-500" />
              <span>Heap Used</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-xs border border-slate-400 border-dashed" />
              <span>Resident Memory (RSS)</span>
            </span>
          </div>
          <span className="font-mono text-[10px]">Points: {data.length}</span>
        </div>
      </CardContent>
    </Card>
  );
}
