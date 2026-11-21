import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET as getRuntime } from '@/app/api/runtime/route';
import { GET as getStatus } from '@/app/api/status/route';

describe('Runtime and Status Aggregation Endpoints', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SIMULATE_UNHEALTHY;
    delete process.env.SIMULATE_UNREADY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('GET /api/runtime', () => {
    it('returns valid runtime information shape', async () => {
      const response = await getRuntime();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('running');
      expect(data.nodeVersion).toBe(process.version);
      expect(typeof data.uptimeSeconds).toBe('number');
      expect(data.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(typeof data.startedAt).toBe('string');
      expect(new Date(data.startedAt).getTime()).not.toBeNaN();
      expect(typeof data.timestamp).toBe('string');
      expect(new Date(data.timestamp).getTime()).not.toBeNaN();
      expect(typeof data.instanceId).toBe('string');

      expect(response.headers.get('Cache-Control')).toContain('no-store');
    });
  });

  describe('GET /api/status', () => {
    it('returns aggregated status payload with all sub-modules', async () => {
      const response = await getStatus();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.service).toBe('service-status-dashboard');
      expect(data.health.status).toBe('healthy');
      expect(data.ready.status).toBe('ready');
      expect(data.version.version).toBeDefined();
      expect(data.runtime.nodeVersion).toBe(process.version);
      expect(data.timestamp).toBeDefined();
    });

    it('returns HTTP 500 status code when simulated unhealthy', async () => {
      process.env.SIMULATE_UNHEALTHY = 'true';

      const response = await getStatus();
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.health.status).toBe('unhealthy');
    });

    it('returns HTTP 503 status code when simulated unready', async () => {
      process.env.SIMULATE_UNREADY = 'true';

      const response = await getStatus();
      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.ready.status).toBe('unready');
    });
  });
});
