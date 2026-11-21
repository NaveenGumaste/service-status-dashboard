import { NextResponse } from 'next/server';
import { getRuntimeInfo } from '@/lib/runtime';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const runtimeInfo = getRuntimeInfo();

  return NextResponse.json(runtimeInfo, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
