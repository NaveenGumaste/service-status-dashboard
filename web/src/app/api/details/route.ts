import { NextResponse } from 'next/server';
import { getDetailedRuntimeInfo } from '@/lib/runtime';
import { getConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const config = getConfig();
  const detailedRuntime = getDetailedRuntimeInfo();

  const safeDetails = {
    ...detailedRuntime,
    nodeEnv: config.nodeEnv,
    port: config.port,
    hostname: config.hostname,
    hasBuildTime: Boolean(config.appBuildTime),
  };

  return NextResponse.json(safeDetails, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
