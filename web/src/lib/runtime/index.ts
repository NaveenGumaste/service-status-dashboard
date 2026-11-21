import { RuntimeResponse } from '@/types';
import { getConfig } from '@/lib/config';

// Capture the application bootstrap time
const APP_STARTED_AT = new Date();

export function getRuntimeInfo(): RuntimeResponse {
  const config = getConfig();
  const uptimeSeconds = Math.max(0, Math.floor((Date.now() - APP_STARTED_AT.getTime()) / 1000));

  return {
    status: 'running',
    nodeVersion: process.version,
    uptimeSeconds,
    startedAt: APP_STARTED_AT.toISOString(),
    timestamp: new Date().toISOString(),
    instanceId: config.appInstanceId,
  };
}

export interface DetailedRuntimeInfo extends RuntimeResponse {
  platform: string;
  architecture: string;
  pid: number;
  memoryUsageMb: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
}

export function getDetailedRuntimeInfo(): DetailedRuntimeInfo {
  const base = getRuntimeInfo();
  const mem = process.memoryUsage();

  return {
    ...base,
    platform: process.platform,
    architecture: process.arch,
    pid: process.pid,
    memoryUsageMb: {
      heapUsed: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotal: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      rss: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
    },
  };
}
