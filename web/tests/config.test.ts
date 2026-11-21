import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getConfig, SERVICE_NAME } from '@/lib/config';

describe('Configuration & Environment Parsing', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('provides safe default values when environment variables are omitted', () => {
    delete process.env.APP_VERSION;
    delete process.env.APP_ENV;
    delete process.env.APP_RELEASE_ID;
    delete process.env.APP_COMMIT_SHA;
    delete process.env.APP_BUILD_TIME;
    delete process.env.APP_INSTANCE_ID;
    delete process.env.SIMULATE_UNREADY;
    delete process.env.SIMULATE_UNHEALTHY;

    const config = getConfig();

    expect(config.appVersion).toBe('1.0.0');
    expect(config.appEnv).toBe('development');
    expect(config.appReleaseId).toBe('local-dev');
    expect(config.appCommitSha).toBe('local');
    expect(config.appBuildTime).toBeNull();
    expect(config.appInstanceId).toBe('local');
    expect(config.simulateUnready).toBe(false);
    expect(config.simulateUnhealthy).toBe(false);
    expect(config.port).toBe(3000);
    expect(config.hostname).toBe('0.0.0.0');
  });

  it('correctly parses custom environment variables', () => {
    process.env.APP_VERSION = '2.1.0';
    process.env.APP_ENV = 'production';
    process.env.APP_RELEASE_ID = 'rel-prod-2026';
    process.env.APP_COMMIT_SHA = 'abcdef123456';
    process.env.APP_BUILD_TIME = '2026-11-20T12:00:00Z';
    process.env.APP_INSTANCE_ID = 'pod-status-xyz-123';
    process.env.SIMULATE_UNREADY = 'true';
    process.env.SIMULATE_UNHEALTHY = 'true';
    process.env.PORT = '8080';

    const config = getConfig();

    expect(config.appVersion).toBe('2.1.0');
    expect(config.appEnv).toBe('production');
    expect(config.appReleaseId).toBe('rel-prod-2026');
    expect(config.appCommitSha).toBe('abcdef123456');
    expect(config.appBuildTime).toBe('2026-11-20T12:00:00Z');
    expect(config.appInstanceId).toBe('pod-status-xyz-123');
    expect(config.simulateUnready).toBe(true);
    expect(config.simulateUnhealthy).toBe(true);
    expect(config.port).toBe(8080);
  });

  it('parses boolean simulation strings correctly (1, yes, true, false, 0)', () => {
    process.env.SIMULATE_UNREADY = '1';
    expect(getConfig().simulateUnready).toBe(true);

    process.env.SIMULATE_UNREADY = 'yes';
    expect(getConfig().simulateUnready).toBe(true);

    process.env.SIMULATE_UNREADY = 'false';
    expect(getConfig().simulateUnready).toBe(false);

    process.env.SIMULATE_UNREADY = '0';
    expect(getConfig().simulateUnready).toBe(false);
  });

  it('defines the canonical SERVICE_NAME', () => {
    expect(SERVICE_NAME).toBe('service-status-dashboard');
  });
});
