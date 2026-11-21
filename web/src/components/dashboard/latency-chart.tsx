'use client';

import * as React from 'react';
import { Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface LatencyDataPoint {
  timestamp: number;
  timeStr: string;
  healthLatency: number;
  readyLatency: number;
}

interface LatencyChartProps {
  data: LatencyDataPoint[];
  currentHealthLatency: number;
  currentReadyLatency: number;
}

export function LatencyChart({
  data,
  currentHealthLatency,
  currentReadyLatency,
}: LatencyChartProps) {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  // Compute stats
  const allHealth = data.map((d) => d.healthLatency);
  const minLatency = allHealth.length > 0 ? Math.min(...allHealth) : 0;
  const maxLatency = allHealth.length > 0 ? Math.max(...allHealth) : 0;
  const avgLatency =
    allHealth.length > 0
      ? Math.round((allHealth.reduce((a, b) => a + b, 0) / allHealth.length) * 10) / 10
      : 0;

  // SVG dimensions
  const width = 600;
  const height = 150;
  const padding = { top: 15, right: 15, bottom: 25, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Determine dynamic Y scale
  const maxYValue = Math.max(25, Math.ceil((maxLatency + 5) / 10) * 10);

  const getX = (index: number) => {
    if (data.length <= 1) return padding.left;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.min(val, maxYValue);
    return padding.top + chartHeight - (clamped / maxYValue) * chartHeight;
  };

  // Generate SVG path for a line
  const makeLinePath = (getter: (d: LatencyDataPoint) => number) => {
    if (data.length === 0) return '';
    if (data.length === 1) {
      const y = getY(getter(data[0]));
      return `M ${padding.left} ${y} L ${padding.left + chartWidth} ${y}`;
    }

    return data
      .map((d, i) => {
        const x = getX(i);
        const y = getY(getter(d));
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Generate SVG path for area fill
  const makeAreaPath = (getter: (d: LatencyDataPoint) => number) => {
    if (data.length === 0) return '';
    const line = makeLinePath(getter);
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const bottomY = padding.top + chartHeight;
    return `${line} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  };

  const healthLine = makeLinePath((d) => d.healthLatency);
  const healthArea = makeAreaPath((d) => d.healthLatency);
  const readyLine = makeLinePath((d) => d.readyLatency);
  const readyArea = makeAreaPath((d) => d.readyLatency);

  const lastHealthPoint =
    data.length > 0
      ? { x: getX(data.length - 1), y: getY(data[data.length - 1].healthLatency) }
      : null;

  const lastReadyPoint =
    data.length > 0
      ? { x: getX(data.length - 1), y: getY(data[data.length - 1].readyLatency) }
      : null;

  return (
    <Card className="border-border/70 overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-500 animate-pulse" />
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Probe Response Velocity & Latency Dynamics
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Live continuous telemetry stream measuring HTTP round-trip latency (ms)
            </CardDescription>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 border border-border/60 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Liveness: </span>
              <strong className="text-foreground">{currentHealthLatency} ms</strong>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 border border-border/60 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span>Readiness: </span>
              <strong className="text-foreground">{currentReadyLatency} ms</strong>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded border border-border/50 bg-muted/20">
            <div className="text-[10px] text-muted-foreground uppercase font-sans">Current Velocity</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {currentHealthLatency} <span className="text-xs font-normal">ms</span>
            </div>
          </div>
          <div className="p-2.5 rounded border border-border/50 bg-muted/20">
            <div className="text-[10px] text-muted-foreground uppercase font-sans">Session Min</div>
            <div className="text-base font-bold text-foreground mt-0.5">
              {minLatency} <span className="text-xs font-normal">ms</span>
            </div>
          </div>
          <div className="p-2.5 rounded border border-border/50 bg-muted/20">
            <div className="text-[10px] text-muted-foreground uppercase font-sans">Rolling Avg</div>
            <div className="text-base font-bold text-foreground mt-0.5">
              {avgLatency} <span className="text-xs font-normal">ms</span>
            </div>
          </div>
          <div className="p-2.5 rounded border border-border/50 bg-muted/20">
            <div className="text-[10px] text-muted-foreground uppercase font-sans">Session Max</div>
            <div className="text-base font-bold text-foreground mt-0.5">
              {maxLatency} <span className="text-xs font-normal">ms</span>
            </div>
          </div>
        </div>

        {/* Live SVG Graph */}
        <div className="relative w-full h-44 rounded-lg border border-border/60 bg-muted/10 p-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="readyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
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
                    {yVal}ms
                  </text>
                </g>
              );
            })}

            {/* Area Fills */}
            {readyArea && <path d={readyArea} fill="url(#readyGrad)" />}
            {healthArea && <path d={healthArea} fill="url(#healthGrad)" />}

            {/* Stroke Lines */}
            {readyLine && (
              <path
                d={readyLine}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {healthLine && (
              <path
                d={healthLine}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Leading Pulse Dots */}
            {lastReadyPoint && (
              <circle
                cx={lastReadyPoint.x}
                cy={lastReadyPoint.y}
                r="3"
                className="fill-sky-400"
              />
            )}
            {lastHealthPoint && (
              <g>
                <circle
                  cx={lastHealthPoint.x}
                  cy={lastHealthPoint.y}
                  r="5"
                  className="fill-emerald-500 animate-ping opacity-60"
                />
                <circle
                  cx={lastHealthPoint.x}
                  cy={lastHealthPoint.y}
                  r="3.5"
                  className="fill-emerald-500 stroke-background stroke-2"
                />
              </g>
            )}

            {/* Interactive Points on Hover */}
            {data.map((d, i) => {
              const cx = getX(i);
              return (
                <rect
                  key={i}
                  x={cx - 10}
                  y={padding.top}
                  width="20"
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoverIndex !== null && data[hoverIndex] && (
            <div
              className="absolute z-10 pointer-events-none p-2 rounded bg-popover/95 border border-border shadow-md text-xs font-mono"
              style={{
                left: `${(hoverIndex / Math.max(1, data.length - 1)) * 85 + 5}%`,
                top: '10px',
              }}
            >
              <div className="text-[10px] text-muted-foreground">{data[hoverIndex].timeStr}</div>
              <div className="text-emerald-500 font-semibold">
                Health: {data[hoverIndex].healthLatency} ms
              </div>
              <div className="text-sky-500 font-semibold">
                Ready: {data[hoverIndex].readyLatency} ms
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-xs bg-emerald-500" />
              <span>Liveness Probe (/api/health)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-xs bg-sky-500" />
              <span>Readiness Probe (/api/ready)</span>
            </span>
          </div>
          <span className="font-mono text-[10px]">Sampling: Last {data.length} measurements</span>
        </div>
      </CardContent>
    </Card>
  );
}
