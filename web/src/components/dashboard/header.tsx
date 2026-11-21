'use client';

import * as React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  isHealthy: boolean;
  isReady: boolean;
  lastUpdated: string | null;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
  refreshIntervalMs: number;
  setRefreshIntervalMs: (val: number) => void;
  version?: string;
  environment?: string;
}

export function Header({
  onRefresh,
  isLoading,
  isHealthy,
  isReady,
  lastUpdated,
  autoRefresh,
  setAutoRefresh,
  refreshIntervalMs,
  setRefreshIntervalMs,
  version,
  environment,
}: HeaderProps) {
  const isOverallGood = isHealthy && isReady;

  return (
    <header className="border-b border-border/70 bg-card/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Branding & Operational Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs select-none shadow-xs">
              S
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Service Status Dashboard
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-2.5 border-l border-border/70">
            <span className="relative flex h-2 w-2">
              {isOverallGood && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOverallGood ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {isOverallGood ? 'All systems operational' : !isHealthy ? 'Liveness failure' : 'Not ready'}
            </span>
          </div>
        </div>

        {/* Right: Controls & Badges */}
        <div className="flex items-center gap-2">
          {environment && (
            <Badge variant="outline" className="hidden md:inline-flex text-[11px] font-mono capitalize py-0.5">
              {environment}
            </Badge>
          )}

          {version && (
            <Badge variant="version" className="hidden sm:inline-flex py-0.5">
              v{version}
            </Badge>
          )}

          <div className="h-4 w-px bg-border/80 hidden sm:block mx-1" />

          {/* Polling Interval Selector */}
          <div className="flex items-center rounded-md border border-border/70 bg-muted/40 p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setAutoRefresh(true);
                setRefreshIntervalMs(2000);
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                autoRefresh && refreshIntervalMs === 2000
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Fast 2s updates"
            >
              2s
            </button>
            <button
              type="button"
              onClick={() => {
                setAutoRefresh(true);
                setRefreshIntervalMs(4000);
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                autoRefresh && refreshIntervalMs === 4000
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Normal 4s updates"
            >
              4s
            </button>
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                !autoRefresh
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={autoRefresh ? 'Pause polling' : 'Resume polling'}
            >
              {autoRefresh ? 'Live' : 'Paused'}
            </button>
          </div>

          {/* Manual Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 px-2.5 text-xs font-normal"
            title={lastUpdated ? `Last updated: ${lastUpdated}` : 'Refresh now'}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            <span className="ml-1.5 hidden sm:inline">Refresh</span>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
