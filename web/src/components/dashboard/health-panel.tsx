'use client';

import * as React from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export interface HealthCheckDetail {
  endpoint: string;
  type: 'liveness' | 'readiness';
  status: string;
  statusCode: number;
  latencyMs: number;
  payload: Record<string, unknown> | null;
  error?: string;
}

interface HealthPanelProps {
  liveness: HealthCheckDetail;
  readiness: HealthCheckDetail;
  lastSuccess: string | null;
  lastFailure: { time: string; reason: string } | null;
  onProbeNow: () => void;
  isProbing: boolean;
}

export function HealthPanel({
  liveness,
  readiness,
  lastSuccess,
  lastFailure,
  onProbeNow,
  isProbing,
}: HealthPanelProps) {
  const [showPayloads, setShowPayloads] = React.useState(false);
  const isLivenessHealthy = liveness.statusCode === 200;
  const isReadinessReady = readiness.statusCode === 200;

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-foreground/80" />
              Kubernetes Probes & Health Evaluation
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Live HTTP probe verification for container lifecycle and traffic routing
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPayloads(!showPayloads)}
              className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              {showPayloads ? 'Hide Raw Payloads' : 'View Payloads'}
              {showPayloads ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onProbeNow}
              disabled={isProbing}
              className="h-7 text-xs px-2.5"
            >
              <RefreshCw className={`h-3 w-3 mr-1.5 ${isProbing ? 'animate-spin' : ''}`} />
              Probe Now
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Liveness Probe Box */}
          <div className="p-3.5 rounded-lg border border-border/70 bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isLivenessHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span className="font-medium text-xs text-foreground">
                  Liveness Probe (Pod Restart Trigger)
                </span>
              </div>
              <Badge variant={isLivenessHealthy ? 'success' : 'destructive'} className="font-mono text-[11px] py-0">
                {isLivenessHealthy ? '200 OK' : `${liveness.statusCode || 'ERR'} FAIL`}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-border/50 text-muted-foreground">
              <div>
                <span className="text-[10px] uppercase tracking-wider block">Endpoint</span>
                <span className="font-mono text-foreground font-medium text-[11px]">GET /api/health</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider block">Latency</span>
                <span className="font-mono text-foreground font-medium text-[11px]">{liveness.latencyMs} ms</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider block">K8s Action</span>
                <span className="text-foreground text-[11px] truncate block" title="Kubelet restarts container on failure">
                  Pod Restart
                </span>
              </div>
            </div>

            {showPayloads && (
              <div className="bg-muted/60 rounded p-2.5 border border-border/60 text-xs font-mono mt-2">
                <div className="text-muted-foreground text-[10px] mb-1">Payload:</div>
                <pre className="text-foreground overflow-x-auto text-[11px]">
                  {JSON.stringify(liveness.payload ?? { error: liveness.error }, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Readiness Probe Box */}
          <div className="p-3.5 rounded-lg border border-border/70 bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isReadinessReady ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="font-medium text-xs text-foreground">
                  Readiness Probe (Traffic Routing Gate)
                </span>
              </div>
              <Badge variant={isReadinessReady ? 'success' : 'warning'} className="font-mono text-[11px] py-0">
                {isReadinessReady ? '200 OK' : `${readiness.statusCode || 'ERR'} UNREADY`}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-border/50 text-muted-foreground">
              <div>
                <span className="text-[10px] uppercase tracking-wider block">Endpoint</span>
                <span className="font-mono text-foreground font-medium text-[11px]">GET /api/ready</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider block">Latency</span>
                <span className="font-mono text-foreground font-medium text-[11px]">{readiness.latencyMs} ms</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider block">K8s Action</span>
                <span className="text-foreground text-[11px] truncate block" title="Endpoints controller isolates unready pods">
                  Route Isolation
                </span>
              </div>
            </div>

            {showPayloads && (
              <div className="bg-muted/60 rounded p-2.5 border border-border/60 text-xs font-mono mt-2">
                <div className="text-muted-foreground text-[10px] mb-1">Payload:</div>
                <pre className="text-foreground overflow-x-auto text-[11px]">
                  {JSON.stringify(readiness.payload ?? { error: readiness.error }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log / History Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50 gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Last successful check:</span>
            <span className="font-medium text-foreground">{formatDate(lastSuccess)}</span>
          </div>

          {lastFailure ? (
            <div className="flex items-center gap-1.5 text-rose-500">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Last failure:</span>
              <span className="font-medium">{formatDate(lastFailure.time)}</span>
              <span className="font-mono text-[11px]">({lastFailure.reason})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>No failure events recorded</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
