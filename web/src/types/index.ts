export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
}

export interface ReadyResponse {
  status: 'ready' | 'unready';
  service: string;
}

export interface VersionResponse {
  name: string;
  version: string;
  environment: string;
  commitSha: string;
  releaseId: string;
  buildTime: string | null;
}

export interface RuntimeResponse {
  status: 'running';
  nodeVersion: string;
  uptimeSeconds: number;
  startedAt: string;
  timestamp: string;
  instanceId: string;
}

export interface StatusResponse {
  service: string;
  version: VersionResponse;
  runtime: RuntimeResponse;
  health: HealthResponse;
  ready: ReadyResponse;
  timestamp: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  hostname: string;
  appVersion: string;
  appEnv: string;
  appReleaseId: string;
  appCommitSha: string;
  appBuildTime: string | null;
  appInstanceId: string;
  simulateUnready: boolean;
  simulateUnhealthy: boolean;
}
