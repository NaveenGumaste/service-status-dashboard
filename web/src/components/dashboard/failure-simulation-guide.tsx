'use client';

import * as React from 'react';
import { Check, Copy, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function FailureSimulationGuide() {
  const [copiedUnready, setCopiedUnready] = React.useState(false);
  const [copiedUnhealthy, setCopiedUnhealthy] = React.useState(false);

  const copyCommand = (cmd: string, type: 'unready' | 'unhealthy') => {
    navigator.clipboard.writeText(cmd);
    if (type === 'unready') {
      setCopiedUnready(true);
      setTimeout(() => setCopiedUnready(false), 1800);
    } else {
      setCopiedUnhealthy(true);
      setTimeout(() => setCopiedUnhealthy(false), 1800);
    }
  };

  const unreadyCmd = 'docker run -d -p 3000:3000 -e SIMULATE_UNREADY=true service-status-dashboard:latest';
  const unhealthyCmd = 'docker run -d -p 3000:3000 -e SIMULATE_UNHEALTHY=true service-status-dashboard:latest';

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-foreground/80" />
              DevOps Chaos & Probe Failure Simulation Guide
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Testing parameters for Argo CD sync policies, automated rollback, and Kubernetes probe self-healing
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] py-0 font-mono">
            Env-Var Control
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Readiness Simulation */}
          <div className="p-3.5 rounded-lg border border-border/70 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs text-foreground">
                Readiness Failure Simulation
              </span>
              <Badge variant="warning" className="font-mono text-[10px] py-0">
                HTTP 503
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Simulates container warmup or dependency saturation where process is alive but not ready to serve user traffic.
            </p>
            <div className="bg-background rounded p-2.5 border border-border/60 text-xs font-mono flex items-center justify-between gap-2">
              <span className="truncate text-foreground text-[11px]">{unreadyCmd}</span>
              <button
                type="button"
                onClick={() => copyCommand(unreadyCmd, 'unready')}
                className="p-1 hover:text-foreground text-muted-foreground transition-colors shrink-0"
                title="Copy command"
                aria-label="Copy command"
              >
                {copiedUnready ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <div className="text-[11px] text-muted-foreground">
              <strong className="text-foreground">K8s Consequence:</strong> Endpoints controller detaches the Pod; active rolling update pauses safely.
            </div>
          </div>

          {/* Liveness Simulation */}
          <div className="p-3.5 rounded-lg border border-border/70 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs text-foreground">
                Liveness Failure Simulation
              </span>
              <Badge variant="destructive" className="font-mono text-[10px] py-0">
                HTTP 500
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Simulates unrecoverable internal deadlock where the application process must be terminated and restarted.
            </p>
            <div className="bg-background rounded p-2.5 border border-border/60 text-xs font-mono flex items-center justify-between gap-2">
              <span className="truncate text-foreground text-[11px]">{unhealthyCmd}</span>
              <button
                type="button"
                onClick={() => copyCommand(unhealthyCmd, 'unhealthy')}
                className="p-1 hover:text-foreground text-muted-foreground transition-colors shrink-0"
                title="Copy command"
                aria-label="Copy command"
              >
                {copiedUnhealthy ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <div className="text-[11px] text-muted-foreground">
              <strong className="text-foreground">K8s Consequence:</strong> Consecutive probe failures trigger container restart by kubelet daemon.
            </div>
          </div>
        </div>

        <div className="p-3 rounded-md bg-muted/30 border border-border/60 text-xs text-muted-foreground">
          <strong className="text-foreground">Production Safety:</strong> Chaos failure is triggered exclusively through container environment flags (<code className="font-mono text-foreground font-semibold">SIMULATE_UNREADY</code>, <code className="font-mono text-foreground font-semibold">SIMULATE_UNHEALTHY</code>) at process startup. There is deliberately no unauthenticated HTTP write endpoint that could be exploited in production.
        </div>
      </CardContent>
    </Card>
  );
}
