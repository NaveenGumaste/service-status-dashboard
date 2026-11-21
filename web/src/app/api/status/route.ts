import { NextResponse } from 'next/server';
import { getAggregatedStatus } from '@/lib/health';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const { statusCode, response } = getAggregatedStatus();

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
