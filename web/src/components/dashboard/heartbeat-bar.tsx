'use client';

import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface HeartbeatItem {
  id: string;
  time: string;
  statusCode: number;
  status: 'healthy' | 'unready' | 'unhealthy';
  latencyMs: number;
}

interface HeartbeatBarProps {
  history: HeartbeatItem[];
  totalChecks: number;
}

export function HeartbeatBar({ history, totalChecks }: HeartbeatBarProps) {
  const [hoveredItem, setHoveredItem] = React.useState<HeartbeatItem | null>(null);

  // Compute availability percentage
  const successfulCount = history.filter((h) => h.statusCode === 200).length;
  const availabilityPct =
    history.length > 0
      ? Math.round((successfulCount / history.length) * 1000) / 10
      : 100.0;

  // Fill up to 36 slots
  const maxSlots = 36;
  const displayItems = history.slice(-maxSlots);
  const emptySlots = Math.max(0, maxSlots - displayItems.length);

  return (
    <Card className="border-border/70 p-4">
      <CardContent className="p-0 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              SLO & Probe Availability Grid (Last {history.length} checks)
            </span>
            <Badge
              variant={availabilityPct === 100 ? 'success' : 'destructive'}
              className="font-mono text-[10px] py-0"
            >
              {availabilityPct.toFixed(1)}% UP
            </Badge>
          </div>

          <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-3">
            <span>Session Probes: <strong className="text-foreground">{totalChecks}</strong></span>
            <span>•</span>
            <span className="text-emerald-500 font-medium">{successfulCount} Healthy</span>
          </div>
        </div>

        {/* 36-slot Discrete Block Grid using flex so it NEVER breaks or wraps into rows */}
        <div className="flex items-center gap-1 w-full py-1">
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex-1 h-6 rounded-xs bg-muted/40 border border-border/40 transition-colors"
              title="Awaiting probe"
            />
          ))}

          {displayItems.map((item) => {
            const isOk = item.statusCode === 200;
            const isUnready = item.statusCode === 503;
            const colorClass = isOk
              ? 'bg-emerald-500/80 hover:bg-emerald-500'
              : isUnready
              ? 'bg-amber-500/80 hover:bg-amber-500'
              : 'bg-rose-500/80 hover:bg-rose-500';

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`flex-1 h-6 rounded-xs transition-all cursor-pointer ${colorClass}`}
              />
            );
          })}
        </div>

        {/* Hover / Status Caption */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground min-h-[16px]">
          {hoveredItem ? (
            <div className="font-mono text-foreground flex items-center gap-2">
              <span className="text-muted-foreground">Probe at {hoveredItem.time}:</span>
              <strong className={hoveredItem.statusCode === 200 ? 'text-emerald-500' : 'text-rose-500'}>
                HTTP {hoveredItem.statusCode}
              </strong>
              <span>({hoveredItem.latencyMs} ms)</span>
            </div>
          ) : (
            <div className="text-muted-foreground text-[10px]">
              Hover over any block to inspect historical probe status
            </div>
          )}

          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-xs bg-emerald-500" />
              <span>200 OK</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-xs bg-amber-500" />
              <span>503 Unready</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-xs bg-rose-500" />
              <span>500 Fail</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
