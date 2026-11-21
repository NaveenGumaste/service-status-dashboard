'use client';

import * as React from 'react';
import { Cpu } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RuntimeResponse } from '@/types';
import { formatDate, formatUptime } from '@/lib/utils';

interface RuntimePanelProps {
  runtime: RuntimeResponse;
}

export function RuntimePanel({ runtime }: RuntimePanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-foreground/80" />
              Server & Runtime Telemetry
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Authentic container process metrics without simulated telemetry
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] py-0">
            Node.js
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="divide-y divide-border/50 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Node Engine Version</span>
            <span className="font-mono font-medium text-foreground">{runtime.nodeVersion}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Server Uptime</span>
            <div className="text-right">
              <span className="font-mono font-medium text-foreground">
                {formatUptime(runtime.uptimeSeconds)}
              </span>
              <span className="text-[11px] text-muted-foreground block font-mono">
                {runtime.uptimeSeconds.toLocaleString()} total seconds
              </span>
            </div>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Process State</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400 capitalize">
              {runtime.status}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Bootstrap Started At</span>
            <span className="font-mono text-foreground text-[11px]">
              {formatDate(runtime.startedAt)}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Server Wall Clock</span>
            <span className="font-mono text-foreground text-[11px]">
              {formatDate(runtime.timestamp)}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Instance Identifier</span>
            <span className="font-mono text-foreground font-medium truncate max-w-[200px]" title={runtime.instanceId}>
              {runtime.instanceId}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
