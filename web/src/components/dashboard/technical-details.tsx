'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SafeDetails {
  platform: string;
  architecture: string;
  pid: number;
  memoryUsageMb: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  nodeEnv: string;
  port: number;
  hostname: string;
}

interface TechnicalDetailsProps {
  details: SafeDetails | null;
}

export function TechnicalDetails({ details }: TechnicalDetailsProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card className="border-border/60">
      <CardHeader
        className="py-3 px-5 cursor-pointer select-none hover:bg-muted/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-xs font-medium text-foreground">
              Low-Level Process Diagnostics (Safe Metadata)
            </CardTitle>
            <CardDescription className="text-[11px] hidden sm:inline">
              Safe runtime parameters; strictly excludes secrets and credentials
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" aria-label="Toggle diagnostics">
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-3 px-5 pb-4 border-t border-border/50 bg-muted/10">
          {details ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded border border-border/60 bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-sans">PID</div>
                <div className="font-semibold text-foreground mt-0.5">{details.pid}</div>
              </div>

              <div className="p-2.5 rounded border border-border/60 bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-sans">Platform</div>
                <div className="font-semibold text-foreground mt-0.5">{details.platform}</div>
              </div>

              <div className="p-2.5 rounded border border-border/60 bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-sans">Architecture</div>
                <div className="font-semibold text-foreground mt-0.5">{details.architecture}</div>
              </div>

              <div className="p-2.5 rounded border border-border/60 bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-sans">Binding</div>
                <div className="font-semibold text-foreground mt-0.5">{details.hostname}:{details.port}</div>
              </div>

              <div className="p-2.5 rounded border border-border/60 bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-sans">Heap Used</div>
                <div className="font-semibold text-foreground mt-0.5">{details.memoryUsageMb.heapUsed} MB</div>
              </div>

              <div className="p-2.5 rounded border border-border/60 bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-sans">Resident (RSS)</div>
                <div className="font-semibold text-foreground mt-0.5">{details.memoryUsageMb.rss} MB</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground py-2 font-mono">
              Collecting process metrics...
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
