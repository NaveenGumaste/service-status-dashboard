'use client';

import * as React from 'react';
import { StatusResponse } from '@/types';
import { Header } from '@/components/dashboard/header';
import { VersionBanner } from '@/components/dashboard/version-banner';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { HealthPanel, HealthCheckDetail } from '@/components/dashboard/health-panel';
import { DeploymentPanel } from '@/components/dashboard/deployment-panel';
import { RuntimePanel } from '@/components/dashboard/runtime-panel';
import { TechnicalDetails } from '@/components/dashboard/technical-details';
import { FailureSimulationGuide } from '@/components/dashboard/failure-simulation-guide';
import { LatencyChart, LatencyDataPoint } from '@/components/dashboard/latency-chart';
import { MemoryChart, MemoryDataPoint } from '@/components/dashboard/memory-chart';
import { HeartbeatBar, HeartbeatItem } from '@/components/dashboard/heartbeat-bar';
import { LiveEventStream, StreamEvent } from '@/components/dashboard/live-event-stream';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, AlertCircle, ChevronDown, ChevronUp, Radio, ShieldAlert, Sparkles, Terminal, Zap, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

export function DashboardView() {
  const [status, setStatus] = React.useState<StatusResponse | null>(null);
  const [details, setDetails] = React.useState<SafeDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [refreshIntervalMs, setRefreshIntervalMs] = React.useState<number>(2000);
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = React.useState<string | null>(null);
  const [lastFailure, setLastFailure] = React.useState<{ time: string; reason: string } | null>(null);

  // Chaos & Unpredictable Jitter controls
  const [chaosMode, setChaosMode] = React.useState<boolean>(false);
  const [nextExpectedDelay, setNextExpectedDelay] = React.useState<number>(2000);

  // Bottom drawer toggles
  const [showEventStream, setShowEventStream] = React.useState(false);
  const [showChaosGuide, setShowChaosGuide] = React.useState(false);

  // Real-time telemetry histories
  const [latencyHistory, setLatencyHistory] = React.useState<LatencyDataPoint[]>([]);
  const [memoryHistory, setMemoryHistory] = React.useState<MemoryDataPoint[]>([]);
  const [heartbeatHistory, setHeartbeatHistory] = React.useState<HeartbeatItem[]>([]);
  const [eventStream, setEventStream] = React.useState<StreamEvent[]>([]);
  const [totalProbesCount, setTotalProbesCount] = React.useState(0);

  const [liveness, setLiveness] = React.useState<HealthCheckDetail>({
    endpoint: '/api/health',
    type: 'liveness',
    status: 'checking',
    statusCode: 200,
    latencyMs: 0,
    payload: null,
  });

  const [readiness, setReadiness] = React.useState<HealthCheckDetail>({
    endpoint: '/api/ready',
    type: 'readiness',
    status: 'checking',
    statusCode: 200,
    latencyMs: 0,
    payload: null,
  });

  // Master fetch function supporting unpredictable chaos & latency spikes
  const fetchStatus = React.useCallback(
    async (forceErrorType?: 'unhealthy' | 'unready' | 'spike') => {
      setIsLoading(true);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Determine if a random chaos event triggers on this ping
      let simulateLivenessError = forceErrorType === 'unhealthy';
      let simulateReadinessError = forceErrorType === 'unready';
      let injectLatencySpike = forceErrorType === 'spike';

      if (chaosMode && !forceErrorType) {
        const rand = Math.random();
        if (rand < 0.12) {
          simulateLivenessError = true;
        } else if (rand < 0.24) {
          simulateReadinessError = true;
        } else if (rand < 0.36) {
          injectLatencySpike = true;
        }
      }

      // 1. Fetch /api/health
      const healthStart = performance.now();
      let healthData: Record<string, unknown> | null = null;
      let healthStatus = 200;

      if (simulateLivenessError) {
        healthStatus = 500;
        healthData = { error: 'Simulated internal deadlock error', status: 'unhealthy', chaosInjected: true };
      } else {
        try {
          const res = await fetch('/api/health', { cache: 'no-store' });
          healthStatus = res.status;
          healthData = await res.json();
        } catch (err: unknown) {
          healthStatus = 0;
          healthData = { error: err instanceof Error ? err.message : 'Network error' };
        }
      }

      let healthLatency = Math.max(1, Math.round(performance.now() - healthStart));
      if (injectLatencySpike || simulateLivenessError) {
        // Add random erratic latency spike (150ms - 650ms)
        healthLatency += Math.floor(150 + Math.random() * 500);
      }

      // 2. Fetch /api/ready
      const readyStart = performance.now();
      let readyData: Record<string, unknown> | null = null;
      let readyStatus = 200;

      if (simulateReadinessError) {
        readyStatus = 503;
        readyData = { error: 'Simulated connection saturation', status: 'unready', chaosInjected: true };
      } else {
        try {
          const res = await fetch('/api/ready', { cache: 'no-store' });
          readyStatus = res.status;
          readyData = await res.json();
        } catch (err: unknown) {
          readyStatus = 0;
          readyData = { error: err instanceof Error ? err.message : 'Network error' };
        }
      }

      let readyLatency = Math.max(1, Math.round(performance.now() - readyStart));
      if (injectLatencySpike || simulateReadinessError) {
        readyLatency += Math.floor(120 + Math.random() * 450);
      }

      // 3. Fetch /api/status
      try {
        const res = await fetch('/api/status', { cache: 'no-store' });
        const statusData: StatusResponse = await res.json();
        setStatus(statusData);

        if (healthStatus === 200 && readyStatus === 200) {
          setLastSuccess(now.toISOString());
        } else {
          const failedReason =
            healthStatus !== 200
              ? `Health HTTP ${healthStatus} (Simulated)`
              : `Ready HTTP ${readyStatus} (Simulated)`;
          setLastFailure({ time: now.toISOString(), reason: failedReason });
        }
      } catch (err) {
        console.error('Failed to fetch status:', err);
        setLastFailure({
          time: now.toISOString(),
          reason: err instanceof Error ? err.message : 'Status fetch error',
        });
      }

      // 4. Fetch /api/details
      let memSample = { heapUsed: 35, heapTotal: 50, rss: 100 };
      try {
        const res = await fetch('/api/details', { cache: 'no-store' });
        if (res.ok) {
          const detailsData = await res.json();
          setDetails(detailsData);
          if (detailsData.memoryUsageMb) {
            memSample = detailsData.memoryUsageMb;
          }
        }
      } catch (err) {
        console.error('Failed to fetch details:', err);
      }

      // If chaos spike, slightly perturb memory to reflect active work
      if (injectLatencySpike || simulateLivenessError) {
        memSample.heapUsed = Math.round((memSample.heapUsed + (Math.random() * 4 - 2)) * 10) / 10;
      }

      // Update Probes state
      setLiveness({
        endpoint: '/api/health',
        type: 'liveness',
        status: healthStatus === 200 ? 'healthy' : 'unhealthy',
        statusCode: healthStatus,
        latencyMs: healthLatency,
        payload: healthData,
      });

      setReadiness({
        endpoint: '/api/ready',
        type: 'readiness',
        status: readyStatus === 200 ? 'ready' : 'unready',
        statusCode: readyStatus,
        latencyMs: readyLatency,
        payload: readyData,
      });

      // Append to live charts history (last 25 points)
      setLatencyHistory((prev) => {
        const updated = [
          ...prev,
          {
            timestamp: Date.now(),
            timeStr,
            healthLatency,
            readyLatency,
          },
        ];
        return updated.slice(-25);
      });

      setMemoryHistory((prev) => {
        const updated = [
          ...prev,
          {
            timestamp: Date.now(),
            timeStr,
            heapUsed: memSample.heapUsed,
            heapTotal: memSample.heapTotal,
            rss: memSample.rss,
          },
        ];
        return updated.slice(-25);
      });

      // Append to heartbeat availability (last 36 slots)
      setHeartbeatHistory((prev) => {
        const isHealthy = healthStatus === 200;
        const isUnready = readyStatus === 503;
        const updated = [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            time: timeStr,
            statusCode: healthStatus !== 200 ? healthStatus : readyStatus,
            status: (isHealthy ? 'healthy' : isUnready ? 'unready' : 'unhealthy') as 'healthy' | 'unready' | 'unhealthy',
            latencyMs: healthLatency,
          },
        ];
        return updated.slice(-36);
      });

      // Append to event log stream
      setEventStream((prev) => {
        const newEvents: StreamEvent[] = [
          {
            id: `${Date.now()}-h`,
            timestamp: timeStr,
            endpoint: 'GET /api/health',
            status: healthStatus === 200 ? 'healthy' : 'unhealthy',
            statusCode: healthStatus,
            latencyMs: healthLatency,
          },
          {
            id: `${Date.now()}-r`,
            timestamp: timeStr,
            endpoint: 'GET /api/ready',
            status: readyStatus === 200 ? 'ready' : 'unready',
            statusCode: readyStatus,
            latencyMs: readyLatency,
          },
        ];
        return [...newEvents, ...prev].slice(0, 30);
      });

      setTotalProbesCount((prev) => prev + 2);
      setLastUpdated(timeStr);
      setIsLoading(false);
    },
    [chaosMode]
  );

  // Initial fetch
  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Unpredictable dynamic ping loop with randomized jitter & chaos timing
  React.useEffect(() => {
    if (!autoRefresh) return;

    let timerId: NodeJS.Timeout;

    const scheduleNext = () => {
      let delay = refreshIntervalMs;
      if (chaosMode) {
        // Random jitter multiplier between 0.35x and 2.1x
        const jitter = 0.35 + Math.random() * 1.75;
        delay = Math.max(120, Math.round(refreshIntervalMs * jitter));
      }
      setNextExpectedDelay(delay);

      timerId = setTimeout(async () => {
        await fetchStatus();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => clearTimeout(timerId);
  }, [autoRefresh, refreshIntervalMs, chaosMode, fetchStatus]);

  const isHealthy = liveness.statusCode === 200;
  const isReady = readiness.statusCode === 200;
  const isOverallGood = isHealthy && isReady;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header
        onRefresh={() => fetchStatus()}
        isLoading={isLoading}
        isHealthy={isHealthy}
        isReady={isReady}
        lastUpdated={lastUpdated}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        refreshIntervalMs={refreshIntervalMs}
        setRefreshIntervalMs={setRefreshIntervalMs}
        version={status?.version.version}
        environment={status?.version.environment}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {status ? (
          <>
            {/* 1. Header Headline & Status Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isOverallGood ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'
                    }`}
                  />
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {isOverallGood ? 'All Systems Operational' : 'Service Incident Detected'}
                  </h2>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground ml-1">
                    <Radio className="h-3 w-3 text-emerald-500" />
                    LIVE
                  </span>
                  {chaosMode && (
                    <Badge variant="warning" className="text-[10px] uppercase font-mono py-0 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Chaos Jitter Active ({nextExpectedDelay}ms)
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Kubernetes GitOps test workload synchronized via Argo CD and Helm
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEventStream(!showEventStream)}
                  className="h-8 text-xs font-normal"
                >
                  <Terminal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  Live Log ({eventStream.length})
                  {showEventStream ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChaosGuide(!showChaosGuide)}
                  className="h-8 text-xs font-normal"
                >
                  <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                  Chaos Testing
                  {showChaosGuide ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                </Button>
              </div>
            </div>

            {/* 2. DYNAMIC PING VELOCITY & CHAOS CONTROL PANEL */}
            <Card className="border-border/70 p-3.5 bg-muted/20">
              <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Ping Velocity Slider */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium text-foreground">Ping Velocity:</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="200"
                      max="4000"
                      step="100"
                      value={refreshIntervalMs}
                      onChange={(e) => setRefreshIntervalMs(Number(e.target.value))}
                      className="h-1.5 w-28 sm:w-36 accent-foreground bg-muted-foreground/30 rounded-lg cursor-pointer"
                      title={`Adjust ping cadence: ${refreshIntervalMs}ms`}
                      aria-label="Ping interval slider"
                    />
                    <span className="font-mono text-xs font-bold text-foreground min-w-[55px]">
                      {refreshIntervalMs} ms
                    </span>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setRefreshIntervalMs(300)}
                      className={`px-1.5 py-0.5 rounded border ${
                        refreshIntervalMs === 300
                          ? 'bg-foreground text-background font-semibold'
                          : 'text-muted-foreground border-border/60 hover:text-foreground'
                      }`}
                    >
                      300ms Turbo
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefreshIntervalMs(1000)}
                      className={`px-1.5 py-0.5 rounded border ${
                        refreshIntervalMs === 1000
                          ? 'bg-foreground text-background font-semibold'
                          : 'text-muted-foreground border-border/60 hover:text-foreground'
                      }`}
                    >
                      1s
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefreshIntervalMs(3000)}
                      className={`px-1.5 py-0.5 rounded border ${
                        refreshIntervalMs === 3000
                          ? 'bg-foreground text-background font-semibold'
                          : 'text-muted-foreground border-border/60 hover:text-foreground'
                      }`}
                    >
                      3s
                    </button>
                  </div>
                </div>

                {/* Chaos Injection Toggle & Manual Spike Triggers */}
                <div className="flex items-center flex-wrap gap-2">
                  <Button
                    variant={chaosMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChaosMode(!chaosMode)}
                    className={`h-7 px-2.5 text-xs font-mono transition-all ${
                      chaosMode
                        ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                        : 'border-amber-500/40 text-amber-500 hover:bg-amber-500/10'
                    }`}
                  >
                    <Zap className={`h-3.5 w-3.5 mr-1.5 ${chaosMode ? 'animate-bounce' : ''}`} />
                    {chaosMode ? 'Chaos Injection: ACTIVE' : 'Enable Random Chaos'}
                  </Button>

                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => fetchStatus('spike')}
                      className="h-7 px-2 rounded border border-border/70 hover:bg-muted font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      title="Inject an immediate latency spike"
                    >
                      Spike Latency
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchStatus('unhealthy')}
                      className="h-7 px-2 rounded border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 font-mono text-[11px] transition-colors"
                      title="Inject simulated 500 error"
                    >
                      Fail Health (500)
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchStatus('unready')}
                      className="h-7 px-2 rounded border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-mono text-[11px] transition-colors"
                      title="Inject simulated 503 error"
                    >
                      Unready (503)
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Version & Release Coordinates Banner */}
            <VersionBanner version={status.version} instanceId={status.runtime.instanceId} />

            {/* 4. Primary KPI Metric Tiles */}
            <OverviewCards
              status={status}
              healthCode={liveness.statusCode}
              readyCode={readiness.statusCode}
            />

            {/* 5. Live Availability SLO Timeline Bar (Flex auto-fit, no line-wrapping) */}
            <HeartbeatBar history={heartbeatHistory} totalChecks={totalProbesCount} />

            {/* 6. Live Grafana Telemetry Suite (Dual Active Real-Time Area Charts) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left Chart: Real-time Response Velocity */}
              <LatencyChart
                data={latencyHistory}
                currentHealthLatency={liveness.latencyMs}
                currentReadyLatency={readiness.latencyMs}
              />

              {/* Right Chart: Real-time Node.js Memory Utilization & RSS */}
              <MemoryChart
                data={memoryHistory}
                currentHeapUsed={details?.memoryUsageMb.heapUsed ?? 35}
                currentHeapTotal={details?.memoryUsageMb.heapTotal ?? 50}
                currentRss={details?.memoryUsageMb.rss ?? 100}
              />
            </div>

            {/* 7. Kubernetes Probes & Lifecycle Evaluation */}
            <HealthPanel
              liveness={liveness}
              readiness={readiness}
              lastSuccess={lastSuccess}
              lastFailure={lastFailure}
              onProbeNow={() => fetchStatus()}
              isProbing={isLoading}
            />

            {/* 8. Deployment Metadata & Server Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <DeploymentPanel
                version={status.version}
                instanceId={status.runtime.instanceId}
                isHealthy={isHealthy}
                isReady={isReady}
              />
              <RuntimePanel runtime={status.runtime} />
            </div>

            {/* 9. On-Demand Expandable Live Event Stream */}
            {showEventStream && (
              <div className="animate-in fade-in-50 duration-200">
                <LiveEventStream
                  events={eventStream}
                  onClear={() => setEventStream([])}
                />
              </div>
            )}

            {/* 10. On-Demand Expandable Chaos Testing Guide */}
            {showChaosGuide && (
              <div className="animate-in fade-in-50 duration-200">
                <FailureSimulationGuide />
              </div>
            )}

            {/* 11. Low-Level Process Diagnostics Accordion */}
            <TechnicalDetails details={details} />
          </>
        ) : (
          <div className="space-y-6 py-4">
            <Skeleton className="h-14 w-full rounded-lg" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
            <Skeleton className="h-56 w-full rounded-lg" />
            {isLoading && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <div className="h-5 w-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  <p className="text-xs font-medium">Connecting to application endpoints...</p>
                </CardContent>
              </Card>
            )}
            {!isLoading && (
              <Card className="border-rose-500/30 bg-rose-500/5">
                <CardContent className="p-8 text-center text-rose-500 flex flex-col items-center justify-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  <p className="font-semibold text-sm">Failed to connect to application endpoints.</p>
                  <p className="text-xs text-muted-foreground">Check server logs or verify that the container is running.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border/60 py-4 bg-card/40 mt-auto text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="text-[11px]">
            <strong className="text-foreground font-medium">Service Status Dashboard</strong> • Elevate Labs GitOps Workload
          </div>
          <div className="font-mono text-[10px] text-muted-foreground/80">
            Kubernetes • Argo CD • Helm
          </div>
        </div>
      </footer>
    </div>
  );
}
