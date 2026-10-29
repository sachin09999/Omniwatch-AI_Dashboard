import { NextResponse } from 'next/server';
import { MOCK_DASHBOARD_DATA } from '@/lib/mockData';
import { getBackendBase, getBackendHeaders } from '@/lib/backendClient';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const timeFrame = searchParams.get('time_frame') || 'today';
  const backendBase = getBackendBase();

  try {
    const res = await fetch(`${backendBase}/ai/detections/dashboard?time_frame=${timeFrame}`, {
      headers: getBackendHeaders(),
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('[Next.js API] Dashboard proxy failed, using mock data:', error.message);
    return NextResponse.json(MOCK_DASHBOARD_DATA);
  }
}
