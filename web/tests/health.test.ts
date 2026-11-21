import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET as getHealth } from '@/app/api/health/route';
import { GET as getReady } from '@/app/api/ready/route';

describe('Health and Readiness Endpoints', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SIMULATE_UNHEALTHY;
    delete process.env.SIMULATE_UNREADY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('GET /api/health (Liveness Probe)', () => {
    it('returns HTTP 200 with healthy status by default', async () => {
      const response = await getHealth();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        status: 'healthy',
        service: 'service-status-dashboard',
      });

      expect(response.headers.get('Cache-Control')).toContain('no-store');
    });

    it('returns HTTP 500 when SIMULATE_UNHEALTHY=true', async () => {
      process.env.SIMULATE_UNHEALTHY = 'true';

      const response = await getHealth();
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toEqual({
        status: 'unhealthy',
        service: 'service-status-dashboard',
      });
    });
  });

  describe('GET /api/ready (Readiness Probe)', () => {
    it('returns HTTP 200 with ready status by default', async () => {
      const response = await getReady();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        status: 'ready',
        service: 'service-status-dashboard',
      });

      expect(response.headers.get('Cache-Control')).toContain('no-store');
    });

    it('returns HTTP 503 when SIMULATE_UNREADY=true', async () => {
      process.env.SIMULATE_UNREADY = 'true';

      const response = await getReady();
      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data).toEqual({
        status: 'unready',
        service: 'service-status-dashboard',
      });
    });
  });
});
