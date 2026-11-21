'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusResponse } from '@/types';
import { formatUptime } from '@/lib/utils';

interface OverviewCardsProps {
  status: StatusResponse;
  healthCode: number;
  readyCode: number;
}

export function OverviewCards({ status, healthCode, readyCode }: OverviewCardsProps) {
  const isHealthy = status.health.status === 'healthy';
  const isReady = status.ready.status === 'ready';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Liveness Card */}
      <Card className="hover:border-border transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Liveness Probe
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              HTTP {healthCode}
            </span>
          </div>
          <div className="text-lg font-semibold tracking-tight text-foreground capitalize">
            {status.health.status}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground mt-1">
            GET /api/health
          </div>
        </CardContent>
      </Card>

      {/* 2. Readiness Card */}
      <Card className="hover:border-border transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Readiness Probe
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isReady ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              HTTP {readyCode}
            </span>
          </div>
          <div className="text-lg font-semibold tracking-tight text-foreground capitalize">
            {status.ready.status}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground mt-1">
            GET /api/ready
          </div>
        </CardContent>
      </Card>

      {/* 3. Uptime Card */}
      <Card className="hover:border-border transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Service Uptime
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {status.runtime.uptimeSeconds}s
            </span>
          </div>
          <div className="text-lg font-semibold tracking-tight text-foreground font-mono">
            {formatUptime(status.runtime.uptimeSeconds)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 truncate" title={status.runtime.startedAt}>
            Since {new Date(status.runtime.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Runtime Card */}
      <Card className="hover:border-border transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Node.js Runtime
            </span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 capitalize">
              {status.runtime.status}
            </span>
          </div>
          <div className="text-lg font-semibold tracking-tight text-foreground font-mono">
            {status.runtime.nodeVersion}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 font-mono truncate" title={status.runtime.instanceId}>
            {status.runtime.instanceId}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
