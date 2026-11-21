import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET as getVersion } from '@/app/api/version/route';

describe('Version Endpoint (/api/version)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns default release and version metadata', async () => {
    delete process.env.APP_VERSION;
    delete process.env.APP_ENV;
    delete process.env.APP_RELEASE_ID;
    delete process.env.APP_COMMIT_SHA;
    delete process.env.APP_BUILD_TIME;

    const response = await getVersion();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      name: 'service-status-dashboard',
      version: '1.0.0',
      environment: 'development',
      commitSha: 'local',
      releaseId: 'local-dev',
      buildTime: null,
    });

    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });

  it('dynamically reflects updated version and commit configuration', async () => {
    process.env.APP_VERSION = '1.1.0';
    process.env.APP_ENV = 'staging';
    process.env.APP_RELEASE_ID = 'rel-stage-202611';
    process.env.APP_COMMIT_SHA = '89abcde';
    process.env.APP_BUILD_TIME = '2026-11-20T15:30:00Z';

    const response = await getVersion();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      name: 'service-status-dashboard',
      version: '1.1.0',
      environment: 'staging',
      commitSha: '89abcde',
      releaseId: 'rel-stage-202611',
      buildTime: '2026-11-20T15:30:00Z',
    });
  });
});
