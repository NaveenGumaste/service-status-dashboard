import { NextResponse } from 'next/server';
import { getHealthStatus } from '@/lib/health';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const { isHealthy, response } = getHealthStatus();

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 500,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
