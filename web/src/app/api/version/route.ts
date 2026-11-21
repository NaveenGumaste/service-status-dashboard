import { NextResponse } from 'next/server';
import { getVersionInfo } from '@/lib/health';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const versionInfo = getVersionInfo();

  return NextResponse.json(versionInfo, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
