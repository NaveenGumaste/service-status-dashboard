import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VersionBanner } from '@/components/dashboard/version-banner';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { HealthPanel } from '@/components/dashboard/health-panel';
import { DeploymentPanel } from '@/components/dashboard/deployment-panel';
import { RuntimePanel } from '@/components/dashboard/runtime-panel';
import { StatusResponse, VersionResponse, RuntimeResponse } from '@/types';

const mockVersion: VersionResponse = {
  name: 'service-status-dashboard',
  version: '1.0.0',
  environment: 'production',
  commitSha: 'abc1234',
  releaseId: 'rel-prod-01',
  buildTime: '2026-11-20T10:00:00Z',
};

const mockRuntime: RuntimeResponse = {
  status: 'running',
  nodeVersion: 'v22.0.0',
  uptimeSeconds: 3600,
  startedAt: '2026-11-20T09:00:00Z',
  timestamp: '2026-11-20T10:00:00Z',
  instanceId: 'k8s-pod-status-1234',
};

const mockStatus: StatusResponse = {
  service: 'service-status-dashboard',
  version: mockVersion,
  runtime: mockRuntime,
  health: { status: 'healthy', service: 'service-status-dashboard' },
  ready: { status: 'ready', service: 'service-status-dashboard' },
  timestamp: '2026-11-20T10:00:00Z',
};

describe('Dashboard Component Rendering', () => {
  it('renders VersionBanner with version, release ID, and commit', () => {
    render(<VersionBanner version={mockVersion} instanceId="k8s-pod-status-1234" />);

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('rel-prod-01')).toBeInTheDocument();
    expect(screen.getByText('abc1234')).toBeInTheDocument();
    expect(screen.getByText('k8s-pod-status-1234')).toBeInTheDocument();
  });

  it('renders OverviewCards with health and readiness indicators', () => {
    render(<OverviewCards status={mockStatus} healthCode={200} readyCode={200} />);

    expect(screen.getByText('Liveness Probe')).toBeInTheDocument();
    expect(screen.getByText('Readiness Probe')).toBeInTheDocument();
    expect(screen.getByText('Service Uptime')).toBeInTheDocument();
    expect(screen.getByText('Node.js Runtime')).toBeInTheDocument();
  });

  it('renders HealthPanel with probe targets and latency info', () => {
    render(
      <HealthPanel
        liveness={{
          endpoint: '/api/health',
          type: 'liveness',
          status: 'healthy',
          statusCode: 200,
          latencyMs: 12,
          payload: { status: 'healthy', service: 'service-status-dashboard' },
        }}
        readiness={{
          endpoint: '/api/ready',
          type: 'readiness',
          status: 'ready',
          statusCode: 200,
          latencyMs: 15,
          payload: { status: 'ready', service: 'service-status-dashboard' },
        }}
        lastSuccess="2026-11-20T10:00:00Z"
        lastFailure={null}
        onProbeNow={vi.fn()}
        isProbing={false}
      />
    );

    expect(screen.getByText(/Kubernetes Probes & Health Evaluation/i)).toBeInTheDocument();
    expect(screen.getByText(/Liveness Probe \(Pod Restart Trigger\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Readiness Probe \(Traffic Routing Gate\)/i)).toBeInTheDocument();
  });

  it('renders DeploymentPanel with environment and deployment metadata', () => {
    render(
      <DeploymentPanel
        version={mockVersion}
        instanceId="k8s-pod-status-1234"
        isHealthy={true}
        isReady={true}
      />
    );

    expect(screen.getByText(/Deployment Metadata & GitOps Artifact Identity/i)).toBeInTheDocument();
    expect(screen.getByText('production')).toBeInTheDocument();
  });

  it('renders RuntimePanel with actual Node.js information', () => {
    render(<RuntimePanel runtime={mockRuntime} />);

    expect(screen.getByText(/Server & Runtime Telemetry/i)).toBeInTheDocument();
    expect(screen.getByText('v22.0.0')).toBeInTheDocument();
    expect(screen.getByText(/3,600 total seconds/i)).toBeInTheDocument();
  });
});
