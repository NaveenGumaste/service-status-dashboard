import { HealthResponse, ReadyResponse, VersionResponse, StatusResponse } from '@/types';
import { getConfig, SERVICE_NAME } from '@/lib/config';
import { getRuntimeInfo } from '@/lib/runtime';

export function getHealthStatus(): { isHealthy: boolean; response: HealthResponse } {
  const config = getConfig();
  const isHealthy = !config.simulateUnhealthy;

  return {
    isHealthy,
    response: {
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: SERVICE_NAME,
    },
  };
}

export function getReadyStatus(): { isReady: boolean; response: ReadyResponse } {
  const config = getConfig();
  const isReady = !config.simulateUnready;

  return {
    isReady,
    response: {
      status: isReady ? 'ready' : 'unready',
      service: SERVICE_NAME,
    },
  };
}

export function getVersionInfo(): VersionResponse {
  const config = getConfig();

  return {
    name: SERVICE_NAME,
    version: config.appVersion,
    environment: config.appEnv,
    commitSha: config.appCommitSha,
    releaseId: config.appReleaseId,
    buildTime: config.appBuildTime,
  };
}

export function getAggregatedStatus(): {
  statusCode: number;
  response: StatusResponse;
} {
  const health = getHealthStatus();
  const ready = getReadyStatus();
  const version = getVersionInfo();
  const runtime = getRuntimeInfo();

  // If unhealthy, status code is 500; if unready, status code is 503; else 200
  let statusCode = 200;
  if (!health.isHealthy) {
    statusCode = 500;
  } else if (!ready.isReady) {
    statusCode = 503;
  }

  return {
    statusCode,
    response: {
      service: SERVICE_NAME,
      version,
      runtime,
      health: health.response,
      ready: ready.response,
      timestamp: new Date().toISOString(),
    },
  };
}
