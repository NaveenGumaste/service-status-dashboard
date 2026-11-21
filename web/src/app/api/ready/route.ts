import { NextResponse } from 'next/server';
import { getReadyStatus } from '@/lib/health';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const { isReady, response } = getReadyStatus();

  return NextResponse.json(response, {
    status: isReady ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
