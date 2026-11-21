import { z } from 'zod';
import { AppConfig } from '@/types';

const booleanStringSchema = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const lower = val.trim().toLowerCase();
      return lower === 'true' || lower === '1' || lower === 'yes';
    }
    return false;
  });

export const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 3000))
    .pipe(z.number().min(1).max(65535)),
  HOSTNAME: z.string().default('0.0.0.0'),
  APP_VERSION: z.string().min(1).default('1.0.0'),
  APP_ENV: z.string().min(1).default('development'),
  APP_RELEASE_ID: z.string().min(1).default('local-dev'),
  APP_COMMIT_SHA: z.string().min(1).default('local'),
  APP_BUILD_TIME: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  APP_INSTANCE_ID: z.string().min(1).default('local'),
  SIMULATE_UNREADY: booleanStringSchema,
  SIMULATE_UNHEALTHY: booleanStringSchema,
});

export function getConfig(overrideEnv?: NodeJS.ProcessEnv): AppConfig {
  const env = overrideEnv ?? process.env;
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    console.error('Invalid environment configuration:', parsed.error.format());
    // Fall back to safe defaults if parsing somehow failed
    return {
      nodeEnv: env.NODE_ENV || 'development',
      port: 3000,
      hostname: '0.0.0.0',
      appVersion: env.APP_VERSION || '1.0.0',
      appEnv: env.APP_ENV || 'development',
      appReleaseId: env.APP_RELEASE_ID || 'local-dev',
      appCommitSha: env.APP_COMMIT_SHA || 'local',
      appBuildTime: env.APP_BUILD_TIME || null,
      appInstanceId: env.APP_INSTANCE_ID || 'local',
      simulateUnready: env.SIMULATE_UNREADY === 'true',
      simulateUnhealthy: env.SIMULATE_UNHEALTHY === 'true',
    };
  }

  const data = parsed.data;

  return {
    nodeEnv: data.NODE_ENV,
    port: data.PORT,
    hostname: data.HOSTNAME,
    appVersion: data.APP_VERSION,
    appEnv: data.APP_ENV,
    appReleaseId: data.APP_RELEASE_ID,
    appCommitSha: data.APP_COMMIT_SHA,
    appBuildTime: data.APP_BUILD_TIME,
    appInstanceId: data.APP_INSTANCE_ID,
    simulateUnready: data.SIMULATE_UNREADY ?? false,
    simulateUnhealthy: data.SIMULATE_UNHEALTHY ?? false,
  };
}

export const SERVICE_NAME = 'service-status-dashboard';
