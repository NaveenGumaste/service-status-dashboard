'use client';

import * as React from 'react';
import { Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VersionResponse } from '@/types';
import { formatDate } from '@/lib/utils';

interface DeploymentPanelProps {
  version: VersionResponse;
  instanceId: string;
  isHealthy: boolean;
  isReady: boolean;
}

export function DeploymentPanel({
  version,
  instanceId,
  isHealthy,
  isReady,
}: DeploymentPanelProps) {
  const isHealthyAndReady = isHealthy && isReady;

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-foreground/80" />
              Deployment Metadata & GitOps Artifact Identity
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Workload coordinates synchronized from Git repository
            </CardDescription>
          </div>
          <Badge variant={isHealthyAndReady ? 'success' : 'destructive'} className="text-[10px] py-0">
            {isHealthyAndReady ? 'In Sync' : 'Degraded'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="divide-y divide-border/50 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Application Version</span>
            <span className="font-mono font-medium text-foreground">v{version.version}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Release Identifier</span>
            <span className="font-mono font-medium text-foreground">{version.releaseId}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Target Environment</span>
            <span className="font-medium text-foreground capitalize">{version.environment}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Git Commit SHA</span>
            <span className="font-mono text-foreground font-medium">{version.commitSha}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Build Timestamp</span>
            <span className="font-mono text-foreground text-[11px]">
              {version.buildTime ? formatDate(version.buildTime) : 'Local dev build (null)'}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">Pod / Instance ID</span>
            <span className="font-mono text-foreground font-medium truncate max-w-[200px]" title={instanceId}>
              {instanceId}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
