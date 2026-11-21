'use client';

import * as React from 'react';
import { Check, Copy, GitBranch, Server, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VersionResponse } from '@/types';
import { formatDate } from '@/lib/utils';

interface VersionBannerProps {
  version: VersionResponse;
  instanceId: string;
}

export function VersionBanner({ version, instanceId }: VersionBannerProps) {
  const [copiedSha, setCopiedSha] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 1800);
  };

  return (
    <div className="rounded-lg border border-border/80 bg-card p-4 shadow-xs transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Release Coordinates */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/70 border border-border/60 text-foreground font-mono font-semibold text-xs tracking-tight">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <span>v{version.version}</span>
          </div>

          <Badge variant="outline" className="font-mono text-xs py-0.5 font-normal">
            {version.releaseId}
          </Badge>

          <Badge variant="secondary" className="uppercase font-mono text-[10px] tracking-wider py-0.5">
            {version.environment}
          </Badge>
        </div>

        {/* Right: Git SHA, Pod ID, and Build info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {/* Commit SHA */}
          <div className="flex items-center gap-1.5 font-mono">
            <GitBranch className="h-3.5 w-3.5 text-muted-foreground/80" />
            <span className="text-muted-foreground font-sans text-[11px]">Commit:</span>
            <span className="text-foreground font-medium">{version.commitSha}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(version.commitSha)}
              className="p-1 hover:text-foreground hover:bg-muted rounded transition-colors"
              title="Copy commit SHA"
              aria-label="Copy commit SHA"
            >
              {copiedSha ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>

          <span className="text-border hidden sm:inline">•</span>

          {/* Instance / Pod ID */}
          <div className="flex items-center gap-1.5 font-mono">
            <Server className="h-3.5 w-3.5 text-muted-foreground/80" />
            <span className="text-muted-foreground font-sans text-[11px]">Pod:</span>
            <span className="text-foreground font-medium truncate max-w-[160px] sm:max-w-none" title={instanceId}>
              {instanceId}
            </span>
          </div>

          {version.buildTime && (
            <>
              <span className="text-border hidden sm:inline">•</span>
              <span className="text-[11px]">
                Built {formatDate(version.buildTime)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
