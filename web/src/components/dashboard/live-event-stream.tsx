'use client';

import * as React from 'react';
import { Terminal, Activity, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface StreamEvent {
  id: string;
  timestamp: string;
  endpoint: string;
  status: string;
  statusCode: number;
  latencyMs: number;
}

interface LiveEventStreamProps {
  events: StreamEvent[];
  onClear: () => void;
}

export function LiveEventStream({ events, onClear }: LiveEventStreamProps) {
  return (
    <Card className="border-border/70 overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Live Ingress Probe Event Stream
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Continuous live stream of HTTP probe evaluation receipts
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
          >
            Clear Log
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-48 overflow-y-auto divide-y divide-border/40 font-mono text-xs">
          {events.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-xs">
              Waiting for incoming probe events...
            </div>
          ) : (
            events.slice(0, 15).map((ev) => {
              const isOk = ev.statusCode === 200;
              return (
                <div
                  key={ev.id}
                  className="px-4 py-2 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isOk ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-muted-foreground text-[11px]">{ev.timestamp}</span>
                    <span className="text-foreground font-medium">{ev.endpoint}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-[11px]">{ev.latencyMs} ms</span>
                    <Badge
                      variant={isOk ? 'success' : 'destructive'}
                      className="font-mono text-[10px] py-0"
                    >
                      HTTP {ev.statusCode}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
